import { autofillDOMFields } from './domParser';
import { AutofillItem } from '../types';

export function injectAutofillValues(items: AutofillItem[]): { filledCount: number } {
  const res = autofillDOMFields(items);
  return { filledCount: res.successCount };
}
