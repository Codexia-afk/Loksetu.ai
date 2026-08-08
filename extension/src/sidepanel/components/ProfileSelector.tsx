import React, { useState, useEffect } from 'react';
import { CitizenProfile } from '../../types';
import {
  encryptProfile,
  decryptProfile,
  saveEncryptedProfileToDB,
  getAllEncryptedProfilesFromDB,
  EncryptedVaultContainer
} from '../../services/cryptoVault';

interface ProfileSelectorProps {
  activeProfile: CitizenProfile | null;
  onProfileLoaded: (profile: CitizenProfile | null) => void;
}

export const ProfileSelector: React.FC<ProfileSelectorProps> = ({ activeProfile, onProfileLoaded }) => {
  const [containers, setContainers] = useState<EncryptedVaultContainer[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [pin, setPin] = useState<string>('123456');
  const [profileNameInput, setProfileNameInput] = useState<string>('Ramesh Chandra Das (Citizen)');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string>('');

  useEffect(() => {
    loadProfileList();
  }, []);

  const loadProfileList = async () => {
    try {
      const list = await getAllEncryptedProfilesFromDB();
      setContainers(list);
      if (list.length > 0 && !selectedProfileId) {
        setSelectedProfileId(list[0].profileId);
      }
    } catch (e) {
      console.error('Error loading vault list:', e);
    }
  };

  const handleCreateDefaultProfile = async () => {
    if (pin.length < 6) {
      setStatusMsg('❌ PIN must be at least 6 digits (OWASP Cryptographic Standard).');
      return;
    }

    setIsLoading(true);
    setStatusMsg('🔒 Deriving AES-256 key via 600,000 PBKDF2 iterations...');

    setTimeout(async () => {
      try {
        const newProfile: CitizenProfile = {
          id: `profile_${Date.now()}`,
          profileName: profileNameInput,
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
          documentEntries: {
            aadhaar_doc: { fileName: 'aadhaar_ramesh.pdf', confidence: 94 },
            land_doc: { fileName: 'khatiyan_402.pdf', documentNumber: '402/1', confidence: 88 }
          }
        };

        const encrypted = await encryptProfile(newProfile, pin);
        await saveEncryptedProfileToDB(encrypted);
        await loadProfileList();
        setSelectedProfileId(newProfile.id);
        onProfileLoaded(newProfile);
        setStatusMsg('✅ Profile created & encrypted in IndexedDB.');
      } catch (e: any) {
        setStatusMsg(`❌ Error: ${e.message}`);
      } finally {
        setIsLoading(false);
      }
    }, 50);
  };

  const handleUnlockProfile = async () => {
    if (!selectedProfileId) return;
    if (pin.length < 6) {
      setStatusMsg('❌ Enter 6-digit PIN.');
      return;
    }

    const container = containers.find(c => c.profileId === selectedProfileId);
    if (!container) return;

    setIsLoading(true);
    setStatusMsg('🔓 Decrypting vault via 600k PBKDF2 iterations...');

    setTimeout(async () => {
      try {
        const decrypted = await decryptProfile(container, pin);
        onProfileLoaded(decrypted);
        setStatusMsg(`✅ Unlocked profile: ${decrypted.profileName}`);
      } catch (e: any) {
        setStatusMsg('❌ Invalid PIN or decryption failure.');
      } finally {
        setIsLoading(false);
      }
    }, 50);
  };

  const handleExportProfile = async () => {
    if (!activeProfile) return;
    try {
      const container = await encryptProfile(activeProfile, pin);
      const jsonStr = JSON.stringify(container, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeProfile.profileName.replace(/\s+/g, '_')}_encrypted.loksetu`;
      a.click();
      setStatusMsg('💾 Encrypted .loksetu backup exported successfully.');
    } catch (e: any) {
      setStatusMsg(`❌ Export failed: ${e.message}`);
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const container = JSON.parse(text) as EncryptedVaultContainer;
      if (!container.saltHex || !container.ciphertextHex) {
        throw new Error('Invalid .loksetu file structure.');
      }
      await saveEncryptedProfileToDB(container);
      await loadProfileList();
      setSelectedProfileId(container.profileId);
      setStatusMsg('📥 Encrypted container imported. Enter PIN to unlock.');
    } catch (err: any) {
      setStatusMsg(`❌ Import error: ${err.message}`);
    }
  };

  return (
    <div className="sp-card">
      <div className="sp-card-title">
        <span>👤 Facilitator Vault Manager</span>
        <span className="badge-tag badge-info">Multi-Profile Mode</span>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label style={{ fontSize: '11px', fontWeight: 600, color: '#475569' }}>Select Citizen Profile:</label>
        <select
          className="form-control"
          style={{ padding: '6px', fontSize: '12px', marginTop: '2px' }}
          value={selectedProfileId}
          onChange={(e) => setSelectedProfileId(e.target.value)}
        >
          {containers.length === 0 && <option value="">No profiles found in vault</option>}
          {containers.map(c => (
            <option key={c.profileId} value={c.profileId}>
              {c.profileName} (Encrypted)
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
        <input
          type="password"
          placeholder="6-Digit PIN (e.g. 123456)"
          maxLength={6}
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          style={{ width: '60%', padding: '6px 8px', fontSize: '12px', borderRadius: '4px', border: '1px solid #CBD5E1' }}
        />
        <button
          className="btn-sp-primary"
          style={{ width: '40%' }}
          onClick={handleUnlockProfile}
          disabled={isLoading || !selectedProfileId}
        >
          {isLoading ? 'Decrypting...' : '🔓 Unlock'}
        </button>
      </div>

      {containers.length === 0 && (
        <div style={{ marginTop: '8px', borderTop: '1px solid #E2E8F0', paddingTop: '8px' }}>
          <input
            type="text"
            placeholder="Citizen Profile Name"
            value={profileNameInput}
            onChange={(e) => setProfileNameInput(e.target.value)}
            style={{ width: '100%', padding: '6px', fontSize: '11px', marginBottom: '6px', borderRadius: '4px', border: '1px solid #CBD5E1' }}
          />
          <button className="btn-sp-primary btn-sp-green" onClick={handleCreateDefaultProfile} disabled={isLoading}>
            + Create Demo Citizen Profile (Ramesh Das)
          </button>
        </div>
      )}

      {activeProfile && (
        <div style={{ marginTop: '10px', background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '8px', borderRadius: '6px' }}>
          <div style={{ fontWeight: 700, color: '#166534', fontSize: '12px' }}>Active: {activeProfile.profileName}</div>
          <div style={{ fontSize: '11px', color: '#15803D' }}>
            Aadhaar: {activeProfile.personalDetails.aadhaar_number} | Land: {activeProfile.landAndIncome.land_holding_scale} Acres
          </div>
          <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
            <button
              onClick={handleExportProfile}
              style={{ padding: '4px 8px', fontSize: '10px', background: '#0F2C59', color: '#FFF', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              💾 Export .loksetu File
            </button>
            <label style={{ padding: '4px 8px', fontSize: '10px', background: '#475569', color: '#FFF', borderRadius: '4px', cursor: 'pointer' }}>
              📥 Import Profile
              <input type="file" accept=".loksetu,.json" style={{ display: 'none' }} onChange={handleImportFile} />
            </label>
          </div>
        </div>
      )}

      {statusMsg && (
        <div style={{ marginTop: '8px', fontSize: '11px', fontWeight: 600, color: statusMsg.startsWith('❌') ? '#DC2626' : '#15803D' }}>
          {statusMsg}
        </div>
      )}
    </div>
  );
};
