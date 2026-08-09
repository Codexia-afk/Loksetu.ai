import React from 'react';
import { Users, User, Lock, Shield } from 'lucide-react';

interface HeaderProps {
  mode: 'citizen' | 'facilitator';
  onToggleMode: (newMode: 'citizen' | 'facilitator') => void;
}

export const Header: React.FC<HeaderProps> = ({ mode, onToggleMode }) => {
  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/90 px-4 py-3 sticky top-0 z-50 shadow-xs">
      <div className="flex flex-col items-center justify-center space-y-2">
        {/* Central Shield Icon & Brand Header */}
        <div className="flex items-center space-x-3">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl blur-xs opacity-60 group-hover:opacity-100 transition duration-300"></div>
            <img
              src="/icons/loksetu_shield_transparent.png"
              alt="LokSetu Shield Emblem"
              className="relative w-10 h-10 object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                // Fallback to icon128 if transparent PNG not available
                (e.target as HTMLImageElement).src = '/icons/icon128.png';
              }}
            />
          </div>

          <div className="flex flex-col text-left">
            <div className="flex items-center space-x-2">
              <h1 className="font-extrabold text-slate-900 text-lg tracking-tight leading-none">
                LokSetu
              </h1>
              <span className="text-[10px] font-semibold bg-gradient-to-r from-emerald-50 to-teal-50 text-teal-700 border border-teal-200 px-1.5 py-0.5 rounded-full shadow-2xs font-mono">
                v2.1 God Mode
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1 mt-0.5">
              <Lock className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>Sovereign Zero-Knowledge Copilot</span>
            </p>
          </div>
        </div>

        {/* Dual Mode Switcher Pills */}
        <div className="bg-slate-100 p-1 rounded-xl border border-slate-200/80 flex items-center space-x-1 w-full max-w-xs shadow-2xs">
          <button
            onClick={() => onToggleMode('citizen')}
            className={`flex-1 flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              mode === 'citizen'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
            title="Citizen Self-Service Mode"
          >
            <User className="w-3.5 h-3.5" />
            <span>Self-Service</span>
          </button>

          <button
            onClick={() => onToggleMode('facilitator')}
            className={`flex-1 flex items-center justify-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              mode === 'facilitator'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
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
