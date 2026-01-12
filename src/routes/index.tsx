import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'

import { DynamicFormRenderer } from '@/components/form-builder/DynamicFormRenderer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { FormSchema } from '@/types/form-schema'
import { parseFormSchema } from '@/types/form-schema.validators'

export const Route = createFileRoute('/')({ component: FormBuilderPage })

const DEFAULT_SCHEMA: FormSchema = {
  id: 'default',
  title: 'Dynamic Form Builder',
  description: 'Edit the JSON on the left to regenerate the form.',
  groups: [
    {
      id: 'account',
      title: 'Account',
      fields: [
        {
          id: 'account.type',
          type: 'dropdown',
          label: 'Account Type',
          placeholder: 'Select account type',
          options: [
            { label: 'Individual', value: 'INDIVIDUAL' },
            { label: 'Business', value: 'BUSINESS' },
          ],
        },
        { id: 'account.acceptTerms', type: 'checkbox', label: 'I accept the terms' },
      ],
    },
    {
      id: 'identity',
      title: 'Identity',
      fields: [
        {
          id: 'identity.idType',
          type: 'radio',
          label: 'Identification Type',
          options: [
            { label: 'Personal ID', value: 'PERSONAL_ID' },
            { label: 'Passport', value: 'PASSPORT' },
          ],
        },
        {
          id: 'identity.idNumber',
          type: 'text',
          label: 'Identification Number',
          placeholder: 'Enter your ID number',
        },
      ],
      groups: [
        {
          id: 'address',
          title: 'Address (Nested Group)',
          fields: [
            { id: 'address.street', type: 'text', label: 'Street' },
            { id: 'address.zip', type: 'text', label: 'ZIP', placeholder: 'e.g. 10001' },
            { id: 'address.notes', type: 'textarea', label: 'Notes' },
          ],
        },
      ],
    },
  ],
}

function FormBuilderPage() {
  const [schemaText, setSchemaText] = useState(() =>
    JSON.stringify(DEFAULT_SCHEMA, null, 2),
  )
  const [liveValues, setLiveValues] = useState<Record<string, unknown>>({})
  const [lastSubmitted, setLastSubmitted] = useState<Record<string, unknown> | null>(
    null,
  )

  const [debouncedSchemaText, setDebouncedSchemaText] = useState(schemaText)
  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSchemaText(schemaText), 1000)
    return () => clearTimeout(handle)
  }, [schemaText])

  const schemaResult = useMemo(() => {
    return parseFormSchema(debouncedSchemaText)
  }, [debouncedSchemaText])

  const schemaKey = useMemo(() => {
    // forces a remount when schema changes so defaultValues re-apply
    return `schema:${debouncedSchemaText.length}:${debouncedSchemaText.slice(0, 32)}`
  }, [debouncedSchemaText])

  return (
    <div
      className="min-h-screen p-6 text-white"
      style={{
        backgroundColor: '#000',
        backgroundImage:
          'radial-gradient(ellipse 60% 60% at 0% 100%, #444 0%, #222 60%, #000 100%)',
      }}
    >
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight">Dynamic Form Builder</h1>
          <p className="text-sm text-slate-300">
            Paste/edit a JSON schema to generate the form. Validation runs 1s after you stop typing.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="border-b border-slate-700/40">
              <CardTitle>Schema (JSON)</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              <div className="space-y-2">
                <Label htmlFor="schemaText">JSON Schema</Label>
                <Textarea
                  id="schemaText"
                  value={schemaText}
                  onChange={(e) => setSchemaText(e.target.value)}
                  rows={18}
                  className="font-mono text-xs"
                />
              </div>

              {schemaResult.ok ? (
                <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">
                  Schema valid
                </div>
              ) : (
                <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3">
                  <div className="text-sm font-semibold text-red-200">
                    {schemaResult.errorType === 'invalid_json'
                      ? 'Invalid JSON'
                      : 'Invalid schema'}
                  </div>
                  <pre className="mt-2 max-h-40 overflow-auto text-xs text-red-100/80 whitespace-pre-wrap">
                    {schemaResult.error}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-slate-700/40">
              <CardTitle>Generated Form</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {schemaResult.ok ? (
                <DynamicFormRenderer
                  key={schemaKey}
                  schema={schemaResult.schema as unknown as FormSchema}
                  onSubmit={(values) => {
                    setLastSubmitted(values)
                  }}
                  onValueChange={(values) => setLiveValues(values)}
                />
              ) : (
                <div className="text-sm text-slate-300">
                  Fix the schema errors to render the form.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="border-b border-slate-700/40">
            <CardTitle>Output (Live + Last Submit)</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-2">
              <div className="text-sm font-semibold text-slate-200">Live Values</div>
              <pre className="rounded-md border border-slate-700/60 bg-slate-950/40 p-3 text-xs text-slate-200 overflow-auto max-h-64">
                {JSON.stringify(liveValues, null, 2)}
              </pre>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-semibold text-slate-200">Last Submitted</div>
              <pre className="rounded-md border border-slate-700/60 bg-slate-950/40 p-3 text-xs text-slate-200 overflow-auto max-h-64">
                {JSON.stringify(lastSubmitted ?? {}, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
