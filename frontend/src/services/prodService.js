import { request } from '../api/client.js';
import { SERVICE_CONFIG } from './config.js';

export const prodService = {
  getConfig: () => request('/config', {}, SERVICE_CONFIG.API_BASE_URL),
  getAltchaChallenge: () => request('/altcha/challenge', {}, SERVICE_CONFIG.API_BASE_URL),
  createInstantAccount: (payload) =>
    request('/accounts/instant', { method: 'POST', body: JSON.stringify(payload || {}), idempotent: true }, SERVICE_CONFIG.API_BASE_URL),
  createCustomAccount: (payload) =>
    request('/accounts/custom', { method: 'POST', body: JSON.stringify(payload || {}), idempotent: true }, SERVICE_CONFIG.API_BASE_URL),
  getApps: () => request('/apps', {}, SERVICE_CONFIG.API_BASE_URL),
};
