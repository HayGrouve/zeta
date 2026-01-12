export function setPath(
  obj: Record<string, unknown>,
  path: string,
  value: unknown,
): void {
  const parts = path.split('.').filter(Boolean)
  if (parts.length === 0) return

  let cursor: Record<string, unknown> = obj
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i]
    const existing = cursor[key]
    if (existing && typeof existing === 'object' && !Array.isArray(existing)) {
      cursor = existing as Record<string, unknown>
      continue
    }
    const next: Record<string, unknown> = {}
    cursor[key] = next
    cursor = next
  }

  cursor[parts[parts.length - 1]] = value
}

