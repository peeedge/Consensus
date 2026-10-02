import { useCallback, useEffect, useState } from 'react';

/**
 * A minimal hash router. Hash routing keeps the app a static file that can be
 * dropped on any host, while still giving real back-button behaviour and
 * linkable archive puzzles.
 */
export type Route =
  | { name: 'today' }
  | { name: 'archive' }
  | { name: 'how-to-play' }
  | { name: 'puzzle'; id: string };

export const ROUTE_PATHS = {
  today: '#/',
  archive: '#/archive',
  howToPlay: '#/how-to-play',
  puzzle: (id: string) => `#/puzzle/${encodeURIComponent(id)}`,
} as const;

function parseHash(hash: string): Route {
  const path = hash.replace(/^#\/?/, '').replace(/\/$/, '');
  if (path === 'archive') return { name: 'archive' };
  if (path === 'how-to-play') return { name: 'how-to-play' };
  if (path.startsWith('puzzle/')) {
    const id = decodeURIComponent(path.slice('puzzle/'.length));
    if (id) return { name: 'puzzle', id };
  }
  return { name: 'today' };
}

export function useRoute(): [Route, (path: string) => void] {
  const [route, setRoute] = useState<Route>(() =>
    parseHash(typeof window === 'undefined' ? '' : window.location.hash),
  );

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = useCallback((path: string) => {
    if (window.location.hash === path) {
      setRoute(parseHash(path));
      return;
    }
    window.location.hash = path;
  }, []);

  return [route, navigate];
}
