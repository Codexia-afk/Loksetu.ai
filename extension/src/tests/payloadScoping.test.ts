import { describe, it, expect } from 'vitest';

describe('Fix #6 & Constraint 3: Scoped LLM DTO Payload Boundary Audit', () => {
  it('should structurally exclude user values, vault entries, and sibling input data', () => {
    const mockDOMElementContext = {
      fieldId: 'nature_of_occupancy',
      labelText: 'Nature of Occupancy',
      ariaLabel: 'Select land occupancy mode',
      inputType: 'select-one',
      placeholder: 'Select title',
      contextHint: 'Land & Income Details',
      // Neighboring filled values in DOM
      userInputValue: 'Owner',
      siblingAadhaarValue: '987654321098',
      vaultSecretKey: 'SECRET_VAULT_PAYLOAD'
    };

    // Construct scoped DTO payload
    const scopedDTO = {
      field_id: mockDOMElementContext.fieldId,
      label_text: mockDOMElementContext.labelText,
      aria_label: mockDOMElementContext.ariaLabel || null,
      input_type: mockDOMElementContext.inputType || 'text',
      placeholder: mockDOMElementContext.placeholder || null,
      context_hint: mockDOMElementContext.contextHint || null
    };

    // Assert strict keys only
    const keys = Object.keys(scopedDTO);
    expect(keys).toEqual([
      'field_id',
      'label_text',
      'aria_label',
      'input_type',
      'placeholder',
      'context_hint'
    ]);

    // Assert zero value leaking
    const payloadStr = JSON.stringify(scopedDTO);
    expect(payloadStr).not.toContain('987654321098');
    expect(payloadStr).not.toContain('SECRET_VAULT_PAYLOAD');
    expect(payloadStr).not.toContain('userInputValue');
  });
});
