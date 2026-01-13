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
      visibility: {
        dependsOn: 'account.type',
        operator: 'equals',
        value: 'INDIVIDUAL',
      },
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
      visibility: {
        dependsOn: 'account.type',
        operator: 'equals',
        value: 'BUSINESS',
      },
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
          id: 'loanDetails',
          title: 'Loan Details',
          fields: [
            {
              id: 'loan.amount',
              type: 'number',
              label: 'Requested Amount ($)',
              placeholder: 'Enter amount',
              validation: [
                {
                  rules: {
                    min: 1000,
                    max: 100000,
                    message: 'Loan amount must be between $1,000 and $100,000',
                  },
                },
              ],
            },
            {
              id: 'loan.income',
              type: 'number',
              label: 'Monthly Income ($)',
              placeholder: 'Enter your monthly income',
              validation: [
                {
                  rules: {
                    min: 500,
                    message: 'Minimum monthly income required is $500',
                  },
                },
              ],
            },
          ],
        },
        {
          id: 'address',
          title: 'Address',
          description: 'ZIP can be used to auto-fill city/state (mocked).',
          fields: [
            { id: 'address.street', type: 'text', label: 'Street' },
            {
              id: 'address.zip',
              type: 'text',
              label: 'ZIP',
              placeholder: 'e.g. 10001',
            },
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

const showcaseSchema: FormSchema = {
  id: 'example.showcase',
  title: 'Showcase (All Features)',
  description:
    'All input types, nested groups, dynamic visibility, and mock API integrations in one blueprint.',
  apiIntegrations: [
    {
      id: 'zipLookup',
      endpoint: 'fetchAddressFromZip',
      triggerFields: ['address.zip'],
      targetFields: ['address.city', 'address.state'],
    },
    {
      id: 'companyLookup',
      endpoint: 'fetchCompanyDetails',
      triggerFields: ['company.registrationNumber'],
      targetFields: [
        'company.companyName',
        'company.tradingName',
        'company.vatNumber',
      ],
    },
  ],
  groups: [
    {
      id: 'controls',
      title: 'Controls',
      description: 'Change these values to trigger visibility and API actions.',
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
          validation: [
            { rules: { required: true, message: 'Account type is required' } },
          ],
        },
        {
          id: 'controls.enableAdvanced',
          type: 'checkbox',
          label: 'Enable advanced section',
        },
      ],
    },
    {
      id: 'advanced',
      title: 'Advanced Section (Dynamic Visibility)',
      description: 'Visible when controls.enableAdvanced is checked.',
      visibility: {
        dependsOn: 'controls.enableAdvanced',
        operator: 'equals',
        value: true,
      },
      groups: [
        {
          id: 'advanced.nestedA',
          title: 'Nested Group A',
          fields: [
            {
              id: 'advanced.note',
              type: 'textarea',
              label: 'Notes',
              placeholder: 'This group only appears when advanced is enabled.',
            },
          ],
        },
        {
          id: 'advanced.nestedB',
          title: 'Nested Group B',
          fields: [
            {
              id: 'advanced.flag',
              type: 'checkbox',
              label: 'Extra Flag',
            },
          ],
        },
      ],
    },
    {
      id: 'allTypes',
      title: 'All Input Types',
      fields: [
        {
          id: 'profile.fullName',
          type: 'text',
          label: 'Full Name',
          placeholder: 'Jane Doe',
          validation: [
            { rules: { required: true, message: 'Full name is required' } },
          ],
        },
        {
          id: 'profile.bio',
          type: 'textarea',
          label: 'Bio',
          placeholder: 'Tell us a bit about yourself...',
          validation: [
            {
              rules: {
                maxLength: 160,
                message: 'Bio must be 160 chars or less',
              },
            },
          ],
        },
        {
          id: 'profile.age',
          type: 'number',
          label: 'Age',
          placeholder: 'Numbers only',
          validation: [
            {
              rules: {
                min: 18,
                max: 120,
                message: 'Age must be between 18 and 120',
              },
            },
          ],
        },
        {
          id: 'prefs.contactMethod',
          type: 'radio',
          label: 'Contact Method',
          options: [
            { label: 'Email', value: 'EMAIL' },
            { label: 'SMS', value: 'SMS' },
          ],
          validation: [
            { rules: { required: true, message: 'Choose a contact method' } },
          ],
        },
        {
          id: 'prefs.country',
          type: 'dropdown',
          label: 'Country',
          placeholder: 'Select country',
          options: [
            { label: 'South Africa', value: 'ZA' },
            { label: 'United States', value: 'US' },
          ],
        },
        {
          id: 'prefs.subscribe',
          type: 'checkbox',
          label: 'Subscribe to product updates',
        },
      ],
    },
    {
      id: 'business',
      title: 'Business Details',
      description: 'Visible when account.type = BUSINESS. Try REG-0001 or REG-0002, then click Fetch Data.',
      visibility: {
        dependsOn: 'account.type',
        operator: 'equals',
        value: 'BUSINESS',
      },
      fields: [
        {
          id: 'company.registrationNumber',
          type: 'text',
          label: 'Registration Number',
          placeholder: 'e.g. REG-0001 or REG-0002',
          defaultValue: 'REG-0001',
          validation: [
            {
              rules: {
                required: true,
                message: 'Registration number is required',
              },
            },
          ],
        },
        {
          id: 'company.companyName',
          type: 'text',
          label: 'Company Name (API filled)',
          disabled: true,
        },
        {
          id: 'company.tradingName',
          type: 'text',
          label: 'Trading Name (API filled)',
          disabled: true,
        },
        {
          id: 'company.vatNumber',
          type: 'text',
          label: 'VAT Number (API filled)',
          disabled: true,
        },
      ],
    },
    {
      id: 'identity',
      title: 'Identity (Dynamic Validation)',
      fields: [
        {
          id: 'identity.idType',
          type: 'radio',
          label: 'Identification Type',
          defaultValue: 'PERSONAL_ID',
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
          defaultValue: '1234567890',
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
    },
    {
      id: 'address',
      title: 'Address (Nested + API)',
      description:
        'Enter a ZIP like 10001, 94105, or 60601, then click Fetch Data.',
      groups: [
        {
          id: 'address.nested',
          title: 'Address (Nested Group)',
          fields: [
            { id: 'address.street', type: 'text', label: 'Street' },
            {
              id: 'address.zip',
              type: 'text',
              label: 'ZIP',
              placeholder: 'e.g. 10001',
              defaultValue: '10001',
            },
            {
              id: 'address.city',
              type: 'text',
              label: 'City (API filled)',
              disabled: true,
            },
            {
              id: 'address.state',
              type: 'text',
              label: 'State (API filled)',
              disabled: true,
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
  {
    id: 'showcase',
    title: 'Showcase (All Features)',
    description: showcaseSchema.description ?? '',
    schema: showcaseSchema,
    jsonText: JSON.stringify(showcaseSchema, null, 2),
  },
]
