import React from 'react';
import { CitizenProfile } from '../../types';
import { screenAllSchemes, MultiSchemeResult } from '../../engine/multiSchemeScreener';
import { Layers, CheckCircle2, ShieldAlert, XCircle, BookOpen, ExternalLink } from 'lucide-react';

interface SchemeMatrixUIProps {
  profile: CitizenProfile;
  onSelectSchemeDetail?: (schemeId: string) => void;
}

export const SchemeMatrixUI: React.FC<SchemeMatrixUIProps> = ({ profile, onSelectSchemeDetail }) => {
  const results: MultiSchemeResult[] = screenAllSchemes(profile);

  const eligibleCount = results.filter(r => r.status === 'eligible').length;
  const partialCount = results.filter(r => r.status === 'partial').length;
  const ineligibleCount = results.filter(r => r.status === 'ineligible').length;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4 shadow-2xs">
      {/* Matrix Summary Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#0F2C59]" />
            Cross-Scheme Eligibility Matrix
          </h3>
          <p className="text-xs text-slate-500">Screening profile against {results.length} active scheme rulesets</p>
        </div>
        <div className="flex gap-1.5 text-[10px] font-bold">
          <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full">
            {eligibleCount} Eligible
          </span>
          {partialCount > 0 && (
            <span className="bg-amber-50 border border-amber-200 text-amber-800 px-2 py-0.5 rounded-full">
              {partialCount} Partial
            </span>
          )}
          {ineligibleCount > 0 && (
            <span className="bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
              {ineligibleCount} Ineligible
            </span>
          )}
        </div>
      </div>

      {/* Scheme Cards Grid */}
      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {results.map((item) => (
          <div
            key={item.schemeId}
            className={`border rounded-xl p-3 space-y-2 text-xs transition-all ${
              item.status === 'eligible'
                ? 'bg-emerald-50/40 border-emerald-200'
                : item.status === 'partial'
                ? 'bg-amber-50/40 border-amber-200'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {item.status === 'eligible' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : item.status === 'partial' ? (
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <div>
                  <h4 className="font-extrabold text-slate-900">{item.schemeName}</h4>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {item.state} • {item.department}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
                  item.status === 'eligible'
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                    : item.status === 'partial'
                    ? 'bg-amber-100 border-amber-300 text-amber-900'
                    : 'bg-slate-200 border-slate-300 text-slate-700'
                }`}>
                  {item.status === 'eligible' ? '100% Qualified' : item.status === 'partial' ? 'Partial Match' : 'Not Qualified'}
                </span>
                <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                  {item.passCount}/{item.totalCount} Rules Passed
                </p>
              </div>
            </div>

            {/* Failed Rule Gazette Citations for Ineligible / Partial Schemes */}
            {item.failedRules.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-lg p-2 text-[10px] space-y-1 text-slate-800 shadow-2xs">
                <p className="font-bold text-amber-800 flex items-center gap-1">
                  <XCircle className="w-3 h-3 text-amber-600" /> Disqualifying Gazette Criteria:
                </p>
                {item.failedRules.map((rule, idx) => (
                  <div key={idx} className="flex items-center justify-between border-t border-slate-100 pt-1">
                    <span className="text-slate-700 font-medium">{rule.ruleLogic}</span>
                    <a
                      href={rule.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-700 underline font-mono font-semibold flex items-center gap-0.5 shrink-0 ml-2 hover:text-indigo-900"
                    >
                      <BookOpen className="w-2.5 h-2.5" />
                      {rule.sourceReference}
                      <ExternalLink className="w-2 h-2" />
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
