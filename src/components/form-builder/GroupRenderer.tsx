'use client'

import type { FormGroup } from '@/types/form-schema'
import { Search } from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import type { FormValues } from '@/types/form-schema'
import { evaluateVisibility } from './visibility'
import { FieldRenderer } from './FieldRenderer'

export function GroupRenderer({
  group,
  form,
  values,
  submissionAttempts,
  depth = 0,
  onInspect,
}: {
  group: FormGroup
  form: any
  values: FormValues
  submissionAttempts: number
  depth?: number
  onInspect?: (id: string) => void
}) {
  const [isPulsing, setIsPulse] = useState(false)

  const isVisible = evaluateVisibility(group.visibility, values)
  if (!isVisible) return null

  const handleInspect = () => {
    setIsPulse(true)
    onInspect?.(group.id)
    setTimeout(() => setIsPulse(false), 600)
  }

  const nested = group.groups ?? []
  const fields = group.fields ?? []

  const hasHeader = Boolean(group.title || group.description)

  return (
    <Card className={cn(
      "animate-in fade-in slide-in-from-bottom-2 duration-500",
      depth > 0 ? 'border-white/5 bg-white/5 shadow-inner' : ''
    )}>
      {hasHeader ? (
        <CardHeader className="border-b border-slate-700/40">
          {group.title ? (
            <CardTitle
              className={cn(
                'flex items-center gap-2 group/title hover:text-primary transition-all rounded px-1 -ml-1 w-fit',
                isPulsing ? 'animate-zetta-pulse text-primary' : '',
              )}
            >
              {group.title}
              <Search
                size={14}
                className="opacity-0 group-hover/title:opacity-100 transition-opacity"
                onClick={handleInspect}
                title="Inspect group in JSON"
              />
            </CardTitle>
          ) : null}
          {group.description ? (
            <CardDescription>{group.description}</CardDescription>
          ) : null}
        </CardHeader>
      ) : null}

      <CardContent className={hasHeader ? 'pt-6' : ''}>
        <div className="space-y-6">
          {fields.length > 0 ? (
            <div className="space-y-4">
              {fields.map((field) => (
                <FieldRenderer
                  key={field.id}
                  field={field}
                  form={form}
                  values={values}
                  submissionAttempts={submissionAttempts}
                  onInspect={onInspect}
                />
              ))}
            </div>
          ) : null}

          {nested.length > 0 ? (
            <div className="space-y-4">
              {nested.map((child) => (
                <div key={child.id} className="pl-4 border-l border-slate-700/40">
                  <GroupRenderer
                    group={child}
                    form={form}
                    values={values}
                    submissionAttempts={submissionAttempts}
                    depth={depth + 1}
                    onInspect={onInspect}
                  />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

