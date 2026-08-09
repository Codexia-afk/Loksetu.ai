import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_ICONS_DIR = path.resolve(__dirname, '../public/icons');
const DIST_ICONS_DIR = path.resolve(__dirname, '../dist/icons');

if (!fs.existsSync(PUBLIC_ICONS_DIR)) fs.mkdirSync(PUBLIC_ICONS_DIR, { recursive: true });
if (!fs.existsSync(DIST_ICONS_DIR)) fs.mkdirSync(DIST_ICONS_DIR, { recursive: true });

const svgPath = path.join(PUBLIC_ICONS_DIR, 'loksetu_shield_logo.svg');
const svgContent = fs.readFileSync(svgPath, 'utf-8');

// Copy SVG to dist icons as well
fs.writeFileSync(path.join(DIST_ICONS_DIR, 'loksetu_shield_logo.svg'), svgContent);

console.log('✅ LokSetu Sovereign Shield SVG Icon copied to public/icons and dist/icons!');
