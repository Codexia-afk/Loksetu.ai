# LokSetu: Sovereign Form Intelligence & Guided Application Copilot

> **Social Issues Hackathon Submission**  
> *Privacy-First Browser Copilot & Facilitator Application Engine for Indian Welfare Portals*

---

## Executive Summary

Government welfare schemes in India fail citizens primarily at the application execution step. LokSetu sits directly on top of state and central application portals as a privacy-first browser extension sidepanel, empowering both **self-service citizens** and **CSC (Common Service Centre) facilitators** to fill, verify, and complete complex forms with guaranteed data privacy and zero vendor lock-in.

---

## Core Architecture & Security Guarantees

1. **Scoped Host Permissions & Fixed Extension ID**:
   - `manifest.json` host permissions are strictly scoped to `http://localhost/*` and `http://127.0.0.1/*`.
   - Manifest includes a pinned public `"key"` to ensure a deterministic Extension ID (`chrome-extension://...`) across all environments.
   - `CORSMiddleware` in `backend/main.py` explicitly allowlists the extension origin.

2. **OWASP-Grade Encrypted Vault (600,000 PBKDF2 Iterations)**:
   - AES-256-GCM authenticated encryption client-side using native `window.crypto.subtle`.
   - Key derived from a minimum 6-digit numeric PIN using **600,000 PBKDF2 iterations** (OWASP 2023+ standard for offline brute-force resistance).
   - Encrypted `.loksetu` portable exports/imports for multi-device facilitator workflows.

3. **Strictly Typed Zero-PII LLM Boundary**:
   - The `/explain-field` proxy endpoint receives strictly scoped DTO payloads: `{ field_id, label_text, aria_label, input_type, context_hint }`.
   - `context_hint` is extracted exclusively from parent `<legend>` or section heading text.
   - Field values, Aadhaar numbers, and document text are **structurally prohibited** at the TypeScript DTO layer.

4. **Deterministic Eligibility & Non-Blocking Evidence Mode**:
   - Client-side scheme evaluation against versioned JSON specifications (`wb_krishak_bandhu.json`, `pm_kisan.json`, `mp_ladli_behna.json`).
   - Every Evidence Mode screen displays a `Rules last verified: [date] — source: [official notification link]` badge.
   - Non-matching criteria **never hard-block**; an "Apply anyway" flow linking to the official scheme page is always rendered.

5. **Confidence-Gated OCR Anomaly Flagging**:
   - Tesseract.js Web Worker recognizer bundled with `eng` and `ben` language scripts.
   - Any OCR result with confidence $< 75\%$ triggers an anomaly flag requiring manual human verification before field population.

6. **Visual Lineage & Source Tracking**:
   - Every autofilled field gets a high-contrast green border (`#046A38`) and a source badge (e.g. `[Vault: Aadhaar Profile]`).

7. **Human Approval Gate & Zero Auto-Submit Guarantee**:
   - Programmatic form submission (`form.submit()`) is forbidden across all code paths.
   - Submission requires an explicit user authorization click inside the Pre-Submission Review Modal, which calculates a 0-100% Application Readiness Score.
   - Verified via automated build audit (`npm run check:no-submit`).

8. **Multi-Profile Facilitator Mode**:
   - CSC operators can maintain multiple isolated citizen vaults in one browser session with zero data leakage across profile switches.

---

## Verification Test Results

```bash
========================= 4 passed backend pytest =========================
✅ ZERO AUTO-SUBMIT GUARANTEE VERIFIED: 0 occurrences of form.submit() in codebase.
✓ src/tests/payloadScoping.test.ts  (1 test) 1ms
✓ src/tests/ruleEvaluator.test.ts  (2 tests) 1ms
✓ src/tests/vaultCrypto.test.ts  (3 tests) 178ms
✓ simulator build succeeded (34 modules)
✓ extension build succeeded (95 modules)
```

---

## How to Run & Demo

### 1. Launch FastAPI Backend
```bash
cd backend
python3 main.py
# Serves at http://localhost:8000
```

### 2. Launch Government Portal Simulator
```bash
cd simulator
npm run dev
# Serves at http://localhost:5173
```

### 3. Load Extension in Chrome
1. Open Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode** (top right).
3. Click **Load unpacked** and select the `/extension/dist` directory.
4. Open `http://localhost:5173` — the LokSetu copilot sidepanel auto-opens!
