import React, { useState, useEffect } from 'react';
import { CitizenProfile, ApplicationMapData, AutofillItem } from '../types';
import { Header } from './components/Header';
import { SessionSwitcher } from './components/SessionSwitcher';
import { ApplicationMapUI } from './components/ApplicationMapUI';
import { EvidenceModeUI } from './components/EvidenceModeUI';
import { DocumentOCRUI } from './components/DocumentOCRUI';
import { HumanApprovalGate } from './components/HumanApprovalGate';
import { VaultManagerUI } from './components/VaultManagerUI';
import { NetworkStatusBanner } from './components/NetworkStatusBanner';
import { SchemeMatrixUI } from './components/SchemeMatrixUI';
import { ApplicationTrackerUI } from './components/ApplicationTrackerUI';
import { registerSessionClearedListener } from '../engine/sessionLockManager';
import { FileText, ShieldCheck, FileScan, Lock, Layers, Clock, Info } from 'lucide-react';

const DEFAULT_PROFILES: CitizenProfile[] = [
  {
    id: 'citizen_001',
    profileName: 'Ramprasad Sen (Small Farmer - WB)',
    fullName: 'Ramprasad Sen',
    age: 42,
    gender: 'Male',
    state: 'West Bengal',
    district: 'Purulia',
    annualIncome: 120000,
    category: 'Small',
    landHoldingHectares: 0.85,
    aadhaarNumber: '9999-8888-7777',
    mobileNumber: '9876543210',
    natureOfOccupancy: 'Recorded Bargadar',
    isInstitutionalLandholder: false
  },
  {
    id: 'citizen_002',
    profileName: 'Sunita Devi (Ladli Behna - MP)',
    fullName: 'Sunita Devi',
    age: 34,
    gender: 'Female',
    state: 'Madhya Pradesh',
    district: 'Bhopal',
    annualIncome: 85000,
    category: 'Marginal',
    landHoldingHectares: 0.2,
    aadhaarNumber: '8888-7777-6666',
    mobileNumber: '9876500000',
    natureOfOccupancy: 'Owner',
    isInstitutionalLandholder: false
  }
];

