import type { FormField, FormGroup, FormSchema } from '@/types/form-schema'

import { setPath } from './path'

function getFieldDefaultValue(field: FormField): unknown {
  if (field.defaultValue !== undefined) return field.defaultValue

  switch (field.type) {
    case 'checkbox':
      return false
    case 'text':
    case 'textarea':
    case 'dropdown':
    case 'radio':
      return ''
    case 'number':
      return ''
    default:
      return ''
  }
}

function collectFields(group: FormGroup): Array<FormField> {
  const fields = group.fields ?? []
  const nestedGroups = group.groups ?? []
  const nestedFields = nestedGroups.flatMap(collectFields)
  return [...fields, ...nestedFields]
}

export function buildDefaultValues(schema: FormSchema): Record<string, unknown> {
  const defaults: Record<string, unknown> = {}

  const allFields = schema.groups.flatMap(collectFields)
  for (const field of allFields) {
    setPath(defaults, field.id, getFieldDefaultValue(field))
  }

  return defaults
}

