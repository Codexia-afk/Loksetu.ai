# LokSetu v2: User Guide & End-to-End Operational Manual

> **Sovereign Form Intelligence & Guided Application Copilot**  
> *A Complete Step-by-Step Guide for Citizens, CSC Operators, Hackathon Judges & Presenters*

---

## 📑 Table of Contents
1. [Prerequisites & One-Time Installation](#1-prerequisites--one-time-installation)
2. [How LokSetu Works Under the Hood](#2-how-loksetu-works-under-the-hood)
3. [Step-by-Step Usage Guide](#3-step-by-step-usage-guide)
   - [Step 1: Launch Government Portal Simulator](#step-1-launch-government-portal-simulator)
   - [Step 2: Load Unpacked Extension in Chrome](#step-2-load-unpacked-extension-in-chrome)
   - [Step 3: Select Operating Mode (Citizen vs CSC Operator)](#step-3-select-operating-mode-citizen-vs-csc-operator)
   - [Step 4: Manage Encrypted Citizen Vaults](#step-4-manage-encrypted-citizen-vaults)
   - [Step 5: Scan Application Portal & View Readiness Score](#step-5-scan-application-portal--view-readiness-score)
   - [Step 6: Translate Legal Jargon & Vernacular Read-Aloud](#step-6-translate-legal-jargon--vernacular-read-aloud)
   - [Step 7: Audit Deterministic Scheme Rules (Evidence Mode)](#step-7-audit-deterministic-scheme-rules-evidence-mode)
   - [Step 8: Perform On-Device OCR Anomaly Check](#step-8-perform-on-device-ocr-anomaly-check)
   - [Step 9: Review Human Approval Gate & Pre-Fill Form](#step-9-review-human-approval-gate--pre-fill-form)
   - [Step 10: Manual Submission & Portable `.loksetu` Export](#step-10-manual-submission--portable-loksetu-export)
4. [Demo Day Checklist for Presentation](#4-demo-day-checklist-for-presentation)

---

## 1. Prerequisites & One-Time Installation

Before running LokSetu v2, ensure you have:
- **Google Chrome Browser** (v114+ with Side Panel support).
- **Node.js** (v18 or v20+) & **npm**.
- The repository cloned locally on your system.

---

## 2. How LokSetu Works Under the Hood

LokSetu v2 sits directly on top of state and central application portals as a Chrome extension sidepanel. It operates through **6 core sovereign engines**:

```
 [Portal HTML Page]
         │
         ▼ (Scan DOM & Classify)
 ┌────────────────────────────────────────────────────────┐
 │ 1. DOM Parser & Master Field Matcher (v2)              │
 │    • Extracts labels, ARIA descriptors, & section context│
 │    • Neutralizes prompt injection attempts             │
 │    • Isolates hidden fields & third-party iframes       │
 └───────────────────────────┬────────────────────────────┘
                             │
                             ▼
 ┌────────────────────────────────────────────────────────┐
 │ 2. Zero-Knowledge On-Device Vault Engine               │
 │    • AES-256-GCM encryption with Web Crypto API         │
 │    • PBKDF2 key derivation @ 600,000 iterations          │
 └───────────────────────────┬────────────────────────────┘
                             │
                             ▼
 ┌────────────────────────────────────────────────────────┐
 │ 3. Deterministic Scheme Eligibility Engine             │
 │    • 100% logic rule check against Gazette standards   │
 │    • Non-blocking audit trail with Apply Anyway link   │
 └───────────────────────────┬────────────────────────────┘
                             │
                             ▼
 ┌────────────────────────────────────────────────────────┐
 │ 4. Fallback-First Gemini Jargon Explainer              │
 │    • Instant offline dictionary for complex terms      │
 │    • Bengali Speech Synthesis (TTS) read-aloud          │
 └───────────────────────────┬────────────────────────────┘
                             │
                             ▼
 ┌────────────────────────────────────────────────────────┐
 │ 5. Local Tesseract.js OCR Anomaly Detector             │
 │    • On-device Web Worker (eng + ben)                  │
 │    • Confidence thresholding (<75% triggers warnings)  │
 └───────────────────────────┬────────────────────────────┘
                             │
                             ▼
 ┌────────────────────────────────────────────────────────┐
 │ 6. Human Approval Gate & Native Prototype Setter       │
 │    • Pre-fill review modal with explicit source tags   │
 │    • Emerald outlines (#10B981) via setNativeValue     │
 │    • ZERO auto-submit guarantee (100% human submit)    │
 └────────────────────────────────────────────────────────┘
```

---

## 3. Step-by-Step Usage Guide

### Step 1: Launch Government Portal Simulator
Open your terminal and start the portal simulator:
```bash
cd simulator
npm run dev
```
- Open your browser to **`http://localhost:5173`**.
- You will see the **WB Krishak Bandhu Application Portal** simulator with ~14 input fields across Personal Details, Address, Land & Income, and Document Uploads.

### Step 2: Load Unpacked Extension in Chrome
1. Open Chrome and navigate to **`chrome://extensions`**.
2. Toggle on **Developer mode** (top-right corner).
3. Click **Load unpacked** (top-left).
4. Select the directory: `extension/dist`.
5. Pin the LokSetu extension icon to your Chrome toolbar.

### Step 3: Select Operating Mode (Citizen vs CSC Operator)
1. Navigate back to `http://localhost:5173`.
2. Click the LokSetu icon or open the Chrome Side Panel.
3. In the header bar, toggle between modes:
   - **Self-Service Mode**: For citizens applying for their own schemes.
   - **CSC Operator Mode**: For Common Service Centre operators or NGO volunteers managing multiple citizen profiles.

### Step 4: Manage Encrypted Citizen Vaults
1. Click the **Vault** tab in the sidepanel.
2. Enter a **6+ digit PIN** (e.g. `123456`).
3. View or edit citizen details (Full Name, Age, State, District, Annual Income, Land Holding Scale, Aadhaar No.).
4. Click **Encrypt & Save to Local Vault**.
   - *What happens under the hood*: LokSetu runs 600,000 PBKDF2 SHA-256 rounds to derive an AES-256-GCM key and saves the encrypted ciphertext to local IndexedDB.

### Step 5: Scan Application Portal & View Readiness Score
1. Click the **Form Map** tab.
2. Click **Scan Active Portal Page**.
3. LokSetu inspects the DOM and displays:
   - Total detected form input fields (e.g. 14 fields).
   - Application Readiness Score progress bar (0–100%).
   - Itemized list of fields categorized into *Personal*, *Address*, *Income*, and *Documents*.

### Step 6: Translate Legal Jargon & Vernacular Read-Aloud
1. On fields labeled with ambiguous legal terms (e.g. *"Nature of Occupancy"* or *"Land Holding Scale"*), click **Explain Jargon**.
   - LokSetu checks its local offline dictionary (`explainerFallbackLibrary.ts`) and displays a plain-language explanation (e.g. *"Select 'Owner' if you own the agricultural land directly, or 'Recorded Bargadar' if you are a registered sharecropper"*).
2. Click **Listen (BN)** to trigger the Web Speech API, which reads the explanation aloud in a Bengali voice.

### Step 7: Audit Deterministic Scheme Rules (Evidence Mode)
1. Click the **Evidence** tab.
2. Select a scheme tab (e.g. *WB Krishak Bandhu*, *PM-KISAN*, *MP Ladli Behna*).
3. View the **Deterministic Rule Audit**:
   - Status badge: `CONFIRMED MATCH` (100% logic check) or `Does Not Match Recorded Criteria`.
   - Accessible line-item pass/fail badges with icons and explicit text (`PASSED` / `FAILED`).
   - Rule verification date link to official Gazette notifications.
4. If a criteria fails, click the always-visible **Apply Anyway on Portal** button to proceed directly to the portal notification.

### Step 8: Perform On-Device OCR Anomaly Check
1. Click the **OCR** tab.
2. Drag and drop an Aadhaar Card or Land Record image into the dropzone.
3. LokSetu launches a local Tesseract.js Web Worker (`eng` + `ben`).
4. If confidence is below 75% or a name mismatch occurs, LokSetu displays an **"ATTENTION REQUIRED: Flagged for Manual Verification"** warning banner highlighting anomalies.

### Step 9: Review Human Approval Gate & Pre-Fill Form
1. On the **Form Map** tab, click **Review & Autofill**.
2. The **Human Approval Gate** modal pops up, displaying:
   - Every mapped field value alongside its explicit provenance source tag (e.g. `Source: Vault — Identity Profile`, `Source: Vault — Aadhaar Card`).
   - Human verification warning notice.
3. Click **Authorize & Fill**.
   - LokSetu uses `setNativeValue` to update input values cleanly across React/Vue/Angular forms and outlines filled inputs on the page with a high-contrast emerald confirmation border (`#10B981`).

### Step 10: Manual Submission & Portable `.loksetu` Export
1. Review all filled inputs on the web portal.
2. Manually click the portal's submit button. **LokSetu never auto-submits forms.**
3. In **CSC Operator Mode**, click **Export .loksetu** to download an encrypted multi-profile backup file for backup or cross-device transfer.

---

## 4. Demo Day Checklist for Presentation

| Step | Action | Expected Output for Judges |
| :--- | :--- | :--- |
| **1** | Open `http://localhost:5173` | WB Krishak Bandhu Portal renders with 14 inputs & dropzones. |
| **2** | Open LokSetu Sidepanel | Clean dark slate interface loads instantly. |
| **3** | Click **Scan Active Portal Page** | Progress bar updates to Readiness Score (85%+). |
| **4** | Click **Explain Jargon** on "Nature of Occupancy" | Plain language explanation appears instantly with Bengali speech button. |
| **5** | Switch to **Evidence** Tab | Line-item audit trail renders with Gazette source links & "Apply Anyway". |
| **6** | Switch to **CSC Operator Mode** | Multi-profile session switcher opens with encrypted `.loksetu` export/import. |
| **7** | Click **Review & Autofill** -> **Authorize & Fill** | Form fields on portal get high-contrast emerald outlines (`#10B981`). |
| **8** | Verify Submission | Show that form submit is 100% manual — zero auto-submit guarantee. |
