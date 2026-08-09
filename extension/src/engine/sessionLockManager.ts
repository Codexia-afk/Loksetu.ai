import { CitizenProfile, EncryptedVaultContainer } from '../types';
import { decryptProfile } from './vaultCrypto';

type SessionClearedListener = (reason: string) => void;

let inMemoryDecryptedProfile: CitizenProfile | null = null;
let activeSessionProfileId: string | null = null;
let listeners: SessionClearedListener[] = [];
let idleTimer: any = null;
const IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes default

export function registerSessionClearedListener(listener: SessionClearedListener): () => void {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
}

export function clearSessionMemory(reason: string = 'Session switched or logged out'): void {
  inMemoryDecryptedProfile = null;
  activeSessionProfileId = null;

  if (idleTimer) {
    clearTimeout(idleTimer);
    idleTimer = null;
  }

  listeners.forEach(listener => listener(reason));
}

export function resetIdleTimer(): void {
  if (idleTimer) {
    clearTimeout(idleTimer);
  }
  idleTimer = setTimeout(() => {
    clearSessionMemory('Idle timeout — 5 minutes of inactivity');
  }, IDLE_TIMEOUT_MS);
}

export async function unlockProfileWithPin(
  container: EncryptedVaultContainer,
  pin: string
): Promise<CitizenProfile> {
  // Always wipe prior session memory before decrypting new profile
  clearSessionMemory(`Decrypting new profile session (${container.profileId})`);

  const decrypted = await decryptProfile(container, pin);

  inMemoryDecryptedProfile = decrypted;
  activeSessionProfileId = container.profileId;
  resetIdleTimer();

  return decrypted;
}

export function getActiveSessionProfile(): CitizenProfile | null {
  return inMemoryDecryptedProfile;
}

export function getActiveSessionProfileId(): string | null {
  return activeSessionProfileId;
}
