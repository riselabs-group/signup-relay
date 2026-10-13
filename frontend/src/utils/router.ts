export type RouteKey = 'home' | 'share' | 'apps' | 'docs';

export function getRouteFromPath(pathname: string, hash = ''): RouteKey {
  const cleanPath = pathname.replace(/\/+$/, '') || '/';
  const cleanHash = hash.replace(/^#\/?/, '').toLowerCase();

  if (cleanPath === '/share' || cleanPath.endsWith('/share.html') || cleanHash === 'share') return 'share';
  if (cleanPath === '/apps' || cleanPath.endsWith('/apps.html') || cleanHash === 'apps') return 'apps';
  if (cleanPath.startsWith('/docs') || cleanPath.endsWith('/docs.html') || cleanHash.startsWith('docs')) return 'docs';
  return 'home';
}

export function getPathForRoute(route: RouteKey): string {
  switch (route) {
    case 'share': return '/share';
    case 'apps': return '/apps';
    case 'docs': return '/docs';
    default: return '/';
  }
}
