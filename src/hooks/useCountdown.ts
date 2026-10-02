import { useEffect, useState } from 'react';

import { formatCountdown, msUntilNextDay } from '../lib/dateUtils';

/**
 * Live `H:MM:SS` until the next puzzle unlocks at local midnight.
 *
 * The remaining time is read from the clock during render rather than stored,
 * so it stays correct even if a tick is dropped while the tab is backgrounded.
 */
export function useCountdownToNextPuzzle(active: boolean): string {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => setTick((tick) => tick + 1), 1000);
    return () => window.clearInterval(timer);
  }, [active]);

  return formatCountdown(msUntilNextDay());
}
