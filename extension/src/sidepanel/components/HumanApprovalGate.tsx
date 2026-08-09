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
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200/90 rounded-2xl max-w-sm w-full p-4 space-y-4 shadow-xl">
        <div className="flex items-center space-x-2.5 border-b border-slate-100 pb-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-2xs">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">Human Approval Gate</h3>
            <p className="text-xs text-slate-500 font-medium">Review Provenance Before Field Population</p>
          </div>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
          <div>
            <p className="text-slate-900 font-bold">Target Form: {mapData.portalName}</p>
            <p className="text-slate-500 font-medium text-[11px]">Ready to populate {autofillItems.length} of {mapData.totalFields} fields</p>
          </div>
          <div className="text-right">
            <span className="text-xl font-extrabold text-emerald-600">{mapData.readinessScore}%</span>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Readiness</p>
          </div>
        </div>

        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {autofillItems.map(item => (
            <div key={item.fieldId} className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/80 text-xs flex justify-between items-center shadow-2xs">
              <div>
                <span className="text-slate-500 font-medium text-[10px] block">{item.fieldId}</span>
                <span className="text-slate-900 font-bold">{item.value}</span>
              </div>
              <span className="text-[10px] bg-slate-900 text-white font-mono px-2 py-0.5 rounded-md font-semibold shadow-2xs">
                {item.sourceLabel}
              </span>
            </div>
          ))}
        </div>

        <div className="bg-amber-50/90 border border-amber-200/90 p-3 rounded-xl text-[11px] text-amber-900 space-y-1 shadow-2xs">
          <p className="font-bold flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            Human Verification Required
          </p>
          <p className="opacity-90 leading-relaxed font-medium">
            LokSetu will fill input fields on the portal DOM with green outlines. Form submission remains 100% manual — you must review all fields on the official portal and press submit yourself.
          </p>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-100 hover:bg-slate-200/80 text-slate-800 py-2.5 rounded-xl text-xs font-semibold border border-slate-200/80 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirmAutofill(autofillItems)}
            className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl text-xs font-extrabold shadow-sm flex items-center justify-center gap-1.5 transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Authorize & Fill
          </button>
        </div>
      </div>
    </div>
  );
};
