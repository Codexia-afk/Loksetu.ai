import { FormField, ApplicationMapData, AutofillItem } from '../types';
import { highlightElement } from './domHighlighter';
import { setNativeValue } from '../engine/fieldMatcherV2';

function categorizeField(labelText: string, name: string): FormField['category'] {
  const norm = (labelText + ' ' + name).toLowerCase();
  if (norm.includes('name') || norm.includes('age') || norm.includes('dob') || norm.includes('gender') || norm.includes('aadhaar') || norm.includes('mobile')) {
    return 'personal';
  }
  if (norm.includes('state') || norm.includes('district') || norm.includes('block') || norm.includes('village') || norm.includes('pin')) {
    return 'address';
  }
  if (norm.includes('income') || norm.includes('land') || norm.includes('occupancy') || norm.includes('khatian') || norm.includes('dag') || norm.includes('category')) {
    return 'income';
  }
  if (norm.includes('doc') || norm.includes('upload') || norm.includes('file') || norm.includes('certificate')) {
    return 'document';
  }
  return 'unknown';
}

function extractContextHint(element: HTMLElement): string {
  const fieldset = element.closest('fieldset');
  if (fieldset) {
    const legend = fieldset.querySelector('legend');
    if (legend && legend.textContent) {
      return legend.textContent.trim();
    }
  }

  let curr: HTMLElement | null = element;
  while (curr && curr !== document.body) {
    const heading = curr.querySelector('h2, h3, h4');
    if (heading && heading.textContent) {
      return heading.textContent.trim();
    }
    curr = curr.parentElement;
  }
  return 'General Application Form';
}

function checkIsVisible(el: HTMLElement): boolean {
  if (el.offsetWidth === 0 && el.offsetHeight === 0) return false;
  if (el.getAttribute('aria-hidden') === 'true') return false;
  const style = window.getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
  return true;
}

export function parseDOMFields(): ApplicationMapData {
  const elements = Array.from(document.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
    'input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea'
  ));

  const fields: FormField[] = elements.map(el => {
    const id = el.id || el.name || `field_${Math.random().toString(36).substring(2, 7)}`;
    let labelText = '';

    if (el.id) {
      const labelEl = document.querySelector<HTMLLabelElement>(`label[for="${el.id}"]`);
      if (labelEl) labelText = labelEl.innerText.trim();
    }
    if (!labelText && el.parentElement) {
      const parentLabel = el.parentElement.closest('label');
      if (parentLabel) labelText = parentLabel.innerText.trim();
    }
    const placeholderText = ('placeholder' in el && typeof el.placeholder === 'string') ? el.placeholder : '';
    if (!labelText) {
      labelText = el.getAttribute('aria-label') || placeholderText || el.name || 'Unlabeled Field';
    }

    const value = el.value || '';
    const category = categorizeField(labelText, el.name || '');
    const contextHint = extractContextHint(el);
    const isVague = labelText.toLowerCase().includes('nature') || labelText.toLowerCase().includes('scale') || labelText.length < 5;
    const isVisible = checkIsVisible(el);
    const isHidden = !isVisible || el.type === 'hidden';
    const isDisabled = el.disabled || ('readOnly' in el ? (el as any).readOnly : false);
    const maxLength = ('maxLength' in el && typeof el.maxLength === 'number' && el.maxLength > 0) ? el.maxLength : null;
    const pattern = el.getAttribute('pattern') || null;
    const frameOrigin = window.location.origin;

    return {
      id,
      name: el.name || id,
      type: el.type || el.tagName.toLowerCase(),
      label: labelText,
      value,
      required: el.required || el.hasAttribute('aria-required'),
      category,
      ariaLabel: el.getAttribute('aria-label') || undefined,
      placeholder: placeholderText || undefined,
      contextHint,
      isVague,
      isVisible,
      isHidden,
      isDisabled,
      maxLength,
      pattern,
      frameOrigin
    };
  });

  const totalFields = fields.length;
  const filledFields = fields.filter(f => f.value.trim().length > 0).length;
  const completionPercentage = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
  const readinessScore = completionPercentage;

  const portalName = document.title || 'Government Application Portal';

  return {
    portalName,
    totalFields,
    fields,
    completionPercentage,
    readinessScore
  };
}

export function autofillDOMFields(items: AutofillItem[]): { successCount: number } {
  let successCount = 0;

  for (const item of items) {
    const el = (document.getElementById(item.fieldId) ||
                document.querySelector(`[name="${item.fieldId}"]`)) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;

    if (el && 'value' in el) {
      setNativeValue(el, item.value);
      highlightElement(el, item.sourceLabel);
      successCount++;
    }
  }

  return { successCount };
}
