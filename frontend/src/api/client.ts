import { API_BASE_URL } from './registry.ts';

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export function generateIdempotencyKey(): string {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export interface RequestOptions extends Omit<RequestInit, 'headers'> {
  headers?: Record<string, string>;
  timeoutMs?: number;
  idempotent?: boolean;
  idempotencyKey?: string;
}

export async function request<T = unknown>(
  endpoint: string,
  options: RequestOptions = {},
  baseUrl: string = API_BASE_URL
): Promise<T> {
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${cleanBase}${cleanEndpoint}`;

  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? 10000;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  if (timeoutMs > 0) {
    timeout = setTimeout(() => controller.abort(), timeoutMs);
  }

  if (options.signal) {
    if (options.signal.aborted) {
      controller.abort(options.signal.reason);
    } else {
      options.signal.addEventListener('abort', () => controller.abort(options.signal?.reason), { once: true });
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (options.idempotent && !headers['Idempotency-Key']) {
    headers['Idempotency-Key'] = options.idempotencyKey || generateIdempotencyKey();
  } else if (options.idempotencyKey && !headers['Idempotency-Key']) {
    headers['Idempotency-Key'] = options.idempotencyKey;
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    let data: unknown = null;
    const text = await res.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    if (!res.ok) {
      let message = `HTTP ${res.status}`;
      if (typeof data === 'object' && data !== null) {
        const obj = data as Record<string, unknown>;
        if (typeof obj.message === 'string') message = obj.message;
        else if (typeof obj.detail === 'string') message = obj.detail;
        else if (typeof obj.error === 'string') message = obj.error;
      }
      throw new ApiError(message, res.status, data);
    }
    return data as T;
  } catch (err: unknown) {
    if (err instanceof ApiError) throw err;
    const error = err as Error;
    throw new ApiError(error.message || 'Network request failed', error.name === 'AbortError' ? 408 : 0);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}
