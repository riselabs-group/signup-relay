import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, isSupportedHashAlgorithm } from '../src/utils/password-hash.ts';

test('isSupportedHashAlgorithm lists the four PHC algos', () => {
  assert.equal(isSupportedHashAlgorithm('argon2id'), true);
  assert.equal(isSupportedHashAlgorithm('bcrypt'), true);
  assert.equal(isSupportedHashAlgorithm('scrypt'), true);
  assert.equal(isSupportedHashAlgorithm('pbkdf2'), true);
  assert.equal(isSupportedHashAlgorithm('md5'), false);
});

test('hashPassword argon2id returns phc prefix', async () => {
  const h = await hashPassword('argon2id', 'correct horse');
  assert.ok(h.startsWith('$argon2id$'));
});
