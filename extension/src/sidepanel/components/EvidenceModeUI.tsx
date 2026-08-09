import React, { useState } from 'react';
import { CitizenProfile, SchemeRule, EligibilityResult } from '../../types';
import { evaluateEligibility } from '../../engine/deterministicRules';
import { ShieldCheck, CheckCircle2, XCircle, ExternalLink, Calendar, Info, ShieldAlert, BookOpen } from 'lucide-react';

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
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-4 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Deterministic Evidence Mode
        </h3>
      </div>

      {/* Scheme Selector Tabs */}
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
        {schemes.map(s => (
          <button
            key={s.schemeId}
            onClick={() => setSelectedSchemeId(s.schemeId)}
            className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all text-center ${
              selectedSchemeId === s.schemeId
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            {s.schemeId === 'wb_krishak_bandhu' ? 'WB Krishak' : s.schemeId === 'pm_kisan' ? 'PM-KISAN' : 'MP Ladli'}
          </button>
        ))}
      </div>

      {/* Verification Status Header Card */}
      <div className={`p-3.5 rounded-xl border text-xs space-y-2.5 shadow-2xs ${
        eligibilityResult.isEligible
          ? 'bg-emerald-50/90 border-emerald-200/90 text-emerald-900'
          : 'bg-amber-50/90 border-amber-200/90 text-amber-900'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {eligibilityResult.isEligible ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            )}
            <div>
              <p className="font-extrabold text-sm leading-tight">
                {eligibilityResult.isEligible ? 'CONFIRMED MATCH' : 'Does Not Match Recorded Criteria'}
              </p>
              <p className="text-[11px] font-medium opacity-90">
                100% Deterministic Rule Audit • Confidence: {eligibilityResult.confidence * 100}%
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold font-mono uppercase bg-white/80 px-2 py-1 rounded-lg border border-slate-200 shadow-2xs">
            {selectedScheme.verificationStatus}
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-200/60 font-medium">
          <span className="flex items-center gap-1 opacity-80">
            <Calendar className="w-3 h-3 text-slate-600" />
            Rules Verified: {selectedScheme.lastVerified}
          </span>
          <a
            href={selectedScheme.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 underline text-emerald-700 hover:text-emerald-900 font-semibold"
          >
            Source Gazette Notification <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Audit Criteria Breakdown */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-slate-500" />
          Individual Criteria Lineage & Gazette Citations
        </h4>

        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {eligibilityResult.auditTrail.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3 space-y-1.5 text-xs"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">{item.criterion}</p>
                  <p className="text-[11px] text-slate-600 font-medium">
                    Recorded: <span className="font-mono text-slate-900 font-semibold">{item.actual}</span> (Required: <span className="font-mono text-slate-900 font-semibold">{item.expected}</span>)
                  </p>
                </div>

                {/* Accessible Pass/Fail Badge */}
                <div className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                  item.passed
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-red-100 text-red-800 border-red-300'
                }`}>
                  {item.passed ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>PASSED</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5 text-red-600" />
                      <span>FAILED</span>
                    </>
                  )}
                </div>
              </div>

              {/* Provenance Gazette Citation Chip */}
              {item.provenance && (
                <div className="bg-white border border-slate-200/90 rounded-lg p-2 text-[10px] text-slate-700 space-y-1 shadow-2xs">
                  <div className="flex items-center justify-between text-slate-900 font-bold">
                    <span className="flex items-center gap-1 text-slate-800">
                      <BookOpen className="w-3 h-3 text-emerald-600 shrink-0" />
                      {item.provenance.sourceTitle}
                    </span>
                    <a
                      href={item.provenance.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono underline text-emerald-700 hover:text-emerald-900 flex items-center gap-0.5"
                    >
                      {item.provenance.sourceReference}
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <p className="text-slate-600 leading-tight">
                    {item.provenance.ruleLogic}
                  </p>
                  <p className="text-[9px] text-slate-400 font-mono">
                    Last Verified: {item.provenance.lastVerifiedDate} • Type: {item.provenance.sourceType.toUpperCase()}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Override Link */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-slate-500 font-medium">Bypass eligibility checks?</span>
        <a
          href={eligibilityResult.applyAnywayUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 text-slate-800 px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all font-semibold"
        >
          <span>Apply Anyway on Portal</span>
          <ExternalLink className="w-3 h-3 text-slate-500" />
        </a>
      </div>
    </div>
  );
};
