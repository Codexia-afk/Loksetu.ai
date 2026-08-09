import { CitizenProfile, SchemeRule, EligibilityResult, AuditCriterion, RuleProvenance } from '../types';

function findProvenance(scheme: SchemeRule, ruleIdKey: string): RuleProvenance | undefined {
  if (!scheme.rules) return undefined;
  const match = scheme.rules.find(r => r.ruleId.includes(ruleIdKey) || r.provenance?.ruleId.includes(ruleIdKey));
  return match?.provenance;
}

export function evaluateEligibility(profile: CitizenProfile, scheme: SchemeRule): EligibilityResult {
  const auditTrail: AuditCriterion[] = [];
  let isEligible = true;

  const criteria = scheme.criteria || {};

  const age = profile.age ?? (profile.personalDetails?.dob ? new Date().getFullYear() - new Date(profile.personalDetails.dob).getFullYear() : 35);
  const gender = profile.gender ?? profile.personalDetails?.gender ?? 'Male';
  const state = profile.state ?? profile.addressDetails?.state ?? 'West Bengal';
  const annualIncome = profile.annualIncome ?? profile.landAndIncome?.annual_income ?? 100000;
  const landHoldingHectares = profile.landHoldingHectares ?? profile.landAndIncome?.land_holding_scale ?? 1.0;
  const category = profile.category ?? profile.landAndIncome?.farmer_category ?? 'Small';
  const natureOfOccupancy = profile.natureOfOccupancy ?? profile.landAndIncome?.nature_of_occupancy;
  const isInstitutionalLandholder = profile.isInstitutionalLandholder ?? profile.landAndIncome?.is_institutional_landholder ?? false;

  // 1. Age Rule
  if (criteria.minAge !== undefined || criteria.maxAge !== undefined) {
    const minAge = criteria.minAge ?? 0;
    const maxAge = criteria.maxAge ?? 120;
    const agePassed = age >= minAge && age <= maxAge;
    if (!agePassed) isEligible = false;
    auditTrail.push({
      ruleId: `${scheme.schemeId}_age`,
      criterion: `Age Requirement (${minAge}–${maxAge} years)`,
      expected: `${minAge}–${maxAge} years`,
      actual: `${age} years`,
      passed: agePassed,
      provenance: findProvenance(scheme, 'age')
    });
  }

  // 2. Gender Rule
  if (criteria.allowedGender && criteria.allowedGender.length > 0) {
    const genderPassed = criteria.allowedGender.includes(gender);
    if (!genderPassed) isEligible = false;
    auditTrail.push({
      ruleId: `${scheme.schemeId}_gender`,
      criterion: `Gender Requirement (${criteria.allowedGender.join(', ')})`,
      expected: criteria.allowedGender.join(', '),
      actual: gender,
      passed: genderPassed,
      provenance: findProvenance(scheme, 'gender')
    });
  }

  // 3. State Domicile Rule
  if (criteria.allowedStates && criteria.allowedStates.length > 0 && !criteria.allowedStates.includes('ALL')) {
    const statePassed = criteria.allowedStates.includes(state);
    if (!statePassed) isEligible = false;
    auditTrail.push({
      ruleId: `${scheme.schemeId}_state`,
      criterion: `State Domicile (${criteria.allowedStates.join(', ')})`,
      expected: criteria.allowedStates.join(', '),
      actual: state,
      passed: statePassed,
      provenance: findProvenance(scheme, 'state')
    });
  }

  // 4. Annual Income Cap
  if (criteria.maxIncomeCap !== undefined) {
    const incomePassed = annualIncome <= criteria.maxIncomeCap;
    if (!incomePassed) isEligible = false;
    auditTrail.push({
      ruleId: `${scheme.schemeId}_income`,
      criterion: `Annual Income Ceiling (₹${criteria.maxIncomeCap.toLocaleString('en-IN')})`,
      expected: `≤ ₹${criteria.maxIncomeCap.toLocaleString('en-IN')}`,
      actual: `₹${annualIncome.toLocaleString('en-IN')}`,
      passed: incomePassed,
      provenance: findProvenance(scheme, 'income')
    });
  }

  // 5. Land Holding Scale Rule
  if (criteria.minLandHoldingHectares !== undefined) {
    const landPassed = landHoldingHectares >= criteria.minLandHoldingHectares;
    if (!landPassed) isEligible = false;
    auditTrail.push({
      ruleId: `${scheme.schemeId}_land`,
      criterion: `Minimum Land Holding (${criteria.minLandHoldingHectares} Ha)`,
      expected: `≥ ${criteria.minLandHoldingHectares} Ha`,
      actual: `${landHoldingHectares} Ha`,
      passed: landPassed,
      provenance: findProvenance(scheme, 'land')
    });
  }

  // 6. Category / Farmer Class Rule
  if (criteria.allowedCategories && criteria.allowedCategories.length > 0) {
    const categoryPassed = criteria.allowedCategories.includes(category) ||
                           (natureOfOccupancy ? criteria.allowedCategories.includes(natureOfOccupancy) : false);
    if (!categoryPassed) isEligible = false;
    auditTrail.push({
      ruleId: `${scheme.schemeId}_category`,
      criterion: `Farmer / Occupancy Category`,
      expected: criteria.allowedCategories.join(' / '),
      actual: category + (natureOfOccupancy ? ` (${natureOfOccupancy})` : ''),
      passed: categoryPassed,
      provenance: findProvenance(scheme, 'category')
    });
  }

  // 7. Institutional Landholder Rule
  if (criteria.disqualifyInstitutionalLandholders) {
    const instPassed: boolean = !isInstitutionalLandholder;
    if (!instPassed) isEligible = false;
    auditTrail.push({
      ruleId: `${scheme.schemeId}_non_inst`,
      criterion: `Non-Institutional Landholder`,
      expected: `Individual Farmer (Non-Institutional)`,
      actual: isInstitutionalLandholder ? 'Institutional Landholder' : 'Individual Farmer',
      passed: instPassed,
      provenance: findProvenance(scheme, 'non_inst')
    });
  }

  return {
    isEligible,
    confidence: 1.0, // 100% deterministic rule-based evaluation
    auditTrail,
    verifiedDate: scheme.lastVerified,
    sourceUrl: scheme.sourceUrl,
    applyAnywayUrl: scheme.sourceUrl // ALWAYS populated regardless of eligibility status
  };
}
