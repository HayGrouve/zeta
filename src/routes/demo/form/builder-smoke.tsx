import { createFileRoute } from '@tanstack/react-router'

import { DynamicFormRenderer } from '@/components/form-builder/DynamicFormRenderer'
import type { FormSchema } from '@/types/form-schema'

export const Route = createFileRoute('/demo/form/builder-smoke')({
  component: BuilderSmoke,
})

const smokeSchema: FormSchema = {
  id: 'builder-smoke',
  title: 'Form Builder Smoke Test',
  description: 'Hardcoded schema to quickly verify core renderer behavior.',
  groups: [
    {
      id: 'account',
      title: 'Account',
      description: 'Basic account selection',
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
          description: 'Verify nested groups render correctly.',
          fields: [
            {
              id: 'address.street',
              type: 'text',
              label: 'Street',
            },
            {
              id: 'address.zip',
              type: 'text',
              label: 'ZIP',
              placeholder: 'e.g. 10001',
            },
            {
              id: 'address.notes',
              type: 'textarea',
              label: 'Notes',
              placeholder: 'Optional notes',
            },
          ],
        },
      ],
    },
  ],
}

function BuilderSmoke() {
  return (
    <div
      className="min-h-screen p-6 text-white"
      style={{
        backgroundColor: '#000',
        backgroundImage:
          'radial-gradient(ellipse 60% 60% at 0% 100%, #444 0%, #222 60%, #000 100%)',
      }}
    >
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <DynamicFormRenderer
          schema={smokeSchema}
          onSubmit={(values) => {
            console.log('SMOKE_SUBMIT', values)
            alert('Submitted! Check console for nested values.')
          }}
        />
      </div>
    </div>
  )
}

