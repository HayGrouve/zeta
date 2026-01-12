function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

/**
 * Deep-merge plain objects. Arrays and non-objects are replaced.
 */
export function deepMerge(
  base: Record<string, unknown>,
  override: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...base }

  for (const [key, value] of Object.entries(override)) {
    const existing = out[key]
    if (isPlainObject(existing) && isPlainObject(value)) {
      out[key] = deepMerge(existing, value)
      continue
    }
    out[key] = value
  }

  return out
}

