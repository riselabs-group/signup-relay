export function generateRandomString(length) {
  const charset = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = new Uint8Array(length);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(bytes[i] % charset.length);
  }
  return result;
}

export function generateRandomCredentials(domain = 'chatchi.org') {
  const username = generateRandomString(12);
  const password = generateRandomString(24);
  return {
    username,
    password,
    email: `${username}@${domain}`,
  };
}

export function buildDcloginUri({
  email,
  password,
  imapHost = 'mail.chatchi.org',
  imapPort = 993,
  imapSecurity = 'ssl',
  smtpHost = 'mail.chatchi.org',
  smtpPort = 465,
  smtpSecurity = 'ssl',
} = {}) {
  if (!email || !password) {
    throw new Error('Email and password are required to build dclogin URI');
  }

  const query = [
    `p=${encodeURIComponent(password)}`,
    'v=1',
    `ih=${encodeURIComponent(imapHost)}`,
    `ip=${imapPort}`,
    `is=${imapSecurity}`,
    `sh=${encodeURIComponent(smtpHost)}`,
    `sp=${smtpPort}`,
    `ss=${smtpSecurity}`,
    'ic=3',
  ].join('&');

  return `dclogin:${email}/?${query}`;
}

export function openDeltaChatUri(dcloginUrl, onFallback, timeoutMs = 2000) {
  if (typeof window === 'undefined') return () => {};

  let opened = false;
  let timer = null;

  const cleanup = () => {
    if (timer) clearTimeout(timer);
    window.removeEventListener('blur', handleBlur);
    document.removeEventListener('visibilitychange', handleVisibility);
  };

  const handleBlur = () => {
    opened = true;
    cleanup();
  };
  const handleVisibility = () => {
    if (document.hidden) {
      opened = true;
      cleanup();
    }
  };

  window.addEventListener('blur', handleBlur, { once: true });
  document.addEventListener('visibilitychange', handleVisibility);

  window.location.href = dcloginUrl;

  timer = setTimeout(() => {
    cleanup();
    if (!opened && typeof onFallback === 'function') {
      onFallback();
    }
  }, timeoutMs);

  return cleanup;
}
