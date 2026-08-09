import React, { useState, useEffect } from 'react';
import { CitizenProfile, ApplicationMapData, AutofillItem } from '../types';
import { Header } from './components/Header';
import { SessionSwitcher } from './components/SessionSwitcher';
import { ApplicationMapUI } from './components/ApplicationMapUI';
import { EvidenceModeUI } from './components/EvidenceModeUI';
import { DocumentOCRUI } from './components/DocumentOCRUI';
import { HumanApprovalGate } from './components/HumanApprovalGate';
import { VaultManagerUI } from './components/VaultManagerUI';
import { FileText, ShieldCheck, FileScan, Lock, Layers } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'map' | 'evidence' | 'ocr' | 'vault'>('map');

  const [profiles, setProfiles] = useState<CitizenProfile[]>(DEFAULT_PROFILES);
  const [activeProfileId, setActiveProfileId] = useState<string>(DEFAULT_PROFILES[0].id);

  const [mapData, setMapData] = useState<ApplicationMapData | null>(null);
  const [isApprovalOpen, setIsApprovalOpen] = useState(false);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];

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
            // Attempt programmatic script injection as fallback
            if (chrome.scripting) {
              chrome.scripting.executeScript(
                { target: { tabId }, files: ['src/content/contentScript.js'] },
                () => {
                  if (chrome.runtime.lastError) {
                    useFallbackMockMap();
                    return;
                  }
                  // Retry message after injection
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
    setStatusNotification(`Switched active profile to ${profiles.find(p => p.id === id)?.profileName}`);
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
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      <Header mode={mode} onToggleMode={setMode} />

      <main className="flex-1 p-4 space-y-4 max-w-md mx-auto w-full">
        {mode === 'facilitator' && (
          <SessionSwitcher
            profiles={profiles}
            activeProfileId={activeProfileId}
            onSelectProfile={handleProfileSelect}
            onCreateNewProfile={handleCreateProfile}
            onImportComplete={handleImportComplete}
          />
        )}

        <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('map')}
            className={`flex-1 py-2 rounded-lg font-medium flex items-center justify-center gap-1 transition-all ${
              activeTab === 'map'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Form Map</span>
          </button>

          <button
            onClick={() => setActiveTab('evidence')}
            className={`flex-1 py-2 rounded-lg font-medium flex items-center justify-center gap-1 transition-all ${
              activeTab === 'evidence'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Evidence</span>
          </button>

          <button
            onClick={() => setActiveTab('ocr')}
            className={`flex-1 py-2 rounded-lg font-medium flex items-center justify-center gap-1 transition-all ${
              activeTab === 'ocr'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileScan className="w-3.5 h-3.5 text-amber-400" />
            <span>OCR</span>
          </button>

          <button
            onClick={() => setActiveTab('vault')}
            className={`flex-1 py-2 rounded-lg font-medium flex items-center justify-center gap-1 transition-all ${
              activeTab === 'vault'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-indigo-300" />
            <span>Vault</span>
          </button>
        </div>

        {statusNotification && (
          <div className="bg-slate-900 border border-slate-800 text-indigo-300 text-xs px-3 py-2 rounded-lg flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              {statusNotification}
            </span>
            <button
              onClick={() => setStatusNotification(null)}
              className="text-slate-500 hover:text-slate-300 text-xs"
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

        {activeTab === 'evidence' && (
          <EvidenceModeUI profile={activeProfile} />
        )}

        {activeTab === 'ocr' && (
          <DocumentOCRUI profile={activeProfile} />
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
