'use client'

import { useStore } from '@tanstack/react-form'

import type { FormField } from '@/types/form-schema'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

function toDomId(pathId: string): string {
  return pathId.replaceAll('.', '__')
}

function ErrorMessages({
  errors,
}: {
  errors: Array<string | { message: string }>
}) {
  if (errors.length === 0) return null

  return (
    <div className="mt-1 space-y-1">
      {errors.map((error) => {
        const message = typeof error === 'string' ? error : error.message
        return (
          <div key={message} className="text-sm font-medium text-red-400">
            {message}
          </div>
        )
      })}
    </div>
  )
}

export function FieldRenderer({
  field,
  form,
}: {
  field: FormField
  form: any
}) {
  // We intentionally keep this lightly typed; schema-driven field names are dynamic.
  return (
    <form.Field name={field.id as never}>
      {(fieldApi: any) => {
        const errors = useStore(fieldApi.store, (s: any) => s.meta.errors) as Array<
          string | { message: string }
        >
        const isTouched = useStore(fieldApi.store, (s: any) => s.meta.isTouched) as boolean
        const id = toDomId(field.id)

        const label = (
          <Label htmlFor={id} className="text-sm font-semibold">
            {field.label}
          </Label>
        )

        switch (field.type) {
          case 'text':
            return (
              <div className="space-y-2">
                {label}
                <Input
                  id={id}
                  value={(fieldApi.state.value ?? '') as string}
                  placeholder={field.placeholder}
                  onBlur={fieldApi.handleBlur}
                  onChange={(e) => fieldApi.handleChange(e.target.value)}
                />
                {isTouched ? <ErrorMessages errors={errors} /> : null}
              </div>
            )

          case 'textarea':
            return (
              <div className="space-y-2">
                {label}
                <Textarea
                  id={id}
                  value={(fieldApi.state.value ?? '') as string}
                  placeholder={field.placeholder}
                  onBlur={fieldApi.handleBlur}
                  onChange={(e) => fieldApi.handleChange(e.target.value)}
                />
                {isTouched ? <ErrorMessages errors={errors} /> : null}
              </div>
            )

          default:
            return null
        }
      }}
    </form.Field>
  )
}

