import { SERVICE_CONFIG } from './config.js';
import { prodService } from './prodService.js';
import { mockService } from './mockService.js';

export function createServiceDispatcher({ mode, prod, mock } = {}) {
  const selectedMode = mode || SERVICE_CONFIG.MODE;
  const prodTarget = prod || prodService;
  const mockTarget = mock || mockService;

  if (selectedMode === 'FORCE_MOCK') return mockTarget;
  if (selectedMode === 'FORCE_PROD') return prodTarget;

  // AUTO_FALLBACK proxy
  return new Proxy(prodTarget, {
    get(target, prop) {
      if (typeof target[prop] !== 'function') return target[prop];
      return async (...args) => {
        try {
          return await target[prop](...args);
        } catch (error) {
          if (error.status && error.status >= 400 && error.status < 500) {
            throw error; // Business errors pass through
          }
          if (typeof console !== 'undefined') {
            console.warn(`[Service] Live call to ${prop} failed (${error.message}). Using mock fallback.`);
          }
          return mockTarget[prop](...args);
        }
      };
    },
  });
}

export const service = createServiceDispatcher();
