import React from 'react'
import { Check, Copy, X } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface CodeViewerDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  json: Record<string, unknown> | null
}

export function CodeViewerDialog({
  isOpen,
  onClose,
  title,
  json,
}: CodeViewerDialogProps) {
  const [copied, setCopied] = useState(false)
  const jsonString = JSON.stringify(json ?? {}, null, 2)

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Simple JSON syntax highlighter
  const highlightJson = (text: string) => {
    if (!text) return null

    // Regex to match JSON parts: keys, strings, numbers, booleans/null
    const regex =
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g

    return text.split('\n').map((line, i) => {
      let lastIndex = 0
      const elements = []
      let match

      while ((match = regex.exec(line)) !== null) {
        // Add plain text before match
        if (match.index > lastIndex) {
          elements.push(line.substring(lastIndex, match.index))
        }

        const part = match[0]
        let className = 'text-slate-300'

        if (/^"/.test(part)) {
          if (/:$/.test(part)) {
            className = 'text-cyan-400' // Key
          } else {
            className = 'text-emerald-400' // String
          }
        } else if (/true|false/.test(part)) {
          className = 'text-amber-400' // Boolean
        } else if (/null/.test(part)) {
          className = 'text-rose-400' // Null
        } else if (/[0-9]/.test(part)) {
          className = 'text-orange-400' // Number
        }

        elements.push(
          <span key={`${i}-${match.index}`} className={className}>
            {part}
          </span>,
        )
        lastIndex = regex.lastIndex
      }

      // Add remaining plain text
      if (lastIndex < line.length) {
        elements.push(line.substring(lastIndex))
      }

      return (
        <div key={i} className="min-h-[1.25rem]">
          <span className="inline-block w-8 mr-4 text-right text-slate-600 select-none text-[10px]">
            {i + 1}
          </span>
          {elements}
        </div>
      )
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[90vw] w-full max-h-[90vh] h-full bg-black/90 border-white/10 glass shadow-2xl overflow-hidden flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 border-b border-white/5 flex flex-row items-center justify-between space-y-0 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black tracking-tight text-white uppercase italic">
                {title}
              </DialogTitle>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                Expanded Inspection View
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-6 custom-scrollbar bg-black/40">
          <pre className="font-mono text-sm leading-relaxed">
            {highlightJson(jsonString)}
          </pre>
        </div>

        <div className="p-4 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              {jsonString.length.toLocaleString()} bytes •{' '}
              {jsonString.split('\n').length} lines
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="border-white/10 hover:bg-white/5 h-8 px-3 gap-2 text-[10px] font-bold uppercase tracking-widest"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-emerald-400" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3 text-slate-400" />
                  Copy JSON
                </>
              )}
            </Button>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-cyan-400" /> Key
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400" /> String
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
