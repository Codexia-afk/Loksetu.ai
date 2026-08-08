// @vitest-environment jsdom
import { describe, it, expect, beforeAll } from 'vitest';
import { CitizenProfile } from '../types';
import { encryptProfile } from '../services/cryptoVault';

beforeAll(async () => {
  if (!window.crypto || !window.crypto.subtle) {
    const cryptoModule = await import('node:crypto');
    Object.defineProperty(window, 'crypto', { value: cryptoModule.webcrypto });
  }
});

describe('Adversarial Test: Export Vault Plaintext PII Leak Audit (Section 12)', () => {
  const sensitiveProfile: CitizenProfile = {
    id: 'profile_secret_99',
    profileName: 'Ramesh Chandra Das (Citizen)',
    updatedAt: new Date().toISOString(),
    personalDetails: {
      full_name: 'Ramesh Chandra Das',
      dob: '1985-06-15',
      gender: 'Male',
      aadhaar_number: '987654321098',
      mobile_number: '9830012345'
    },
    addressDetails: {
      state: 'West Bengal',
      district: 'Purba Bardhaman',
      block_tehsil: 'Memari-I',
      village_ward: 'Radhakantapur',
      pincode: '713146'
    },
    landAndIncome: {
      farmer_category: 'Small',
      annual_income: 120000,
      nature_of_occupancy: 'Owner',
      land_holding_scale: 1.25,
      is_institutional_landholder: false
    },
    documentEntries: {}
  };

  it('should encrypt all profile values leaving 0 unencrypted plaintext PII strings in export JSON', async () => {
    const pin = '123456';
    const container = await encryptProfile(sensitiveProfile, pin);
    const exportJsonString = JSON.stringify(container);

    // Assert sensitive PII values NEVER appear as raw text in exported container
    expect(exportJsonString).not.toContain('987654321098'); // Aadhaar
    expect(exportJsonString).not.toContain('9830012345');   // Mobile number
    expect(exportJsonString).not.toContain('Radhakantapur'); // Village ward
    expect(exportJsonString).not.toContain('120000');       // Annual income
  });
});
