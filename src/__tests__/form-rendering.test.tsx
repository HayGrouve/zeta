import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { DynamicFormRenderer } from '@/components/form-builder/DynamicFormRenderer'

import { makeSchema, renderUi } from './test-utils'

describe('DynamicFormRenderer', () => {
  it('renders supported field types and nested groups', () => {
    renderUi(<DynamicFormRenderer schema={makeSchema()} />)

    expect(screen.getByText('Group 1')).toBeTruthy()
    expect(screen.getByText('Nested Group')).toBeTruthy()

    // Field labels
    expect(screen.getByText('Name')).toBeTruthy()
    expect(screen.getByText('Bio')).toBeTruthy()
    expect(screen.getByText('Role')).toBeTruthy()
    expect(screen.getByText('Agree')).toBeTruthy()
    expect(screen.getByText('ID Type')).toBeTruthy()
    expect(screen.getByText('ZIP')).toBeTruthy()

    // Submit button exists
    expect(screen.getByRole('button', { name: /submit/i })).toBeTruthy()
  })
})

