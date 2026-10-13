import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.resolve(__dirname, '..');
const repoRootDir = path.resolve(frontendDir, '..');
const docsDir = path.resolve(repoRootDir, 'docs');

test('documentation markdown files exist in docs directory', () => {
  const docs = ['PHILOSOPHY.md', 'DEPLOY_CHATCHI.md', 'SECURITY.md', 'PRIVACY.md'];
  for (const doc of docs) {
    const fullPath = path.resolve(docsDir, doc);
    assert.ok(fs.existsSync(fullPath), `Document ${doc} must exist at ${fullPath}`);
  }
});

test('PHILOSOPHY.md covers four freedoms, Autocrypt OpenPGP, and AGPL-3.0', () => {
  const content = fs.readFileSync(path.resolve(docsDir, 'PHILOSOPHY.md'), 'utf8');
  assert.match(content, /چهار آزادی اساسی|آزادی‌های چهارگانه/);
  assert.match(content, /آزادی ۰/);
  assert.match(content, /آزادی ۱/);
  assert.match(content, /آزادی ۲/);
  assert.match(content, /آزادی ۳/);
  assert.match(content, /Autocrypt/);
  assert.match(content, /OpenPGP/);
  assert.match(content, /AGPL-3\.0/);
});

test('DEPLOY_CHATCHI.md covers Stalwart fork, DNS records, ports, and docker compose', () => {
  const content = fs.readFileSync(path.resolve(docsDir, 'DEPLOY_CHATCHI.md'), 'utf8');
  assert.match(content, /Stalwart/i);
  assert.match(content, /MX/);
  assert.match(content, /SPF/);
  assert.match(content, /DKIM/);
  assert.match(content, /DMARC/);
  assert.match(content, /993/);
  assert.match(content, /465/);
  assert.match(content, /docker compose|docker-compose/);
});

test('SECURITY.md covers TLS 1.3, Autocrypt, OpenPGP, and in-memory passwords', () => {
  const content = fs.readFileSync(path.resolve(docsDir, 'SECURITY.md'), 'utf8');
  assert.match(content, /TLS 1\.3/);
  assert.match(content, /Autocrypt/);
  assert.match(content, /OpenPGP/);
  assert.match(content, /حافظه/);
});

test('PRIVACY.md covers zero-log, no tracking scripts, and 30-day account expiry', () => {
  const content = fs.readFileSync(path.resolve(docsDir, 'PRIVACY.md'), 'utf8');
  assert.match(content, /لاگ/);
  assert.match(content, /ردیابی/);
  assert.match(content, /۳۰ روز|30 روز|30 days/i);
});

test('DocsRoute component exists with sticky sidebar and topic switcher', () => {
  const filePath = fs.existsSync(path.resolve(frontendDir, 'src/routes/DocsRoute.tsx'))
    ? path.resolve(frontendDir, 'src/routes/DocsRoute.tsx')
    : path.resolve(frontendDir, 'src/routes/DocsRoute.jsx');
  assert.ok(fs.existsSync(filePath), 'DocsRoute.tsx or DocsRoute.jsx must exist');
  const content = fs.readFileSync(filePath, 'utf8');

  assert.match(content, /export function DocsRoute/, 'Must export DocsRoute component');
  assert.match(content, /philosophy/);
  assert.match(content, /deploy/);
  assert.match(content, /security/);
  assert.match(content, /privacy/);
  assert.match(content, /lg:flex-row/, 'Must support responsive sidebar layout');
});

test('DocsRoute supports markdown rendering with marked and sanitizeHtml', () => {
  const filePath = fs.existsSync(path.resolve(frontendDir, 'src/routes/DocsRoute.tsx'))
    ? path.resolve(frontendDir, 'src/routes/DocsRoute.tsx')
    : path.resolve(frontendDir, 'src/routes/DocsRoute.jsx');
  const content = fs.readFileSync(filePath, 'utf8');

  assert.match(content, /import\s*\{\s*marked\s*\}\s*from\s*['"]marked['"]/, 'Must import marked');
  assert.match(content, /marked\.parse/, 'Must parse markdown content');
  assert.match(content, /sanitizeHtml/, 'Must sanitize parsed markdown HTML');
  assert.match(content, /dangerouslySetInnerHTML/, 'Must render HTML output');
});
