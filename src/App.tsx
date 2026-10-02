import { useEffect, useMemo } from 'react';

import { Archive } from './components/Archive';
import { DailyPuzzle } from './components/DailyPuzzle';
import { Header } from './components/Header';
import { HowToPlay } from './components/HowToPlay';
import { getPuzzleById, getPuzzleForDate } from './data/puzzleRepository';
import { ROUTE_PATHS, useRoute } from './hooks/useRoute';
import { useGameState } from './state/context';

function NotFound() {
  return (
    <section className="empty-page">
      <h1 className="page-header__title">That puzzle is not here</h1>
      <p className="empty-state">
        The edition you asked for does not exist, or has not run yet.
      </p>
      <p>
        <a className="link" href={ROUTE_PATHS.today}>
          Go to today&rsquo;s puzzle
        </a>
      </p>
    </section>
  );
}

export default function App() {
  const [route] = useRoute();
  const { today, streakDays, settings } = useGameState();

  const todaysPuzzle = useMemo(() => getPuzzleForDate(today), [today]);
  const routedPuzzle = useMemo(
    () => (route.name === 'puzzle' ? getPuzzleById(route.id) : null),
    [route],
  );

  // Let CSS honour the in-app preference the same way it honours the OS one.
  useEffect(() => {
    document.documentElement.dataset.reduceMotion = settings.reduceMotion ? 'true' : 'false';
  }, [settings.reduceMotion]);

  // Each view is its own page as far as scroll position is concerned.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [route]);

  return (
    <div className="app">
      <a className="skip-link" href="#main">
        Skip to puzzle
      </a>

      <div className="shell">
        <Header route={route} streakDays={streakDays} />

        <main className="main" id="main" tabIndex={-1}>
          {route.name === 'archive' ? <Archive /> : null}
          {route.name === 'how-to-play' ? <HowToPlay /> : null}
          {route.name === 'today' ? (
            <DailyPuzzle key={todaysPuzzle.id} puzzle={todaysPuzzle} />
          ) : null}
          {route.name === 'puzzle' ? (
            routedPuzzle ? (
              <DailyPuzzle key={routedPuzzle.id} puzzle={routedPuzzle} />
            ) : (
              <NotFound />
            )
          ) : null}
        </main>

        <footer className="colophon">
          <p>Consensus &mdash; a daily puzzle about what everyone else would say.</p>
          <p className="colophon__fine">
            Survey figures are written for the puzzle, not collected from real respondents.
          </p>
        </footer>
      </div>
    </div>
  );
}
