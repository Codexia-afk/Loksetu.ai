import React, { useState } from 'react';
import { CitizenProfile, FieldMapEntry, ExplainerResponse } from '../../types';
import { speakText, stopSpeaking } from '../../services/ttsService';

interface SmartAutofillProps {
  activeProfile: CitizenProfile | null;
  fields: FieldMapEntry[];
  onTriggerAutofill: (items: any[]) => void;
  onOpenApprovalGate: () => void;
}

export const SmartAutofill: React.FC<SmartAutofillProps> = ({
  activeProfile,
  fields,
  onTriggerAutofill,
  onOpenApprovalGate
}) => {
  const [explainerData, setExplainerData] = useState<ExplainerResponse | null>(null);
  const [loadingFieldId, setLoadingFieldId] = useState<string>('');
  const [isPlayingTTS, setIsPlayingTTS] = useState<boolean>(false);

  const handleFillFromVault = () => {
    if (!activeProfile) return;

    // Map vault fields to DOM field items with source labels (Constraint 8)
    const items = [
      { fieldId: 'full_name', value: activeProfile.personalDetails.full_name, sourceLabel: 'Vault: Aadhaar Profile', confidence: 100 },
      { fieldId: 'dob', value: activeProfile.personalDetails.dob, sourceLabel: 'Vault: Aadhaar Profile', confidence: 100 },
      { fieldId: 'gender', value: activeProfile.personalDetails.gender, sourceLabel: 'Vault: Aadhaar Profile', confidence: 100 },
      { fieldId: 'aadhaar_number', value: activeProfile.personalDetails.aadhaar_number, sourceLabel: 'Vault: Aadhaar Document', confidence: 94 },
      { fieldId: 'mobile_number', value: activeProfile.personalDetails.mobile_number, sourceLabel: 'Vault: Aadhaar Profile', confidence: 100 },
      { fieldId: 'state', value: activeProfile.addressDetails.state, sourceLabel: 'Vault: Address Details', confidence: 100 },
      { fieldId: 'district', value: activeProfile.addressDetails.district, sourceLabel: 'Vault: Address Details', confidence: 100 },
      { fieldId: 'block_tehsil', value: activeProfile.addressDetails.block_tehsil, sourceLabel: 'Vault: Address Details', confidence: 100 },
      { fieldId: 'village_ward', value: activeProfile.addressDetails.village_ward, sourceLabel: 'Vault: Address Details', confidence: 100 },
      { fieldId: 'pincode', value: activeProfile.addressDetails.pincode, sourceLabel: 'Vault: Address Details', confidence: 100 },
      { fieldId: 'farmer_category', value: activeProfile.landAndIncome.farmer_category, sourceLabel: 'Vault: Land Profile', confidence: 100 },
      { fieldId: 'annual_income', value: String(activeProfile.landAndIncome.annual_income), sourceLabel: 'Vault: Income Profile', confidence: 100 },
      { fieldId: 'nature_of_occupancy', value: activeProfile.landAndIncome.nature_of_occupancy, sourceLabel: 'Vault: Land Record Khatiyan', confidence: 88 },
      { fieldId: 'land_holding_scale', value: String(activeProfile.landAndIncome.land_holding_scale), sourceLabel: 'Vault: Land Record Khatiyan', confidence: 88 }
    ];

    onTriggerAutofill(items);
  };

  // Constraint 3 & Fix 6: Scoped DTO LLM Payload Call
  const handleFetchExplanation = async (field: FieldMapEntry) => {
    setLoadingFieldId(field.fieldId);
    try {
      // Build strictly scoped DTO
      const payload = {
        field_id: field.fieldId,
        label_text: field.labelText,
        aria_label: field.ariaLabel || null,
        input_type: field.inputType || 'text',
        placeholder: field.placeholder || null,
        context_hint: field.contextHint || 'Land & Income Details'
      };

      const res = await fetch('http://localhost:8000/api/v1/explain-field', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setExplainerData(data);
      }
    } catch (err) {
      console.error('LLM proxy error:', err);
    } finally {
      setLoadingFieldId('');
    }
  };

  const handleToggleTTS = (text: string) => {
    if (isPlayingTTS) {
      stopSpeaking();
      setIsPlayingTTS(false);
    } else {
      speakText(text, 'en-IN');
      setIsPlayingTTS(true);
    }
  };

  return (
    <div className="sp-card">
      <div className="sp-card-title">
        <span>⚡ Smart Autofill & Field Guidance</span>
      </div>

      <button
        className="btn-sp-primary btn-sp-green"
        style={{ marginBottom: '10px' }}
        onClick={handleFillFromVault}
        disabled={!activeProfile}
      >
        ✨ Fill Portal Form from Vault ({activeProfile ? activeProfile.profileName : 'No Active Vault'})
      </button>

      {/* Disambiguation Section */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
          Scoped Gemini Disambiguation Targets:
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {fields.filter(f => f.isVague).map(f => (
            <div key={f.fieldId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFFBEB', padding: '6px 8px', borderRadius: '4px', border: '1px solid #FCD34D' }}>
              <span style={{ fontSize: '11px', color: '#92400E', fontWeight: 600 }}>{f.labelText}</span>
              <button
                onClick={() => handleFetchExplanation(f)}
                style={{ padding: '3px 8px', fontSize: '10px', background: '#0F2C59', color: '#FFF', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                disabled={loadingFieldId === f.fieldId}
              >
                {loadingFieldId === f.fieldId ? 'Fetching...' : '💡 Explain'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Scoped Explainer Output Box */}
      {explainerData && (
        <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', padding: '10px', borderRadius: '6px', fontSize: '11px', marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontWeight: 700, color: '#0369A1' }}>💡 Scoped Guidance: {explainerData.field_id}</span>
            <button
              onClick={() => handleToggleTTS(explainerData.plain_language_explanation)}
              style={{ padding: '2px 6px', fontSize: '10px', background: '#0284C7', color: '#FFF', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              {isPlayingTTS ? '⏸️ Stop Audio' : '🔊 Listen (Web Speech TTS)'}
            </button>
          </div>
          <p style={{ color: '#0C4A6E', marginBottom: '6px' }}>{explainerData.plain_language_explanation}</p>
          <div style={{ fontSize: '10px', fontStyle: 'italic', color: '#0369A1' }}>
            Example: {explainerData.example_input}
          </div>
        </div>
      )}

      {/* Pre-Submission Review Trigger Button */}
      <button
        className="btn-sp-primary"
        style={{ background: '#FF671F' }}
        onClick={onOpenApprovalGate}
      >
        🛡️ Launch Human Approval Gate & Review
      </button>
    </div>
  );
};
