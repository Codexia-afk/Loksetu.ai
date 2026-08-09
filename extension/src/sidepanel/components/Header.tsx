import React from 'react';
import { ShieldCheck, Users, User, Lock } from 'lucide-react';

interface HeaderProps {
  mode: 'citizen' | 'facilitator';
  onToggleMode: (newMode: 'citizen' | 'facilitator') => void;
}

export const Header: React.FC<HeaderProps> = ({ mode, onToggleMode }) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-slate-100 text-base leading-tight flex items-center gap-1.5">
              LokSetu <span className="text-xs bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-1.5 py-0.5 rounded font-mono">v2.0</span>
            </h1>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-400" /> Sovereign Zero-Knowledge Copilot
            </p>
          </div>
        </div>

        {/* Dual Mode Switcher */}
        <div className="bg-slate-800/80 p-1 rounded-lg border border-slate-700/60 flex items-center space-x-1">
          <button
            onClick={() => onToggleMode('citizen')}
            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              mode === 'citizen'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
            title="Citizen Self-Service Mode"
          >
            <User className="w-3.5 h-3.5" />
            <span>Self-Service</span>
          </button>
          <button
            onClick={() => onToggleMode('facilitator')}
            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              mode === 'facilitator'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
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
