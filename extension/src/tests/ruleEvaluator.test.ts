import { describe, it, expect } from 'vitest';
import { CitizenProfile, SchemeRule } from '../types';
import { evaluateEligibility } from '../engine/deterministicRules';

describe('Deterministic Scheme Rule Evaluator', () => {
  const mockSchemeRule: SchemeRule = {
    schemeId: 'wb_krishak_bandhu',
    schemeName: 'WB Krishak Bandhu',
    state: 'West Bengal',
    department: 'Department of Agriculture',
    lastVerified: '2026-08-01',
    sourceUrl: 'https://matirkatha.wb.gov.in/krishakbandhu',
    verificationStatus: 'human-verified',
    criteria: {
      minAge: 18,
      maxAge: 60,
      allowedStates: ['West Bengal'],
      maxIncomeCap: 300000,
      minLandHoldingHectares: 0.01,
      disqualifyInstitutionalLandholders: true
    }
  };

  const passingProfile: CitizenProfile = {
    id: 'p1',
    profileName: 'Passing Profile',
    fullName: 'Ramesh Das',
    age: 40,
    gender: 'Male',
    state: 'West Bengal',
    district: 'Purba Bardhaman',
    annualIncome: 120000,
    category: 'Small',
    landHoldingHectares: 1.25,
    natureOfOccupancy: 'Owner',
    isInstitutionalLandholder: false
  };

  const failingProfile: CitizenProfile = {
    id: 'p2',
    profileName: 'Failing Profile',
    fullName: 'Suresh Patnaik',
    age: 76, // Age 76 > 60
    gender: 'Male',
    state: 'Bihar', // Non-WB
    district: 'Patna',
    annualIncome: 400000, // Income > 300000
    category: 'Small',
    landHoldingHectares: 0.0,
    isInstitutionalLandholder: false
  };

  it('should correctly mark a fully compliant profile as ELIGIBLE', () => {
    const report = evaluateEligibility(passingProfile, mockSchemeRule);
    expect(report.isEligible).toBe(true);
    expect(report.confidence).toBe(1.0);
    expect(report.auditTrail.every(a => a.passed)).toBe(true);
    expect(report.verifiedDate).toBe('2026-08-01');
    expect(report.sourceUrl).toBe('https://matirkatha.wb.gov.in/krishakbandhu');
    expect(report.applyAnywayUrl).toBe('https://matirkatha.wb.gov.in/krishakbandhu');
  });

  it('should correctly identify mismatches for a non-matching profile without hard-blocking', () => {
    const report = evaluateEligibility(failingProfile, mockSchemeRule);
    expect(report.isEligible).toBe(false);
    expect(report.confidence).toBe(1.0);
    expect(report.applyAnywayUrl).toBeDefined(); // Always populated
    expect(report.auditTrail.some(a => !a.passed)).toBe(true);
  });
});
