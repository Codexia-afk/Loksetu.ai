import React, { useState } from 'react';
import { CitizenProfile, SchemeRule, EligibilityResult } from '../../types';
import { evaluateEligibility } from '../../engine/deterministicRules';
import { ShieldCheck, CheckCircle2, XCircle, ExternalLink, Calendar, Info, ShieldAlert } from 'lucide-react';

import wbScheme from '../../../data/schemes/wb_krishak_bandhu.json';
import pmKisanScheme from '../../../data/schemes/pm_kisan.json';
import mpLadliScheme from '../../../data/schemes/mp_ladli_behna.json';

interface EvidenceModeUIProps {
  profile: CitizenProfile;
}

export const EvidenceModeUI: React.FC<EvidenceModeUIProps> = ({ profile }) => {
  const schemes: SchemeRule[] = [
    wbScheme as SchemeRule,
    pmKisanScheme as SchemeRule,
    mpLadliScheme as SchemeRule
  ];

  const [selectedSchemeId, setSelectedSchemeId] = useState<string>(wbScheme.schemeId);

  const selectedScheme = schemes.find(s => s.schemeId === selectedSchemeId) || schemes[0];
  const eligibilityResult: EligibilityResult = evaluateEligibility(profile, selectedScheme);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
      {/* Scheme Selector Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="font-semibold text-slate-200 text-sm flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Deterministic Evidence Mode
        </h3>
      </div>

      <div className="flex space-x-1 bg-slate-800/60 p-1 rounded-lg border border-slate-700/60">
        {schemes.map(s => (
          <button
            key={s.schemeId}
            onClick={() => setSelectedSchemeId(s.schemeId)}
            className={`flex-1 py-1.5 px-2 rounded text-[11px] font-medium transition-all text-center ${
              selectedSchemeId === s.schemeId
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/40'
            }`}
          >
            {s.schemeId === 'wb_krishak_bandhu' ? 'WB Krishak' : s.schemeId === 'pm_kisan' ? 'PM-KISAN' : 'MP Ladli'}
          </button>
        ))}
      </div>

      {/* Verification Status Header Card */}
      <div className={`p-3 rounded-lg border text-xs space-y-2 ${
        eligibilityResult.isEligible
          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
          : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {eligibilityResult.isEligible ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            )}
            <div>
              <p className="font-bold text-sm">
                {eligibilityResult.isEligible ? 'CONFIRMED MATCH' : 'Does Not Match Recorded Criteria'}
              </p>
              <p className="text-[11px] opacity-90">
                100% Deterministic Rule Audit • Confidence: {eligibilityResult.confidence * 100}%
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono uppercase bg-slate-900/60 px-2 py-0.5 rounded border border-slate-700">
            {selectedScheme.verificationStatus}
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/60">
          <span className="flex items-center gap-1 opacity-80">
            <Calendar className="w-3 h-3 text-indigo-400" />
            Rules Verified: {selectedScheme.lastVerified}
          </span>
          <a
            href={selectedScheme.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 underline text-indigo-300 hover:text-indigo-200"
          >
            Source Gazette Notification <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Audit Criteria Breakdown */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-slate-300 flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-indigo-400" />
          Individual Criteria Lineage
        </h4>

        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {eligibilityResult.auditTrail.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-2 flex items-center justify-between text-xs"
            >
              <div>
                <p className="font-medium text-slate-200">{item.criterion}</p>
                <p className="text-[11px] text-slate-400">
                  Recorded: <span className="font-mono text-slate-300">{item.actual}</span> (Required: <span className="font-mono text-slate-300">{item.expected}</span>)
                </p>
              </div>

              {/* Accessible Pass/Fail Badge (Icon + Explicit Text Label) */}
              <div className={`flex items-center space-x-1 px-2 py-1 rounded text-[10px] font-bold border ${
                item.passed
                  ? 'bg-emerald-950 border-emerald-600/60 text-emerald-300'
                  : 'bg-red-950 border-red-600/60 text-red-300'
              }`}>
                {item.passed ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>PASSED</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5 text-red-400" />
                    <span>FAILED</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ALWAYS VISIBLE OVERRIDE LINK */}
      <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
        <span className="text-[11px] text-slate-400">Want to bypass rule checks?</span>
        <a
          href={eligibilityResult.applyAnywayUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-indigo-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all font-medium"
        >
          <span>Apply Anyway on Portal</span>
          <ExternalLink className="w-3 h-3 text-indigo-400" />
        </a>
      </div>
    </div>
  );
};
