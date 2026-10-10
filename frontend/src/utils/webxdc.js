// ponytail: window.location.assign triggers native webview navigation; upgrade to jsbridge if app provides one

export function getAbsoluteXdcUrl(relPath, origin = (typeof window !== 'undefined' ? window.location?.origin : 'https://chatchi.org')) {
  try {
    return new URL(relPath, origin || 'https://chatchi.org').href;
  } catch (_) {
    return relPath;
  }
}

/**
 * DeltaChat App Picker on Android & iOS WebViews has no window-open handler.
 * Same-window navigation triggers native shouldOverrideUrlLoading (Android)
 * and WKNavigationDelegate (iOS) to intercept the .xdc MIME package and attach it to chat.
 */
export function sendXdcToChat(event, relPath) {
  if (event) {
    if (typeof event.preventDefault === 'function') event.preventDefault();
    if (typeof event.stopPropagation === 'function') event.stopPropagation();
  }
  const fullUrl = getAbsoluteXdcUrl(relPath);
  if (typeof window !== 'undefined' && window.location?.assign) {
    window.location.assign(fullUrl);
  }
}
