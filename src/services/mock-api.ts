/**
 * Mock external API service.
 *
 * Usage (later UI integration):
 * - Build an input payload from current form values.
 * - Call `callMockApi(endpoint, inputs)` when the user clicks "Fetch Data".
 * - Use `options.delayMs` to control perceived latency (tests should set `delayMs: 0`).
 */

export type MockApiEndpoint =
  | 'fetchAddressFromZip'
  | 'fetchCompanyDetails'
  | 'validateIdentification'

export type MockApiInputs = Record<string, unknown>

export type MockApiOptions = {
  /**
   * Overrides simulated latency. Use `0` in tests.
   */
  delayMs?: number
  /**
   * 0..1 deterministic failure rate based on endpoint+inputs.
   */
  failRate?: number
  /**
   * If true, always throws (useful for demos/tests).
   */
  forceError?: boolean
}

type AddressResponse = { city: string; state: string }
type CompanyDetailsResponse = {
  companyName: string
  tradingName?: string
  vatNumber?: string
}
type IdType = 'PERSONAL_ID' | 'PASSPORT' | 'DRIVER_LICENSE'
type IdentificationValidationResponse = { isValid: boolean; reason?: string }

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function stableStringify(value: unknown): string {
  if (value === null) return 'null'
  if (typeof value !== 'object') return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`
  const obj = value as Record<string, unknown>
  const keys = Object.keys(obj).sort()
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(',')}}`
}

function hashToUnitInterval(input: string): number {
  // FNV-1a 32-bit
  let hash = 2166136261
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  // map to [0, 1)
  return (hash >>> 0) / 2 ** 32
}

function getDefaultDelayMs(endpoint: MockApiEndpoint, inputs: MockApiInputs): number {
  const r = hashToUnitInterval(`${endpoint}:${stableStringify(inputs)}`)
  // 400..800ms inclusive-ish
  return 400 + Math.floor(r * 401)
}

function shouldFail(
  endpoint: MockApiEndpoint,
  inputs: MockApiInputs,
  failRate: number,
): boolean {
  if (failRate <= 0) return false
  if (failRate >= 1) return true
  const r = hashToUnitInterval(`fail:${endpoint}:${stableStringify(inputs)}`)
  return r < failRate
}

function readString(inputs: MockApiInputs, key: string): string | undefined {
  const value = inputs[key]
  return typeof value === 'string' ? value : undefined
}

function assertNonEmptyString(value: string | undefined, fieldName: string): string {
  if (!value || value.trim().length === 0) {
    throw new Error(`MOCK_API:INVALID_INPUT:${fieldName}`)
  }
  return value.trim()
}

function normalizeZip(zip: string): string {
  const normalized = zip.trim()
  // US ZIP or ZIP+4
  const isValid = /^\d{5}(-\d{4})?$/.test(normalized)
  if (!isValid) {
    throw new Error('MOCK_API:INVALID_ZIP')
  }
  return normalized.slice(0, 5)
}

function fetchAddressFromZip(inputs: MockApiInputs): AddressResponse {
  const zip = assertNonEmptyString(readString(inputs, 'zip'), 'zip')
  const zip5 = normalizeZip(zip)

  const table: Record<string, AddressResponse> = {
    '10001': { city: 'New York', state: 'NY' },
    '94105': { city: 'San Francisco', state: 'CA' },
    '60601': { city: 'Chicago', state: 'IL' },
  }

  return table[zip5] ?? { city: 'Unknown City', state: 'Unknown State' }
}

function fetchCompanyDetails(inputs: MockApiInputs): CompanyDetailsResponse {
  const registrationNumber = assertNonEmptyString(
    readString(inputs, 'registrationNumber'),
    'registrationNumber',
  )

  const table: Record<string, CompanyDetailsResponse> = {
    'REG-0001': {
      companyName: 'Zeta Demo Holdings (Pty) Ltd',
      tradingName: 'Zeta Demo',
      vatNumber: 'ZA1234567890',
    },
    'REG-0002': {
      companyName: 'Acme Trading (Pty) Ltd',
      tradingName: 'Acme',
    },
  }

  return (
    table[registrationNumber] ?? {
      companyName: `Company ${registrationNumber}`,
    }
  )
}

function validateIdentification(inputs: MockApiInputs): IdentificationValidationResponse {
  const idTypeRaw = readString(inputs, 'idType')
  const idNumber = assertNonEmptyString(readString(inputs, 'idNumber'), 'idNumber')

  if (idTypeRaw !== 'PERSONAL_ID' && idTypeRaw !== 'PASSPORT' && idTypeRaw !== 'DRIVER_LICENSE') {
    throw new Error('MOCK_API:INVALID_INPUT:idType')
  }

  const idType: IdType = idTypeRaw

  const patterns: Record<IdType, RegExp> = {
    PERSONAL_ID: /^\d{10}$/,
    PASSPORT: /^[A-Z0-9]{6,9}$/i,
    DRIVER_LICENSE: /^[A-Z0-9-]{5,15}$/i,
  }

  const isValid = patterns[idType].test(idNumber)
  return isValid
    ? { isValid: true }
    : { isValid: false, reason: `Invalid format for ${idType}` }
}

export async function callMockApi(
  endpoint: MockApiEndpoint,
  inputs: MockApiInputs,
  options: MockApiOptions = {},
): Promise<unknown> {
  if (options.forceError) {
    throw new Error('MOCK_API:FORCED_ERROR')
  }

  const failRate = typeof options.failRate === 'number' ? options.failRate : 0
  if (shouldFail(endpoint, inputs, failRate)) {
    throw new Error('MOCK_API:RANDOM_FAILURE')
  }

  const delayMs =
    typeof options.delayMs === 'number'
      ? Math.max(0, Math.floor(options.delayMs))
      : getDefaultDelayMs(endpoint, inputs)

  if (delayMs > 0) {
    await sleep(delayMs)
  }

  switch (endpoint) {
    case 'fetchAddressFromZip':
      return fetchAddressFromZip(inputs)
    case 'fetchCompanyDetails':
      return fetchCompanyDetails(inputs)
    case 'validateIdentification':
      return validateIdentification(inputs)
    default: {
      const _exhaustive: never = endpoint
      return _exhaustive
    }
  }
}

