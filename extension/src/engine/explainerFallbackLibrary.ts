export const EXPLAINER_FALLBACK_DICTIONARY: Record<string, string> = {
  'nature of occupancy': "Select 'Owner' if you own the agricultural land directly, 'Patta Holder' if you hold government land allotment rights, or 'Recorded Bargadar' if you are a registered sharecropper.",
  'land holding scale': 'Enter the total agricultural land area in Acres. 1 Acre is approximately 0.4047 Hectares (approx. 3 Bighas in West Bengal).',
  'farmer category': 'Marginal farmer (land up to 1 Hectare / 2.47 Acres), Small farmer (1 to 2 Hectares), or Large farmer (above 2 Hectares).',
  'institutional landholder': "Select 'Yes' if the land is registered under a company, trust, or organization rather than an individual citizen.",
  'aadhaar linked bank account': 'The bank account where your Aadhaar is linked for Direct Benefit Transfer (DBT) payment credits.',
  'khatian number': 'The ROR (Record of Rights) Khatian number mentioned on your land mutation or Porcha document.',
  'dag number': 'The plot/survey number (Dag No.) of your agricultural land plot as listed in government land records.'
};

export function getFallbackExplanation(labelText: string, ariaLabel: string = ''): string | null {
  const normalized = (labelText + ' ' + ariaLabel).toLowerCase().trim();
  for (const [key, explanation] of Object.entries(EXPLAINER_FALLBACK_DICTIONARY)) {
    if (normalized.includes(key)) {
      return explanation;
    }
  }
  return null;
}
