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

export const SERVICE_CONFIG: ServiceConfig = {
  MODE: (env.VITE_SERVICE_MODE as ServiceMode) || "AUTO_FALLBACK",
  API_BASE_URL: API_BASE_URL,
  DOMAIN: API_DOMAIN.replace(/^https?:\/\//, '').split(':')[0].split('/')[0] || env.VITE_DOMAIN || "chatchi.org",
};
