import React, { useState, useEffect } from 'react';
import { CitizenProfile, FieldMapEntry, SchemeEligibilityReport } from '../types';
import { ProfileSelector } from './components/ProfileSelector';
import { ApplicationMap } from './components/ApplicationMap';
import { EvidenceEligibility } from './components/EvidenceEligibility';
import { OCRScanner } from './components/OCRScanner';
import { SmartAutofill } from './components/SmartAutofill';
import { ApprovalGateModal } from './components/ApprovalGateModal';
import { JudgePanel } from './components/JudgePanel';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'map' | 'evidence' | 'ocr' | 'autofill'>('map');
  const [activeProfile, setActiveProfile] = useState<CitizenProfile | null>(null);
  const [fields, setFields] = useState<FieldMapEntry[]>([]);
  const [isApprovalGateOpen, setIsApprovalGateOpen] = useState<boolean>(false);
  const [statusNotification, setStatusNotification] = useState<string>('');
  const [showJudgePanel, setShowJudgePanel] = useState<boolean>(false);
  const [eligibilityReport, setEligibilityReport] = useState<SchemeEligibilityReport | null>(null);

  useEffect(() => {
    handleScanDOM();
  }, []);

  const handleScanDOM = () => {
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0]?.id;
        if (tabId) {
          chrome.tabs.sendMessage(tabId, { type: 'SCAN_DOM' }, (response) => {
            if (response && response.fields) {
              setFields(response.fields);
            }
          });
        }
      });
    } catch (e) {
      console.warn('Chrome runtime message fallback:', e);
    }
  };

  const handleTriggerAutofill = (items: any[]) => {
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0]?.id;
        if (tabId) {
          chrome.tabs.sendMessage(tabId, { type: 'AUTOFILL_DOM', items }, (response) => {
            if (response && response.filledCount) {
              setStatusNotification(`✅ Successfully injected ${response.filledCount} fields with green outlines & source badges.`);
              handleScanDOM();
            }
          });
        }
      });
    } catch (e) {
      setStatusNotification('⚠️ Autofill requires live simulator tab.');
    }
  };

  const handleResetDemo = () => {
    setActiveProfile(null);
    setStatusNotification('🔄 Demo state reset clean for next evaluation.');
    handleScanDOM();
  };

  const handleApprovedSubmit = () => {
    setIsApprovalGateOpen(false);
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0]?.id;
        if (tabId) {
          chrome.scripting.executeScript({
            target: { tabId },
            func: () => {
              const submitBtn = document.getElementById('btn-portal-submit');
              if (submitBtn) submitBtn.click();
            }
          });
        }
      });
    } catch (e) {
      setStatusNotification('Submitted application via Human Approval Gate.');
    }
  };

  return (
    <div>
      <div className="sp-header">
        <div className="sp-logo">
          <span>🇮🇳 LokSetu</span>
          <span className="sp-logo-badge">Copilot</span>
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <button
            onClick={() => setShowJudgePanel(!showJudgePanel)}
            style={{
              fontSize: '10px',
              background: showJudgePanel ? '#FF671F' : 'rgba(255,255,255,0.2)',
              color: '#FFF',
              border: 'none',
              padding: '2px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            ⚖️ Judge Panel
          </button>
          <button
            onClick={handleResetDemo}
            style={{
              fontSize: '10px',
              background: '#DC2626',
              color: '#FFF',
              border: 'none',
              padding: '2px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            🔄 Reset
          </button>
        </div>
      </div>

      {showJudgePanel && (
        <JudgePanel
          activeProfile={activeProfile}
          fields={fields}
          eligibilityReport={eligibilityReport}
        />
      )}

      {/* Nav Tabs */}
      <div className="sp-nav">
        <button className={`sp-nav-btn ${activeTab === 'map' ? 'active' : ''}`} onClick={() => setActiveTab('map')}>
          🗺️ App Map ({fields.length})
        </button>
        <button className={`sp-nav-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
          👤 Vault & Profiles
        </button>
        <button className={`sp-nav-btn ${activeTab === 'evidence' ? 'active' : ''}`} onClick={() => setActiveTab('evidence')}>
          ⚖️ Evidence Mode
        </button>
        <button className={`sp-nav-btn ${activeTab === 'ocr' ? 'active' : ''}`} onClick={() => setActiveTab('ocr')}>
          📄 OCR Hub
        </button>
        <button className={`sp-nav-btn ${activeTab === 'autofill' ? 'active' : ''}`} onClick={() => setActiveTab('autofill')}>
          ⚡ Smart Fill
        </button>
      </div>

      {/* Main Content Area */}
      <div className="sp-content">
        {statusNotification && (
          <div style={{ background: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0', padding: '6px 10px', borderRadius: '6px', fontSize: '11px', marginBottom: '10px' }}>
            {statusNotification}
          </div>
        )}

        {activeTab === 'map' && (
          <ApplicationMap fields={fields} onScanTrigger={handleScanDOM} />
        )}

        {activeTab === 'profile' && (
          <ProfileSelector activeProfile={activeProfile} onProfileLoaded={(p) => setActiveProfile(p)} />
        )}

        {activeTab === 'evidence' && (
          <EvidenceEligibility activeProfile={activeProfile} />
        )}

        {activeTab === 'ocr' && (
          <OCRScanner />
        )}

        {activeTab === 'autofill' && (
          <SmartAutofill
            activeProfile={activeProfile}
            fields={fields}
            onTriggerAutofill={handleTriggerAutofill}
            onOpenApprovalGate={() => setIsApprovalGateOpen(true)}
          />
        )}
      </div>

      <ApprovalGateModal
        isOpen={isApprovalGateOpen}
        activeProfile={activeProfile}
        fields={fields}
        onClose={() => setIsApprovalGateOpen(false)}
        onUserApprovedSubmit={handleApprovedSubmit}
      />
    </div>
  );
};

export default App;
