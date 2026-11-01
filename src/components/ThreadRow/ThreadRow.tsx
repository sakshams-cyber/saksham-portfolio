import type { ThreadNode } from '../../content/types';
import { Reveal } from '../Reveal/Reveal';
import styles from './ThreadRow.module.css';

/** Four fields joined by one line — the line draws itself as the nodes reveal (§10.9). */
export function ThreadRow({ nodes }: { nodes: ThreadNode[] }) {
  return (
    <div className={styles.wrap}>
      <Reveal className={styles.lineReveal}>
        <span className={styles.line} aria-hidden="true" />
      </Reveal>
      <ol className={styles.row}>
        {nodes.map((n, i) => (
          <Reveal as="li" key={n.title} delay={(i + 1) as 1 | 2 | 3 | 4} className={styles.node}>
            <span className={styles.dot} aria-hidden="true" />
            <span className={styles.field}>{n.field}</span>
            <h3 className={styles.title}>{n.title}</h3>
            <p className={styles.text}>{n.text}</p>
          </Reveal>
        ))}
      </ol>
    </div>
  );
}
