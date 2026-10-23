import { API_BASE_URL, API_DOMAIN } from '../api/registry.ts';

export type ServiceMode = "FORCE_MOCK" | "FORCE_PROD" | "AUTO_FALLBACK";

export interface ServiceConfig {
  MODE: ServiceMode;
  API_BASE_URL: string;
  DOMAIN: string;
}

const env =
  (typeof process !== "undefined" &&
    (process.env as Record<string, string | undefined>)) ||
  (typeof import.meta !== "undefined" &&
    (import.meta as unknown as { env: Record<string, string | undefined> })
      .env) ||
  {};

// ponytail: smart host detection falling back to window.location.hostname for IP-hosted or dynamic domains
export function resolveFallbackDomain(envDomain?: string, apiDomain?: string): string {
  if (envDomain) return envDomain;
  if (apiDomain) {
    const extracted = apiDomain.replace(/^https?:\/\//, '').split(':')[0].split('/')[0];
    if (extracted) return extracted;
  }
  if (typeof window !== 'undefined' && window.location?.hostname) {
    const host = window.location.hostname;
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return host;
    }
  }
  return 'chatchi.org';
}

export const SERVICE_CONFIG: ServiceConfig = {
  MODE: (env.VITE_SERVICE_MODE as ServiceMode) || "AUTO_FALLBACK",
  API_BASE_URL: API_BASE_URL,
  DOMAIN: resolveFallbackDomain(env.VITE_DOMAIN, API_DOMAIN),
};
