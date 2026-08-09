# LokSetu v2 Threat Model & Security Architecture

## 1. Threat Boundary & Storage Paradigm

- **Zero-Knowledge On-Device Storage**: All citizen PII (Aadhaar number, income, land holdings, address) resides strictly within the browser runtime (`chrome.storage.local` / IndexedDB).
- **No Remote Backend PII Storage**: There is no external database or server collecting citizen profiles.

---

## 2. Cryptographic Security & Vault Export Protection

- **Key Derivation Standard**: Native Web Crypto `window.crypto.subtle` PBKDF2-HMAC-SHA256 with **600,000 iterations** (OWASP 2023+ requirement).
- **Encryption Primitive**: AES-256-GCM authenticated encryption with 16-byte random salt and 12-byte random IV per operation.
- **PIN Entropy Enforcement**: Minimum 6-digit numeric PIN required. PIN validation is hard-enforced inside cryptographic functions (`vaultCrypto.ts`), rejecting short PINs at runtime.
- **Export Security (`.loksetu` files)**: Exported vault bundles contain AES-GCM ciphertext hex, salt hex, and IV hex only. 0 plaintext PII strings exist in the export bundle, making stolen vault files resistant to offline GPU brute-force attacks.

---

## 3. LLM Privacy Boundary & Scoped DTO Payload

- **Scoped DTO Boundary**: The Gemini explainer API call receives exclusively the `ScopedExplainerPayload` interface:
  ```typescript
  export interface ScopedExplainerPayload {
    fieldId: string;
    labelText: string;
    ariaLabel: string;
    inputType: string;
    placeholder: string;
    contextHint: string;
  }
  ```
- **Prohibited Data**: Form input values, Aadhaar numbers, citizen name/age/income, OCR extracted text, and raw HTML blobs are **structurally prohibited** at the TypeScript DTO layer.

---

## 4. Zero Auto-Submit Security Model

- **Risk**: Programmatic submission by extensions can submit invalid, fraudulent, or unintended applications without explicit user consent.
- **Mitigation**: `.submit()`, `.requestSubmit()`, and synthetic `'submit'` event dispatching are strictly forbidden across all code paths.
- **Enforcement**: Build-blocking CI script (`npm run check:no-submit`) and Vitest structural tests verify zero occurrences in source code.

---

## 5. CSC Operator Session Isolation & In-Memory Protection

- **Risk**: CSC operators and NGO volunteers handle back-to-back applications for multiple citizens on shared hardware, risking residual PII lingering in memory or shoulder-surfing between sessions.
- **Mitigation**:
  - **Memory Wiping**: `sessionLockManager.ts` fully overwrites and nullifies decrypted in-memory citizen profiles upon profile switch, logout, or sidepanel close.
  - **Mandatory PIN Re-entry**: Switching to a second citizen's vault requires explicit 6-digit PIN verification. Decryption keys are never reused across different profiles.
  - **Idle Auto-Lock**: Automatically clears decrypted in-memory PII after 5 minutes of inactivity (`IDLE_TIMEOUT_MS`).
  - **Visual Confirmation**: Emits `sessionCleared` events surfaced as UI notifications (*"Session cleared — no citizen data remains in memory"*).

---

## 6. Supply-Chain & Update Integrity

- **Risk**: A compromised extension update or supply-chain mutation could attempt to introduce network exfiltration code targeting decrypted vault data.
- **Mitigations**:
  - **Manifest V3 Code Review**: All published extensions undergo Chrome Web Store static analysis prohibiting remote code execution (`unsafe-eval` forbidden).
  - **Build SHA-256 Verification**: Production release ZIP bundles are published alongside git commit SHA-256 build hashes for verification by NGO IT auditors.
  - **Host Permission Restriction**: Judging release is strictly restricted to `http://localhost:*/*` and `http://127.0.0.1:*/*` in `manifest.json`. Any expansion to production `*.gov.in` domains requires explicit manifest review.