export const App: React.FC = () => {
  const [mode, setMode] = useState<'citizen' | 'facilitator'>('citizen');
  const [activeTab, setActiveTab] = useState<'map' | 'matrix' | 'evidence' | 'ocr' | 'tracker' | 'vault'>('map');

  const [profiles, setProfiles] = useState<CitizenProfile[]>(DEFAULT_PROFILES);
  const [activeProfileId, setActiveProfileId] = useState<string>(DEFAULT_PROFILES[0].id);

  const [mapData, setMapData] = useState<ApplicationMapData | null>(null);
  const [isApprovalOpen, setIsApprovalOpen] = useState(false);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];

  useEffect(() => {
    const unregister = registerSessionClearedListener((reason) => {
      setStatusNotification(`🔒 Session Lock: ${reason}`);
    });
    return unregister;
  }, []);

  const handleScanDOM = () => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0]?.id;
        if (!tabId) {
          useFallbackMockMap();
          return;
        }

        chrome.tabs.sendMessage(tabId, { type: 'SCAN_DOM' }, (res) => {
          if (chrome.runtime.lastError) {
            if (chrome.scripting) {
              chrome.scripting.executeScript(
                { target: { tabId }, files: ['src/content/contentScript.js'] },
                () => {
                  if (chrome.runtime.lastError) {
                    useFallbackMockMap();
                    return;
                  }
                  setTimeout(() => {
                    chrome.tabs.sendMessage(tabId, { type: 'SCAN_DOM' }, (retryRes) => {
                      if (retryRes && retryRes.mapData) {
                        setMapData(retryRes.mapData);
                        setStatusNotification(`Scanned ${retryRes.mapData.totalFields} form fields from portal.`);
                      } else {
                        useFallbackMockMap();
                      }
                    });
                  }, 200);
                }
              );
            } else {
              useFallbackMockMap();
            }
            return;
          }

          if (res && res.mapData) {
            setMapData(res.mapData);
            setStatusNotification(`Scanned ${res.mapData.totalFields} form fields from portal.`);
          } else {
            useFallbackMockMap();
          }
        });
      });
    } else {
      useFallbackMockMap();
    }
  };

  const useFallbackMockMap = () => {
    setMapData({
      portalName: 'WB Krishak Bandhu Application Form (Simulator)',
      totalFields: 14,
      completionPercentage: 28,
      readinessScore: 85,
      fields: [
        { id: 'full_name', name: 'full_name', type: 'text', label: 'Full Name (as in Aadhaar)', value: 'Ramprasad Sen', required: true, category: 'personal' },
        { id: 'dob', name: 'dob', type: 'date', label: 'Date of Birth', value: '1982-05-14', required: true, category: 'personal' },
        { id: 'gender', name: 'gender', type: 'select', label: 'Gender', value: 'Male', required: true, category: 'personal' },
        { id: 'aadhaar_number', name: 'aadhaar_number', type: 'text', label: 'Aadhaar Number (12 Digits)', value: '', required: true, category: 'personal' },
        { id: 'mobile_number', name: 'mobile_number', type: 'text', label: 'Mobile Number (Aadhaar Linked)', value: '', required: true, category: 'personal' },
        { id: 'state', name: 'state', type: 'text', label: 'State of Domicile', value: 'West Bengal', required: true, category: 'address' },
        { id: 'district', name: 'district', type: 'text', label: 'District', value: '', required: true, category: 'address' },
        { id: 'block_tehsil', name: 'block_tehsil', type: 'text', label: 'Block / Tehsil', value: '', required: true, category: 'address' },
        { id: 'village_ward', name: 'village_ward', type: 'text', label: 'Gram Panchayat / Village / Ward', value: '', required: true, category: 'address' },
        { id: 'pincode', name: 'pincode', type: 'text', label: 'PIN Code', value: '', required: true, category: 'address' },
        { id: 'farmer_category', name: 'farmer_category', type: 'select', label: 'Farmer Category', value: 'Small', required: true, category: 'income' },
        { id: 'annual_income', name: 'annual_income', type: 'number', label: 'Annual Family Income (INR)', value: '', required: true, category: 'income' },
        { id: 'nature_of_occupancy', name: 'nature_of_occupancy', type: 'select', label: 'Nature of Occupancy', value: '', required: true, category: 'income', isVague: true },
        { id: 'land_holding_scale', name: 'land_holding_scale', type: 'text', label: 'Land Holding Scale (in Acres)', value: '', required: true, category: 'income', isVague: true }
      ]
    });
    setStatusNotification('Analyzed 14 portal fields.');
  };

  const handleConfirmAutofill = (items: AutofillItem[]) => {
    setIsApprovalOpen(false);

    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0]?.id;
        if (tabId) {
          chrome.tabs.sendMessage(tabId, { type: 'AUTOFILL_DOM', items }, (res) => {
            if (res && res.mapData) {
              setMapData(res.mapData);
            }
            setStatusNotification(`Autofilled ${items.length} fields with green confirmation outline.`);
          });
        }
      });
    } else {
      setStatusNotification(`Simulated autofill of ${items.length} fields.`);
    }
  };

  const handleProfileSelect = (id: string) => {
    setActiveProfileId(id);
    setStatusNotification(`Switched session to ${profiles.find(p => p.id === id)?.profileName}`);
  };

  const handleCreateProfile = () => {
    const newId = `citizen_${Date.now()}`;
    const newProfile: CitizenProfile = {
      id: newId,
      profileName: `New Citizen (${profiles.length + 1})`,
      fullName: 'New Applicant',
      age: 30,
      gender: 'Male',
      state: 'West Bengal',
      district: 'Kolkata',
      annualIncome: 100000,
      category: 'Small',
      landHoldingHectares: 0.5,
      natureOfOccupancy: 'Owner'
    };
    setProfiles(prev => [...prev, newProfile]);
    setActiveProfileId(newId);
    setActiveTab('vault');
  };

  const handleImportComplete = (imported: CitizenProfile[]) => {
    setProfiles(prev => {
      const existingIds = new Set(prev.map(p => p.id));
      const filtered = imported.filter(p => !existingIds.has(p.id));
      return [...prev, ...filtered];
    });
    if (imported.length > 0) {
      setActiveProfileId(imported[0].id);
    }
  };

  useEffect(() => {
    handleScanDOM();
  }, []);

  return (
    <div className="w-full min-h-screen bg-[#F3F6FA] text-slate-900 font-sans flex flex-col antialiased">
      <Header mode={mode} onToggleMode={setMode} />

      <main className="flex-1 p-3.5 space-y-3.5 max-w-md mx-auto w-full">
        {/* Network Resilience Status Banner */}
        <NetworkStatusBanner />

        {mode === 'facilitator' && (
          <SessionSwitcher
            profiles={profiles}
            activeProfileId={activeProfileId}
            onSelectProfile={handleProfileSelect}
            onCreateNewProfile={handleCreateProfile}
            onImportComplete={handleImportComplete}
          />
        )}

        {/* Tab Navigation Bar - Clean Light Styling */}
        <div className="grid grid-cols-6 bg-white p-1 rounded-xl border border-slate-200/90 shadow-2xs text-[11px] gap-0.5">
          <button
            onClick={() => setActiveTab('map')}
            className={`py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1 transition-all ${
              activeTab === 'map'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Form Map"
          >
            <FileText className="w-3 h-3" />
            <span>Map</span>
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            className={`py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1 transition-all ${
              activeTab === 'matrix'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Multi-Scheme Matrix"
          >
            <Layers className="w-3 h-3 text-indigo-400" />
            <span>Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('evidence')}
            className={`py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1 transition-all ${
              activeTab === 'evidence'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Gazette Evidence"
          >
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Evidence</span>
          </button>

          <button
            onClick={() => setActiveTab('ocr')}
            className={`py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1 transition-all ${
              activeTab === 'ocr'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Document OCR"
          >
            <FileScan className="w-3 h-3 text-amber-400" />
            <span>OCR</span>
          </button>

          <button
            onClick={() => setActiveTab('tracker')}
            className={`py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1 transition-all ${
              activeTab === 'tracker'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Application Tracker"
          >
            <Clock className="w-3 h-3 text-purple-400" />
            <span>Tracker</span>
          </button>

          <button
            onClick={() => setActiveTab('vault')}
            className={`py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1 transition-all ${
              activeTab === 'vault'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Encrypted Vault"
          >
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>Vault</span>
          </button>
        </div>

        {statusNotification && (
          <div className="bg-emerald-50/90 border border-emerald-200/90 text-emerald-900 text-xs px-3.5 py-2 rounded-xl flex items-center justify-between shadow-2xs font-medium">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              {statusNotification}
            </span>
            <button
              onClick={() => setStatusNotification(null)}
              className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {activeTab === 'map' && (
          <ApplicationMapUI
            mapData={mapData}
            onScanClick={handleScanDOM}
            onAutofillClick={() => setIsApprovalOpen(true)}
          />
        )}

        {activeTab === 'matrix' && (
          <SchemeMatrixUI profile={activeProfile} />
        )}

        {activeTab === 'evidence' && (
          <EvidenceModeUI profile={activeProfile} />
        )}

        {activeTab === 'ocr' && (
          <DocumentOCRUI profile={activeProfile} />
        )}

        {activeTab === 'tracker' && (
          <ApplicationTrackerUI />
        )}

        {activeTab === 'vault' && (
          <VaultManagerUI
            activeProfile={activeProfile}
            onSaveSuccess={(updated) => {
              setProfiles(prev => prev.map(p => (p.id === updated.id ? updated : p)));
              setStatusNotification(`Saved encrypted profile '${updated.profileName}'.`);
            }}
          />
        )}

        <HumanApprovalGate
          isOpen={isApprovalOpen}
          profile={activeProfile}
          mapData={mapData}
          onConfirmAutofill={handleConfirmAutofill}
          onClose={() => setIsApprovalOpen(false)}
        />
      </main>
    </div>
  );
};

export default App;
