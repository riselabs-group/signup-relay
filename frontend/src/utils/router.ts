export type RouteKey = 'home' | 'share' | 'apps' | 'docs' | 'community';

export function getRouteFromPath(pathname: string, hash = ''): RouteKey {
  const cleanPath = pathname.replace(/\/+$/, '') || '/';
  const cleanHash = hash.replace(/^#\/?/, '').toLowerCase();

  if (cleanPath === '/share' || cleanPath.endsWith('/share.html') || cleanHash === 'share') return 'share';
  if (cleanPath === '/apps' || cleanPath.endsWith('/apps.html') || cleanHash === 'apps') return 'apps';
  if (cleanPath.startsWith('/docs') || cleanPath.endsWith('/docs.html') || cleanHash.startsWith('docs')) return 'docs';
  if (cleanPath === '/community' || cleanPath.endsWith('/community.html') || cleanHash === 'community') return 'community';
  return 'home';
}

export function getPathForRoute(route: RouteKey): string {
  switch (route) {
    case 'share': return '/share';
    case 'apps': return '/apps';
    case 'docs': return '/docs';
    case 'community': return '/community';
    default: return '/';
  }
}
