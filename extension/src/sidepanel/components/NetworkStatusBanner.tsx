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
    <div className={`px-3 py-2 rounded-xl border text-[11px] flex items-center justify-between transition-all shadow-2xs ${
      isOnline
        ? 'bg-white border-slate-200/90 text-slate-800'
        : 'bg-amber-50/90 border-amber-200/90 text-amber-900'
    }`}>
      <div className="flex items-center gap-1.5">
        {isOnline ? (
          <Wifi className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        ) : (
          <WifiOff className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        )}
        <span className="font-semibold">
          {isOnline ? (
            <span className="flex items-center gap-1">
              Online <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200/80 font-mono text-[10px]">Gemini 1.5 Flash</span>
            </span>
          ) : (
            <span className="flex items-center gap-1">
              Offline Mode <span className="text-amber-800 bg-amber-100/80 px-1.5 py-0.5 rounded-md border border-amber-300/80 font-mono text-[10px]">Local Dictionary</span>
            </span>
          )}
        </span>
      </div>

      <button
        onClick={handleToggleSimulated}
        title="Toggle offline fallback simulation for live judge demo"
        className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border flex items-center gap-1 transition-all ${
          netState.isSimulatedOffline
            ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
            : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200/70 hover:text-slate-900'
        }`}
      >
        <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
        {netState.isSimulatedOffline ? 'Simulating Offline' : 'Simulate Offline'}
      </button>
    </div>
  );
};
