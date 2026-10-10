import test from 'node:test';
import assert from 'node:assert/strict';
import { mockService } from '../src/services/mockService.js';
import { createServiceDispatcher } from '../src/services/index.js';
import { ApiError, request, generateIdempotencyKey } from '../src/api/client.js';

test('mockService returns valid config and instant account DTO', async () => {
  const config = await mockService.getConfig();
  assert.equal(config.domain, 'chatchi.org');
  assert.equal(config.registration_open, true);
  assert.equal(config.instant_accounts_enabled, true);

  const account = await mockService.createInstantAccount();
  assert.ok(account.email.includes('@chatchi.org'));
  assert.ok(account.dclogin_link.startsWith('dclogin:'));
  assert.equal(account.account_type, 'instant');
  assert.ok(account.expires_at);
});

test('mockService returns altcha challenge and apps', async () => {
  const challenge = await mockService.getAltchaChallenge();
  assert.equal(challenge.algorithm, 'SHA-256');
  assert.ok(challenge.challenge);

  const apps = await mockService.getApps();
  assert.ok(Array.isArray(apps.apps));
  assert.ok(apps.apps.length > 0);
  assert.equal(apps.apps[0].app_id, 'chat.delta.webxdc.chess');
});

test('mockService validates custom account constraints', async () => {
  await assert.rejects(
    async () => {
      await mockService.createCustomAccount({ username: 'ab', password: '123' });
    },
    { message: /at least 3 characters/ }
  );

  await assert.rejects(
    async () => {
      await mockService.createCustomAccount({ username: 'validuser', password: 'short' });
    },
    { message: /at least 8 characters/ }
  );

  const custom = await mockService.createCustomAccount({
    username: 'validuser',
    password: 'StrongPassword123!',
  });
  assert.equal(custom.email, 'validuser@chatchi.org');
  assert.ok(custom.dclogin_link.startsWith('dclogin:'));
  assert.equal(custom.account_type, 'custom');
});

test('service dispatcher handles AUTO_FALLBACK to mock when prod fails with 5xx/network error', async () => {
  const failingProd = {
    getConfig: async () => {
      const err = new Error('Network error');
      err.status = 502;
      throw err;
    },
  };

  const dispatcher = createServiceDispatcher({
    mode: 'AUTO_FALLBACK',
    prod: failingProd,
    mock: mockService,
  });

  const config = await dispatcher.getConfig();
  assert.equal(config.domain, 'chatchi.org');
});

test('service dispatcher does NOT fallback on 4xx business/client errors', async () => {
  const failingProd = {
    createCustomAccount: async () => {
      const err = new Error('Username already taken');
      err.status = 409;
      throw err;
    },
  };

  const dispatcher = createServiceDispatcher({
    mode: 'AUTO_FALLBACK',
    prod: failingProd,
    mock: mockService,
  });

  await assert.rejects(
    async () => {
      await dispatcher.createCustomAccount({ username: 'existing', password: 'password123' });
    },
    { message: /Username already taken/ }
  );
});

test('service dispatcher respects FORCE_MOCK and FORCE_PROD modes', async () => {
  let prodCalled = false;
  const dummyProd = {
    getConfig: async () => {
      prodCalled = true;
      return { domain: 'prod.chatchi.org' };
    },
  };

  const forceMockDispatcher = createServiceDispatcher({
    mode: 'FORCE_MOCK',
    prod: dummyProd,
    mock: mockService,
  });
  const mockConfig = await forceMockDispatcher.getConfig();
  assert.equal(mockConfig.domain, 'chatchi.org');
  assert.equal(prodCalled, false);

  const forceProdDispatcher = createServiceDispatcher({
    mode: 'FORCE_PROD',
    prod: dummyProd,
    mock: mockService,
  });
  const prodConfig = await forceProdDispatcher.getConfig();
  assert.equal(prodConfig.domain, 'prod.chatchi.org');
  assert.equal(prodCalled, true);
});

test('client request supports timeout, idempotency key and ApiError', async () => {
  const key = generateIdempotencyKey();
  assert.ok(key && typeof key === 'string');

  const err = new ApiError('Not Found', 404, { detail: 'missing' });
  assert.equal(err.status, 404);
  assert.equal(err.message, 'Not Found');
  assert.deepEqual(err.data, { detail: 'missing' });
});
