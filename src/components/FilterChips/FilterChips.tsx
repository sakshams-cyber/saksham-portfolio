import { useRef, type KeyboardEvent } from 'react';
import { store, useStore, type Filter } from '../../state/store';
import styles from './FilterChips.module.css';

const OPTIONS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'built', label: 'Built' },
  { value: 'prepared', label: 'Prepared' },
];

export function setFilter(f: Filter) {
  store.set({ filter: f });
  const url = new URL(location.href);
  if (f === 'all') url.searchParams.delete('level');
  else url.searchParams.set('level', f);
  history.replaceState(history.state, '', url);
}

/** Page-wide confidence filter: a radiogroup with roving tabindex (§6.6, §11). */
export function FilterChips() {
  const filter = useStore((s) => s.filter);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: KeyboardEvent, i: number) => {
    let next = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % OPTIONS.length;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp')
      next = (i - 1 + OPTIONS.length) % OPTIONS.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = OPTIONS.length - 1;
    if (next < 0) return;
    e.preventDefault();
    setFilter(OPTIONS[next].value);
    refs.current[next]?.focus();
  };

  return (
    <div className={styles.wrap}>
      <span className={styles.label} id="filter-label">
        Filter by confidence
      </span>
      <div role="radiogroup" aria-labelledby="filter-label" className={styles.group}>
        {OPTIONS.map((o, i) => {
          const checked = filter === o.value;
          return (
            <button
              key={o.value}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={checked}
              tabIndex={checked ? 0 : -1}
              className={`${styles.chip} ${checked ? styles.checked : ''}`}
              data-value={o.value}
              onClick={() => setFilter(o.value)}
              onKeyDown={(e) => onKey(e, i)}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
