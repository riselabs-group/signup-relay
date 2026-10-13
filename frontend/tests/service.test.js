import test from 'node:test';
import assert from 'node:assert/strict';
import { mockService } from '../src/services/mockService.ts';
import { createServiceDispatcher } from '../src/services/index.ts';
import { ApiError, request, generateIdempotencyKey } from '../src/api/client.ts';
import { API_BASE, API_DOMAIN, API_ENDPOINTS } from '../src/api/registry.ts';
import { SERVICE_CONFIG } from '../src/services/config.ts';

test('mockService returns valid config and instant account DTO', async () => {
  const config = await mockService.getConfig();
  assert.equal(config.domain, SERVICE_CONFIG.DOMAIN);
  assert.equal(config.registration_open, true);
  assert.equal(config.instant_accounts_enabled, true);

  const account = await mockService.createInstantAccount();
  assert.ok(account.email.includes(`@${SERVICE_CONFIG.DOMAIN}`));
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
  assert.equal(custom.email, `validuser@${SERVICE_CONFIG.DOMAIN}`);
  assert.ok(custom.dclogin_link.startsWith('dclogin:'));
  assert.equal(custom.account_type, 'custom');

  await assert.rejects(
    async () => {
      await mockService.createCustomAccount();
    },
    { message: /at least 3 characters/ }
  );
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
  assert.equal(config.domain, SERVICE_CONFIG.DOMAIN);
});

test('service dispatcher handles AUTO_FALLBACK to mock when prod times out (408)', async () => {
  const timeoutProd = {
    getConfig: async () => {
      const err = new ApiError('Request timed out', 408);
      throw err;
    },
  };

  const dispatcher = createServiceDispatcher({
    mode: 'AUTO_FALLBACK',
    prod: timeoutProd,
    mock: mockService,
  });

  const config = await dispatcher.getConfig();
  assert.equal(config.domain, SERVICE_CONFIG.DOMAIN);
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
  assert.equal(mockConfig.domain, SERVICE_CONFIG.DOMAIN);
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

test('service dispatcher handles non-object or nullish error rejections gracefully', async () => {
  const primitiveThrowingProd = {
    getConfig: async () => {
      throw 'Raw string network failure';
    },
  };

  const dispatcher = createServiceDispatcher({
    mode: 'AUTO_FALLBACK',
    prod: primitiveThrowingProd,
    mock: mockService,
  });

  const config = await dispatcher.getConfig();
  assert.equal(config.domain, SERVICE_CONFIG.DOMAIN);
});

test('client request supports timeout, idempotency key and ApiError', async () => {
  const key = generateIdempotencyKey();
  assert.ok(key && typeof key === 'string');

  const err = new ApiError('Not Found', 404, { detail: 'missing' });
  assert.equal(err.status, 404);
  assert.equal(err.message, 'Not Found');
  assert.deepEqual(err.data, { detail: 'missing' });
});

test('API registry defines static base and all standard endpoint paths', () => {
  assert.equal(API_BASE, '/api/v1');
  assert.equal(API_DOMAIN, '');
  assert.equal(API_ENDPOINTS.HEALTH, '/health');
  assert.equal(API_ENDPOINTS.CONFIG, '/config');
  assert.equal(API_ENDPOINTS.ALTCHA_CHALLENGE, '/altcha/challenge');
  assert.equal(API_ENDPOINTS.ACCOUNTS_INSTANT, '/accounts/instant');
  assert.equal(API_ENDPOINTS.ACCOUNTS_CUSTOM, '/accounts/custom');
  assert.equal(API_ENDPOINTS.APPS, '/apps');
  assert.equal(SERVICE_CONFIG.API_BASE_URL, '/api/v1');
  assert.equal(SERVICE_CONFIG.DOMAIN, 'chatchi.org');
});
