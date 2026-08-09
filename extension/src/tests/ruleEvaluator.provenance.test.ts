import { describe, it, expect } from 'vitest';
import wbScheme from '../../data/schemes/wb_krishak_bandhu.json';
import pmKisanScheme from '../../data/schemes/pm_kisan.json';
import mpLadliScheme from '../../data/schemes/mp_ladli_behna.json';
import { evaluateEligibility } from '../engine/deterministicRules';
import { CitizenProfile, SchemeRule } from '../types';

describe('Gap 1: Gazette Rule Provenance & Citation Verification Suite', () => {
  const schemes: SchemeRule[] = [
    wbScheme as SchemeRule,
    pmKisanScheme as SchemeRule,
    mpLadliScheme as SchemeRule
  ];

  it('1. All shipped scheme JSON specifications must contain complete rules with provenance', () => {
    for (const scheme of schemes) {
      expect(scheme.rules).toBeDefined();
      expect(scheme.rules.length).toBeGreaterThan(0);

      for (const rule of scheme.rules) {
        expect(rule.provenance).toBeDefined();
        expect(rule.provenance.ruleId).toBeTruthy();
        expect(rule.provenance.schemeId).toBe(scheme.schemeId);
        expect(rule.provenance.sourceType).toMatch(/gazette|official_portal_faq|circular/);
        expect(rule.provenance.sourceTitle).toBeTruthy();
        expect(rule.provenance.sourceReference).toBeTruthy();
        expect(rule.provenance.sourceUrl).toMatch(/^https:\/\//);
        expect(rule.provenance.lastVerifiedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(rule.provenance.ruleLogic).toBeTruthy();
      }
    }
  });

  it('2. evaluateEligibility must attach complete Gazette provenance metadata to every audit trail item', () => {
    const testProfile: CitizenProfile = {
      id: 'test_citizen_001',
      profileName: 'Test Citizen',
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

    const result = evaluateEligibility(testProfile, wbScheme as SchemeRule);

    expect(result.auditTrail.length).toBeGreaterThan(0);
    for (const item of result.auditTrail) {
      expect(item.provenance).toBeDefined();
      expect(item.provenance?.sourceTitle).toBeTruthy();
      expect(item.provenance?.sourceReference).toBeTruthy();
      expect(item.provenance?.sourceUrl).toMatch(/^https:\/\//);
    }
  });
});
