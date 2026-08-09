import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCHEMES_DIR = path.resolve(__dirname, '../data/schemes');

function checkProvenance() {
  console.log('🔍 Running LokSetu Gazette Provenance Audit (Gap 1)...');

  if (!fs.existsSync(SCHEMES_DIR)) {
    console.error(`❌ Schemes directory not found at: ${SCHEMES_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(SCHEMES_DIR).filter(f => f.endsWith('.json'));
  let totalRules = 0;
  let missingProvenanceCount = 0;

  for (const file of files) {
    const filePath = path.join(SCHEMES_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const scheme = JSON.parse(content);

    if (!scheme.rules || !Array.isArray(scheme.rules) || scheme.rules.length === 0) {
      console.error(`❌ Scheme '${file}' has no 'rules' array defined.`);
      missingProvenanceCount++;
      continue;
    }

    for (let i = 0; i < scheme.rules.length; i++) {
      totalRules++;
      const rule = scheme.rules[i];
      const prov = rule.provenance;

      if (!prov) {
        console.error(`❌ Scheme '${file}' rule index ${i} (${rule.ruleId}) is missing 'provenance' object.`);
        missingProvenanceCount++;
        continue;
      }

      const requiredFields = [
        'ruleId',
        'schemeId',
        'sourceType',
        'sourceTitle',
        'sourceReference',
        'sourceUrl',
        'lastVerifiedDate',
        'ruleLogic'
      ];

      for (const field of requiredFields) {
        if (!prov[field] || typeof prov[field] !== 'string' || prov[field].trim() === '') {
          console.error(`❌ Scheme '${file}' rule '${rule.ruleId}' missing provenance field '${field}'.`);
          missingProvenanceCount++;
        }
      }
    }
  }

  if (missingProvenanceCount > 0) {
    console.error(`\n❌ PROVENANCE AUDIT FAILED: Found ${missingProvenanceCount} rule(s) with missing Gazette provenance metadata.`);
    process.exit(1);
  }

  console.log(`✅ VERIFIED: All ${totalRules} scheme rules across ${files.length} JSON specifications contain 100% complete Gazette provenance citations.`);
}

checkProvenance();
