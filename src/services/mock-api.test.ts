import { describe, expect, it } from 'vitest'

import { callMockApi } from './mock-api'

describe('mock api', () => {
  it('fetchAddressFromZip returns a deterministic mapping for known zips', async () => {
    const result = (await callMockApi(
      'fetchAddressFromZip',
      { zip: '10001' },
      { delayMs: 0 },
    )) as { city: string; state: string }

    expect(result).toEqual({ city: 'New York', state: 'NY' })
  })

  it('fetchAddressFromZip throws for invalid zip', async () => {
    await expect(
      callMockApi('fetchAddressFromZip', { zip: 'ABC' }, { delayMs: 0 }),
    ).rejects.toThrow(/MOCK_API:INVALID_ZIP|MOCK_API:INVALID_INPUT:zip/)
  })

  it('fetchCompanyDetails returns deterministic data for known registration numbers', async () => {
    const result = (await callMockApi(
      'fetchCompanyDetails',
      { registrationNumber: 'REG-0001' },
      { delayMs: 0 },
    )) as { companyName: string; tradingName?: string; vatNumber?: string }

    expect(result.companyName).toBe('Zeta Demo Holdings (Pty) Ltd')
    expect(result.tradingName).toBe('Zeta Demo')
  })

  it('validateIdentification returns isValid=true for valid personal id', async () => {
    const result = (await callMockApi(
      'validateIdentification',
      { idType: 'PERSONAL_ID', idNumber: '1234567890' },
      { delayMs: 0 },
    )) as { isValid: boolean; reason?: string }

    expect(result.isValid).toBe(true)
    expect(result.reason).toBeUndefined()
  })

  it('validateIdentification returns isValid=false for invalid passport', async () => {
    const result = (await callMockApi(
      'validateIdentification',
      { idType: 'PASSPORT', idNumber: '###' },
      { delayMs: 0 },
    )) as { isValid: boolean; reason?: string }

    expect(result.isValid).toBe(false)
    expect(result.reason).toMatch(/Invalid format/i)
  })
})

