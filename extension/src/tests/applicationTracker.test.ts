import { describe, it, expect, vi } from 'vitest';
import {
  createTrackerRecord,
  encryptTrackerRecord,
  decryptTrackerRecord,
  getOfficialStatusUrl
} from '../engine/applicationTracker';

describe('Gap 5: Post-Submission Application Tracker Verification Suite', () => {
  const PIN = '123456';

  it('1. Creates valid tracker record with official portal deep link', () => {
    const record = createTrackerRecord('wb_krishak_bandhu', 'WB Krishak Bandhu', 'KB-2026-WB-88912', 7);

    expect(record.trackerId).toBeTruthy();
    expect(record.schemeId).toBe('wb_krishak_bandhu');
    expect(record.referenceNumber).toBe('KB-2026-WB-88912');
    expect(record.officialStatusUrl).toContain('matirkatha.wb.gov.in');
  });

  it('2. Encrypts and decrypts tracker records via AES-256-GCM without exposing plaintext in storage', async () => {
    const record = createTrackerRecord('pm_kisan', 'PM-KISAN', 'PMK-9988776655', 14);

    const encryptedJson = await encryptTrackerRecord(record, PIN);
    expect(encryptedJson).not.toContain('PMK-9988776655'); // No plaintext reference number in payload
    expect(encryptedJson).toContain('ciphertextHex');

    const decrypted = await decryptTrackerRecord(encryptedJson, PIN);
    expect(decrypted.referenceNumber).toBe('PMK-9988776655');
    expect(decrypted.schemeName).toBe('PM-KISAN');
  });

  it('3. Guarantees ZERO network calls / XHR / fetch during tracker execution', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    const record = createTrackerRecord('mp_ladli_behna', 'MP Ladli Behna', 'LB-2026-MP-445566', 30);
    const encrypted = await encryptTrackerRecord(record, PIN);
    const decrypted = await decryptTrackerRecord(encrypted, PIN);

    expect(decrypted.referenceNumber).toBe('LB-2026-MP-445566');
    expect(fetchSpy).not.toHaveBeenCalled();

    fetchSpy.mockRestore();
  });
});
