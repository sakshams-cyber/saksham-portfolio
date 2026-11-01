import { sections } from '../../content/portfolio';
import type { Level } from '../../content/types';
import { useStore } from '../../state/store';
import { LEVEL_LABEL } from '../Tag/Tag';
import { setFilter } from '../FilterChips/FilterChips';
import styles from './FilterStatus.module.css';

/** Count of items (cards + award rows) at a level, computed from the data. */
export function countLevel(level: Level): number {
  let n = 0;
  for (const s of sections) {
    for (const p of s.projects ?? []) if (p.level === level) n++;
    for (const a of s.awards ?? []) if (a.level === level) n++;
  }
  return n;
}

/** Polite live-region announcement + sticky "Showing: X · Clear" pill (§10.3, §12). */
export function FilterStatus() {
  const filter = useStore((s) => s.filter);
  const count = filter === 'all' ? 0 : countLevel(filter);
  const message =
    filter === 'all'
      ? ''
      : `Showing ${count} ${LEVEL_LABEL[filter].toLowerCase()} item${count === 1 ? '' : 's'}`;
  return (
    <>
      <div className="visually-hidden" aria-live="polite" data-testid="filter-live">
        {message}
      </div>
      {filter !== 'all' && (
        <div className={styles.pill} data-testid="filter-pill">
          <span>
            Showing: <strong>{LEVEL_LABEL[filter]}</strong>
          </span>
          <button type="button" className={styles.clear} onClick={() => setFilter('all')}>
            Clear<span className="visually-hidden"> confidence filter</span>
          </button>
        </div>
      )}
    </>
  );
}
