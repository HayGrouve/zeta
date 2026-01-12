'use client'

import { useStore } from '@tanstack/react-form'

import type { FormField } from '@/types/form-schema'

import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

          case 'dropdown':
            return (
              <div className="space-y-2">
                {label}
                <Select
                  value={(fieldApi.state.value ?? '') as string}
                  onValueChange={(value) => fieldApi.handleChange(value)}
                >
                  <SelectTrigger className="w-full" id={id}>
                    <SelectValue placeholder={field.placeholder ?? 'Select...'} />
                  </SelectTrigger>
                  <SelectContent>
                    {(field.options ?? []).map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isTouched ? <ErrorMessages errors={errors} /> : null}
              </div>
            )

          case 'checkbox':
            return (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={id}
                    checked={Boolean(fieldApi.state.value)}
                    onCheckedChange={(checked) => fieldApi.handleChange(Boolean(checked))}
                    onBlur={fieldApi.handleBlur}
                  />
                  <Label htmlFor={id} className="text-sm font-semibold">
                    {field.label}
                  </Label>
                </div>
                {isTouched ? <ErrorMessages errors={errors} /> : null}
              </div>
            )

          case 'radio':
            return (
              <div className="space-y-2">
                {label}
                <RadioGroup
                  value={(fieldApi.state.value ?? '') as string}
                  onValueChange={(value) => fieldApi.handleChange(value)}
                >
                  {(field.options ?? []).map((opt) => {
                    const itemId = `${id}__${opt.value}`
                    return (
                      <div key={opt.value} className="flex items-center gap-2">
                        <RadioGroupItem id={itemId} value={opt.value} />
                        <Label htmlFor={itemId} className="text-sm">
                          {opt.label}
                        </Label>
                      </div>
                    )
                  })}
                </RadioGroup>
                {isTouched ? <ErrorMessages errors={errors} /> : null}
              </div>
            )

          default: {
            // Unsupported field type fallback: never crash the renderer.
            return (
              <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3">
                <div className="text-sm font-semibold text-amber-200">
                  Unsupported field type
                </div>
                <div className="mt-1 text-xs text-amber-100/80">
                  <div>
                    <span className="font-medium">id:</span> {field.id}
                  </div>
                  <div>
                    <span className="font-medium">type:</span> {(field as any).type}
                  </div>
                </div>
              </div>
            )
          }
        }
      }}
    </form.Field>
  )
}

