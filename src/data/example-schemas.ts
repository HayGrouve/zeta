import type { FormSchema } from '@/types/form-schema'

export type ExampleSchema = {
  id: string
  title: string
  description: string
  schema: FormSchema
  jsonText: string
}

const registrationSchema: FormSchema = {
  id: 'example.registration',
  title: 'Registration (Individual vs Business)',
  description:
    'Demonstrates dynamic visibility: selecting INDIVIDUAL vs BUSINESS determines which sections appear.',
  groups: [
    {
      id: 'account',
      title: 'Account Type',
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
      ],
    },
    {
      id: 'individual',
      title: 'Individual Details',
      description: 'Shown when account.type = INDIVIDUAL',
      visibility: { dependsOn: 'account.type', operator: 'equals', value: 'INDIVIDUAL' },
      fields: [
        { id: 'individual.firstName', type: 'text', label: 'First Name' },
        { id: 'individual.lastName', type: 'text', label: 'Last Name' },
        { id: 'individual.dateOfBirth', type: 'text', label: 'Date of Birth' },
      ],
    },
    {
      id: 'business',
      title: 'Business Details',
      description: 'Shown when account.type = BUSINESS',
      visibility: { dependsOn: 'account.type', operator: 'equals', value: 'BUSINESS' },
      fields: [
        { id: 'business.companyName', type: 'text', label: 'Company Name' },
        {
          id: 'business.registrationNumber',
          type: 'text',
          label: 'Registration Number',
          placeholder: 'e.g. REG-0001',
        },
      ],
    },
  ],
}

const kycSchema: FormSchema = {
  id: 'example.kyc',
  title: 'KYC (Dynamic Validation by ID Type)',
  description:
    'Demonstrates dynamic validation rules: idNumber format changes based on selected idType.',
  groups: [
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
          placeholder: 'Enter ID number',
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
                pattern: '^[A-Z0-9]{6,9}$',
                message: 'Passport must be 6–9 alphanumeric characters',
              },
            },
            {
              when: { field: 'identity.idType', equals: 'DRIVER_LICENSE' },
              rules: {
                pattern: '^[A-Z0-9-]{5,15}$',
                message: 'Driver license must be 5–15 alphanumeric characters or hyphens',
              },
            },
          ],
        },
      ],
    },
  ],
}

const loanSchema: FormSchema = {
  id: 'example.loan',
  title: 'Loan Application (Nested Groups + Mock API Auto-Fill)',
  description:
    'Demonstrates nested groups and API auto-fill intent: ZIP triggers city/state via mock API.',
  apiIntegrations: [
    {
      id: 'zipLookup',
      endpoint: 'fetchAddressFromZip',
      triggerFields: ['address.zip'],
      targetFields: ['address.city', 'address.state'],
    },
  ],
  groups: [
    {
      id: 'applicant',
      title: 'Applicant',
      fields: [
        { id: 'applicant.fullName', type: 'text', label: 'Full Name' },
        { id: 'applicant.email', type: 'text', label: 'Email' },
      ],
      groups: [
        {
          id: 'address',
          title: 'Address',
          description: 'ZIP can be used to auto-fill city/state (mocked).',
          fields: [
            { id: 'address.street', type: 'text', label: 'Street' },
            { id: 'address.zip', type: 'text', label: 'ZIP', placeholder: 'e.g. 10001' },
            {
              id: 'address.city',
              type: 'text',
              label: 'City',
              disabled: true,
              autoFillFrom: 'zipLookup',
            },
            {
              id: 'address.state',
              type: 'text',
              label: 'State',
              disabled: true,
              autoFillFrom: 'zipLookup',
            },
          ],
        },
      ],
    },
  ],
}

export const EXAMPLE_SCHEMAS: Array<ExampleSchema> = [
  {
    id: 'registration',
    title: 'Registration (Visibility)',
    description: registrationSchema.description ?? '',
    schema: registrationSchema,
    jsonText: JSON.stringify(registrationSchema, null, 2),
  },
  {
    id: 'kyc',
    title: 'KYC (Dynamic Validation)',
    description: kycSchema.description ?? '',
    schema: kycSchema,
    jsonText: JSON.stringify(kycSchema, null, 2),
  },
  {
    id: 'loan',
    title: 'Loan (API Auto-Fill + Nested)',
    description: loanSchema.description ?? '',
    schema: loanSchema,
    jsonText: JSON.stringify(loanSchema, null, 2),
  },
]

