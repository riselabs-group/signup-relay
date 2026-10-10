import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const baseDir = fs.existsSync(path.resolve(process.cwd(), 'frontend'))
  ? path.resolve(process.cwd(), 'frontend')
  : process.cwd();

test('tailwind configuration exports chatchi themes', () => {
  const configPath = path.resolve(baseDir, 'tailwind.config.js');
  assert.ok(fs.existsSync(configPath), 'tailwind.config.js must exist');

  const content = fs.readFileSync(configPath, 'utf8');
  assert.match(content, /chatchi-dark/, 'Must define chatchi-dark theme');
  assert.match(content, /chatchi-light/, 'Must define chatchi-light theme');
  assert.match(content, /Vazirmatn/, 'Must include Vazirmatn font');
});

test('index.html contains anti-FOUT theme blocker and stable scrollbar', () => {
  const htmlPath = path.resolve(baseDir, 'index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');
  assert.match(html, /localStorage\.getItem\(['"]chatchi_theme['"]\)/, 'Must contain inline theme blocker');
  assert.match(html, /scrollbar-gutter:\s*stable/i, 'Must specify stable scrollbar gutter');
});
