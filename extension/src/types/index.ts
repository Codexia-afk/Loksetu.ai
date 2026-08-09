export interface RuleProvenance {
  ruleId: string;
  schemeId: string;
  sourceType: 'gazette' | 'official_portal_faq' | 'circular';
  sourceTitle: string;
  sourceReference: string;
  sourceUrl: string;
  lastVerifiedDate: string;
  ruleLogic: string;
}

export interface CitizenProfile {
  id: string;
  profileName: string;
  fullName?: string;
  age?: number;
  gender?: 'Male' | 'Female' | 'Other';
  state?: string;
  district?: string;
  annualIncome?: number;
  category?: 'Marginal' | 'Small' | 'Large' | 'General' | 'OBC' | 'SC' | 'ST' | 'Patta Holder' | 'Recorded Bargadar' | string;
  landHoldingHectares?: number;
  aadhaarNumber?: string;
  mobileNumber?: string;
  pincode?: string;
  villageWard?: string;
  blockTehsil?: string;
  natureOfOccupancy?: 'Owner' | 'Patta Holder' | 'Recorded Bargadar' | string;
  isInstitutionalLandholder?: boolean;
  updatedAt?: string;

  // Legacy nested format support
  personalDetails?: {
    full_name: string;
    dob: string;
    gender: 'Male' | 'Female' | 'Other';
    aadhaar_number: string;
    mobile_number: string;
  };
  addressDetails?: {
    state: string;
    district: string;
    block_tehsil: string;
    village_ward: string;
    pincode: string;
  };
  landAndIncome?: {
    farmer_category: 'Marginal' | 'Small' | 'Large';
    annual_income: number;
    nature_of_occupancy: 'Owner' | 'Patta Holder' | 'Recorded Bargadar';
    land_holding_scale: number;
    is_institutional_landholder: boolean;
  };
  documentEntries?: Record<string, any>;
}

export interface FormField {
  id: string;
  name: string;
  type: string;
  label: string;
  value: string;
  required: boolean;
  category: 'personal' | 'address' | 'income' | 'document' | 'unknown';
  explanation?: string;
  ariaLabel?: string;
  placeholder?: string;
  contextHint?: string;
  isVague?: boolean;
  isVisible?: boolean;
  isHidden?: boolean;
  isDisabled?: boolean;
  maxLength?: number | null;
  pattern?: string | null;
  frameOrigin?: string;
}

export interface ApplicationMapData {
  portalName: string;
  totalFields: number;
  fields: FormField[];
  completionPercentage: number;
  readinessScore: number;
}

export interface SchemeRuleCriterion {
  ruleId: string;
  minAge?: number;
  maxAge?: number;
  allowedGender?: string[];
  allowedStates?: string[];
  allowedCategories?: string[];
  maxIncomeCap?: number;
  minLandHoldingHectares?: number;
  disqualifyInstitutionalLandholders?: boolean;
  provenance: RuleProvenance;
}

export interface SchemeRule {
  schemeId: string;
  schemeName: string;
  state: string;
  department: string;
  lastVerified: string;
  sourceUrl: string;
  verificationStatus: 'human-verified' | 'ILLUSTRATIVE — VERIFY BEFORE JUDGING';
  rules: SchemeRuleCriterion[];
  criteria?: {
    minAge?: number;
    maxAge?: number;
    allowedGender?: string[];
    allowedStates?: string[];
    allowedCategories?: string[];
    maxIncomeCap?: number;
    minLandHoldingHectares?: number;
    disqualifyInstitutionalLandholders?: boolean;
  };
}

export interface AuditCriterion {
  ruleId: string;
  criterion: string;
  expected: string;
  actual: string;
  passed: boolean;
  provenance?: RuleProvenance;
}

export interface EligibilityResult {
  isEligible: boolean;
  confidence: number; // 1.0 deterministic
  auditTrail: AuditCriterion[];
  verifiedDate: string;
  sourceUrl: string;
  applyAnywayUrl: string;
}

export interface OCRAnomalyResult {
  documentType: string;
  extractedText: string;
  confidence: number;
  anomaliesFound: string[];
  isClean: boolean;
}

export interface ScopedExplainerPayload {
  fieldId: string;
  labelText: string;
  ariaLabel: string;
  inputType: string;
  placeholder: string;
  contextHint: string;
}

export interface EncryptedVaultContainer {
  version: '1.0';
  profileId: string;
  profileName: string;
  saltHex: string;
  ivHex: string;
  ciphertextHex: string;
  createdAt: string;
}

export interface AutofillItem {
  fieldId: string;
  value: string;
  sourceLabel: string;
  confidence: number;
  transformInstruction?: TransformedValueInstruction;
}

// Master Prompt v2 & v2.1 Types
export type TransformOp =
  | 'NONE'
  | 'EXTRACT_DAY'
  | 'EXTRACT_MONTH'
  | 'EXTRACT_YEAR'
  | 'SPLIT_DIGITS_GROUP'
  | 'ADDRESS_LINE'
  | 'UPPERCASE'
  | 'REMOVE_SPACES'
  | 'FORMAT_DDMMYYYY'
  | 'FORMAT_YYYYMMDD';

export interface TransformedValueInstruction {
  op: TransformOp;
  group?: number;
  totalGroups?: number;
  line?: number;
  params?: Record<string, any>;
}

export interface MappedFieldV2 {
  elementId: string;
  targetVaultKey: string;
  confidenceScore: number;
  matchingReason: string;
  requiresUserVerification: boolean;
  transformedValueInstruction: TransformedValueInstruction;
}

export interface UnmappedElementV2 {
  elementId: string;
  category: 'captcha_or_otp' | 'no_confident_match' | 'prompt_injection_suspected' | 'ambiguous_duplicate' | 'unsupported_field_type';
  reason: string;
}

export interface DocumentToUploadV2 {
  elementId: string;
  expectedDocument: string;
  acceptedFormats: string[];
}

export interface FormGuardsV2 {
  actionButtons: string[];
  hiddenOrSuspiciousElements: string[];
  crossOriginElements: string[];
  hasCaptcha: boolean;
  hasFileUploads: boolean;
}

export interface FieldMatchingResponseV2 {
  schemaVersion: '2.0';
  mappedFields: MappedFieldV2[];
  unmappedElements: UnmappedElementV2[];
  documentsToUpload: DocumentToUploadV2[];
  formGuards: FormGuardsV2;
}

export interface FormNodeV2 {
  elementId: string;
  tagName: string;
  inputType: string;
  nameAttr: string;
  idAttr: string;
  labelText: string;
  placeholderText: string;
  ariaLabel: string;
  sectionContext: string;
  options?: { value: string; label: string }[];
  isVisible?: boolean;
  isHidden?: boolean;
  isDisabled?: boolean;
  isRequired?: boolean;
  maxLength?: number | null;
  pattern?: string | null;
  frameOrigin?: string;
}

// Legacy Type Aliases for Backward Compatibility
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

export interface ExplainerResponse {
  field_id: string;
  plain_language_explanation: string;
  example_input: string;
  guidance_tips: string[];
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
