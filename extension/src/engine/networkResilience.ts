export interface NetworkState {
  isOnline: boolean;
  isSimulatedOffline: boolean;
  activeProvider: 'gemini' | 'offline_dictionary';
  statusMessage: string;
}

let simulatedOffline = false;

export function setSimulatedOffline(state: boolean): void {
  simulatedOffline = state;
}

export function isSimulatedOffline(): boolean {
  return simulatedOffline;
}

export function getNetworkState(): NetworkState {
  const browserOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  const effectiveOnline = browserOnline && !simulatedOffline;

  return {
    isOnline: browserOnline,
    isSimulatedOffline: simulatedOffline,
    activeProvider: effectiveOnline ? 'gemini' : 'offline_dictionary',
    statusMessage: effectiveOnline
      ? 'Online — Gemini AI explanations active'
      : simulatedOffline
      ? 'Demo Mode — Simulated offline, using pre-compiled local dictionary'
      : 'Offline Mode — Zero network, using pre-compiled local dictionary'
  };
}
