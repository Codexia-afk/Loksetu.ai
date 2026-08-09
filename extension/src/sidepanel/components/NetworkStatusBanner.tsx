import React, { useState, useEffect } from 'react';
import { getNetworkState, setSimulatedOffline, NetworkState } from '../../engine/networkResilience';
import { Wifi, WifiOff, Zap } from 'lucide-react';

export const NetworkStatusBanner: React.FC = () => {
  const [netState, setNetState] = useState<NetworkState>(getNetworkState());

  useEffect(() => {
    const handleStatusChange = () => setNetState(getNetworkState());
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

  const handleToggleSimulated = () => {
    setSimulatedOffline(!netState.isSimulatedOffline);
    setNetState(getNetworkState());
  };

  const isOnline = netState.activeProvider === 'gemini';

  return (
    <div className={`px-3 py-1.5 rounded-lg border text-[11px] flex items-center justify-between transition-all ${
      isOnline
        ? 'bg-slate-900/90 border-slate-800 text-slate-300'
        : 'bg-amber-950/70 border-amber-800/60 text-amber-200'
    }`}>
      <div className="flex items-center gap-1.5">
        {isOnline ? (
          <Wifi className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        ) : (
          <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        )}
        <span className="font-medium">
          {isOnline ? (
            <span className="flex items-center gap-1">
              Online <span className="text-emerald-400 font-mono text-[10px]">(Gemini AI)</span>
            </span>
          ) : (
            <span className="flex items-center gap-1">
              Offline Mode <span className="text-amber-300 font-mono text-[10px]">(Local Dictionary)</span>
            </span>
          )}
        </span>
      </div>

      <button
        onClick={handleToggleSimulated}
        title="Toggle offline fallback simulation for live judge demo"
        className={`px-2 py-0.5 rounded text-[10px] font-semibold border flex items-center gap-1 transition-all ${
          netState.isSimulatedOffline
            ? 'bg-amber-600 text-white border-amber-500 shadow-sm'
            : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
        }`}
      >
        <Zap className="w-2.5 h-2.5 text-amber-400" />
        {netState.isSimulatedOffline ? 'Simulating Offline' : 'Simulate Offline'}
      </button>
    </div>
  );
};
