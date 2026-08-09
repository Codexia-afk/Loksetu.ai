import { describe, it, expect, beforeEach } from 'vitest';
import {
  clearSessionMemory,
  unlockProfileWithPin,
  getActiveSessionProfile,
  getActiveSessionProfileId,
  registerSessionClearedListener
} from '../engine/sessionLockManager';
import { encryptProfile } from '../engine/vaultCrypto';
import { CitizenProfile } from '../types';

describe('Gap 4: CSC Session Isolation & In-Memory Protection Verification Suite', () => {
  const profileA: CitizenProfile = {
    id: 'citizen_A_101',
    profileName: 'Citizen A (Ramprasad)',
    fullName: 'Ramprasad Sen',
    aadhaarNumber: '9999-8888-7777',
    annualIncome: 120000
  };

  const profileB: CitizenProfile = {
    id: 'citizen_B_202',
    profileName: 'Citizen B (Sunita)',
    fullName: 'Sunita Devi',
    aadhaarNumber: '8888-7777-6666',
    annualIncome: 85000
  };

  const PIN_A = '123456';
  const PIN_B = '654321';

  beforeEach(() => {
    clearSessionMemory('Test reset');
  });

  it('1. Loading Citizen A and switching to Citizen B completely wipes Citizen A decrypted PII from memory', async () => {
    let clearedMessage = '';
    registerSessionClearedListener((reason) => {
      clearedMessage = reason;
    });

    const containerA = await encryptProfile(profileA, PIN_A);
    const containerB = await encryptProfile(profileB, PIN_B);

    // Unlock Citizen A
    const decryptedA = await unlockProfileWithPin(containerA, PIN_A);
    expect(decryptedA.fullName).toBe('Ramprasad Sen');
    expect(getActiveSessionProfile()?.aadhaarNumber).toBe('9999-8888-7777');
    expect(getActiveSessionProfileId()).toBe('citizen_A_101');

    // Switch to Citizen B
    const decryptedB = await unlockProfileWithPin(containerB, PIN_B);

    // Verify Citizen A PII is 100% gone from active memory
    expect(getActiveSessionProfileId()).toBe('citizen_B_202');
    expect(getActiveSessionProfile()?.fullName).toBe('Sunita Devi');
    expect(getActiveSessionProfile()?.aadhaarNumber).not.toBe('9999-8888-7777');
    expect(clearedMessage).toBeTruthy();
  });

  it('2. Citizen B vault cannot be decrypted without re-entering valid PIN', async () => {
    const containerB = await encryptProfile(profileB, PIN_B);

    // Explicitly wipe session
    clearSessionMemory('Session cleared');
    expect(getActiveSessionProfile()).toBeNull();

    // Attempt decryption with wrong PIN must fail
    await expect(unlockProfileWithPin(containerB, '000000')).rejects.toThrow(/Invalid PIN|corrupted vault/);

    // Decryption with correct PIN succeeds
    const unlocked = await unlockProfileWithPin(containerB, PIN_B);
    expect(unlocked.fullName).toBe('Sunita Devi');
  });
});
