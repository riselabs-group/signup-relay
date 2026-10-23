import { sha256 } from 'hash-wasm';
import type { AltchaChallenge } from '../services/types.ts';

// ponytail: use native crypto.subtle when available in Secure Contexts, with seamless hash-wasm fallback for plain HTTP / raw IP
export async function sha256Hex(data: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle?.digest) {
    try {
      const encoder = new TextEncoder();
      const buffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
      const hashArray = Array.from(new Uint8Array(buffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Insecure context or subtle restriction: fall through to hash-wasm
    }
  }
  return sha256(data);
}

export function encodeBase64(str: string): string {
  if (typeof btoa !== 'undefined') {
    return btoa(str);
  }
  return Buffer.from(str, 'utf-8').toString('base64');
}

// ponytail: synchronous in-thread chunked solver; upgrade to Web Worker if challenge max_number exceeds 100,000
export async function solveAltcha(
  challengeData: AltchaChallenge,
  maxIterations: number = 100000
): Promise<string> {
  const { algorithm, challenge, salt, signature, max_number } = challengeData;
  const limit = Math.min(max_number || maxIterations, maxIterations);

  if (!challenge || challenge.startsWith('mock_')) {
    const payload = JSON.stringify({
      algorithm: algorithm || 'SHA-256',
      challenge: challenge || 'mock_challenge',
      number: 0,
      salt: salt || 'mock_salt',
      signature: signature || 'mock_signature',
    });
    return encodeBase64(payload);
  }

  for (let i = 0; i <= limit; i++) {
    const candidate = await sha256Hex(`${salt}${i}`);
    if (candidate === challenge) {
      const payload = JSON.stringify({
        algorithm,
        challenge,
        number: i,
        salt,
        signature,
      });
      return encodeBase64(payload);
    }
  }

  throw new Error('Could not solve Altcha proof-of-work within limit');
}
