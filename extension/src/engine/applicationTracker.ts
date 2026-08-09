import { encryptProfile, decryptProfile } from './vaultCrypto';
import { CitizenProfile } from '../types';

export interface ApplicationTrackerRecord {
  trackerId: string;
  schemeId: string;
  schemeName: string;
  referenceNumber: string;
  submissionDate: string;
  reminderDays: number;
  officialStatusUrl: string;
  notes?: string;
}

const OFFICIAL_STATUS_URLS: Record<string, string> = {
  wb_krishak_bandhu: 'https://matirkatha.wb.gov.in/krishakbandhu',
  pm_kisan: 'https://pmkisan.gov.in/FarmerStatus.aspx',
  mp_ladli_behna: 'https://cmladlibehna.mp.gov.in/applicationstatus.aspx'
};

export function getOfficialStatusUrl(schemeId: string): string {
  return OFFICIAL_STATUS_URLS[schemeId] || 'https://www.myscheme.gov.in/';
}

export function createTrackerRecord(
  schemeId: string,
  schemeName: string,
  referenceNumber: string,
  reminderDays: number = 7,
  notes?: string
): ApplicationTrackerRecord {
  if (!referenceNumber || referenceNumber.trim().length === 0) {
    throw new Error('Reference number cannot be empty.');
  }

  return {
    trackerId: `track_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    schemeId,
    schemeName,
    referenceNumber: referenceNumber.trim(),
    submissionDate: new Date().toISOString(),
    reminderDays,
    officialStatusUrl: getOfficialStatusUrl(schemeId),
    notes
  };
}

export async function encryptTrackerRecord(
  record: ApplicationTrackerRecord,
  pin: string
): Promise<string> {
  const dummyProfile: CitizenProfile = {
    id: record.trackerId,
    profileName: record.schemeName,
    documentEntries: { trackerRecord: record }
  };
  const container = await encryptProfile(dummyProfile, pin);
  return JSON.stringify(container);
}

export async function decryptTrackerRecord(
  encryptedJson: string,
  pin: string
): Promise<ApplicationTrackerRecord> {
  const container = JSON.parse(encryptedJson);
  const profile = await decryptProfile(container, pin);
  if (!profile.documentEntries?.trackerRecord) {
    throw new Error('Corrupted or invalid tracker payload.');
  }
  return profile.documentEntries.trackerRecord as ApplicationTrackerRecord;
}
