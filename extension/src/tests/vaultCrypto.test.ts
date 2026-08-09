// @vitest-environment jsdom
import { describe, it, expect, beforeAll } from 'vitest';
import { CitizenProfile } from '../types';
import { encryptProfile, decryptProfile } from '../engine/vaultCrypto';

beforeAll(async () => {
  if (!window.crypto || !window.crypto.subtle) {
    const cryptoModule = await import('node:crypto');
    Object.defineProperty(window, 'crypto', { value: cryptoModule.webcrypto });
  }
});

describe('Fix #2 & Constraint 5: 600,000 PBKDF2 + AES-GCM Vault Cryptography', () => {
  const sampleProfile: CitizenProfile = {
    id: 'test_profile_123',
    profileName: 'Test Citizen',
    fullName: 'Test Citizen',
    age: 34,
    gender: 'Male',
    state: 'West Bengal',
    district: 'Kolkata',
    annualIncome: 100000,
    category: 'Small',
    landHoldingHectares: 1.5,
    updatedAt: new Date().toISOString(),
    personalDetails: {
      full_name: 'Test Citizen',
      dob: '1990-01-01',
      gender: 'Male',
      aadhaar_number: '123456789012',
      mobile_number: '9876543210'
    }
  };

  it('should reject PINs shorter than 6 digits', async () => {
    await expect(encryptProfile(sampleProfile, '12345')).rejects.toThrow(
      'PIN must be at least 6 digits for cryptographic safety.'
    );
  });

  it('should successfully encrypt and decrypt round-trip with a valid 6-digit PIN', async () => {
    const pin = '654321';
    const container = await encryptProfile(sampleProfile, pin);

    expect(container.saltHex).toBeDefined();
    expect(container.ivHex).toBeDefined();
    expect(container.ciphertextHex).toBeDefined();

    const decrypted = await decryptProfile(container, pin);
    expect(decrypted.id).toBe(sampleProfile.id);
    expect(decrypted.fullName || decrypted.personalDetails?.full_name).toBe('Test Citizen');
  });

  it('should fail decryption when given an incorrect PIN', async () => {
    const pin = '654321';
    const container = await encryptProfile(sampleProfile, pin);

    await expect(decryptProfile(container, '999999')).rejects.toThrow(
      'Invalid PIN or corrupted vault payload.'
    );
  });
});
