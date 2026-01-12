'use client'

import type { FormGroup } from '@/types/form-schema'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { FieldRenderer } from './FieldRenderer'

export function GroupRenderer({
  group,
  form,
  depth = 0,
}: {
  group: FormGroup
  form: any
  depth?: number
}) {
  const nested = group.groups ?? []
  const fields = group.fields ?? []

  const hasHeader = Boolean(group.title || group.description)

  return (
    <Card className={depth > 0 ? 'border-slate-700/60 bg-slate-900/40' : ''}>
      {hasHeader ? (
        <CardHeader className="border-b border-slate-700/40">
          {group.title ? <CardTitle>{group.title}</CardTitle> : null}
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
                <FieldRenderer key={field.id} field={field} form={form} />
              ))}
            </div>
          ) : null}

          {nested.length > 0 ? (
            <div className="space-y-4">
              {nested.map((child) => (
                <div key={child.id} className="pl-4 border-l border-slate-700/40">
                  <GroupRenderer group={child} form={form} depth={depth + 1} />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

