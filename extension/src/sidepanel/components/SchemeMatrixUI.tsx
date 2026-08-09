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
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
      {/* Matrix Summary Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="font-semibold text-slate-200 text-sm flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-indigo-400" />
            Cross-Scheme Eligibility Matrix
          </h3>
          <p className="text-xs text-slate-400">Screening profile against {results.length} active scheme rulesets</p>
        </div>
        <div className="flex gap-1.5 text-[10px] font-semibold">
          <span className="bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 px-2 py-0.5 rounded">
            {eligibleCount} Eligible
          </span>
          {partialCount > 0 && (
            <span className="bg-amber-950/80 border border-amber-700/60 text-amber-300 px-2 py-0.5 rounded">
              {partialCount} Partial
            </span>
          )}
          {ineligibleCount > 0 && (
            <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
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
            className={`border rounded-lg p-3 space-y-2 text-xs transition-all ${
              item.status === 'eligible'
                ? 'bg-emerald-950/30 border-emerald-700/40'
                : item.status === 'partial'
                ? 'bg-amber-950/30 border-amber-700/40'
                : 'bg-slate-800/30 border-slate-700/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {item.status === 'eligible' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : item.status === 'partial' ? (
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                )}
                <div>
                  <h4 className="font-bold text-slate-100">{item.schemeName}</h4>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {item.state} • {item.department}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                  item.status === 'eligible'
                    ? 'bg-emerald-950 border-emerald-500/60 text-emerald-300'
                    : item.status === 'partial'
                    ? 'bg-amber-950 border-amber-500/60 text-amber-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}>
                  {item.status === 'eligible' ? '100% Qualified' : item.status === 'partial' ? 'Partial Match' : 'Not Qualified'}
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {item.passCount}/{item.totalCount} Rules Passed
                </p>
              </div>
            </div>

            {/* Failed Rule Gazette Citations for Ineligible / Partial Schemes */}
            {item.failedRules.length > 0 && (
              <div className="bg-slate-950/80 border border-slate-800 rounded p-2 text-[10px] space-y-1 text-slate-300">
                <p className="font-semibold text-amber-300 flex items-center gap-1">
                  <XCircle className="w-3 h-3 text-amber-400" /> Disqualifying Gazette Criteria:
                </p>
                {item.failedRules.map((rule, idx) => (
                  <div key={idx} className="flex items-center justify-between border-t border-slate-800/80 pt-1">
                    <span className="text-slate-300">{rule.ruleLogic}</span>
                    <a
                      href={rule.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 underline font-mono flex items-center gap-0.5 shrink-0 ml-2"
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
