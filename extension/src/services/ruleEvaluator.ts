import { CitizenProfile, SchemeEligibilityReport, RuleEvaluationResult } from '../types';

export function calculateAge(dobString: string): number {
  if (!dobString) return 0;
  const dob = new Date(dobString);
  const diff = Date.now() - dob.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

export function evaluateEligibility(
  schemeData: any,
  profile: CitizenProfile
): SchemeEligibilityReport {
  const age = calculateAge(profile.personalDetails.dob);
  const ruleResults: RuleEvaluationResult[] = [];

  const rules = schemeData.rules || [];
  let passCount = 0;

  for (const rule of rules) {
    let actualValue: any = null;
    let passed = false;

    // Resolve actual value from profile
    if (rule.field === 'state') {
      actualValue = profile.addressDetails.state;
    } else if (rule.field === 'age') {
      actualValue = age;
    } else if (rule.field === 'land_holding_acres') {
      actualValue = profile.landAndIncome.land_holding_scale;
    } else if (rule.field === 'nature_of_occupancy') {
      actualValue = profile.landAndIncome.nature_of_occupancy;
    } else if (rule.field === 'is_institutional_landholder') {
      actualValue = profile.landAndIncome.is_institutional_landholder;
    } else if (rule.field === 'gender') {
      actualValue = profile.personalDetails.gender;
    } else if (rule.field === 'annual_income_inr') {
      actualValue = profile.landAndIncome.annual_income;
    }

    // Evaluate Operator
    if (rule.operator === 'equals') {
      passed = actualValue === rule.target;
    } else if (rule.operator === 'greater_than') {
      passed = Number(actualValue) > Number(rule.target);
    } else if (rule.operator === 'greater_than_or_equal') {
      passed = Number(actualValue) >= Number(rule.target);
    } else if (rule.operator === 'less_than_or_equal') {
      passed = Number(actualValue) <= Number(rule.target);
    } else if (rule.operator === 'range') {
      const [min, max] = rule.target;
      passed = Number(actualValue) >= min && Number(actualValue) <= max;
    } else if (rule.operator === 'in') {
      passed = Array.isArray(rule.target) && rule.target.includes(actualValue);
    }

    if (passed) passCount++;

    ruleResults.push({
      ruleId: rule.id,
      label: rule.label,
      passed,
      citation: rule.citation,
      actualValue,
      expectedValue: rule.target
    });
  }

  const totalCount = rules.length;
  let status: 'ELIGIBLE' | 'INELIGIBLE' | 'PARTIAL' = 'ELIGIBLE';

  if (passCount === totalCount) {
    status = 'ELIGIBLE';
  } else if (passCount === 0) {
    status = 'INELIGIBLE';
  } else {
    status = 'PARTIAL';
  }

  return {
    schemeId: schemeData.id,
    schemeName: schemeData.name,
    state: schemeData.state,
    department: schemeData.department,
    status,
    lastVerified: schemeData.last_verified,
    sourceUrl: schemeData.source_url,
    statusNote: schemeData.status_note,
    ruleResults,
    passCount,
    totalCount
  };
}
