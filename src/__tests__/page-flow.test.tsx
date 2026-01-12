import { fireEvent, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { FormBuilderPage } from '@/routes/index'

import { advance, renderUi, setupFakeTimers } from './test-utils'

describe('FormBuilderPage', () => {
  it('debounces schema validation (1s) before showing JSON errors', async () => {
    const cleanupTimers = setupFakeTimers()
    try {
      renderUi(<FormBuilderPage />)

      const textarea = screen.getByLabelText('JSON Schema') as HTMLTextAreaElement
      fireEvent.change(textarea, { target: { value: '{' } })

      // Immediately after typing, we should not show the debounced error yet.
      expect(screen.queryByText('Invalid JSON')).toBeNull()

      await advance(999)
      expect(screen.queryByText('Invalid JSON')).toBeNull()

      await advance(1)
      expect(screen.getByText('Invalid JSON')).toBeTruthy()
    } finally {
      cleanupTimers()
      vi.useRealTimers()
    }
  })

  it('loads an example into the textarea via the Load Example selector', async () => {
    renderUi(<FormBuilderPage />)

    // Open the "Load Example" Radix Select (avoid matching form field dropdowns)
    const loadExampleLabel = screen.getByText('Load Example')
    const loadExampleContainer = loadExampleLabel.parentElement
    expect(loadExampleContainer).toBeTruthy()

    const loadExampleCombobox = within(loadExampleContainer!).getByRole('combobox')
    fireEvent.pointerDown(loadExampleCombobox)
    fireEvent.keyDown(loadExampleCombobox, { key: 'ArrowDown' })

    fireEvent.click(await screen.findByText('Registration (Visibility)'))

    const textarea = screen.getByLabelText('JSON Schema') as HTMLTextAreaElement
    expect(textarea.value).toContain('example.registration')
  })
})

