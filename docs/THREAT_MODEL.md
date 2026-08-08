# LokSetu Cryptographic Threat Model & Security Architecture

## Overview
LokSetu is designed under a **Zero-Trust Client-Side Privacy** model. No citizen Personally Identifiable Information (PII), application values, or vault documents are ever transmitted to or stored on backend servers.

---

## 1. Vault Key Derivation & Encryption Specs

- **Algorithm**: AES-256-GCM (Authenticated Encryption with Associated Data).
- **Key Derivation Function (KDF)**: PBKDF2-HMAC-SHA256.
- **Iteration Count**: **600,000 iterations** (exceeding OWASP 2023+ recommendations).
- **Salt**: 16-byte cryptographically secure random salt (`crypto.getRandomValues()`).
- **Initialization Vector (IV)**: 12-byte random IV per encryption operation.
- **Storage**: Encrypted payload stored in IndexedDB (`LokSetu_Vault_DB`).

---

## 2. Threat Analysis: Offline Brute-Force on Exported `.loksetu` Files

When a facilitator or citizen exports their encrypted profile to a portable `.loksetu` JSON file:

1. **Entropy Boundary**:
   - A 6-digit numeric PIN yields $10^6 = 1,000,000$ possible keys.
   - At 600,000 PBKDF2 iterations, calculating a single key attempt takes $\approx 100\text{ ms} - 250\text{ ms}$ on standard modern consumer hardware.

2. **Offline Attack Cost**:
   - Sequential CPU brute-force of all $10^6$ combinations:
     $$1,000,000 \times 0.15\text{s} = 150,000\text{ seconds} \approx 41.6\text{ hours}$$
   - Parallelized GPU attack: PBKDF2-HMAC-SHA256 with 600k iterations places heavy memory and compute pressure on GPU shaders, significantly raising energy and hardware costs for an attacker compared to raw MD5/SHA256 hashes.

3. **Core Conclusion**:
   - While 600,000 PBKDF2 iterations provides strong technical friction, **user PIN entropy remains the structural ceiling** of export file security.
   - Facilitators managing multiple citizen profiles are advised to use 6+ digit PINs or alphanumeric passphrases for maximum offline protection.

---

## 3. Network & LLM Payload Boundary Threat Model

1. **Host Permission Boundary**:
   - `manifest.json` restricts extension network access strictly to `http://localhost:*/*` and `http://127.0.0.1:*/*`.
   - Blanket host wildcard permissions (`<all_urls>`, `*://*/*`) are forbidden.

2. **Zero-PII LLM Boundary**:
   - The `/explain-field` proxy endpoint receives strictly scoped metadata DTOs:
     - `fieldId`
     - `labelText`
     - `ariaLabel`
     - `inputType`
     - `placeholder`
     - `contextHint` (extracted exclusively from parent `<legend>` or section heading text)
   - Field values, user entries, Aadhaar numbers, and document OCR contents are **structurally omitted** at the TypeScript DTO layer.

3. **Zero Auto-Submit Guarantee**:
   - `form.submit()` or programmatic DOM submission trigger calls are forbidden across all content scripts and extension modules.
   - The user must explicitly inspect and confirm the Pre-Submission Review Modal before any submission action occurs.
