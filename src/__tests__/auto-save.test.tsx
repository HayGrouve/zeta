import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { FormBuilderPage } from '@/routes/index'

import { advance, renderUi, setupFakeTimers } from './test-utils'

const STORAGE_KEY = 'zeta.formBuilder.v1'

describe('Auto-save (page integration)', () => {
  it('restores a saved session and supports reset + clear', async () => {
    const saved = {
      version: 1,
      savedAt: Date.now(),
      schemaText: JSON.stringify(
        {
          id: 'example.saved',
          title: 'Saved Schema',
          groups: [{ id: 'g', fields: [{ id: 'name', type: 'text', label: 'Name' }] }],
        },
        null,
        2,
      ),
      values: { name: 'Alice' },
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))

    renderUi(<FormBuilderPage />)

    expect(screen.getByText(/Restored previous session/i)).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /reset current form/i }))
    expect(screen.getByText(/Saved session available/i)).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: /clear saved session/i }))
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('persists schemaText + values after debounce', async () => {
    const cleanupTimers = setupFakeTimers()
    try {
      renderUi(<FormBuilderPage />)

      const textarea = screen.getByLabelText('JSON Schema') as HTMLTextAreaElement

      // Ensure schema is debounced into a valid state before we try to type into the form.
      await advance(1000)

      // Type in schema textarea to trigger autosave on schemaText changes.
      fireEvent.change(textarea, { target: { value: textarea.value } })

      await advance(500)
      const raw = localStorage.getItem(STORAGE_KEY)
      expect(raw).toBeTruthy()
      expect(raw!).toContain('"version":1')
      expect(raw!).toContain('"schemaText"')
      expect(raw!).toContain('"values"')
    } finally {
      cleanupTimers()
    }
  })
})

