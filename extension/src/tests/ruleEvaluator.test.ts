import { describe, it, expect } from 'vitest';
import { CitizenProfile } from '../types';
import { evaluateEligibility } from '../services/ruleEvaluator';

describe('Fix #3 & Constraint 4: Deterministic Scheme Rule Evaluator', () => {
  const schemeData = {
    id: 'wb-krishak-bandhu',
    name: 'West Bengal Krishak Bandhu (Assured Income)',
    state: 'West Bengal',
    department: 'Dept of Agriculture',
    last_verified: '2026-08-01',
    source_url: 'https://matirkatha.wb.gov.in/krishakbandhu',
    rules: [
      {
        id: 'residence_rule',
        field: 'state',
        operator: 'equals',
        target: 'West Bengal',
        label: 'Resident of West Bengal',
        citation: 'Clause 3.1'
      },
      {
        id: 'age_rule',
        field: 'age',
        operator: 'range',
        target: [18, 60],
        label: 'Age 18-60',
        citation: 'Clause 4.2'
      },
      {
        id: 'land_rule',
        field: 'land_holding_acres',
        operator: 'greater_than',
        target: 0.0,
        label: 'Land holding > 0',
        citation: 'Clause 5.1'
      }
    ]
  };

  const passingProfile: CitizenProfile = {
    id: 'p1',
    profileName: 'Passing Profile',
    updatedAt: '',
    personalDetails: { full_name: 'A', dob: '1995-01-01', gender: 'Male', aadhaar_number: '1', mobile_number: '1' },
    addressDetails: { state: 'West Bengal', district: 'Purba Bardhaman', block_tehsil: 'M', village_ward: 'R', pincode: '700000' },
    landAndIncome: { farmer_category: 'Small', annual_income: 100000, nature_of_occupancy: 'Owner', land_holding_scale: 1.2, is_institutional_landholder: false },
    documentEntries: {}
  };

  const failingProfile: CitizenProfile = {
    id: 'p2',
    profileName: 'Failing Profile',
    updatedAt: '',
    personalDetails: { full_name: 'B', dob: '1950-01-01', gender: 'Male', aadhaar_number: '2', mobile_number: '2' }, // Age 76 > 60
    addressDetails: { state: 'Bihar', district: 'Patna', block_tehsil: 'P', village_ward: 'P', pincode: '800000' }, // Non WB
    landAndIncome: { farmer_category: 'Small', annual_income: 100000, nature_of_occupancy: 'Owner', land_holding_scale: 0.0, is_institutional_landholder: false },
    documentEntries: {}
  };

  it('should correctly mark a fully compliant profile as ELIGIBLE', () => {
    const report = evaluateEligibility(schemeData, passingProfile);
    expect(report.status).toBe('ELIGIBLE');
    expect(report.passCount).toBe(3);
    expect(report.totalCount).toBe(3);
    expect(report.lastVerified).toBe('2026-08-01');
    expect(report.sourceUrl).toBe('https://matirkatha.wb.gov.in/krishakbandhu');
  });

  it('should correctly identify mismatches for a non-matching profile without hard-blocking', () => {
    const report = evaluateEligibility(schemeData, failingProfile);
    expect(report.status).toBe('INELIGIBLE');
    expect(report.passCount).toBe(0);
    expect(report.ruleResults.every(r => !r.passed)).toBe(true);
  });
});
