import { FieldMapEntry } from '../types';

export function findAssociatedLabel(inputEl: HTMLElement): string {
  // 1. Check for label[for=id]
  if (inputEl.id) {
    const labelEl = document.querySelector(`label[for="${inputEl.id}"]`);
    if (labelEl && labelEl.textContent) {
      return labelEl.textContent.trim().replace(/\*|\(Disambiguation Target\)/g, '').trim();
    }
  }

  // 2. Check parent label
  const parentLabel = inputEl.closest('label');
  if (parentLabel && parentLabel.textContent) {
    return parentLabel.textContent.trim().replace(/\*|\(Disambiguation Target\)/g, '').trim();
  }

  // 3. Check aria-label
  const ariaLabel = inputEl.getAttribute('aria-label');
  if (ariaLabel) return ariaLabel.trim();

  // 4. Placeholder fallback
  const placeholder = inputEl.getAttribute('placeholder');
  if (placeholder) return placeholder.trim();

  return inputEl.getAttribute('name') || inputEl.id || 'Unlabeled Input';
}

export function findContextHint(inputEl: HTMLElement): string {
  // Fix 6: contextHint MUST be extracted strictly from parent <legend> or section heading text ONLY
  const sectionEl = inputEl.closest('.form-section, fieldset, section');
  if (sectionEl) {
    const heading = sectionEl.querySelector('h2, h3, h4, legend, .section-title');
    if (heading && heading.textContent) {
      return heading.textContent.trim();
    }
  }
  return 'General Application Section';
}

export function scanApplicationForm(): FieldMapEntry[] {
  const form = document.querySelector('form') || document.body;
  const inputs = form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
    'input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea'
  );

  const fieldEntries: FieldMapEntry[] = [];

  inputs.forEach((el) => {
    const fieldId = el.id || el.getAttribute('name') || `field_${Math.random().toString(36).substring(2, 7)}`;
    const labelText = findAssociatedLabel(el);
    const ariaLabel = el.getAttribute('aria-label') || undefined;
    const inputType = el.tagName.toLowerCase() === 'select' ? 'select-one' : (el.getAttribute('type') || 'text');
    const placeholder = el.getAttribute('placeholder') || undefined;
    const contextHint = findContextHint(el);
    const currentValue = el.value || '';

    // Classify Section
    let section: 'personal' | 'address' | 'land_income' | 'documents' = 'personal';
    const sectionContainer = el.closest('[data-section]');
    if (sectionContainer) {
      const secAttr = sectionContainer.getAttribute('data-section');
      if (secAttr === 'address') section = 'address';
      else if (secAttr === 'land_income') section = 'land_income';
      else if (secAttr === 'documents') section = 'documents';
    } else {
      const idLower = fieldId.toLowerCase();
      if (idLower.includes('district') || idLower.includes('state') || idLower.includes('pin') || idLower.includes('village')) {
        section = 'address';
      } else if (idLower.includes('land') || idLower.includes('income') || idLower.includes('occupancy') || idLower.includes('category')) {
        section = 'land_income';
      } else if (inputType === 'file' || idLower.includes('doc')) {
        section = 'documents';
      }
    }

    // Detect vague fields requiring LLM disambiguation
    const isVague = fieldId.includes('occupancy') || fieldId.includes('land_holding_scale') || labelText.toLowerCase().includes('occupancy');

    fieldEntries.push({
      fieldId,
      section,
      labelText,
      ariaLabel,
      inputType,
      placeholder,
      isVague,
      currentValue,
      contextHint
    });
  });

  return fieldEntries;
}
