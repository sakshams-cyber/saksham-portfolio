import styles from './Eyebrow.module.css';

export function Eyebrow({ num, label, center }: { num: string; label: string; center?: boolean }) {
  return (
    <p className={`${styles.eyebrow} ${center ? styles.center : ''}`}>
      {num && (
        <span className={`${styles.num} num`} aria-hidden="true">
          {num}
        </span>
      )}
      <span className={styles.label}>{label}</span>
    </p>
  );
}
