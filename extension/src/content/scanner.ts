import { parseDOMFields } from './domParser';
import { FieldMapEntry } from '../types';

export function scanApplicationForm(): FieldMapEntry[] {
  const mapData = parseDOMFields();
  return mapData.fields.map(f => ({
    fieldId: f.id,
    section: (f.category === 'document' ? 'documents' : f.category === 'income' ? 'land_income' : f.category === 'address' ? 'address' : 'personal') as any,
    labelText: f.label,
    ariaLabel: f.ariaLabel,
    inputType: f.type,
    placeholder: f.placeholder,
    isVague: !!f.isVague,
    currentValue: f.value,
    contextHint: f.contextHint
  }));
}
