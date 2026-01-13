import { z } from 'zod'

import type { DynamicValidation, FormField, FormValues, ValidationRule } from '@/types/form-schema'

import { isEmptyValue } from './visibility'

function getByPath(obj: unknown, path: string): unknown {
  if (!path) return undefined
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key]
    }
    return undefined
  }, obj)
}

function pickRuleBlock(
  validations: DynamicValidation[] | undefined,
  allValues: FormValues,
): ValidationRule | undefined {
  if (!validations || validations.length === 0) return undefined

  const firstUnconditional = validations.find((v) => !v.when)?.rules
  const firstMatching = validations.find((v) => {
    if (!v.when) return false
    const current = getByPath(allValues, v.when.field)
    return String(current ?? '') === v.when.equals
  })?.rules

  return firstMatching ?? firstUnconditional ?? validations[0]?.rules
}

function zodForField(field: FormField, rules: ValidationRule): z.ZodTypeAny {
  const message = rules.message

  switch (field.type) {
    case 'checkbox': {
      // Interpret "required" as "must be checked".
      return rules.required ? z.literal(true, { message }) : z.boolean().optional()
    }
    case 'number': {
      // NOTE: number fields are rendered as text inputs, so the form value can be a string.
      // We validate "digits only" and then apply min/max on the parsed number.
      return z.any().superRefine((val, ctx) => {
        const raw = typeof val === 'string' ? val.trim() : val

        if (raw === undefined || raw === '') {
          if (rules.required) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message })
          }
          return
        }

        const str = typeof raw === 'number' ? String(raw) : String(raw)
        if (!/^\d+$/.test(str)) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message })
          return
        }

        const num = Number(str)
        if (!Number.isFinite(num)) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message })
          return
        }

        if (rules.min !== undefined && num < rules.min) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message })
          return
        }
        if (rules.max !== undefined && num > rules.max) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message })
        }
      })
    }
    default: {
      // Text-like inputs
      let schema: z.ZodTypeAny = z.string()
      if (rules.required) schema = (schema as z.ZodString).min(1, message)
      if (rules.minLength !== undefined) schema = (schema as z.ZodString).min(rules.minLength, message)
      if (rules.maxLength !== undefined) schema = (schema as z.ZodString).max(rules.maxLength, message)
      if (rules.pattern) schema = (schema as z.ZodString).regex(new RegExp(rules.pattern), message)
      return rules.required ? schema : schema.optional()
    }
  }
}

export function validateFieldValue(
  field: FormField,
  value: unknown,
  allValues: FormValues,
): string | undefined {
  const rules =
    pickRuleBlock(field.validation, allValues) ??
    (field.type === 'number'
      ? ({ message: 'Must be a valid number' } satisfies Pick<ValidationRule, 'message'> as ValidationRule)
      : undefined)
  if (!rules) return undefined

  // If field isn't required, don't validate empty values.
  if (!rules.required && isEmptyValue(value)) return undefined

  const schema = zodForField(field, rules)
  const result = schema.safeParse(value)
  if (result.success) return undefined

  return result.error.issues[0]?.message ?? 'Invalid value'
}

