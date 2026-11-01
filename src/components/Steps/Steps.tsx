import type { Step } from '../../content/types';
import { Reveal } from '../Reveal/Reveal';
import styles from './Steps.module.css';

export function Steps({ steps }: { steps: Step[] }) {
  return (
    <ol className={styles.steps}>
      {steps.map((s, i) => (
        <Reveal as="li" key={s.key} delay={(i + 1) as 1 | 2 | 3} className={styles.step}>
          <span className={`${styles.key} num`}>{s.key}</span>
          <p className={styles.text}>{s.text}</p>
        </Reveal>
      ))}
    </ol>
  );
}
