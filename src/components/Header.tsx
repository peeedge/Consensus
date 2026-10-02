import { ROUTE_PATHS } from '../hooks/useRoute';
import type { Route } from '../hooks/useRoute';

interface HeaderProps {
  route: Route;
  streakDays: number;
}

const LINKS = [
  { label: 'Today', href: ROUTE_PATHS.today, matches: ['today', 'puzzle'] },
  { label: 'Archive', href: ROUTE_PATHS.archive, matches: ['archive'] },
  { label: 'How to play', href: ROUTE_PATHS.howToPlay, matches: ['how-to-play'] },
] as const;

export function Header({ route, streakDays }: HeaderProps) {
  return (
    <header className="masthead">
      <div className="masthead__brand">
        <a className="masthead__wordmark" href={ROUTE_PATHS.today}>
          Consensus
        </a>
        <p className="masthead__tagline">Daily survey puzzle</p>
      </div>

      <nav className="masthead__nav" aria-label="Sections">
        <ul className="masthead__links">
          {LINKS.map((link) => {
            const current = (link.matches as readonly string[]).includes(route.name);
            return (
              <li key={link.href}>
                <a
                  className="masthead__link"
                  href={link.href}
                  aria-current={current ? 'page' : undefined}
                >
                  {link.label}
                </a>
              </li>
            );
          })}
        </ul>

        {streakDays > 0 ? (
          <p className="masthead__streak">
            <span className="masthead__streak-label">Streak</span>
            <span className="masthead__streak-value">
              {streakDays} {streakDays === 1 ? 'day' : 'days'}
            </span>
          </p>
        ) : null}
      </nav>
    </header>
  );
}
