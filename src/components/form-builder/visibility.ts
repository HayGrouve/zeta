import type { FormValues, VisibilityCondition } from '@/types/form-schema'

export function getValueByPath(values: unknown, path: string): unknown {
  if (!path) return undefined
  return path.split('.').filter(Boolean).reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key]
    }
    return undefined
  }, values)
}

export function isEmptyValue(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    value === '' ||
    (Array.isArray(value) && value.length === 0)
  )
}

export function evaluateVisibility(
  condition: VisibilityCondition | undefined,
  values: FormValues,
): boolean {
  if (!condition) return true

  const current = getValueByPath(values, condition.dependsOn)
  const compare = condition.value

  switch (condition.operator) {
    case 'equals': {
      if (typeof compare === 'boolean') return Boolean(current) === compare
      return String(current ?? '') === String(compare ?? '')
    }
    case 'notEquals': {
      if (typeof compare === 'boolean') return Boolean(current) !== compare
      return String(current ?? '') !== String(compare ?? '')
    }
    case 'contains': {
      if (typeof current === 'string' && typeof compare === 'string') {
        return current.includes(compare)
      }
      if (Array.isArray(current)) {
        return current.includes(compare)
      }
      return false
    }
    case 'isEmpty':
      return isEmptyValue(current)
    case 'isNotEmpty':
      return !isEmptyValue(current)
    default: {
      const _exhaustive: never = condition.operator
      return Boolean(_exhaustive)
    }
  }
}

