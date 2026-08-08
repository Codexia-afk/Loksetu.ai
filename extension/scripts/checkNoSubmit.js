import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, '../src');

function scanDirectory(dir) {
  let violations = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      violations = violations.concat(scanDirectory(fullPath));
    } else if (/\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        // Audit pattern: form.submit(), form.requestSubmit(), dispatchEvent('submit')
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

console.log('🔍 Running LokSetu Zero Auto-Submit Adversarial Audit (Fix #5 & Section 17)...');
const violations = scanDirectory(srcDir);

if (violations.length > 0) {
  console.error('❌ ZERO AUTO-SUBMIT GUARANTEE VIOLATION DETECTED!');
  violations.forEach(v => {
    console.error(`   - File: ${v.file}:${v.line}`);
    console.error(`     Code: ${v.code}`);
  });
  process.exit(1);
} else {
  console.log('✅ ZERO AUTO-SUBMIT GUARANTEE VERIFIED: 0 occurrences of .submit(), .requestSubmit(), or synthetic submit events in codebase.');
  process.exit(0);
}
