'use client'

import { useForm, useStore } from '@tanstack/react-form'
import { useEffect, useMemo, useRef, useState } from 'react'

import type { FormField, FormGroup, FormSchema, FormValues } from '@/types/form-schema'

import { Button } from '@/components/ui/button'

import { callMockApi } from '@/services/mock-api'
import { buildDefaultValues } from './defaults'
import { GroupRenderer } from './GroupRenderer'
import { buildActiveOutput } from './activeOutput'
import { evaluateVisibility, getValueByPath } from './visibility'
import { validateFieldValue } from './fieldValidation'

function formatMockApiError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err)

  if (message.includes('MOCK_API:INVALID_ZIP')) {
    return 'ZIP must be 5 digits (or ZIP+4). Try 10001, 94105, or 60601.'
  }
  if (message.includes('MOCK_API:INVALID_INPUT:zip')) {
    return 'ZIP is required to fetch address. Try 10001.'
  }
  if (message.includes('MOCK_API:INVALID_INPUT:registrationNumber')) {
    return 'Registration Number is required. Try REG-0001 or REG-0002.'
  }
  if (message.includes('MOCK_API:UNKNOWN_REGISTRATION_NUMBER')) {
    return 'Unknown Registration Number. Try REG-0001 or REG-0002.'
  }
  if (message.includes('MOCK_API:INVALID_INPUT:idNumber')) {
    return 'Identification Number is required. Try 1234567890.'
  }

  return message
}

export function DynamicFormRenderer({
  schema,
  defaultValues,
  onSubmit,
  onValueChange,
  onInspect,
}: {
  schema: FormSchema
  defaultValues?: Record<string, unknown>
  onSubmit?: (values: Record<string, unknown>) => void
  onValueChange?: (values: Record<string, unknown>) => void
  onInspect?: (id: string) => void
}) {
  const [isFetching, setIsFetching] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const form = useForm<Record<string, unknown>>({
    defaultValues: defaultValues ?? buildDefaultValues(schema),
    onSubmit: ({ value }) => {
      onSubmit?.(buildActiveOutput(schema, value))
    },
  })

  const values = useStore(form.store, (s) => s.values) as FormValues
  const submissionAttempts = useStore(form.store, (s) => s.submissionAttempts)
  const prevSubmitAttempt = useRef(submissionAttempts)

  useEffect(() => {
    if (submissionAttempts <= prevSubmitAttempt.current) return
    prevSubmitAttempt.current = submissionAttempts

    const hasAnyVisibleErrors = (schema: FormSchema, allValues: FormValues) => {
      const visitGroup = (group: FormGroup): boolean => {
        if (!evaluateVisibility(group.visibility, allValues)) return false

        for (const field of group.fields ?? []) {
          if (!evaluateVisibility(field.visibility, allValues)) continue
          const value = getValueByPath(allValues, field.id)
          const err = validateFieldValue(field as FormField, value, allValues)
          if (err) return true
        }

        for (const child of group.groups ?? []) {
          if (visitGroup(child)) return true
        }

        return false
      }

      for (const group of schema.groups ?? []) {
        if (visitGroup(group)) return true
      }
      return false
    }

    if (hasAnyVisibleErrors(schema, values)) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [submissionAttempts, schema, values])
  useEffect(() => {
    onValueChange?.(values)
  }, [onValueChange, values])

  const apiIntegrations = useMemo(() => schema.apiIntegrations ?? [], [schema.apiIntegrations])

  const apiPanelAnchorGroupId = useMemo(() => {
    const addressIntegration = apiIntegrations.find(
      (i) => i.endpoint === 'fetchAddressFromZip',
    )
    if (!addressIntegration) return null

    const relevantFieldIds = new Set([
      ...addressIntegration.triggerFields,
      ...addressIntegration.targetFields,
    ])

    const groupContainsRelevantField = (group: any): boolean => {
      for (const field of group.fields ?? []) {
        if (relevantFieldIds.has(field.id)) return true
      }
      for (const child of group.groups ?? []) {
        if (groupContainsRelevantField(child)) return true
      }
      return false
    }

    const anchor = (schema.groups ?? []).find(groupContainsRelevantField)
    return anchor?.id ?? null
  }, [apiIntegrations, schema.groups])

  const integrationsPanel =
    apiIntegrations.length > 0 ? (
      <div className="rounded-xl border border-white/5 bg-white/5 p-4 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Integrations
            </div>
            <div className="text-xs text-slate-500">
              Use mocked APIs to auto-fill specific fields.
            </div>
          </div>
          <Button
            type="button"
            disabled={isFetching}
            onClick={async () => {
              setFetchError(null)
              setIsFetching(true)
              try {
                for (const integration of apiIntegrations) {
                  const inputs: Record<string, unknown> = {}
                  for (const triggerField of integration.triggerFields) {
                    const value = getValueByPath(values, triggerField)
                    inputs[triggerField.split('.').at(-1) ?? triggerField] = value
                  }

                  const result = await callMockApi(integration.endpoint as any, inputs)

                  if (result && typeof result === 'object' && !Array.isArray(result)) {
                    const obj = result as Record<string, unknown>
                    for (const targetField of integration.targetFields) {
                      const responseKey = targetField.split('.').at(-1) ?? targetField
                      const nextValue =
                        responseKey in obj
                          ? obj[responseKey]
                          : Object.values(obj)[integration.targetFields.indexOf(targetField)]

                      form.setFieldValue(targetField as never, () => nextValue as never)
                    }
                  } else if (integration.targetFields.length === 1) {
                    form.setFieldValue(integration.targetFields[0] as never, () => result as never)
                  }
                }
              } catch (err) {
                setFetchError(formatMockApiError(err))
              } finally {
                setIsFetching(false)
              }
            }}
            className="bg-primary hover:bg-primary/90 text-background font-black uppercase tracking-widest px-6 h-10 shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            {isFetching ? 'Fetching...' : 'Fetch Data'}
          </Button>
        </div>

        {fetchError ? (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 space-y-2 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-widest">
              API Error
            </div>
            <div className="text-[10px] font-medium text-red-200/80 leading-relaxed font-mono">
              {fetchError}
            </div>
          </div>
        ) : null}
      </div>
    ) : null

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-black tracking-tight text-white uppercase italic">{schema.title}</h2>
        {schema.description ? (
          <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">{schema.description}</p>
        ) : null}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
        className="space-y-6"
      >
        <div className="space-y-6">
          {(schema.groups ?? []).flatMap((group) => {
            const nodes: Array<JSX.Element | null> = []
            if (integrationsPanel && apiPanelAnchorGroupId === group.id) {
              nodes.push(
                <div key={`integrations-${group.id}`} className="animate-in fade-in duration-300">
                  {integrationsPanel}
                </div>,
              )
            }
            nodes.push(
              <GroupRenderer
                key={group.id}
                group={group}
                form={form}
                values={values}
                submissionAttempts={submissionAttempts}
                onInspect={onInspect}
              />,
            )
            return nodes
          })}
        </div>

        <div className="flex justify-end pt-4">
          <form.Subscribe selector={(s) => s.isSubmitting}>
            {(isSubmitting) => (
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90 text-background font-black uppercase tracking-widest px-8 h-12 shadow-lg shadow-primary/20 transition-all active:scale-95"
              >
                {isSubmitting ? 'Processing...' : 'Submit Blueprint'}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </div>
  )
}

