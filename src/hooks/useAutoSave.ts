import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const STORAGE_KEY = 'zeta.formBuilder.v1'
const STORAGE_VERSION = 1

type AutoSavePayload = {
  version: number
  savedAt: number
  schemaText: string
  values: Record<string, unknown>
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function safeParsePayload(raw: string): AutoSavePayload | null {
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!isRecord(parsed)) return null
    if (parsed.version !== STORAGE_VERSION) return null
    if (typeof parsed.savedAt !== 'number') return null
    if (typeof parsed.schemaText !== 'string') return null
    if (!isRecord(parsed.values)) return null
    return parsed as AutoSavePayload
  } catch {
    return null
  }
}

export type AutoSaveState = {
  restored: boolean
  restoredAt?: number
  schemaText?: string
  values?: Record<string, unknown>
}

export function useAutoSave({
  schemaText,
  values,
  enabled = true,
  debounceMs = 500,
}: {
  schemaText: string
  values: Record<string, unknown>
  enabled?: boolean
  debounceMs?: number
}) {
  const [restoreState, setRestoreState] = useState<AutoSaveState>({
    restored: false,
  })

  const latest = useRef({ schemaText, values, enabled, debounceMs })
  useEffect(() => {
    latest.current = { schemaText, values, enabled, debounceMs }
  }, [schemaText, values, enabled, debounceMs])

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const payload = safeParsePayload(raw)
    if (!payload) return
    setRestoreState({
      restored: true,
      restoredAt: payload.savedAt,
      schemaText: payload.schemaText,
      values: payload.values,
    })
  }, [])

  useEffect(() => {
    if (!enabled) return

    const handle = setTimeout(() => {
      const { schemaText: st, values: v } = latest.current
      const payload: AutoSavePayload = {
        version: STORAGE_VERSION,
        savedAt: Date.now(),
        schemaText: st,
        values: v,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    }, debounceMs)

    return () => clearTimeout(handle)
  }, [schemaText, values, enabled, debounceMs])

  const clear = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setRestoreState({ restored: false })
  }, [])

  const hasSavedSession = useMemo(() => {
    return restoreState.restored
  }, [restoreState.restored])

  return {
    restoreState,
    hasSavedSession,
    clear,
  }
}

