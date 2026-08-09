export * from '../engine/vaultCrypto';
import { saveProfile, getAllProfilesMeta, getProfile } from '../engine/vaultCrypto';
import { EncryptedVaultContainer, CitizenProfile } from '../types';

export type { EncryptedVaultContainer };

export async function saveEncryptedProfileToDB(container: EncryptedVaultContainer): Promise<void> {
  // Legacy stub helper
}

export async function getAllEncryptedProfilesFromDB(): Promise<EncryptedVaultContainer[]> {
  const meta = await getAllProfilesMeta();
  return meta.map(m => ({
    version: '1.0',
    profileId: m.id,
    profileName: m.profileName,
    saltHex: '',
    ivHex: '',
    ciphertextHex: '',
    createdAt: new Date().toISOString()
  }));
}
