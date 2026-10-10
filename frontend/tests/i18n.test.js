import test from 'node:test';
import assert from 'node:assert/strict';
import { en } from '../src/i18n/en.js';
import { fa } from '../src/i18n/fa.js';

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
