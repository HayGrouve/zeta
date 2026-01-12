import { render } from '@testing-library/react'
import type { RenderOptions } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

import type { FormSchema } from '@/types/form-schema'

export function renderUi(ui: React.ReactElement, options?: RenderOptions) {
  return render(ui, options)
}

export async function advance(ms: number) {
  vi.advanceTimersByTime(ms)
  // Flush microtasks (state updates, promises)
  await Promise.resolve()
  await Promise.resolve()
}

export function setupFakeTimers() {
  vi.useFakeTimers()
  return () => vi.useRealTimers()
}

export function mockAlert() {
  return vi.spyOn(window, 'alert').mockImplementation(() => {})
}

export function clearLocalStorage() {
  localStorage.clear()
}

afterEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
})

export function makeSchema(): FormSchema {
  return {
    id: 'test.schema',
    title: 'Test Schema',
    groups: [
      {
        id: 'group1',
        title: 'Group 1',
        fields: [
          { id: 'name', type: 'text', label: 'Name' },
          { id: 'bio', type: 'textarea', label: 'Bio' },
          {
            id: 'role',
            type: 'dropdown',
            label: 'Role',
            options: [
              { label: 'User', value: 'USER' },
              { label: 'Admin', value: 'ADMIN' },
            ],
          },
          { id: 'agree', type: 'checkbox', label: 'Agree' },
          {
            id: 'idType',
            type: 'radio',
            label: 'ID Type',
            options: [
              { label: 'Personal ID', value: 'PERSONAL_ID' },
              { label: 'Passport', value: 'PASSPORT' },
            ],
          },
        ],
        groups: [
          {
            id: 'nested',
            title: 'Nested Group',
            fields: [{ id: 'address.zip', type: 'text', label: 'ZIP' }],
          },
        ],
      },
    ],
  }
}

