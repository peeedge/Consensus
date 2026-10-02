import { ROUTE_PATHS } from '../hooks/useRoute';
import { MISS_LIMIT, POSITION_POINTS } from '../lib/gameLogic';
import { useGameState } from '../state/context';

export function HowToPlay() {
  const { settings, updateSettings, resetEverything, streak } = useGameState();

  return (
    <section className="how" aria-labelledby="how-heading">
      <header className="page-header">
        <h1 className="page-header__title" id="how-heading">
          How to play
        </h1>
        <p className="page-header__lede">
          Consensus is not a trivia game. There is no single right answer &mdash; only the answers
          most people gave.
        </p>
      </header>

      <section className="how__section">
        <h2 className="how__heading">The idea</h2>
        <p>
          Each day one question went out to a hypothetical survey of 100 people. Six to eight
          responses made the board. Your job is to predict which ones, starting with the most
          popular.
        </p>
        <p>
          The question to ask yourself is never &ldquo;what is true?&rdquo; but &ldquo;what would
          everyone else say?&rdquo;
        </p>
      </section>

      <section className="how__section">
        <h2 className="how__heading">Guessing</h2>
        <ul className="how__list">
          <li>
            You get {MISS_LIMIT} misses. Only answers that are not on the board count against
            you.
          </li>
          <li>
            A correct answer costs nothing, so a good run can go on as long as you keep reading
            the crowd.
          </li>
          <li>Naming something you already found is free too &mdash; just guess again.</li>
          <li>
            You do not need the exact wording. Plurals, spacing, small typos and common synonyms
            are accepted, so &ldquo;cell phone charger&rdquo; finds &ldquo;phone charger.&rdquo;
          </li>
          <li>The round ends on your third miss, or when you clear the board.</li>
        </ul>
      </section>

      <section className="how__section">
        <h2 className="how__heading">Scoring</h2>
        <p>
          Higher positions are worth more, because predicting the crowd&rsquo;s first instinct is
          the harder trick. Clearing the whole board is a perfect round.
        </p>
        <ol className="how__points">
          {POSITION_POINTS.map((points, index) => (
            <li key={points} className="how__point">
              <span className="how__rank">{String(index + 1).padStart(2, '0')}</span>
              <span className="how__dots" aria-hidden="true" />
              <span className="how__value">{points}</span>
            </li>
          ))}
        </ol>
        <p>
          You are also shown your <em>consensus</em> score: the share of the 100 responses your
          answers account for. Four modest answers can be worth less than one everybody gave.
        </p>
      </section>

      <section className="how__section">
        <h2 className="how__heading">Streak &amp; progress</h2>
        <p>
          Finishing the day&rsquo;s puzzle extends your streak; missing a day resets it. Archive
          puzzles are there to play at your leisure and do not affect it. Everything is stored on
          this device only.
        </p>
        <p className="how__stat">
          Longest streak: <strong>{streak.longest}</strong>{' '}
          {streak.longest === 1 ? 'day' : 'days'}
        </p>
      </section>

      <section className="how__section">
        <h2 className="how__heading">Settings</h2>
        <div className="how__setting">
          <input
            id="reduce-motion"
            type="checkbox"
            checked={settings.reduceMotion}
            onChange={(event) => updateSettings({ reduceMotion: event.target.checked })}
          />
          <label htmlFor="reduce-motion">
            Reduce motion
            <span className="how__setting-note">
              Turns off reveal animations. Your system setting is respected either way.
            </span>
          </label>
        </div>

        <ResetControl onReset={resetEverything} />
      </section>

      <p className="how__back">
        <a className="link" href={ROUTE_PATHS.today}>
          Back to today&rsquo;s puzzle
        </a>
      </p>
    </section>
  );
}

function ResetControl({ onReset }: { onReset: () => void }) {
  return (
    <details className="how__danger">
      <summary>Clear saved progress</summary>
      <p>
        This erases every score, your streak and all puzzle progress on this device. It cannot be
        undone.
      </p>
      <button type="button" className="button button--quiet" onClick={onReset}>
        Erase everything
      </button>
    </details>
  );
}
