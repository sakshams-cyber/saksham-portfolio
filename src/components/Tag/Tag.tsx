import type { Level } from '../../content/types';
import styles from './Tag.module.css';

export const LEVEL_LABEL: Record<Level, string> = {
  confirmed: 'Confirmed',
  built: 'Built',
  prepared: 'Prepared',
};

/** Confidence tag: a colored square plus the word — never color alone. */
export function Tag({ level }: { level: Level }) {
  return (
    <span className={`${styles.tag} ${styles[level]}`}>
      <span className={styles.dot} aria-hidden="true" />
      <span className="visually-hidden">Confidence: </span>
      {LEVEL_LABEL[level]}
    </span>
  );
}
