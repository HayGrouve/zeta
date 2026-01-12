import { z } from 'zod'

/**
 * Lenient validators:
 * - `.passthrough()` everywhere to allow unknown keys
 * - enforce required keys + a small set of conditional constraints
 */

const nonEmptyString = z.string().min(1, 'Required')

export const visibilityConditionSchema = z
  .object({
    dependsOn: nonEmptyString,
    operator: z.enum(['equals', 'notEquals', 'contains', 'isEmpty', 'isNotEmpty']),
    value: z.union([z.string(), z.boolean()]).optional(),
  })
  .passthrough()

export const validationRuleSchema = z
  .object({
    pattern: z.string().optional(),
    minLength: z.number().int().nonnegative().optional(),
    maxLength: z.number().int().nonnegative().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    required: z.boolean().optional(),
    message: nonEmptyString,
  })
  .passthrough()

export const dynamicValidationSchema = z
  .object({
    when: z
      .object({
        field: nonEmptyString,
        equals: nonEmptyString,
      })
      .passthrough()
      .optional(),
    rules: validationRuleSchema,
  })
  .passthrough()

export const apiIntegrationSchema = z
  .object({
    id: nonEmptyString,
    endpoint: nonEmptyString,
    triggerFields: z.array(nonEmptyString).default([]),
    targetFields: z.array(nonEmptyString).default([]),
  })
  .passthrough()

export const formFieldSchema = z
  .object({
    id: nonEmptyString,
    type: z.enum(['text', 'textarea', 'dropdown', 'checkbox', 'radio']),
    label: nonEmptyString,
    placeholder: z.string().optional(),
    defaultValue: z.union([z.string(), z.boolean()]).optional(),
    options: z.array(z.object({ label: nonEmptyString, value: nonEmptyString })).optional(),
    validation: z.array(dynamicValidationSchema).optional(),
    visibility: visibilityConditionSchema.optional(),
    autoFillFrom: z.string().optional(),
    disabled: z.boolean().optional(),
  })
  .passthrough()
  .superRefine((field, ctx) => {
    if (field.type === 'dropdown' || field.type === 'radio') {
      if (!field.options || field.options.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `"options" is required and must be non-empty for type "${field.type}"`,
          path: ['options'],
        })
      }
    }
  })

export const formGroupSchema: z.ZodTypeAny = z
  .lazy(() =>
    z
      .object({
        id: nonEmptyString,
        title: z.string().optional(),
        description: z.string().optional(),
        fields: z.array(formFieldSchema).optional(),
        groups: z.array(formGroupSchema).optional(),
        visibility: visibilityConditionSchema.optional(),
      })
      .passthrough(),
  )
  .describe('FormGroup')

export const formSchemaValidator = z
  .object({
    id: nonEmptyString,
    title: nonEmptyString,
    description: z.string().optional(),
    groups: z.array(formGroupSchema),
    apiIntegrations: z.array(apiIntegrationSchema).optional(),
  })
  .passthrough()

export type FormSchemaParseResult =
  | { ok: true; schema: z.infer<typeof formSchemaValidator> }
  | { ok: false; error: string }

export function parseFormSchema(jsonText: string): FormSchemaParseResult {
  try {
    const parsed = JSON.parse(jsonText) as unknown
    const result = formSchemaValidator.safeParse(parsed)
    if (!result.success) {
      return { ok: false, error: result.error.message }
    }
    return { ok: true, schema: result.data }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Invalid JSON',
    }
  }
}

