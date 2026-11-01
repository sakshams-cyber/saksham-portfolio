import { useEffect, useRef } from 'react';
import type { Award } from '../../content/types';
import { useStore } from '../../state/store';
import { Tag } from '../Tag/Tag';
import { whenRevealed } from '../Reveal/whenRevealed';
import styles from './AwardsTable.module.css';

/** Semantic table; rows reveal with a 40ms stagger capped at 400ms (§10.10). */
export function AwardsTable({ awards, caption }: { awards: Award[]; caption: string }) {
  const filter = useStore((s) => s.filter);
  const ref = useRef<HTMLTableElement>(null);

  useEffect(() => {
    const table = ref.current;
    if (!table) return;
    return whenRevealed(table, () => table.classList.add(styles.in), 0.1);
  }, []);

  return (
    <table ref={ref} className={styles.table}>
      <caption className="visually-hidden">{caption}</caption>
      <thead className="visually-hidden">
        <tr>
          <th scope="col">Award</th>
          <th scope="col">Year</th>
          <th scope="col">Confidence</th>
        </tr>
      </thead>
      <tbody>
        {awards.map((a, i) => {
          const dimmed = filter !== 'all' && a.level !== filter;
          return (
            <tr
              key={a.name}
              className={`${styles.row} ${dimmed ? styles.dimmed : ''}`}
              style={{ transitionDelay: `${Math.min(i * 40, 400)}ms` }}
              data-level={a.level}
              data-dimmed={dimmed ? 'true' : 'false'}
            >
              <td className={styles.name}>
                {a.name}
                {a.year && <span className={`${styles.inlineYear} num`}> · {a.year}</span>}
                {dimmed && <span className="visually-hidden"> (filtered out)</span>}
              </td>
              <td className={`${styles.year} num`}>
                {a.year ?? <span aria-label="Year not listed">—</span>}
              </td>
              <td className={styles.tag}>
                <Tag level={a.level} />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
