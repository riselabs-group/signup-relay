export function getAbsoluteXdcUrl(
  relPath: string,
  origin: string = typeof window !== 'undefined' ? window.location?.origin : 'https://chatchi.org'
): string {
  try {
    return new URL(relPath, origin || 'https://chatchi.org').href;
  } catch {
    return relPath;
  }
}

export function sendXdcToChat(
  event: React.SyntheticEvent | Event | null | undefined,
  relPath: string
): void {
  if (event) {
    if (typeof event.preventDefault === 'function') event.preventDefault();
    if (typeof event.stopPropagation === 'function') event.stopPropagation();
  }
  const fullUrl = getAbsoluteXdcUrl(relPath);
  try {
    const parsed = new URL(fullUrl);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return;
    }
  } catch {
    return;
  }
  if (typeof window !== 'undefined' && window.location?.assign) {
    window.location.assign(fullUrl);
  }
}
