import styles from './ProgressBar.module.css';

/** Decorative scroll progress. Width is driven by transform: scaleX from scroll/lenis.ts. */
export function ProgressBar() {
  return <div className={styles.bar} id="progress" aria-hidden="true" />;
}
