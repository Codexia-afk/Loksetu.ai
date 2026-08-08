import { CitizenProfile } from '../types';

const PBKDF2_ITERATIONS = 600000; // OWASP 2023+ requirement for offline brute-force friction
const DB_NAME = 'LokSetu_Vault_DB';
const DB_VERSION = 1;
const STORE_NAME = 'encrypted_profiles';

export interface EncryptedVaultContainer {
  version: '1.0';
  profileId: string;
  profileName: string;
  saltHex: string;
  ivHex: string;
  ciphertextHex: string;
  createdAt: string;
}

/**
 * Derives an AES-GCM 256-bit Key from a user numeric PIN using 600,000 PBKDF2 iterations.
 */
async function deriveKey(pin: string, salt: Uint8Array): Promise<CryptoKey> {
  if (!pin || pin.length < 6) {
    throw new Error('PIN must be at least 6 digits for cryptographic safety.');
  }

  const encoder = new TextEncoder();
  const pinBuffer = encoder.encode(pin);

  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    pinBuffer,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Helpers for Hex Conversion
function bufToHex(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

function hexToBuf(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Encrypts a CitizenProfile into a portable EncryptedVaultContainer payload.
 */
export async function encryptProfile(profile: CitizenProfile, pin: string): Promise<EncryptedVaultContainer> {
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(pin, salt);

  const encoder = new TextEncoder();
  const plaintext = encoder.encode(JSON.stringify(profile));

  const ciphertext = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
    key,
    plaintext
  );

  return {
    version: '1.0',
    profileId: profile.id,
    profileName: profile.profileName,
    saltHex: bufToHex(salt),
    ivHex: bufToHex(iv),
    ciphertextHex: bufToHex(ciphertext),
    createdAt: new Date().toISOString()
  };
}

/**
 * Decrypts an EncryptedVaultContainer payload into a CitizenProfile.
 */
export async function decryptProfile(container: EncryptedVaultContainer, pin: string): Promise<CitizenProfile> {
  const salt = hexToBuf(container.saltHex);
  const iv = hexToBuf(container.ivHex);
  const ciphertext = hexToBuf(container.ciphertextHex);

  const key = await deriveKey(pin, salt);

  try {
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
      key,
      ciphertext.buffer as ArrayBuffer
    );
    const decoder = new TextDecoder();
    return JSON.parse(decoder.decode(decryptedBuffer)) as CitizenProfile;
  } catch (e) {
    throw new Error('Invalid PIN or corrupted vault payload.');
  }
}

/**
 * IndexedDB Database Helper
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'profileId' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveEncryptedProfileToDB(container: EncryptedVaultContainer): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(container);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllEncryptedProfilesFromDB(): Promise<EncryptedVaultContainer[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteProfileFromDB(profileId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(profileId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
