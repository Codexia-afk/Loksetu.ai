import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Zero Auto-Submit Structural Guarantee Audit', () => {
  it('should verify 0 occurrences of submit execution calls in codebase source', () => {
    const srcDir = path.resolve(__dirname, '../');

    function scanDir(dir: string): { file: string; line: number; code: string }[] {
      let violations: { file: string; line: number; code: string }[] = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          violations = violations.concat(scanDir(fullPath));
        } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name) && !entry.name.includes('.test.')) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          const lines = content.split('\n');
          lines.forEach((line, index) => {
            const hasFormSubmit = /\.submit\s*\(/.test(line);
            const hasRequestSubmit = /\.requestSubmit\s*\(/.test(line);
            const hasSubmitDispatch = /dispatchEvent\s*\(\s*new\s+(Custom)?Event\s*\(\s*['"]submit['"]/.test(line);

            if ((hasFormSubmit || hasRequestSubmit || hasSubmitDispatch) && !line.includes('// no-submit-ignore')) {
              violations.push({ file: fullPath, line: index + 1, code: line.trim() });
            }
          });
        }
      }
      return violations;
    }

    const violations = scanDir(srcDir);
    expect(violations).toEqual([]);
  });
});
