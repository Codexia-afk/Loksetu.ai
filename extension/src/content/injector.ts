import { AutofillItem } from '../types';

export function injectAutofillValues(items: AutofillItem[]): { filledCount: number } {
  let filledCount = 0;

  items.forEach((item) => {
    const el = (document.getElementById(item.fieldId) || document.querySelector(`[name="${item.fieldId}"]`)) as HTMLInputElement | HTMLSelectElement | null;

    if (el) {
      // Inject value
      el.value = item.value;

      // Dispatch native React & DOM change events
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));

      // Apply Visual Lineage Badge & High-contrast Green Outline (Constraint 8)
      el.style.border = '2px solid #046A38';
      el.style.boxShadow = '0 0 0 3px rgba(4, 106, 56, 0.2)';
      el.style.transition = 'all 0.3s ease';

      // Create or update source tag badge
      let badge = el.parentElement?.querySelector('.loksetu-source-badge') as HTMLElement;
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'loksetu-source-badge';
        badge.style.display = 'inline-flex';
        badge.style.alignItems = 'center';
        badge.style.gap = '4px';
        badge.style.backgroundColor = '#E6F4EA';
        badge.style.color = '#137333';
        badge.style.fontSize = '0.75rem';
        badge.style.fontWeight = '600';
        badge.style.padding = '2px 8px';
        badge.style.borderRadius = '12px';
        badge.style.marginTop = '4px';
        badge.style.border = '1px solid #CEEAD6';
        
        el.parentElement?.appendChild(badge);
      }
      badge.innerHTML = `🛡️ <strong>Source:</strong> ${item.sourceLabel}`;

      filledCount++;
    }
  });

  return { filledCount };
}
