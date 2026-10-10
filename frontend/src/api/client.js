export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export function generateIdempotencyKey() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export async function request(endpoint, options = {}, baseUrl = '/api/v1') {
  const url = `${baseUrl}${endpoint}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs || 10000);

  const headers = {
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
    clearTimeout(timeout);

    let data = null;
    const text = await res.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch (_) {
        data = text;
      }
    }

    if (!res.ok) {
      throw new ApiError(data?.message || `HTTP ${res.status}`, res.status, data);
    }
    return data;
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof ApiError) throw err;
    throw new ApiError(err.message || 'Network request failed', err.name === 'AbortError' ? 408 : 0);
  }
}
