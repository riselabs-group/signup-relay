import { argon2id, bcrypt, createSHA256, pbkdf2, scrypt } from 'hash-wasm';

export type HashAlgorithm = 'argon2id' | 'bcrypt' | 'scrypt' | 'pbkdf2';

export function isSupportedHashAlgorithm(a: string): a is HashAlgorithm {
  return a === 'argon2id' || a === 'bcrypt' || a === 'scrypt' || a === 'pbkdf2';
}

function randomSalt(bytes = 16): Uint8Array {
  const arr = new Uint8Array(bytes);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(arr);
  } else {
    for (let i = 0; i < bytes; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
  }
  return arr;
}

function phcB64(data: Uint8Array): string {
  let bin = '';
  for (const b of data) bin += String.fromCharCode(b);
  return btoa(bin).replace(/=+$/, '');
}

export async function hashPassword(algorithm: HashAlgorithm, password: string): Promise<string> {
  const salt = randomSalt();
  switch (algorithm) {
    case 'argon2id':
      return argon2id({
        password,
        salt,
        parallelism: 1,
        iterations: 2,
        memorySize: 19456,
        hashLength: 32,
        outputType: 'encoded',
      });
    case 'bcrypt':
      return bcrypt({
        password,
        salt,
        costFactor: 10,
        outputType: 'encoded',
      });
    case 'scrypt': {
      // hash-wasm costFactor is N (power of 2); PHC ln=15 → N=32768
      const hash = await scrypt({
        password,
        salt,
        costFactor: 32768,
        blockSize: 8,
        parallelism: 1,
        hashLength: 32,
        outputType: 'binary',
      });
      return `$scrypt$ln=15,r=8,p=1$${phcB64(salt)}$${phcB64(hash)}`;
    }
    case 'pbkdf2': {
      const hash = await pbkdf2({
        password,
        salt,
        iterations: 29000,
        hashLength: 32,
        hashFunction: createSHA256(),
        outputType: 'binary',
      });
      return `$pbkdf2-sha256$i=29000$${phcB64(salt)}$${phcB64(hash)}`;
    }
  }
}
