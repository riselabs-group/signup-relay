import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const baseDir = fs.existsSync(path.resolve(process.cwd(), 'frontend'))
  ? path.resolve(process.cwd(), 'frontend')
  : process.cwd();

test('tailwind configuration exports MailiaM themes', () => {
  const configPath = path.resolve(baseDir, 'tailwind.config.js');
  assert.ok(fs.existsSync(configPath), 'tailwind.config.js must exist');

  const content = fs.readFileSync(configPath, 'utf8');
  assert.match(content, /chatchi-dark/, 'Must define chatchi-dark theme');
  assert.match(content, /chatchi-light/, 'Must define chatchi-light theme');
  assert.match(content, /Vazirmatn/, 'Must include Vazirmatn font');
  assert.match(content, /Inter/, 'Must include Inter font');
  assert.match(content, /JetBrains Mono/, 'Must include JetBrains Mono font');
  assert.doesNotMatch(content, /fonts\.google/, 'Must not load Google Fonts');
  assert.match(content, /\.\/src\/\*\*\/\*\.\{.*ts.*tsx.*\}/, 'Must scan .ts and .tsx files for tailwind content');
});

test('index.html contains anti-FOUT theme blocker and stable scrollbar', () => {
  const htmlPath = path.resolve(baseDir, 'index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');
  assert.match(html, /localStorage\.getItem\(['"]chatchi_theme['"]\)/, 'Must contain inline theme blocker');
  assert.match(html, /scrollbar-gutter:\s*stable/i, 'Must specify stable scrollbar gutter');
  assert.doesNotMatch(html, /fonts\.googleapis|fonts\.gstatic/, 'Must not load Google Fonts');
});

test('local woff2 fonts exist and CSS self-hosts them', () => {
  const fontsDir = path.resolve(baseDir, 'public/fonts');
  for (const name of ['InterVariable.woff2', 'Vazirmatn.woff2', 'JetBrainsMono.woff2']) {
    const full = path.resolve(fontsDir, name);
    assert.ok(fs.existsSync(full), `${name} must exist`);
    assert.ok(fs.statSync(full).size > 10000, `${name} must be a real woff2`);
  }
  const css = fs.readFileSync(path.resolve(baseDir, 'src/index.css'), 'utf8');
  assert.match(css, /url\('\/fonts\/InterVariable\.woff2'\)/);
  assert.match(css, /url\('\/fonts\/Vazirmatn\.woff2'\)/);
  assert.match(css, /url\('\/fonts\/JetBrainsMono\.woff2'\)/);
  assert.doesNotMatch(css, /fonts\.googleapis|fonts\.gstatic/);
});
