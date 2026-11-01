import { useEffect, useRef } from 'react';
import type { Stat } from '../../content/types';
import { Reveal } from '../Reveal/Reveal';
import { whenRevealed } from '../Reveal/whenRevealed';
import styles from './StatRow.module.css';

const fmt = new Intl.NumberFormat('en-US');

/** Counts the number up from 0 when it scrolls into view, only when motion is allowed.
 *  The server-rendered text is already the final value, so without JS it's correct. */
function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    const target = Number(value.replace(/,/g, ''));
    if (!el || !Number.isFinite(target) || !document.documentElement.classList.contains('motion'))
      return;
    let raf = 0;
    el.textContent = '0';
    const stop = whenRevealed(
      el,
      () => {
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / 800);
          const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
          // At t = 1 write the original string so the final value matches the data exactly.
          el.textContent = t < 1 ? fmt.format(Math.round(target * eased)) : value;
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      0.4,
    );
    return () => {
      stop();
      cancelAnimationFrame(raf);
      el.textContent = value;
    };
  }, [value]);
  return (
    <span ref={ref} className={`${styles.value} num`}>
      {value}
    </span>
  );
}

export function StatRow({ stats }: { stats: Stat[] }) {
  return (
    <ul className={`${styles.row} halo`}>
      {stats.map((s, i) => (
        <Reveal
          as="li"
          key={s.label}
          delay={(Math.min(i, 3) + 1) as 1 | 2 | 3 | 4}
          className={styles.stat}
        >
          <CountUp value={s.value} />
          <span className={styles.label}>{s.label}</span>
        </Reveal>
      ))}
    </ul>
  );
}
