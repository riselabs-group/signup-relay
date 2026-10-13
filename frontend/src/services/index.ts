import { SERVICE_CONFIG, type ServiceMode } from './config.ts';
import { prodService } from './prodService.ts';
import { mockService } from './mockService.ts';
import type { IService } from './types.ts';

export interface ServiceDispatcherOptions {
  mode?: ServiceMode;
  prod?: IService;
  mock?: IService;
}

export function createServiceDispatcher({ mode, prod, mock }: ServiceDispatcherOptions = {}): IService {
  const selectedMode = mode || SERVICE_CONFIG.MODE;
  const prodTarget = prod || prodService;
  const mockTarget = mock || mockService;

  if (selectedMode === 'FORCE_MOCK') return mockTarget;
  if (selectedMode === 'FORCE_PROD') return prodTarget;

  // AUTO_FALLBACK proxy
  return new Proxy(prodTarget, {
    get(target: IService, prop: string | symbol) {
      const key = prop as keyof IService;
      const targetVal = target[key];
      if (typeof targetVal !== 'function') return targetVal;

      return async (...args: unknown[]) => {
        try {
          const fn = targetVal as (...a: unknown[]) => Promise<unknown>;
          return await fn.apply(target, args);
        } catch (error: unknown) {
          const err = (error && typeof error === 'object') ? (error as { status?: number; message?: string }) : null;
          if (err && err.status && err.status >= 400 && err.status < 500 && err.status !== 408) {
            throw error; // Business errors pass through
          }
          if (typeof console !== 'undefined') {
            console.warn(`[Service] Live call to ${String(prop)} failed (${err?.message || String(error) || 'error'}). Using mock fallback.`);
          }
          const mockFn = mockTarget[key] as (...a: unknown[]) => Promise<unknown>;
          return mockFn.apply(mockTarget, args);
        }
      };
    },
  });
}

export const service: IService = createServiceDispatcher();
