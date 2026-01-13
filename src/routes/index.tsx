import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  CheckCircle2,
  Copy,
  FileCode2,
  LayoutDashboard,
  Braces,
  History,
  Sparkles,
  Check,
  Zap,
  Maximize2,
} from 'lucide-react'

import { DynamicFormRenderer } from '@/components/form-builder/DynamicFormRenderer'
import { CodeViewerDialog } from '@/components/form-builder/CodeViewerDialog'
import { buildActiveOutput } from '@/components/form-builder/activeOutput'
import { buildDefaultValues } from '@/components/form-builder/defaults'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { useAutoSave } from '@/hooks/useAutoSave'
import { deepMerge } from '@/lib/deepMerge'
import { EXAMPLE_SCHEMAS } from '@/data/example-schemas'
import type { FormSchema } from '@/types/form-schema'
import { parseFormSchema } from '@/types/form-schema.validators'

export const Route = createFileRoute('/')({ component: FormBuilderPage })

function FormSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-2">
        <div className="h-8 w-48 bg-white/5 rounded-md animate-pulse" />
        <div className="h-4 w-72 bg-white/5 rounded-md animate-pulse" />
      </div>
      <div className="grid gap-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="p-6 rounded-xl border border-white/5 bg-white/5 space-y-4"
          >
            <div className="h-6 w-32 bg-white/10 rounded animate-pulse" />
            <div className="space-y-3">
              <div className="h-10 w-full bg-white/5 rounded animate-pulse" />
              <div className="h-10 w-full bg-white/5 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 hover:bg-white/10"
      onClick={handleCopy}
      title="Copy to clipboard"
    >
      {copied ? (
        <Check className="h-4 w-4 text-emerald-400" />
      ) : (
        <Copy className="h-4 w-4 text-slate-400" />
      )}
    </Button>
  )
}

function formatRelativeTime(epochMs: number) {
  const diffMs = Date.now() - epochMs
  const diffSec = Math.max(0, Math.floor(diffMs / 1000))
  if (diffSec < 60) return 'just now'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.floor(diffHr / 24)
  return `${diffDay}d ago`
}

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
        {
          id: 'account.acceptTerms',
          type: 'checkbox',
          label: 'I accept the terms',
        },
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
            { label: 'Driver License', value: 'DRIVER_LICENSE' },
          ],
        },
        {
          id: 'identity.idNumber',
          type: 'text',
          label: 'Identification Number',
          placeholder: 'Format depends on ID type',
          validation: [
            {
              when: { field: 'identity.idType', equals: 'PERSONAL_ID' },
              rules: {
                pattern: '^\\d{10}$',
                message: 'Personal ID must be exactly 10 digits',
              },
            },
            {
              when: { field: 'identity.idType', equals: 'PASSPORT' },
              rules: {
                pattern: '^[A-Za-z0-9]{6,9}$',
                message: 'Passport must be 6–9 alphanumeric characters',
              },
            },
            {
              when: { field: 'identity.idType', equals: 'DRIVER_LICENSE' },
              rules: {
                pattern: '^\\d{5,15}$',
                message: 'Driver License must be 5–15 digits',
              },
            },
          ],
        },
      ],
      groups: [
        {
          id: 'address',
          title: 'Address (Nested Group)',
          fields: [
            { id: 'address.street', type: 'text', label: 'Street' },
            {
              id: 'address.zip',
              type: 'text',
              label: 'ZIP',
              placeholder: 'e.g. 10001',
            },
            { id: 'address.notes', type: 'textarea', label: 'Notes' },
          ],
        },
      ],
    },
  ],
}

