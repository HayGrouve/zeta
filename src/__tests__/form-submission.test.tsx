import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { DynamicFormRenderer } from '@/components/form-builder/DynamicFormRenderer'

import { makeSchema, renderUi } from './test-utils'

describe('Form submission', () => {
  it('submits nested values using dot-path field ids', async () => {
    const onSubmit = vi.fn()
    renderUi(<DynamicFormRenderer schema={makeSchema()} onSubmit={onSubmit} />)

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Bob' } })
    fireEvent.change(screen.getByLabelText('ZIP'), { target: { value: '12345' } })

    fireEvent.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))

    const submitted = onSubmit.mock.calls[0]![0] as Record<string, unknown>
    expect(submitted['name']).toBe('Bob')
    expect((submitted['address'] as Record<string, unknown>)['zip']).toBe('12345')
  })
})

