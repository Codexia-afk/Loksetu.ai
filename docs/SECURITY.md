# LokSetu Security & Cryptographic Specifications

## 1. Cryptographic Key Derivation Specs

- **Algorithm**: AES-256-GCM (Authenticated Encryption with Associated Data).
- **Key Derivation Function**: PBKDF2-HMAC-SHA256.
- **Iteration Count**: **600,000 iterations** (OWASP 2023+ standard for offline brute-force friction).
- **Salt**: 16-byte cryptographically secure random salt via `window.crypto.getRandomValues()`.
- **Initialization Vector**: 12-byte random IV per encryption operation.
- **Minimum PIN Enforcement**: 6 digits required at UI validation layer.

---

## 2. Zero-PII AI Payload Firewall Specs

The payload builder (`buildExplainerPayload`) enforces a strict allow-list boundary:

```typescript
export interface ScopedExplainerPayload {
  field_id: string;
  label_text: string;
  aria_label?: string;
  input_type?: string;
  placeholder?: string;
  context_hint?: string; // Strictly derived from parent <legend> or section heading ONLY
}
```

### Structurally Excluded Fields
- `input.value` / user entries
- Aadhaar numbers (12 digits)
- Phone numbers (10 digits)
- Bank account / IFSC codes
- Document OCR text contents
- Neighboring DOM input values
- Vault storage entries

Verified by automated adversarial test suite `src/tests/payloadScoping.test.ts`.

---

## 3. Automated Zero Auto-Submit Audit Specs

Codebase-wide static audit executed via `npm run check:no-submit` scanning for:
- `form.submit()`
- `form.requestSubmit()`
- `dispatchEvent(new Event('submit'))`

Result: **0 violations detected across entire codebase**.
