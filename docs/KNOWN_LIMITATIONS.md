# LokSetu Honest Disclosure & Known Limitations

> **Engineering Hygiene Policy**: We explicitly document system boundaries and limitations rather than making unprovable claims.

---

## 1. Portal Simulator vs. Real Government Portals
- **Current Scope**: LokSetu is demonstrated against a local, faithful simulator of the West Bengal Krishak Bandhu portal (`http://localhost:5173`).
- **Rationale**: Real government portals enforce dynamic session CAPTCHAs, OTP authentication gates, and unpredictable server maintenance windows. Operating against a deterministic local simulator ensures a reliable, verifiable hackathon evaluation.
- **Production Path**: Extension architecture (`content/scanner.ts` and `content/injector.ts`) uses standard DOM selectors (`<label for>`, ARIA attributes, input IDs) compatible with real portal forms.

## 2. OCR Confidence & Anomaly Thresholds
- **Confidence Gate**: Tesseract.js OCR operates as an advisory assistant. Low-quality, handwritten, or blurred documents generating $< 75\%$ confidence are automatically flagged with a visible `⚠️ MANUALLY VERIFY` status and will not auto-populate fields.
- **Language Support**: Bundled Web Worker OCR supports English (`eng`) and Bengali (`ben`).

## 3. Web Speech API Audio TTS Availability
- **Voice Synthesis**: Audio guidance uses native browser Web Speech API (`window.speechSynthesis`).
- **Voice Availability**: Specific regional language voices (Bengali/Hindi) depend on system-installed browser voice engines. If a specific voice is missing on a host OS, LokSetu cleanly falls back to high-contrast text guidance.

## 4. Facilitator Vault Threat Model & PIN Entropy
- **Encryption Friction**: Vault storage uses 600,000 PBKDF2 iterations and AES-256-GCM encryption.
- **PIN Entropy**: Offline brute-force security of exported `.loksetu` files is bounded by user PIN entropy. Facilitators are advised to use 6+ digit numeric PINs or passphrases for maximum export file security.
