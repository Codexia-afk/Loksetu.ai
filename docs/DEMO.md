# LokSetu Judging & Demo Script Guide

## 1. One-Command Startup

Execute from project root:
```bash
# Terminal 1: Launch Backend
cd backend && python3 main.py

# Terminal 2: Launch Simulator
cd simulator && npm run dev
```

Open Chrome -> `chrome://extensions` -> **Load unpacked** -> Select `/extension/dist`.
Navigate to `http://localhost:5173` — LokSetu sidepanel copilot auto-opens!

---

## 2. 12-Step Judge Walkthrough Script

1. **Open Simulator**: Show realistic WB Krishak Bandhu application form with 14 fields.
2. **Auto-Detection**: Show LokSetu sidepanel auto-detecting the active portal form.
3. **Application Map (M3)**: Click `App Map` tab to inspect section progress and detected field counts.
4. **Create / Unlock Vault (M5)**: Create citizen profile for Ramesh Das with 6-digit PIN (`123456`). Note 600,000 PBKDF2 iterations derivation indicator.
5. **Deterministic Eligibility Check (M4)**: Open `Evidence Mode` tab. Show pass/fail criteria breakdown with official notification URLs and `Rules last verified: 2026-08-01` timestamp.
6. **"Apply Anyway" Flow (M4)**: Select a non-matching scheme (e.g. MP Ladli Behna). Show that mismatches do not hard-block, providing an "Apply anyway" link.
7. **Document Intelligence & Anomaly Flag (M6)**: Open `OCR Hub`. Click `Test Low Quality (58% Conf)`. Show that confidence $< 75\%$ triggers an anomaly flag requiring manual human verification.
8. **Smart Autofill (M7)**: Click `Fill Portal Form from Vault`. Show green high-contrast outlines (`#046A38`) and source badges (`[Vault: Source Tag]`).
9. **Scoped AI Guidance & Web Speech TTS (M7)**: Click `Explain` on `Nature of Occupancy`. Show plain-language explanation and click `Listen` to test audio readout.
10. **Judge Observability Panel (Section 36)**: Click `⚖️ Judge Panel` in header to display live telemetry (0 PII leaked, 0 auto-submits, 600k PBKDF2).
11. **Human Approval Gate (M8)**: Click `Launch Human Approval Gate`. Review line-by-line audit trail and 100% Application Readiness Score. Click `Human Authorize & Submit Form`.
12. **Demo Reset (Section 35)**: Click `🔄 Reset` button to restore clean state for the next judge!
