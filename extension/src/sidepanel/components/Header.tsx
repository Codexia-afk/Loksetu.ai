import React from 'react';
import { Users, User, Lock, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  mode: 'citizen' | 'facilitator';
  onToggleMode: (newMode: 'citizen' | 'facilitator') => void;
}

export const Header: React.FC<HeaderProps> = ({ mode, onToggleMode }) => {
  return (
    <header className="bg-[#0F2C59] text-white border-b-4 border-[#FF671F] px-4 py-3 sticky top-0 z-50 shadow-md">
      <div className="flex flex-col items-center justify-center space-y-2.5">
        {/* Central Shield Icon & Brand Header */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 p-1 flex items-center justify-center border border-white/20 shadow-inner">
            <img
              src="/icons/loksetu_shield_logo.svg"
              alt="LokSetu Sovereign Emblem"
              className="w-8 h-8 object-contain"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          <div className="flex flex-col text-left">
            <div className="flex items-center space-x-2">
              <h1 className="font-extrabold text-white text-lg tracking-tight leading-none flex items-center gap-1.5">
                LokSetu
              </h1>
              <span className="text-[10px] font-bold bg-[#FF671F] text-white px-2 py-0.5 rounded-full font-mono shadow-xs uppercase">
                v2.1 God Mode
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-200 flex items-center gap-1 mt-0.5">
              <Lock className="w-3 h-3 text-[#10B981] shrink-0" />
              <span>Sovereign Zero-Knowledge Copilot</span>
            </p>
          </div>
        </div>

        {/* Dual Mode Switcher Pills */}
        <div className="bg-slate-900/60 p-1 rounded-xl border border-white/10 flex items-center space-x-1 w-full max-w-xs">
          <button
            onClick={() => onToggleMode('citizen')}
            className={`flex-1 flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === 'citizen'
                ? 'bg-white text-[#0F2C59] shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
            title="Citizen Self-Service Mode"
          >
            <User className="w-3.5 h-3.5" />
            <span>Self-Service</span>
          </button>

          <button
            onClick={() => onToggleMode('facilitator')}
            className={`flex-1 flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === 'facilitator'
                ? 'bg-[#FF671F] text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
            title="CSC Facilitator / NGO Operator Mode"
          >
            <Users className="w-3.5 h-3.5" />
            <span>CSC Operator</span>
          </button>
        </div>
      </div>
    </header>
  );
};
