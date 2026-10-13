export const API_DOMAIN =
  (typeof process !== 'undefined' && process.env?.VITE_API_BASE_URL) ||
  import.meta.env?.VITE_API_BASE_URL ||
  "";
export const API_BASE = "/api/v1";

export const API_ENDPOINTS = {
  HEALTH: "/health",
  CONFIG: "/config",
  ALTCHA_CHALLENGE: "/altcha/challenge",
  ACCOUNTS_INSTANT: "/accounts/instant",
  ACCOUNTS_CUSTOM: "/accounts/custom",
  APPS: "/apps",
} as const;

export const API_BASE_URL = API_DOMAIN
  ? `${API_DOMAIN.replace(/\/+$/, '')}${API_BASE}`
  : API_BASE;

