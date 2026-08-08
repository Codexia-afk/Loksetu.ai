export interface CitizenProfile {
  id: string;
  profileName: string;
  updatedAt: string;
  personalDetails: {
    full_name: string;
    dob: string;
    gender: 'Male' | 'Female' | 'Other';
    aadhaar_number: string;
    mobile_number: string;
  };
  addressDetails: {
    state: string;
    district: string;
    block_tehsil: string;
    village_ward: string;
    pincode: string;
  };
  landAndIncome: {
    farmer_category: 'Marginal' | 'Small' | 'Large';
    annual_income: number;
    nature_of_occupancy: 'Owner' | 'Patta Holder' | 'Recorded Bargadar';
    land_holding_scale: number; // in Acres
    is_institutional_landholder: boolean;
  };
  documentEntries: {
    aadhaar_doc?: { fileName: string; issueDate?: string; confidence?: number };
    land_doc?: { fileName: string; documentNumber?: string; confidence?: number };
    bank_doc?: { fileName: string; accountNumber?: string; confidence?: number };
  };
}

export interface ScopedExplainerPayload {
  field_id: string;
  label_text: string;
  aria_label?: string;
  input_type?: string;
  placeholder?: string;
  context_hint?: string; // Strictly extracted from parent <legend> or section heading text ONLY
}

export interface ExplainerResponse {
  field_id: string;
  plain_language_explanation: string;
  example_input: string;
  guidance_tips: string[];
}

export interface FieldMapEntry {
  fieldId: string;
  section: 'personal' | 'address' | 'land_income' | 'documents';
  labelText: string;
  ariaLabel?: string;
  inputType: string;
  placeholder?: string;
  isVague: boolean;
  currentValue: string;
  contextHint?: string;
}

export interface RuleEvaluationResult {
  ruleId: string;
  label: string;
  passed: boolean;
  citation: string;
  actualValue: any;
  expectedValue: any;
}

export interface SchemeEligibilityReport {
  schemeId: string;
  schemeName: string;
  state: string;
  department: string;
  status: 'ELIGIBLE' | 'INELIGIBLE' | 'PARTIAL';
  lastVerified: string;
  sourceUrl: string;
  statusNote?: string;
  ruleResults: RuleEvaluationResult[];
  passCount: number;
  totalCount: number;
}

export interface AutofillItem {
  fieldId: string;
  value: string;
  sourceLabel: string;
  confidence: number;
}

export interface OCRResult {
  extractedText: string;
  confidence: number;
  documentType: string;
  issueDate?: string;
  certificateNumber?: string;
  nameFound?: string;
  isFlaggedForManualReview: boolean;
}
