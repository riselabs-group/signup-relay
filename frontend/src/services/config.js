const env = (typeof process !== 'undefined' && process.env) || (typeof import.meta !== 'undefined' && import.meta.env) || {};

export const SERVICE_CONFIG = {
  MODE: env.VITE_SERVICE_MODE || 'AUTO_FALLBACK',
  API_BASE_URL: env.VITE_API_URL || '/api/v1',
  DOMAIN: 'chatchi.org',
};
