import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { en } from '../src/i18n/en.ts';
import { fa } from '../src/i18n/fa.ts';

const baseDir = fs.existsSync(path.resolve(process.cwd(), 'frontend'))
  ? path.resolve(process.cwd(), 'frontend')
  : process.cwd();

test('en and fa translation dictionaries have key parity for core keys', () => {
  const criticalKeys = [
    'nav_home',
    'nav_share',
    'nav_apps',
    'nav_docs',
    'index_generate',
    'index_open_dc',
    'index_copy_link',
    'index_manual_title',
    'index_ios_title',
    'footer_fs_statement',
  ];

  for (const key of criticalKeys) {
    assert.ok(en[key], `en missing key: ${key}`);
    assert.ok(fa[key], `fa missing key: ${key}`);
  }
  assert.equal(en.dir, 'ltr');
  assert.equal(fa.dir, 'rtl');
  assert.equal(en.lang, 'en');
  assert.equal(fa.lang, 'fa');
});

test('en and fa have full symmetric key parity', () => {
  const enKeys = Object.keys(en).sort();
  const faKeys = Object.keys(fa).sort();
  assert.deepEqual(enKeys, faKeys, 'en and fa must define the exact same translation keys');
});

test('index.tsx guards localStorage access with try-catch and sanitizes stored language', () => {
  const filePath = fs.existsSync(path.resolve(baseDir, 'src/i18n/index.tsx'))
    ? path.resolve(baseDir, 'src/i18n/index.tsx')
    : path.resolve(baseDir, 'src/i18n/index.jsx');
  const content = fs.readFileSync(filePath, 'utf8');
  assert.match(content, /try\s*\{[\s\S]*?localStorage\.getItem[\s\S]*?\}\s*catch/, 'Must guard localStorage.getItem with try-catch');
  assert.match(content, /try\s*\{[\s\S]*?localStorage\.setItem[\s\S]*?\}\s*catch/, 'Must guard localStorage.setItem with try-catch');
  assert.match(content, /stored\s*===\s*['"]en['"]\s*\?\s*['"]en['"]\s*:\s*['"]fa['"]/, 'Must sanitize stored language to en or fa default');
  assert.match(content, /currentDict\[key\]\s*\?\?\s*fallback\s*\?\?\s*key/, 'Must use nullish coalescing for translations and fallbacks');
});

