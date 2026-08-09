import { describe, it, expect, beforeEach } from 'vitest';
import { setSimulatedOffline, getNetworkState } from '../engine/networkResilience';
import { explainFieldLabel } from '../engine/geminiExplainer';
import { ScopedExplainerPayload } from '../types';

describe('Gap 2: Network Resilience & Offline Fallback Verification Suite', () => {
  beforeEach(() => {
    setSimulatedOffline(false);
  });

  it('1. getNetworkState correctly reflects default online vs simulated offline mode', () => {
    let state = getNetworkState();
    expect(state.isSimulatedOffline).toBe(false);

    setSimulatedOffline(true);
    state = getNetworkState();
    expect(state.isSimulatedOffline).toBe(true);
    expect(state.activeProvider).toBe('offline_dictionary');
    expect(state.statusMessage).toContain('local dictionary');
  });

  it('2. explainFieldLabel resolves jargon instantly in offline mode without throwing uncaught errors', async () => {
    setSimulatedOffline(true);

    const payload: ScopedExplainerPayload = {
      fieldId: 'natureOfOccupancy',
      labelText: 'Nature of Occupancy',
      ariaLabel: '',
      inputType: 'select',
      placeholder: '',
      contextHint: 'Land holding details'
    };

    const startTime = Date.now();
    const explanation = await explainFieldLabel(payload, 'fake_api_key_123');
    const duration = Date.now() - startTime;

    expect(explanation).toBeTruthy();
    expect(explanation).toContain('Recorded Bargadar');
    expect(duration).toBeLessThan(50); // Under 50ms instant response
  });
});