export function FormBuilderPage() {
  const [schemaText, setSchemaText] = useState(() =>
    JSON.stringify(DEFAULT_SCHEMA, null, 2),
  )
  const [selectedExampleId, setSelectedExampleId] = useState<string>('custom')
  const [liveValues, setLiveValues] = useState<Record<string, unknown>>({})
  const [lastSubmitted, setLastSubmitted] = useState<Record<
    string,
    unknown
  > | null>(null)
  const [formResetSeed, setFormResetSeed] = useState(0)
  const [isRestoreBannerDismissed, setIsRestoreBannerDismissed] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [viewingJson, setViewingJson] = useState<{
    title: string
    json: Record<string, unknown> | null
  } | null>(null)

  const editorRef = useRef<HTMLTextAreaElement>(null)

  const inspectJsonBlock = (id: string) => {
    if (!editorRef.current) return

    const text = schemaText
    // Regex to find "id": "id" with word boundaries to avoid partial matches
    const idRegex = new RegExp(`"id"\\s*:\\s*"${id}"`, 'g')
    const match = idRegex.exec(text)

    if (match) {
      let start = match.index
      let end = match.index + match[0].length

      // Brace matching logic to find the full object
      let openBraces = 0
      let foundStart = false

      // Scan backwards for the start of the object definition
      for (let i = start; i >= 0; i--) {
        if (text[i] === '{') {
          if (openBraces === 0) {
            start = i
            foundStart = true
            break
          }
          openBraces--
        } else if (text[i] === '}') {
          openBraces++
        }
      }

      if (foundStart) {
        let closeBraces = 1
        // Scan forwards for the end of the object definition
        for (let i = start + 1; i < text.length; i++) {
          if (text[i] === '{') {
            closeBraces++
          } else if (text[i] === '}') {
            closeBraces--
            if (closeBraces === 0) {
              end = i + 1
              break
            }
          }
        }
      }

      const textarea = editorRef.current
      textarea.focus()
      textarea.setSelectionRange(start, end)

      // Scrolling logic: calculate center of defining block
      const targetLine = text.substring(0, start).split('\n').length
      const totalLines = text.split('\n').length
      const scrollHeight = textarea.scrollHeight
      const clientHeight = textarea.clientHeight

      // Estimate scroll target to center the block
      const targetScroll =
        (targetLine / totalLines) * scrollHeight - clientHeight / 2
      textarea.scrollTo({
        top: Math.max(0, targetScroll),
        behavior: 'smooth',
      })
    }
  }

  const [debouncedSchemaText, setDebouncedSchemaText] = useState(schemaText)
  useEffect(() => {
    setIsValidating(true)
    const handle = setTimeout(() => {
      setDebouncedSchemaText(schemaText)
      setIsValidating(false)
    }, 1000)
    return () => clearTimeout(handle)
  }, [schemaText])

  const formatJson = () => {
    try {
      const parsed = JSON.parse(schemaText)
      setSchemaText(JSON.stringify(parsed, null, 2))
    } catch (e) {
      // ignore invalid json for formatting
    }
  }

  const schemaResult = useMemo(() => {
    return parseFormSchema(debouncedSchemaText)
  }, [debouncedSchemaText])

  const schemaKey = useMemo(() => {
    return `schema:${formResetSeed}:${debouncedSchemaText.length}:${debouncedSchemaText.slice(0, 32)}`
  }, [debouncedSchemaText, formResetSeed])

  const { restoreState, hasSavedSession, savedAt, restore, clear } = useAutoSave({
    schemaText,
    values: liveValues,
    enabled: true,
    debounceMs: 500,
  })

  useEffect(() => {
    if (!restoreState.restored) return
    if (restoreState.schemaText) setSchemaText(restoreState.schemaText)
    if (restoreState.values) setLiveValues(restoreState.values)
    setIsRestoreBannerDismissed(true)
    setSelectedExampleId('custom')
    setFormResetSeed((s) => s + 1)
  }, [restoreState.restored])

  const effectiveDefaultValues = useMemo(() => {
    if (!schemaResult.ok) return undefined
    const base = buildDefaultValues(
      schemaResult.schema as unknown as FormSchema,
    )
    if (!restoreState.restored || !restoreState.values) return base
    return deepMerge(base, restoreState.values)
  }, [schemaResult, restoreState.restored, restoreState.values])

  const activeLiveValues = useMemo(() => {
    if (!schemaResult.ok) return liveValues
    return buildActiveOutput(schemaResult.schema as unknown as FormSchema, liveValues)
  }, [schemaResult, liveValues])

  return (
    <div className="min-h-screen pb-12">
      <div className="mx-auto w-full max-w-[1600px] px-6 space-y-8 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-bold tracking-widest uppercase text-[10px]">
              <Zap size={12} className="fill-primary" />
              Developer Workbench
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">
              zetta<span className="text-primary not-italic">.</span>Engine
            </h1>
            <p className="text-sm text-slate-400 max-w-xl">
              Design, test, and preview complex form schemas with real-time
              validation and persistence.
            </p>
          </div>
        </div>

        {hasSavedSession && !restoreState.restored && !isRestoreBannerDismissed ? (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in zoom-in-95 duration-500">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <History size={18} className="text-primary" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">
                  Saved session available
                </div>
                <div className="text-xs text-slate-400">
                  {typeof savedAt === 'number'
                    ? `Saved ${formatRelativeTime(savedAt)} (${new Date(savedAt).toLocaleString()})`
                    : 'Unsaved changes found from your last visit.'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => {
                  restore()
                }}
                className="bg-primary/20 hover:bg-primary/30 text-primary border-none shadow-none font-bold"
              >
                Restore
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsRestoreBannerDismissed(true)}
                className="border-white/10 hover:bg-white/5 font-bold"
              >
                Dismiss
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  clear()
                  setIsRestoreBannerDismissed(true)
                  setFormResetSeed((s) => s + 1)
                  setSchemaText(JSON.stringify(DEFAULT_SCHEMA, null, 2))
                  setLiveValues({})
                  setLastSubmitted(null)
                }}
                className="text-red-400 hover:text-red-300 hover:bg-red-400/10 font-bold"
              >
                Clear saved
              </Button>
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          {/* Left Column: Schema Editor */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="glass overflow-hidden transition-all hover:shadow-2xl hover:shadow-primary/5 border-white/5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-400/10 flex items-center justify-center">
                    <Braces size={16} className="text-emerald-400" />
                  </div>
                  <CardTitle className="text-lg font-black tracking-tight uppercase italic">
                    Editor
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={formatJson}
                    className="h-8 text-[10px] font-bold uppercase tracking-widest hover:bg-white/5"
                  >
                    Format
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-6 space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Preset Library
                      </Label>
                    </div>
                    <Select
                      value={selectedExampleId}
                      onValueChange={(value) => {
                        setSelectedExampleId(value)
                        if (value === 'custom') return
                        const selected = EXAMPLE_SCHEMAS.find(
                          (e) => e.id === value,
                        )
                        if (!selected) return
                        setSchemaText(selected.jsonText)
                        setLiveValues({})
                        setLastSubmitted(null)
                        setFormResetSeed((s) => s + 1)
                      }}
                    >
                      <SelectTrigger className="w-full bg-white/5 border-white/10 h-11 focus:ring-primary/50">
                        <SelectValue placeholder="Select a blueprint..." />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/10">
                        <SelectItem
                          value="custom"
                          className="focus:bg-primary/20 focus:text-primary transition-colors"
                        >
                          Custom Blueprint
                        </SelectItem>
                        {EXAMPLE_SCHEMAS.map((ex) => (
                          <SelectItem
                            key={ex.id}
                            value={ex.id}
                            className="focus:bg-primary/20 focus:text-primary transition-colors"
                          >
                            {ex.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="schemaText"
                        className="text-[10px] font-bold uppercase tracking-widest text-slate-500"
                      >
                        Source JSON
                      </Label>
                      {schemaResult.ok && !isValidating && (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase tracking-widest animate-in fade-in zoom-in duration-300">
                          <CheckCircle2 size={12} />
                          Valid
                        </div>
                      )}
                    </div>
                    <div className="relative group">
                      <Textarea
                        id="schemaText"
                        ref={editorRef}
                        value={schemaText}
                        onChange={(e) => setSchemaText(e.target.value)}
                        rows={20}
                        className="font-mono text-xs bg-black/40 border-white/10 focus:border-primary/50 focus:ring-primary/20 resize-none transition-all"
                        spellCheck={false}
                      />
                      <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <CopyButton text={schemaText} />
                      </div>
                    </div>
                  </div>

                  {!schemaResult.ok && (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 space-y-2 animate-in slide-in-from-top-2 duration-300">
                      <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-widest">
                        <Sparkles size={14} />
                        Parse Error
                      </div>
                      <div className="text-[10px] font-medium text-red-200/80 leading-relaxed font-mono">
                        {schemaResult.errorType === 'invalid_json'
                          ? 'Invalid Syntax: '
                          : 'Schema Mismatch: '}
                        {schemaResult.error}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Preview & Output */}
          <div className="lg:col-span-7 space-y-8">
            {/* Form Preview */}
            <Card className="glass transition-all hover:shadow-2xl hover:shadow-primary/5 border-white/5 min-h-[500px]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <LayoutDashboard size={16} className="text-primary" />
                  </div>
                  <CardTitle className="text-lg font-black tracking-tight uppercase italic">
                    Live Preview
                  </CardTitle>
                </div>
                {isValidating && (
                  <div className="text-[10px] font-bold text-primary uppercase tracking-widest animate-pulse">
                    Refactoring...
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-8">
                {isValidating ? (
                  <FormSkeleton />
                ) : schemaResult.ok ? (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                    <DynamicFormRenderer
                      key={schemaKey}
                      schema={schemaResult.schema as unknown as FormSchema}
                      defaultValues={effectiveDefaultValues}
                      onSubmit={(values) => {
                        setLastSubmitted(values)
                        // Trigger a small "success" pulse on the output card
                      }}
                      onValueChange={(values) => setLiveValues(values)}
                      onInspect={inspectJsonBlock}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center space-y-4 opacity-50">
                    <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center">
                      <FileCode2 size={24} className="text-slate-500" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-white uppercase tracking-widest">
                        Awaiting Valid Source
                      </p>
                      <p className="text-xs text-slate-500">
                        Correct the JSON schema to generate the workbench
                        interface.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Output Panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="glass border-white/5 hover:border-white/10 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between py-4 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Live State
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-white/10"
                      onClick={() =>
                        setViewingJson({
                          title: 'Live State Inspection',
                          json: activeLiveValues,
                        })
                      }
                      title="Expand View"
                    >
                      <Maximize2 className="h-4 w-4 text-slate-400" />
                    </Button>
                    <CopyButton text={JSON.stringify(activeLiveValues, null, 2)} />
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <pre className="text-[10px] font-mono text-slate-300 overflow-auto max-h-48 custom-scrollbar leading-relaxed">
                    {JSON.stringify(activeLiveValues, null, 2)}
                  </pre>
                </CardContent>
              </Card>

              <Card className="glass border-white/5 hover:border-white/10 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between py-4 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      Committed JSON
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-white/10"
                      onClick={() =>
                        setViewingJson({
                          title: 'Committed Data Inspection',
                          json: lastSubmitted,
                        })
                      }
                      title="Expand View"
                      disabled={!lastSubmitted}
                    >
                      <Maximize2 className="h-4 w-4 text-slate-400" />
                    </Button>
                    <CopyButton
                      text={JSON.stringify(lastSubmitted ?? {}, null, 2)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  {lastSubmitted ? (
                    <pre className="text-[10px] font-mono text-primary overflow-auto max-h-48 custom-scrollbar leading-relaxed animate-in fade-in zoom-in-95 duration-300">
                      {JSON.stringify(lastSubmitted, null, 2)}
                    </pre>
                  ) : (
                    <div className="h-24 flex items-center justify-center text-[10px] font-bold text-slate-600 uppercase tracking-widest italic">
                      No Data Committed
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <CodeViewerDialog
        isOpen={!!viewingJson}
        onClose={() => setViewingJson(null)}
        title={viewingJson?.title ?? ''}
        json={viewingJson?.json ?? null}
      />
    </div>
  )
}
