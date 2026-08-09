export * from '../engine/deterministicRules';
import { evaluateEligibility } from '../engine/deterministicRules';
import { CitizenProfile, SchemeRule, SchemeEligibilityReport } from '../types';

export function evaluateSchemeRules(profile: CitizenProfile, scheme: SchemeRule): SchemeEligibilityReport {
  const result = evaluateEligibility(profile, scheme);
  return {
    schemeId: scheme.schemeId,
    schemeName: scheme.schemeName,
    state: scheme.state,
    department: scheme.department,
    status: result.isEligible ? 'ELIGIBLE' : 'INELIGIBLE',
    lastVerified: result.verifiedDate,
    sourceUrl: result.sourceUrl,
    statusNote: result.isEligible ? 'Profile meets recorded criteria' : 'Does not match recorded criteria',
    ruleResults: result.auditTrail.map((item, idx) => ({
      ruleId: `rule_${idx}`,
      label: item.criterion,
      passed: item.passed,
      citation: scheme.sourceUrl,
      actualValue: item.actual,
      expectedValue: item.expected
    })),
    passCount: result.auditTrail.filter(a => a.passed).length,
    totalCount: result.auditTrail.length
  };
}
