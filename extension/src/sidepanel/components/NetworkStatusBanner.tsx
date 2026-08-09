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
    <div className={`px-3.5 py-2 rounded-xl border text-[11px] flex items-center justify-between transition-all shadow-2xs font-medium ${
      isOnline
        ? 'bg-white border-slate-200 text-slate-800'
        : 'bg-amber-50 border-amber-200 text-amber-900'
    }`}>
      <div className="flex items-center gap-1.5">
        {isOnline ? (
          <Wifi className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        ) : (
          <WifiOff className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        )}
        <span>
          {isOnline ? (
            <span className="flex items-center gap-1">
              Online <span className="text-emerald-700 font-mono text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">(Gemini AI Active)</span>
            </span>
          ) : (
            <span className="flex items-center gap-1">
              Offline Mode <span className="text-amber-800 font-mono text-[10px] bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200">(Local Dictionary)</span>
            </span>
          )}
        </span>
      </div>

      <button
        onClick={handleToggleSimulated}
        title="Toggle offline fallback simulation for live judge demo"
        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1 transition-all ${
          netState.isSimulatedOffline
            ? 'bg-amber-600 text-white border-amber-700 shadow-2xs'
            : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
        }`}
      >
        <Zap className="w-2.5 h-2.5 text-amber-500" />
        {netState.isSimulatedOffline ? 'Simulating Offline' : 'Simulate Offline'}
      </button>
    </div>
  );
};
