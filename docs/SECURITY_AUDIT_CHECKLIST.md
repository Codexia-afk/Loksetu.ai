# LokSetu v2.1: Codebase Security Audit & Privacy Checklist

> **Judge-Facing Security & Privacy Verification Artifact**  
> *Itemized Audit of Every File Handling Cryptography, Citizen PII, Storage, and Network Communication*

---

## 🔒 1. Cryptography & On-Device Vault Engine

| File | Purpose | Security & Privacy Rationale |
| :--- | :--- | :--- |
| [`vaultCrypto.ts`](file:///Users/srinjoypramanick/Loksetu.ai/extension/src/engine/vaultCrypto.ts) | Core Vault Cryptography | Enforces **AES-256-GCM** encryption with 16-byte random salt, 12-byte IV, and **600,000 PBKDF2 iterations** via Web Crypto API. Requires minimum 6-digit PIN. 0 plaintext PII stored or exported. |
| [`sessionLockManager.ts`](file:///Users/srinjoypramanick/Loksetu.ai/extension/src/engine/sessionLockManager.ts) | In-Memory Session Wiping | Wipes all decrypted profile references upon profile switch, logout, or 5-minute idle timeout. Mandatory PIN re-entry enforced for new profiles. |
| [`exportPrivacy.test.ts`](file:///Users/srinjoypramanick/Loksetu.ai/extension/src/tests/exportPrivacy.test.ts) | Export Privacy Test | Vitest suite verifying `.loksetu` exports contain zero plaintext PII string occurrences. |

---

## 🛡️ 2. Field-Matching, Parsing & DOM Execution

| File | Purpose | Security & Privacy Rationale |
| :--- | :--- | :--- |
| [`fieldMatcherV2.ts`](file:///Users/srinjoypramanick/Loksetu.ai/extension/src/engine/fieldMatcherV2.ts) | Master Matching Engine v2 | Includes prompt injection defense (`category: "prompt_injection_suspected"`), isolates hidden & cross-origin fields in `formGuards`, enforces elevated scrutiny for critical IDs (`aadhaar_number`, `pancard_number`, `bank_account_number`, `ifsc_code`). |
| [`domParser.ts`](file:///Users/srinjoypramanick/Loksetu.ai/extension/src/content/domParser.ts) | Portal DOM Scanner | Scans active form inputs, captures visibility, disabled state, and context hints. Uses `setNativeValue` prototype setter for clean React/Vue binding. 0 network calls. |
| [`domHighlighter.ts`](file:///Users/srinjoypramanick/Loksetu.ai/extension/src/content/domHighlighter.ts) | Visual Highlight Injector | Draws temporary emerald outlines (`#10B981`) on filled inputs. Local DOM manipulation only. |

---

## ⚖️ 3. Eligibility Engine & Gazette Provenance

| File | Purpose | Security & Privacy Rationale |
| :--- | :--- | :--- |
| [`deterministicRules.ts`](file:///Users/srinjoypramanick/Loksetu.ai/extension/src/engine/deterministicRules.ts) | Eligibility Engine | 100% logic rule check comparing citizen attributes against Gazette rules. Attaches complete `RuleProvenance` metadata to audit trail items. 0 PII sent externally. |
| [`multiSchemeScreener.ts`](file:///Users/srinjoypramanick/Loksetu.ai/extension/src/engine/multiSchemeScreener.ts) | Multi-Scheme Matrix Engine | Evaluates decrypted local profile against all scheme specifications on-device. Generates comparative eligibility grid with Gazette citations for failed rules. |
| `data/schemes/*.json` | Scheme Specifications | Bundled static JSON files containing Gazette references, notification numbers, and rule logic. Checked by `npm run check:provenance`. |

---

## 🌐 4. LLM Boundary & Network Isolation

| File | Purpose | Security & Privacy Rationale |
| :--- | :--- | :--- |
| [`geminiExplainer.ts`](file:///Users/srinjoypramanick/Loksetu.ai/extension/src/engine/geminiExplainer.ts) | Jargon Explainer Engine | Fallback-first design. Checks local pre-compiled dictionary first. Scoped DTO payload (`ScopedExplainerPayload`) strips all PII (name, Aadhaar, income) before sending to Gemini API. |
| [`explainerFallbackLibrary.ts`](file:///Users/srinjoypramanick/Loksetu.ai/extension/src/engine/explainerFallbackLibrary.ts) | Offline Jargon Dictionary | Hand-crafted dictionary resolving legal terms (*"Nature of Occupancy"*, *"Recorded Bargadar"*) with 0 network dependencies and <5ms latency. |
| [`networkResilience.ts`](file:///Users/srinjoypramanick/Loksetu.ai/extension/src/engine/networkResilience.ts) | Offline Resilience Engine | Monitors network health and handles simulated offline mode for live judge demonstrations. |
| [`applicationTracker.ts`](file:///Users/srinjoypramanick/Loksetu.ai/extension/src/engine/applicationTracker.ts) | Post-Submission Tracker | Stores citizen reference numbers encrypted in vault. 100% passive, zero auto-scraping, zero HTTP fetch calls. Verified by `applicationTracker.test.ts`. |

---

## 🚫 5. CI Audit & Security Enforcement Scripts

| File | Purpose | Security & Privacy Rationale |
| :--- | :--- | :--- |
| [`checkNoSubmit.js`](file:///Users/srinjoypramanick/Loksetu.ai/extension/scripts/checkNoSubmit.js) | Zero Auto-Submit Audit | CI build-blocking script scanning all source files for `.submit()`, `.requestSubmit()`, or synthetic submit events. |
| [`checkProvenance.js`](file:///Users/srinjoypramanick/Loksetu.ai/extension/scripts/checkProvenance.js) | Gazette Provenance Audit | CI build-blocking script verifying 100% Gazette provenance metadata across all scheme JSON specifications. |

---

<div align="center">
  <b>LokSetu v2.1 — Sovereign CivicTech Privacy Architecture</b>
</div>
