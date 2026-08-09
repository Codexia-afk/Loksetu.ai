import { describe, it, expect } from 'vitest';
import { screenAllSchemes } from '../engine/multiSchemeScreener';
import { CitizenProfile } from '../types';

describe('Gap 3: Multi-Scheme Screener & Matrix Verification Suite', () => {
  it('1. Correctly screens a multi-scheme eligible farmer profile (WB Krishak + PM-KISAN)', () => {
    const eligibleProfile: CitizenProfile = {
      id: 'citizen_farmer',
      profileName: 'Ramprasad Sen',
      fullName: 'Ramprasad Sen',
      age: 42,
      gender: 'Male',
      state: 'West Bengal',
      annualIncome: 120000,
      landHoldingHectares: 0.85,
      category: 'Small',
      natureOfOccupancy: 'Recorded Bargadar',
      isInstitutionalLandholder: false
    };

    const results = screenAllSchemes(eligibleProfile);

    expect(results).toHaveLength(3);
    const wbRes = results.find(r => r.schemeId === 'wb_krishak_bandhu');
    const pmkRes = results.find(r => r.schemeId === 'pm_kisan');

    expect(wbRes?.status).toBe('eligible');
    expect(pmkRes?.status).toBe('eligible');
    expect(wbRes?.failedRules).toHaveLength(0);
  });

  it('2. Correctly flags non-qualifying scheme rules with complete Gazette provenance citations', () => {
    const maleFarmerProfile: CitizenProfile = {
      id: 'citizen_male',
      profileName: 'Male Farmer',
      fullName: 'Suresh Kumar',
      age: 40,
      gender: 'Male',
      state: 'Madhya Pradesh',
      annualIncome: 100000,
      landHoldingHectares: 0.5,
      category: 'Small',
      isInstitutionalLandholder: false
    };

    const results = screenAllSchemes(maleFarmerProfile);

    const ladliRes = results.find(r => r.schemeId === 'mp_ladli_behna');
    expect(ladliRes?.status).toMatch(/ineligible|partial/);
    expect(ladliRes?.failedRules.length).toBeGreaterThan(0);
    expect(ladliRes?.failedRules[0].sourceReference).toBeTruthy();
    expect(ladliRes?.failedRules[0].ruleLogic).toBeTruthy();
  });

  it('3. Ranks eligible schemes at top of matrix results', () => {
    const profile: CitizenProfile = {
      id: 'citizen_mixed',
      profileName: 'Mixed Profile',
      age: 34,
      gender: 'Female',
      state: 'Madhya Pradesh',
      annualIncome: 85000,
      landHoldingHectares: 0.2,
      category: 'Marginal',
      isInstitutionalLandholder: false
    };

    const results = screenAllSchemes(profile);

    expect(results[0].status).toBe('eligible');
  });
});
