'use client'

import type { FormField, FormValues } from '@/types/form-schema'

import { Search } from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/lib/utils'
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

import { validateFieldValue } from './fieldValidation'
import { evaluateVisibility } from './visibility'

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
  values,
  submissionAttempts,
  onInspect,
}: {
  field: FormField
  form: any
  values: FormValues
  submissionAttempts: number
  onInspect?: (id: string) => void
}) {
  const [isPulsing, setIsPulse] = useState(false)
  const [didEdit, setDidEdit] = useState(false)

  if (!evaluateVisibility(field.visibility, values)) return null

  const handleInspect = () => {
    setIsPulse(true)
    onInspect?.(field.id)
    setTimeout(() => setIsPulse(false), 600)
  }

  // We intentionally keep this lightly typed; schema-driven field names are dynamic.
  return (
    <form.Field
      name={field.id as never}
      validators={{
        onChangeListenTo: Array.from(
          new Set(
            (field.validation ?? [])
              .map((v) => v.when?.field)
              .filter((v): v is string => Boolean(v)),
          ),
        ) as any,
        onChange: ({ value }: { value: unknown }) => {
          const allValues = (form?.store?.state?.values ?? {}) as FormValues
          return validateFieldValue(field, value, allValues)
        },
      }}
    >
      {(fieldApi: any) => {
        // IMPORTANT: Do not use hooks in this render callback (React rules of hooks).
        // `fieldApi.state` updates re-render this callback, so reading directly is enough.
        const isTouched = Boolean(fieldApi.state.meta.isTouched)
        const isDirty = Boolean(fieldApi.state.meta.isDirty)
        const shouldShowErrors =
          isTouched || isDirty || didEdit || submissionAttempts > 0

        const allValues = (form?.store?.state?.values ?? {}) as FormValues
        const computedError = shouldShowErrors
          ? validateFieldValue(field, fieldApi.state.value, allValues)
          : undefined

        const errors = computedError ? [computedError] : []
        const id = toDomId(field.id)

        const label = (
          <div className="flex items-center gap-2 group/label">
            <Label
              htmlFor={id}
              className={cn(
                'text-sm font-semibold hover:text-primary transition-all rounded px-1 -ml-1',
                isPulsing ? 'animate-zetta-pulse text-primary' : '',
              )}
            >
              {field.label}
            </Label>
            <Search
              size={12}
              className="opacity-0 group-hover/label:opacity-100 transition-opacity text-primary cursor-pointer"
              onClick={handleInspect}
              title="Inspect field in JSON"
            />
          </div>
        )

        return (
          <div className="animate-in fade-in slide-in-from-left-1 duration-300">
            {(() => {
              switch (field.type) {
                case 'text':
                  return (
                    <div className="space-y-2">
                      {label}
                      <Input
                        id={id}
                        value={(fieldApi.state.value ?? '') as string}
                        placeholder={field.placeholder}
                        disabled={Boolean(field.disabled)}
                        onBlur={fieldApi.handleBlur}
                        onChange={(e) => {
                          setDidEdit(true)
                          fieldApi.handleChange(e.target.value)
                        }}
                        className="bg-white/5 border-white/10 focus:border-primary/50 transition-all"
                      />
                      {errors.length ? <ErrorMessages errors={errors} /> : null}
                    </div>
                  )

                case 'number':
                  return (
                    <div className="space-y-2">
                      {label}
                      <Input
                        id={id}
                        type="text"
                        inputMode="numeric"
                        value={(fieldApi.state.value ?? '') as string}
                        placeholder={field.placeholder}
                        disabled={Boolean(field.disabled)}
                        onBlur={fieldApi.handleBlur}
                        onChange={(e) => {
                          setDidEdit(true)
                          fieldApi.handleChange(e.target.value)
                        }}
                        className="bg-white/5 border-white/10 focus:border-primary/50 transition-all"
                      />
                      {errors.length ? <ErrorMessages errors={errors} /> : null}
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
                        disabled={Boolean(field.disabled)}
                        onBlur={fieldApi.handleBlur}
                        onChange={(e) => {
                          setDidEdit(true)
                          fieldApi.handleChange(e.target.value)
                        }}
                        className="min-h-[100px] bg-white/5 border-white/10 focus:border-primary/50 transition-all"
                      />
                      {errors.length ? <ErrorMessages errors={errors} /> : null}
                    </div>
                  )

                case 'dropdown':
                  return (
                    <div className="space-y-2">
                      {label}
                      <Select
                        value={(fieldApi.state.value ?? '') as string}
                        onValueChange={(value) => {
                          setDidEdit(true)
                          fieldApi.handleChange(value)
                        }}
                        disabled={Boolean(field.disabled)}
                      >
                        <SelectTrigger
                          className="w-full bg-white/5 border-white/10 h-10 focus:ring-primary/50"
                          id={id}
                          disabled={Boolean(field.disabled)}
                        >
                          <SelectValue placeholder={field.placeholder ?? 'Select...'} />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-white/10">
                          {(field.options ?? []).map((opt) => (
                            <SelectItem
                              key={opt.value}
                              value={opt.value}
                              className="focus:bg-primary/20 focus:text-primary transition-colors"
                            >
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.length ? <ErrorMessages errors={errors} /> : null}
                    </div>
                  )

                case 'checkbox':
                  return (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 group cursor-pointer">
                        <Checkbox
                          id={id}
                          checked={Boolean(fieldApi.state.value)}
                          disabled={Boolean(field.disabled)}
                          onCheckedChange={(checked) => {
                            setDidEdit(true)
                            fieldApi.handleChange(Boolean(checked))
                          }}
                          onBlur={fieldApi.handleBlur}
                          className="border-white/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all"
                        />
                        <Label
                          htmlFor={id}
                          className="text-sm font-semibold cursor-pointer group-hover:text-primary transition-colors"
                          onClick={() => handleInspect()}
                          title="Click to inspect field in JSON"
                        >
                          {field.label}
                        </Label>
                      </div>
                      {errors.length ? <ErrorMessages errors={errors} /> : null}
                    </div>
                  )

                case 'radio':
                  return (
                    <div className="space-y-2">
                      {label}
                      <RadioGroup
                        value={(fieldApi.state.value ?? '') as string}
                        onValueChange={(value) => {
                          setDidEdit(true)
                          fieldApi.handleChange(value)
                        }}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                        disabled={Boolean(field.disabled)}
                      >
                        {(field.options ?? []).map((opt) => {
                          const itemId = `${id}__${opt.value}`
                          return (
                            <div
                              key={opt.value}
                              className="flex items-center gap-2 p-3 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer group"
                            >
                              <RadioGroupItem
                                id={itemId}
                                value={opt.value}
                                className="border-white/20 data-[state=checked]:border-primary text-primary"
                              />
                              <Label
                                htmlFor={itemId}
                                className="text-xs font-medium cursor-pointer flex-1"
                              >
                                {opt.label}
                              </Label>
                            </div>
                          )
                        })}
                      </RadioGroup>
                      {errors.length ? <ErrorMessages errors={errors} /> : null}
                    </div>
                  )

                default: {
                  return (
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 animate-pulse">
                      <div className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                        Schema Warning
                      </div>
                      <div className="mt-1 text-[10px] text-amber-200/70 italic">
                        Field ID "{field.id}" uses unsupported type "{(field as any).type}".
                      </div>
                    </div>
                  )
                }
              }
            })()}
          </div>
        )
      }}
    </form.Field>
  )
}

