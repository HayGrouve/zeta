import type { FormField, FormGroup, FormSchema } from '@/types/form-schema'

import { setPath } from './path'
import { evaluateVisibility, getValueByPath, isEmptyValue } from './visibility'

type ActiveOutputOptions = {
  /**
   * If true, fields with empty values ("", null, undefined, []) are omitted.
   * Defaults to true to keep output JSON concise.
   */
  omitEmpty?: boolean
}

function coerceFieldValue(field: FormField, value: unknown): unknown {
  if (field.type === 'number' && typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed === '') return value
    if (/^\\d+$/.test(trimmed)) return Number(trimmed)
  }
  return value
}

function walkGroups(
  groups: FormGroup[],
  values: Record<string, unknown>,
  out: Record<string, unknown>,
  options: Required<ActiveOutputOptions>,
): void {
  for (const group of groups) {
    if (!evaluateVisibility(group.visibility, values as any)) continue

    for (const field of group.fields ?? []) {
      if (!evaluateVisibility(field.visibility, values as any)) continue
      const raw = getValueByPath(values, field.id)
      const coerced = coerceFieldValue(field, raw)
      if (options.omitEmpty && isEmptyValue(coerced)) continue
      setPath(out, field.id, coerced)
    }

    if (group.groups?.length) {
      walkGroups(group.groups, values, out, options)
    }
  }
}

/**
 * Builds an output object containing only values for fields currently visible
 * (based on field/group visibility rules) at the moment of submission/display.
 */
export function buildActiveOutput(
  schema: FormSchema,
  values: Record<string, unknown>,
  options: ActiveOutputOptions = {},
): Record<string, unknown> {
  const opts: Required<ActiveOutputOptions> = {
    omitEmpty: options.omitEmpty ?? true,
  }

  const out: Record<string, unknown> = {}
  walkGroups(schema.groups ?? [], values, out, opts)
  return out
}

