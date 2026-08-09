# LokSetu v2.1: 5-Minute Winning Hackathon Judge Demo Script

> **The Ultimate Judge-Facing Walkthrough & Presentation Flow**  
> *Follow this exact 5-minute script during live judging to demonstrate every moat feature in sequence.*

---

## 🕒 Minute 0:00–0:45 — The Problem & Vision

**Pitch**:
> *"Judges, myScheme.gov.in tells citizens which schemes exist, but leaves them stranded at the execution step. CSC operators and rural farmers face complex legal jargon ('Nature of Occupancy', 'Bargadar'), opaque eligibility rules, and fear of data leaks. LokSetu v2.1 is an on-device sovereign browser copilot that turns complex portals into guided, verifiable, and completable forms with ZERO citizen PII leaving the browser."*

**Action**:
- Show Chrome browser with `http://localhost:5173` (Krishak Bandhu Portal Simulator) on the left and **LokSetu Side Panel** on the right.
- Point out **`NetworkStatusBanner`** showing *"Online — Gemini AI Active"*.

---

## 🕒 Minute 0:45–1:45 — Dual-Mode & Multi-Scheme Screener Matrix

**Action**:
1. Click **Matrix** tab in the sidepanel.
2. Show the **Cross-Scheme Eligibility Matrix** evaluating the citizen profile against all loaded scheme rulesets simultaneously.
3. Show **WB Krishak Bandhu** (100% Qualified) and **PM-KISAN** (100% Qualified).
4. Point to **MP Ladli Behna** (Disqualified / Ineligible) and expand the **Disqualifying Gazette Criteria** box showing the exact Gazette notification citation chip (*"MP-WCD-2023-LB-SEC1 — Scheme open exclusively to women applicants"*).

**Pitch**:
> *"Notice how LokSetu doesn't just evaluate one scheme at a time. It screens the decrypted profile across all state and central welfare schemes, and for schemes the applicant doesn't qualify for, it provides an exact Gazette citation chip showing why."*

---

## 🕒 Minute 1:45–2:30 — Deterministic Evidence Mode & Legal Jargon Explainer

**Action**:
1. Switch to **Evidence** tab.
2. Highlight the **100% Deterministic Rule Audit** with individual criteria lineage, dated rule tags, and clickable Gazette links.
3. Click **Form Map** tab, find field *"Nature of Occupancy"*, and click **Explain Jargon**.
4. Show instant plain-language explanation: *"Select 'Owner' if you own agricultural land directly, or 'Recorded Bargadar' if you are a registered sharecropper."*
5. Click **Listen (BN)** to play Bengali text-to-speech read-aloud.

---

## 🕒 Minute 2:30–3:15 — Local Document OCR & Offline Network Resilience

**Action**:
1. Click **OCR** tab, drag and drop test Aadhaar / Land record image into dropzone.
2. Show local Tesseract.js Web Worker processing text on-device (`eng` + `ben`).
3. Point to **NetworkStatusBanner** at top, click **Simulate Offline**.
4. Show banner change to *"Offline Mode — Using Pre-compiled Local Dictionary"*. Click **Explain Jargon** on another field — show instant <5ms resolution with zero network calls!

---

## 🕒 Minute 3:15–4:15 — CSC Operator Mode, Session Isolation & Human Approval Gate

**Action**:
1. In top header, toggle mode from **Self-Service** to **CSC Operator**.
2. Click **Session Switcher**, select a second citizen profile (*Sunita Devi*).
3. Show notification: *"Session cleared — no citizen data remains in memory"*. Point out that PIN re-entry is mandatory for decrypting new profiles.
4. Click **Review & Autofill**. Show the **Human Approval Gate** modal displaying every mapped value alongside its provenance source tag (`Source: Vault — Identity Profile`).
5. Click **Authorize & Fill**. Show input fields on `http://localhost:5173` outline in high-contrast **emerald green (`#10B981`)**.

---

## 🕒 Minute 4:15–5:00 — Zero Auto-Submit Guarantee & Post-Submission Tracker

**Action**:
1. Show that the portal's submit button was **NOT** clicked automatically.
2. Manually click the submit button on `http://localhost:5173`.
3. Click **Tracker** tab in sidepanel, paste acknowledgment number `KB-2026-WB-88912`, set reminder to 7 days, and click **Save Encrypted Tracker**.
4. Show official portal status deep link (*"Check Status on Official Portal"*).

**Closing Pitch**:
> *"LokSetu v2.1 proves that sovereign AI can solve complex government form execution with zero data leakage, complete Gazette provenance, offline resilience, and guaranteed human-in-the-loop submission. Thank you!"*
