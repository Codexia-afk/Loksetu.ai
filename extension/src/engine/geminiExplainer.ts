import { ScopedExplainerPayload } from '../types';
import { getFallbackExplanation } from './explainerFallbackLibrary';
import { getNetworkState } from './networkResilience';

/**
 * Explains an ambiguous form field label using a Fallback-First design:
 * 1. Checks simulated offline mode & pre-compiled offline library first (guaranteed, instant, 0 network).
 * 2. Optional Gemini API live call if key present, sending ONLY ScopedExplainerPayload (no PII, no values).
 * 3. Graceful fallback string if API fails or unavailable.
 */
export async function explainFieldLabel(payload: ScopedExplainerPayload, apiKey?: string): Promise<string> {
  const netState = getNetworkState();

  // If network is offline or simulated offline, resolve fallback instantly
  if (!netState.isOnline || netState.isSimulatedOffline) {
    const fallback = getFallbackExplanation(payload.labelText, payload.ariaLabel);
    if (fallback) return fallback;
    return `Enter the required information for '${payload.labelText}' as indicated on your official government identity or land documents.`;
  }

  // 1. Check local pre-compiled fallback dictionary first
  const fallback = getFallbackExplanation(payload.labelText, payload.ariaLabel);
  if (fallback && (!apiKey || apiKey.trim().length === 0)) {
    return fallback;
  }

  // 2. If API key present and online, attempt live Gemini call with strictly typed payload
  if (apiKey && apiKey.trim().length > 0) {
    try {
      const prompt = `You are LokSetu AI, an expert Indian civic tech copilot. Explain the following government portal form field label in simple, clear, 1-2 sentence plain language for a rural Indian citizen. Do not include preamble or markdown formatting.
Context Section: ${payload.contextHint || 'General Form'}
Field Label: ${payload.labelText}
Input Type: ${payload.inputType || 'text'}
Placeholder: ${payload.placeholder || 'none'}`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim().length > 0) {
          return text.trim();
        }
      }
    } catch (e) {
      console.warn('Gemini API explainer call failed, falling back to local heuristic:', e);
    }
  }

  // 3. Clean default fallback
  return fallback || `Enter the required information for '${payload.labelText}' as indicated on your official government identity or land documents.`;
}
