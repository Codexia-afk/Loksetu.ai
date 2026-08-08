# LokSetu Testing Pyramid & Quality Assurance Plan

## 1. Automated Testing Pyramid Breakdown

### Unit & Security Tests (`npm --prefix extension run test`)
- `payloadScoping.test.ts`: Asserts zero sensitive values (Aadhaar, phone, bank account, name) leak into LLM DTOs.
- `exportPrivacy.test.ts`: Parses raw `.loksetu` vault exports and asserts zero plaintext PII strings exist unencrypted in container JSON.
- `vaultCrypto.test.ts`: Verifies 600,000 PBKDF2 iterations, AES-256-GCM encryption, 6-digit minimum PIN validation, and round-trip decryption.
- `ruleEvaluator.test.ts`: Tests deterministic scheme eligibility calculation for passing and failing profiles.

### Static Code Audit (`npm --prefix extension run check:no-submit`)
- Scans all codebase files for `.submit()`, `.requestSubmit()`, `dispatchEvent(new Event('submit'))`.
- Verified: 0 violations detected.

### Backend Test Suite (`python3 -m pytest backend/test_backend.py`)
- Verifies FastAPI endpoints (`/api/v1/schemes`, `/api/v1/schemes/{id}`, `/api/v1/explain-field`).
- Validates CORS response headers for extension origins.
- Validates strict `ScopedExplainerPayload` DTO parsing.

### Build Verification (`npm run build`)
- Verifies TypeScript compilation and bundle generation for both `/simulator` and `/extension`.
