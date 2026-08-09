import React, { useState } from 'react';
import { Users, Download, Upload, Plus, CheckCircle2, ShieldAlert, KeyRound, Loader2 } from 'lucide-react';
import { CitizenProfile } from '../../types';
import { exportEncryptedVault, importEncryptedVault } from '../../engine/vaultCrypto';

interface SessionSwitcherProps {
  profiles: CitizenProfile[];
  activeProfileId: string | null;
  onSelectProfile: (id: string) => void;
  onCreateNewProfile: () => void;
  onImportComplete: (importedProfiles: CitizenProfile[]) => void;
}

export const SessionSwitcher: React.FC<SessionSwitcherProps> = ({
  profiles,
  activeProfileId,
  onSelectProfile,
  onCreateNewProfile,
  onImportComplete
}) => {
  const [pin, setPin] = useState('123456');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleExport = async () => {
    if (!pin || pin.length < 6) {
      setStatusMessage('PIN must be at least 6 digits for cryptographic safety.');
      return;
    }
    setIsProcessing(true);
    setStatusMessage('Deriving 600,000-iteration PBKDF2 key...');
    try {
      const vaultData = await exportEncryptedVault(pin);
      const blob = new Blob([vaultData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `loksetu_vault_${new Date().toISOString().slice(0, 10)}.loksetu`;
      a.click();
      URL.revokeObjectURL(url);
      setStatusMessage('Encrypted .loksetu vault exported successfully.');
    } catch (e: any) {
      setStatusMessage(`Export failed: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!pin || pin.length < 6) {
      setStatusMessage('PIN must be at least 6 digits to decrypt import.');
      return;
    }

    setIsProcessing(true);
    setStatusMessage('Decrypting vault payload with PBKDF2 key...');

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const imported = await importEncryptedVault(text, pin);
        onImportComplete(imported);
        setStatusMessage(`Successfully imported ${imported.length} citizen profile(s).`);
      } catch (err: any) {
        setStatusMessage(`Import failed: ${err.message}`);
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-200 text-sm flex items-center gap-2">
          <Users className="w-4 h-4 text-amber-400" />
          Active Citizen Profile Switcher
        </h3>
        <button
          onClick={onCreateNewProfile}
          className="text-xs bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          New Profile
        </button>
      </div>

      <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto pr-1">
        {profiles.map(p => {
          const isActive = p.id === activeProfileId;
          const income = p.annualIncome || p.landAndIncome?.annual_income || 0;
          const name = p.fullName || p.personalDetails?.full_name || 'Citizen';
          const state = p.state || p.addressDetails?.state || 'West Bengal';

          return (
            <button
              key={p.id}
              onClick={() => onSelectProfile(p.id)}
              className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between ${
                isActive
                  ? 'bg-indigo-950/60 border-indigo-500/60 text-slate-100 ring-1 ring-indigo-500/50'
                  : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <div>
                <p className="font-semibold text-slate-200">{p.profileName}</p>
                <p className="text-[11px] text-slate-400">
                  {name} • {state} • ₹{income.toLocaleString('en-IN')}/yr
                </p>
              </div>
              {isActive && (
                <div className="flex items-center gap-1 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Active</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="pt-2 border-t border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
            Vault PIN (6+ digits)
          </span>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-slate-200 px-2 py-1 rounded text-xs w-24 text-center font-mono focus:border-indigo-500 focus:outline-none"
            placeholder="123456"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExport}
            disabled={isProcessing}
            className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 py-1.5 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
          >
            {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" /> : <Download className="w-3.5 h-3.5 text-indigo-400" />}
            Export .loksetu
          </button>

          <label className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 py-1.5 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-all">
            <Upload className="w-3.5 h-3.5 text-amber-400" />
            Import .loksetu
            <input
              type="file"
              accept=".loksetu,.json"
              onChange={handleFileImport}
              className="hidden"
            />
          </label>
        </div>

        {statusMessage && (
          <p className="text-[11px] text-indigo-300 bg-indigo-950/40 border border-indigo-800/40 p-2 rounded flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            {statusMessage}
          </p>
        )}
      </div>
    </div>
  );
};
