import { request } from '../api/client.ts';
import { API_ENDPOINTS } from '../api/registry.ts';
import { SERVICE_CONFIG } from './config.ts';
import type {
  IService,
  ServerConfig,
  AltchaChallenge,
  InstantAccountPayload,
  InstantAccountResult,
  CustomAccountPayload,
  CustomAccountResult,
  WebxdcCatalog,
} from './types.ts';

// ponytail: one in-flight GET /config; drop cache if live admin edits must show without reload
let configOnce: Promise<ServerConfig> | null = null;

export const prodService: IService = {
  getConfig: (): Promise<ServerConfig> => {
    if (!configOnce) {
      configOnce = request<ServerConfig>(API_ENDPOINTS.CONFIG, {}, SERVICE_CONFIG.API_BASE_URL)
        .then((cfg) => {
          if (cfg?.domain) SERVICE_CONFIG.DOMAIN = cfg.domain;
          return cfg;
        })
        .catch((err) => {
          configOnce = null;
          throw err;
        });
    }
    return configOnce;
  },

  getAltchaChallenge: (): Promise<AltchaChallenge> =>
    request<AltchaChallenge>(API_ENDPOINTS.ALTCHA_CHALLENGE, {}, SERVICE_CONFIG.API_BASE_URL),

  createInstantAccount: (payload: InstantAccountPayload): Promise<InstantAccountResult> =>
    request<InstantAccountResult>(
      API_ENDPOINTS.ACCOUNTS_INSTANT,
      { method: 'POST', body: JSON.stringify(payload), idempotent: true },
      SERVICE_CONFIG.API_BASE_URL
    ),

  createCustomAccount: (payload: CustomAccountPayload): Promise<CustomAccountResult> =>
    request<CustomAccountResult>(
      API_ENDPOINTS.ACCOUNTS_CUSTOM,
      { method: 'POST', body: JSON.stringify(payload), idempotent: true },
      SERVICE_CONFIG.API_BASE_URL
    ),

  getApps: (): Promise<WebxdcCatalog> =>
    request<WebxdcCatalog>(API_ENDPOINTS.APPS, {}, SERVICE_CONFIG.API_BASE_URL),
};
