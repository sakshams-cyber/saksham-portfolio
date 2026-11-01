import styles from './ScrollCue.module.css';

export function ScrollCue() {
  return (
    <div className={styles.cue} aria-hidden="true">
      <span className={styles.label}>scroll</span>
      <span className={styles.line} />
    </div>
  );
}
