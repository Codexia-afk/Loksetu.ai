# LokSetu System Architecture & Governance Matrix

> **Core Philosophy**: *Deterministic Engine Decides. AI Explains. Human Approves.*

---

## 1. System Component Diagram

```
                              ┌─────────────────────────────────────────────────────────┐
                              │                    BROWSER EXTENSION                    │
                              │                  (Pinned Extension ID)                  │
  ┌──────────────────────┐    │  ┌────────────────────┐      ┌───────────────────────┐  │
  │                      │    │  │   Content Script   │      │    Sidepanel UI       │  │
  │  Govt Portal         │    │  │ ────────────────── │      │ ───────────────────── │  │
  │  Simulator           │◄───┼─►│ DOM Parser & ARIA  │◄────►│ Facilitator Vault     │  │
  │  (WB Krishak Bandhu /│    │  │ Autofill Injector  │      │ 600k PBKDF2 + AES-GCM │  │
  │   PM-KISAN)          │    │  │ Source Badges      │      │ Eligibility Engine    │  │
  └──────────────────────┘    │  └────────────────────┘      │ OCR Worker (Tesseract)│  │
                              └──────────────────────────────┴──────────┬────────────┴──┘
                                                                        │
                                                                        │ Typed Scoped DTO Only
                                                                        │ (Label + Legend ARIA metadata)
                                                                        ▼
                                                             ┌─────────────────────┐
                                                             │   FastAPI Backend   │
                                                             │ ─────────────────── │
                                                             │ - CORSMiddleware    │
                                                             │ - Versioned Schemes │
                                                             │ - Gemini LLM Proxy  │
                                                             └─────────────────────┘
```

---

## 2. Decision & Authority Matrix

| Layer | Responsibility | Authority Level | Offline Capability |
|---|---|---|---|
| **Deterministic Rules Engine** | Eligibility calculation, rule validation, document checking, confidence thresholds | **Authoritative (DECIDES)** | 100% Offline |
| **Encrypted Vault Storage** | Web Crypto PBKDF2 (600,000 iterations) + AES-256-GCM profile management | **Authoritative (STORES)** | 100% Offline |
| **Document Intelligence (OCR)** | Tesseract.js Web Worker text extraction and anomaly flagging ($<75\%$ confidence) | **Advisory (FLAGS)** | 100% Offline |
| **AI Explanation Layer (Gemini Proxy)** | Scoped plain-language text assistance & Web Speech TTS audio readout | **Advisory (EXPLAINS)** | Requires Proxy / Graceful Text Fallback |
| **Human Review Gate** | Final line-by-line audit review and authorization click before submission | **Final Authority (APPROVES)** | 100% Offline |

---

## 3. Strict Non-Negotiable Rules

1. **Zero Auto-Submit Guarantee**: Form submission is never triggered programmatically (`form.submit()` blocked).
2. **Minimal LLM Payload Boundary**: Payload builder structurally excludes user entries, Aadhaar numbers, phone numbers, and document text.
3. **Non-Blocking Evidence Mode**: Eligibility mismatches never hard-block; an "Apply anyway" flow is always provided alongside cited scheme sources.
4. **OWASP Cryptographic Vault**: AES-256-GCM derived via PBKDF2-HMAC-SHA256 with 600,000 iterations.
