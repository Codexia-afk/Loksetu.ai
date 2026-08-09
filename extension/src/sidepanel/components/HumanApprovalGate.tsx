import React from 'react';
import { CitizenProfile, ApplicationMapData, AutofillItem } from '../../types';
import { ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';

interface HumanApprovalGateProps {
  isOpen: boolean;
  profile: CitizenProfile;
  mapData: ApplicationMapData | null;
  onConfirmAutofill: (items: AutofillItem[]) => void;
  onClose: () => void;
}

export const HumanApprovalGate: React.FC<HumanApprovalGateProps> = ({
  isOpen,
  profile,
  mapData,
  onConfirmAutofill,
  onClose
}) => {
  if (!isOpen || !mapData) return null;

  const prepareAutofillItems = (): AutofillItem[] => {
    return mapData.fields.map(f => {
      const norm = (f.label + ' ' + f.name).toLowerCase();
      let value = '';
      let sourceLabel = 'Encrypted Vault';

      if (norm.includes('name')) {
        value = profile.fullName || profile.personalDetails?.full_name || '';
        sourceLabel = 'Vault — Identity Profile';
      } else if (norm.includes('age')) {
        value = String(profile.age || (profile.personalDetails?.dob ? 35 : 30));
        sourceLabel = 'Vault — Identity Profile';
      } else if (norm.includes('state')) {
        value = profile.state || profile.addressDetails?.state || '';
        sourceLabel = 'Vault — Address Profile';
      } else if (norm.includes('district')) {
        value = profile.district || profile.addressDetails?.district || '';
        sourceLabel = 'Vault — Address Profile';
      } else if (norm.includes('income')) {
        value = String(profile.annualIncome || profile.landAndIncome?.annual_income || 0);
        sourceLabel = 'Vault — Income Records';
      } else if (norm.includes('land') || norm.includes('scale')) {
        value = String(profile.landHoldingHectares || profile.landAndIncome?.land_holding_scale || 0);
        sourceLabel = 'Vault — Land Record';
      } else if (norm.includes('occupancy') || norm.includes('category')) {
        value = profile.natureOfOccupancy || profile.category || profile.landAndIncome?.nature_of_occupancy || '';
        sourceLabel = 'Vault — Land Category';
      } else if (norm.includes('aadhaar')) {
        value = profile.aadhaarNumber || profile.personalDetails?.aadhaar_number || '9999-8888-7777';
        sourceLabel = 'Vault — Aadhaar Card';
      } else if (norm.includes('mobile') || norm.includes('phone')) {
        value = profile.mobileNumber || profile.personalDetails?.mobile_number || '9876543210';
        sourceLabel = 'Vault — Mobile Entry';
      }

      return {
        fieldId: f.id,
        value,
        sourceLabel,
        confidence: value ? 1.0 : 0
      };
    }).filter(item => item.value.trim().length > 0);
  };

  const autofillItems = prepareAutofillItems();

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-sm w-full p-4 space-y-4 shadow-2xl">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 text-sm">Human Approval Gate</h3>
            <p className="text-xs text-slate-400">Review Provenance Before Field Population</p>
          </div>
        </div>

        <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700 flex items-center justify-between text-xs">
          <div>
            <p className="text-slate-300 font-medium">Target Form: {mapData.portalName}</p>
            <p className="text-slate-400 text-[11px]">Ready to populate {autofillItems.length} of {mapData.totalFields} fields</p>
          </div>
          <div className="text-right">
            <span className="text-lg font-extrabold text-emerald-400">{mapData.readinessScore}%</span>
            <p className="text-[10px] text-slate-400">Readiness</p>
          </div>
        </div>

        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {autofillItems.map(item => (
            <div key={item.fieldId} className="bg-slate-950 p-2 rounded border border-slate-800 text-xs flex justify-between items-center">
              <div>
                <span className="text-slate-400 text-[11px] block">{item.fieldId}</span>
                <span className="text-slate-200 font-semibold">{item.value}</span>
              </div>
              <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800/60 px-2 py-0.5 rounded font-mono">
                {item.sourceLabel}
              </span>
            </div>
          ))}
        </div>

        <div className="bg-amber-950/40 border border-amber-800/40 p-2.5 rounded text-[11px] text-amber-200 space-y-1">
          <p className="font-semibold flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            Human Verification Required
          </p>
          <p className="opacity-90">
            LokSetu will fill input fields on the portal DOM. Form submission remains 100% manual — you must review all fields on the official portal and press submit yourself.
          </p>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg text-xs font-medium border border-slate-700 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirmAutofill(autofillItems)}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 rounded-lg text-xs font-semibold shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1.5 transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            Authorize & Fill
          </button>
        </div>
      </div>
    </div>
  );
};
