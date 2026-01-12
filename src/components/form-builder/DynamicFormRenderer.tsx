'use client'

import { useForm, useStore } from '@tanstack/react-form'
import { useEffect } from 'react'

import type { FormSchema } from '@/types/form-schema'

import { Button } from '@/components/ui/button'

import { buildDefaultValues } from './defaults'
import { GroupRenderer } from './GroupRenderer'

export function DynamicFormRenderer({
  schema,
  defaultValues,
  onSubmit,
  onValueChange,
}: {
  schema: FormSchema
  defaultValues?: Record<string, unknown>
  onSubmit?: (values: Record<string, unknown>) => void
  onValueChange?: (values: Record<string, unknown>) => void
}) {
  const form = useForm<Record<string, unknown>>({
    defaultValues: defaultValues ?? buildDefaultValues(schema),
    onSubmit: ({ value }) => {
      onSubmit?.(value)
    },
  })

  const values = useStore(form.store, (s) => s.values)
  useEffect(() => {
    onValueChange?.(values)
  }, [onValueChange, values])

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-white">{schema.title}</h2>
        {schema.description ? (
          <p className="text-sm text-slate-300">{schema.description}</p>
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
          {schema.groups.map((group) => (
            <GroupRenderer key={group.id} group={group} form={form} />
          ))}
        </div>

        <div className="flex justify-end">
          <form.Subscribe selector={(s) => s.isSubmitting}>
            {(isSubmitting) => (
              <Button type="submit" disabled={isSubmitting}>
                Submit
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </div>
  )
}

