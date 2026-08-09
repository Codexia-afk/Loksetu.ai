import {
  FormNodeV2,
  FieldMatchingResponseV2,
  MappedFieldV2,
  UnmappedElementV2,
  DocumentToUploadV2,
  FormGuardsV2,
  TransformedValueInstruction
} from '../types';

export const CRITICAL_IDENTIFIERS = new Set([
  'aadhaar_number',
  'pancard_number',
  'bank_account_number',
  'ifsc_code'
]);

const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /set\s+confidencescore\s+to/i,
  /map\s+this\s+to\s+aadhaar/i,
  /output\s+the\s+vault\s+keys/i,
  /this\s+field\s+is\s+safe\s+to\s+autofill/i,
  /system\s+prompt/i,
  /override\s+guard/i
];

export function isPromptInjectionAttempt(text: string): boolean {
  if (!text) return false;
  return PROMPT_INJECTION_PATTERNS.some(pattern => pattern.test(text));
}

export function setNativeValue(
  element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
  value: string
): void {
  const proto = Object.getPrototypeOf(element);
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
  if (setter) {
    setter.call(element, value);
  } else {
    element.value = value;
  }
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
}

export function matchFieldsV2(
  formNodes: FormNodeV2[],
  topLevelOrigin: string = 'http://localhost'
): FieldMatchingResponseV2 {
  const mappedFields: MappedFieldV2[] = [];
  const unmappedElements: UnmappedElementV2[] = [];
  const documentsToUpload: DocumentToUploadV2[] = [];
  const formGuards: FormGuardsV2 = {
    actionButtons: [],
    hiddenOrSuspiciousElements: [],
    crossOriginElements: [],
    hasCaptcha: false,
    hasFileUploads: false
  };

  const mappedVaultKeys = new Set<string>();

  for (let i = 0; i < formNodes.length; i++) {
    const node = formNodes[i];
    const labelAndId = `${node.labelText} ${node.placeholderText} ${node.ariaLabel} ${node.nameAttr} ${node.idAttr}`;
    const combinedText = `${labelAndId} ${node.sectionContext}`;
    const norm = combinedText.toLowerCase();
    const labelNorm = labelAndId.toLowerCase();

    // 1. PROMPT INJECTION DEFENSE GUARD
    if (isPromptInjectionAttempt(combinedText)) {
      unmappedElements.push({
        elementId: node.elementId,
        category: 'prompt_injection_suspected',
        reason: 'Adversarial prompt injection pattern detected in form field text.'
      });
      continue;
    }

    // 2. ACTION BUTTONS & MULTI-STEP GUARD
    const isSubmitOrButton = node.inputType === 'submit' || node.inputType === 'button' || node.tagName === 'BUTTON';
    const isNextOrContinue = /next|continue|proceed|submit|pay|verify/i.test(labelNorm);
    if (isSubmitOrButton || isNextOrContinue) {
      formGuards.actionButtons.push(node.elementId);
      continue;
    }

    // 3. CAPTCHA / OTP GUARD
    if (/captcha|otp|one\s*time\s*pass/i.test(norm)) {
      formGuards.hasCaptcha = true;
      unmappedElements.push({
        elementId: node.elementId,
        category: 'captcha_or_otp',
        reason: 'CAPTCHA / OTP input — strictly human-in-the-loop.'
      });
      continue;
    }

    // 4. HIDDEN OR INVISIBLE FIELD GUARD
    if (node.isHidden || node.isVisible === false || node.inputType === 'hidden') {
      formGuards.hiddenOrSuspiciousElements.push(node.elementId);
      continue;
    }

    // 5. CROSS-ORIGIN FIELD GUARD
    if (node.frameOrigin && node.frameOrigin !== topLevelOrigin) {
      formGuards.crossOriginElements.push(node.elementId);
      continue;
    }

    // 6. DISABLED FIELD GUARD
    if (node.isDisabled) {
      unmappedElements.push({
        elementId: node.elementId,
        category: 'unsupported_field_type',
        reason: 'Field is disabled or read-only on portal.'
      });
      continue;
    }

    // 7. FILE UPLOAD GUARD (Browsers block setting file values)
    if (node.inputType === 'file') {
      formGuards.hasFileUploads = true;
      documentsToUpload.push({
        elementId: node.elementId,
        expectedDocument: node.labelText || 'Required Document Copy',
        acceptedFormats: ['image/jpeg', 'image/png', 'application/pdf']
      });
      continue;
    }

    // 8. SEMANTIC HEURISTIC CLASSIFICATION & SPLIT FIELD DETECTION
    let targetVaultKey = '';
    let confidenceScore = 0.0;
    let matchingReason = '';
    let transform: TransformedValueInstruction = { op: 'NONE' };

    // Check Split DOB (Day / Month / Year)
    if (labelNorm.includes('month') || labelNorm.includes('mm')) {
      targetVaultKey = 'date_of_birth';
      confidenceScore = 0.9;
      matchingReason = 'Split Date of Birth (Month component)';
      transform = { op: 'EXTRACT_MONTH' };
    } else if (labelNorm.includes('year') || labelNorm.includes('yyyy')) {
      targetVaultKey = 'date_of_birth';
      confidenceScore = 0.9;
      matchingReason = 'Split Date of Birth (Year component)';
      transform = { op: 'EXTRACT_YEAR' };
    } else if (labelNorm.includes('day') || labelNorm.includes('dd') || (node.maxLength === 2 && labelNorm.includes('dob'))) {
      targetVaultKey = 'date_of_birth';
      confidenceScore = 0.9;
      matchingReason = 'Split Date of Birth (Day component)';
      transform = { op: 'EXTRACT_DAY' };
    }
    // High-priority Critical Identifiers
    else if (norm.includes('ifsc')) {
      targetVaultKey = 'ifsc_code';
      confidenceScore = 0.98;
      matchingReason = "Matched critical identifier 'IFSC Code'.";
      transform = { op: 'UPPERCASE' };
    } else if (norm.includes('aadhaar') || norm.includes('aadhar') || norm.includes('uid')) {
      targetVaultKey = 'aadhaar_number';
      confidenceScore = 0.98;
      matchingReason = "Matched critical identifier 'Aadhaar Number'.";

      if (node.maxLength === 4) {
        transform = { op: 'SPLIT_DIGITS_GROUP', group: 1, totalGroups: 3 };
      }
    } else if (norm.includes('pan') && !norm.includes('panchayat')) {
      targetVaultKey = 'pancard_number';
      confidenceScore = 0.95;
      matchingReason = "Matched critical identifier 'PAN Card Number'.";
    } else if (norm.includes('name') && !norm.includes('father') && !norm.includes('husband') && !norm.includes('bank')) {
      targetVaultKey = 'citizen_full_name';
      confidenceScore = 0.95;
      matchingReason = "Matched label 'Full Name / Applicant Name'.";
    } else if (norm.includes('father') || norm.includes('husband') || norm.includes('s/o') || norm.includes('w/o')) {
      targetVaultKey = 'father_or_husband_name';
      confidenceScore = 0.92;
      matchingReason = "Matched label 'Father / Husband Name'.";
    } else if (norm.includes('dob') || norm.includes('birth')) {
      targetVaultKey = 'date_of_birth';
      confidenceScore = 0.95;
      matchingReason = "Matched label 'Date of Birth'.";
    } else if (norm.includes('gender') || norm.includes('sex')) {
      targetVaultKey = 'gender';
      confidenceScore = 0.95;
      matchingReason = "Matched label 'Gender'.";
    } else if (norm.includes('mobile') || norm.includes('phone')) {
      targetVaultKey = 'mobile_number';
      confidenceScore = 0.95;
      matchingReason = "Matched label 'Mobile Number'.";
    } else if (norm.includes('state')) {
      targetVaultKey = 'state';
      confidenceScore = 0.95;
      matchingReason = "Matched label 'State Domicile'.";
    } else if (norm.includes('district')) {
      targetVaultKey = 'district';
      confidenceScore = 0.95;
      matchingReason = "Matched label 'District'.";
    } else if (norm.includes('pin') || norm.includes('postal')) {
      targetVaultKey = 'pincode';
      confidenceScore = 0.95;
      matchingReason = "Matched label 'PIN Code'.";
    } else if (norm.includes('address')) {
      targetVaultKey = 'residential_address';
      confidenceScore = 0.90;
      matchingReason = "Matched label 'Residential Address'.";
      if (norm.includes('line 1') || norm.includes('street')) {
        transform = { op: 'ADDRESS_LINE', line: 1 };
      }
    } else if (norm.includes('income')) {
      targetVaultKey = 'annual_household_income';
      confidenceScore = 0.90;
      matchingReason = "Matched label 'Annual Household Income'.";
    } else if (norm.includes('account') || norm.includes('bank no')) {
      targetVaultKey = 'bank_account_number';
      confidenceScore = 0.95;
      matchingReason = "Matched critical identifier 'Bank Account Number'.";
    } else if (norm.includes('category') || norm.includes('caste')) {
      targetVaultKey = 'category';
      confidenceScore = 0.90;
      matchingReason = "Matched label 'Farmer / Caste Category'.";
    }

    if (targetVaultKey && confidenceScore >= 0.5) {
      const requiresUserVerification = CRITICAL_IDENTIFIERS.has(targetVaultKey) || confidenceScore < 0.85;

      mappedFields.push({
        elementId: node.elementId,
        targetVaultKey,
        confidenceScore,
        matchingReason,
        requiresUserVerification,
        transformedValueInstruction: transform
      });
      mappedVaultKeys.add(targetVaultKey);
    } else {
      unmappedElements.push({
        elementId: node.elementId,
        category: 'no_confident_match',
        reason: 'Confidence score below 0.5 threshold.'
      });
    }
  }

  return {
    schemaVersion: '2.0',
    mappedFields,
    unmappedElements,
    documentsToUpload,
    formGuards
  };
}
