import { CitizenProfile, SchemeRule, AuditCriterion, RuleProvenance } from '../types';
import { evaluateEligibility } from './deterministicRules';

import wbScheme from '../../data/schemes/wb_krishak_bandhu.json';
import pmKisanScheme from '../../data/schemes/pm_kisan.json';
import mpLadliScheme from '../../data/schemes/mp_ladli_behna.json';

export interface MultiSchemeResult {
  schemeId: string;
  schemeName: string;
  state: string;
  department: string;
  status: 'eligible' | 'ineligible' | 'partial';
  passCount: number;
  totalCount: number;
  auditTrail: AuditCriterion[];
  failedRules: RuleProvenance[];
  applyAnywayUrl: string;
}

export function screenAllSchemes(
  profile: CitizenProfile,
  customSchemes?: SchemeRule[]
): MultiSchemeResult[] {
  const schemesToEvaluate: SchemeRule[] = customSchemes || [
    wbScheme as SchemeRule,
    pmKisanScheme as SchemeRule,
    mpLadliScheme as SchemeRule
  ];

  const results: MultiSchemeResult[] = [];

  for (const scheme of schemesToEvaluate) {
    const evalRes = evaluateEligibility(profile, scheme);
    const passCount = evalRes.auditTrail.filter(a => a.passed).length;
    const totalCount = evalRes.auditTrail.length;

    let status: 'eligible' | 'ineligible' | 'partial' = 'ineligible';
    if (evalRes.isEligible) {
      status = 'eligible';
    } else if (passCount > 0 && passCount < totalCount) {
      status = 'partial';
    }

    const failedRules: RuleProvenance[] = evalRes.auditTrail
      .filter(a => !a.passed && a.provenance)
      .map(a => a.provenance!);

    results.push({
      schemeId: scheme.schemeId,
      schemeName: scheme.schemeName,
      state: scheme.state,
      department: scheme.department,
      status,
      passCount,
      totalCount,
      auditTrail: evalRes.auditTrail,
      failedRules,
      applyAnywayUrl: evalRes.applyAnywayUrl
    });
  }

  // Sort: Eligible first, then Partial, then Ineligible
  const statusWeight = { eligible: 3, partial: 2, ineligible: 1 };
  return results.sort((a, b) => statusWeight[b.status] - statusWeight[a.status]);
}
