# LokSetu v2: Sovereign Form Intelligence & Guided Application Copilot

> **Hackathon Submission & Engineering Architecture Reference**  
> *Privacy-First Browser Copilot & CSC Facilitator Engine for Indian Welfare Portals*

---

## 🎯 Executive Summary & Core Value Proposition

Government welfare scheme applications in India fail citizens primarily at the execution step due to ambiguous portal terminology, complex eligibility criteria, and lack of guided verification. **LokSetu v2** is a privacy-first browser copilot (Manifest V3 sidepanel) designed for both **self-service citizens** and **CSC (Common Service Centre) operators**.

- **Primary Metric**: Application Completion Rate (successful submission on official portal).
- **Dual Mode**: Self-Service Mode (citizens) & Facilitator-Assisted Mode (CSC operators/NGO volunteers) with encrypted multi-profile session switching and `.loksetu` export/import.
- **Privacy Paradigm**: Zero-Knowledge On-Device Engine. All citizen PII stays encrypted locally via AES-256-GCM with keys derived from a user PIN via **600,000 PBKDF2 iterations** (OWASP minimum standard).

---

## ⚙️ Honest Scope & Deliberate Engineering Decisions

1. **Localhost-Only Host Permissions**:
   - Host permissions in `manifest.json` are strictly scoped to `http://localhost:*/*` and `http://127.0.0.1:*/*` for safety during hackathon judging. Real state/central domains (`*.gov.in`, `*.nic.in`) are a roadmap item and deliberately excluded from this build.

2. **Supported Welfare Schemes (3 Total)**:
   - **WB Krishak Bandhu (Assured Income)**: Fully paired with the live simulator form (`http://localhost:5173`).
   - **PM-KISAN Samman Nidhi**: Fully specified deterministic rule model.
   - **MP Mukhyamantri Ladli Behna Yojana**: Fully specified deterministic rule model (marked `ILLUSTRATIVE — VERIFY BEFORE JUDGING`).

3. **Fallback-First Jargon Explainer**:
   - Uses a pre-compiled offline dictionary (`explainerFallbackLibrary.ts`) for ambiguous terms ("Nature of Occupancy", "Land Holding Scale") to ensure 100% reliability with zero network latency or API key risk during live demos.
   - Optional Gemini API call direct using strictly typed `ScopedExplainerPayload` DTOs (0 PII, 0 form values, 0 raw HTML).

4. **Confidence-Gated Local OCR Anomaly Detection**:
   - Tesseract.js Web Worker bundled with `eng` and `ben` language models.
   - Any document scan with OCR confidence $< 75\%$ triggers an anomaly warning flag requiring manual human verification before population.

5. **Zero Auto-Submit Guarantee**:
   - Programmatic form submission (`form.submit()`, `.requestSubmit()`) and synthetic `'submit'` event dispatching are strictly forbidden across all code paths.
   - Enforced by automated build-blocking audit script (`npm run check:no-submit`) and Vitest unit tests.

---

## 🧪 Automated Verification & Test Results

```bash
loksetu-extension@1.0.0 test
> vitest run

 ✓ src/tests/noSubmitGuarantee.test.ts  (1 test)
 ✓ src/tests/payloadScoping.test.ts      (1 test)
 ✓ src/tests/ruleEvaluator.test.ts       (2 tests)
 ✓ src/tests/exportPrivacy.test.ts       (1 test)
 ✓ src/tests/vaultCrypto.test.ts         (3 tests)

 Test Files  5 passed (5)
      Tests  8 passed (8)

✅ ZERO AUTO-SUBMIT GUARANTEE VERIFIED: 0 occurrences of .submit(), .requestSubmit(), or synthetic submit events in codebase.
✓ simulator build succeeded
✓ extension build succeeded
```

---

## 🚀 Quickstart & Demo Setup

### 1. Launch Government Portal Simulator
```bash
cd simulator
npm run dev
# Running at http://localhost:5173
```

### 2. Load Extension in Chrome
1. Open Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode** (top right toggle).
3. Click **Load unpacked** and select the `extension/dist` directory.
4. Navigate to `http://localhost:5173` — click the LokSetu icon or sidepanel to open the copilot!
