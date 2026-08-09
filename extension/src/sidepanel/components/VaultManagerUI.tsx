import React, { useState } from 'react';
import { CitizenProfile } from '../../types';
import { saveProfile } from '../../engine/vaultCrypto';
import { Lock, ShieldCheck, KeyRound, Loader2, Save } from 'lucide-react';

interface VaultManagerUIProps {
  activeProfile: CitizenProfile;
  onSaveSuccess: (updatedProfile: CitizenProfile) => void;
}

export const VaultManagerUI: React.FC<VaultManagerUIProps> = ({
  activeProfile,
  onSaveSuccess
}) => {
  const [profile, setProfile] = useState<CitizenProfile>({ ...activeProfile });
  const [pin, setPin] = useState('123456');
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleSave = async () => {
    if (!pin || pin.length < 6) {
      setStatusMessage('PIN must be at least 6 digits for OWASP PBKDF2 compliance.');
      return;
    }

    setIsSaving(true);
    setStatusMessage('Deriving AES-256 key via 600,000 PBKDF2 iterations...');

    try {
      const updated = { ...profile, updatedAt: new Date().toISOString() };
      await saveProfile(updated, pin);
      onSaveSuccess(updated);
      setStatusMessage('Vault profile encrypted and saved to on-device IndexedDB.');
    } catch (err: any) {
      setStatusMessage(`Save failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
          <Lock className="w-4 h-4 text-emerald-600" />
          Encrypted On-Device Vault Manager
        </h3>
        <span className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md font-mono font-bold">
          PBKDF2-HMAC-SHA256 (600k)
        </span>
      </div>

      <div className="space-y-3 text-xs">
        <div>
          <label className="text-slate-700 block mb-1 font-semibold">Profile Name</label>
          <input
            type="text"
            value={profile.profileName}
            onChange={e => setProfile({ ...profile, profileName: e.target.value })}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-semibold focus:bg-white focus:border-emerald-500 focus:outline-none shadow-2xs"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-slate-700 block mb-1 font-semibold">Full Name</label>
            <input
              type="text"
              value={profile.fullName}
              onChange={e => setProfile({ ...profile, fullName: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-semibold focus:bg-white focus:border-emerald-500 focus:outline-none shadow-2xs"
            />
          </div>

          <div>
            <label className="text-slate-700 block mb-1 font-semibold">Age</label>
            <input
              type="number"
              value={profile.age}
              onChange={e => setProfile({ ...profile, age: parseInt(e.target.value, 10) || 0 })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-semibold focus:bg-white focus:border-emerald-500 focus:outline-none shadow-2xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-slate-700 block mb-1 font-semibold">State Domicile</label>
            <input
              type="text"
              value={profile.state}
              onChange={e => setProfile({ ...profile, state: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-semibold focus:bg-white focus:border-emerald-500 focus:outline-none shadow-2xs"
            />
          </div>

          <div>
            <label className="text-slate-700 block mb-1 font-semibold">District</label>
            <input
              type="text"
              value={profile.district}
              onChange={e => setProfile({ ...profile, district: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-semibold focus:bg-white focus:border-emerald-500 focus:outline-none shadow-2xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-slate-700 block mb-1 font-semibold">Annual Income (₹)</label>
            <input
              type="number"
              value={profile.annualIncome}
              onChange={e => setProfile({ ...profile, annualIncome: parseInt(e.target.value, 10) || 0 })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-semibold focus:bg-white focus:border-emerald-500 focus:outline-none shadow-2xs"
            />
          </div>

          <div>
            <label className="text-slate-700 block mb-1 font-semibold">Land Scale (Hectares)</label>
            <input
              type="number"
              step="0.01"
              value={profile.landHoldingHectares}
              onChange={e => setProfile({ ...profile, landHoldingHectares: parseFloat(e.target.value) || 0 })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-900 font-semibold focus:bg-white focus:border-emerald-500 focus:outline-none shadow-2xs"
            />
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <KeyRound className="w-4 h-4 text-amber-500" />
            <span className="text-slate-800 font-bold">Encryption PIN:</span>
          </div>
          <input
            type="password"
            value={pin}
            onChange={e => setPin(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-slate-900 px-2 py-1.5 rounded-lg text-center w-24 font-mono font-bold focus:bg-white focus:border-emerald-500 focus:outline-none shadow-2xs"
            placeholder="123456"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-amber-400" /> : <Save className="w-4 h-4 text-emerald-400" />}
          Encrypt & Save to Local Vault
        </button>

        {statusMessage && (
          <p className="text-[11px] text-emerald-900 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            {statusMessage}
          </p>
        )}
      </div>
    </div>
  );
};
