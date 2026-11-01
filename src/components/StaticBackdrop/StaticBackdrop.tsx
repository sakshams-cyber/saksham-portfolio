import styles from './StaticBackdrop.module.css';

/** Non-WebGL background: always rendered under the canvas, so first paint, reduced motion,
 *  WebGL-off and context loss all look complete. */
export function StaticBackdrop() {
  return <div className={styles.backdrop} aria-hidden="true" data-testid="static-backdrop" />;
}
