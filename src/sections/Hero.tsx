import { person } from '../content/portfolio';
import type { Section } from '../content/types';
import { Reveal } from '../components/Reveal/Reveal';
import { ScrollCue } from '../components/ScrollCue/ScrollCue';
import styles from './sections.module.css';

export function Hero({ section }: { section: Section }) {
  const [first, ...rest] = person.name.split(' ');
  return (
    <section
      id={section.id}
      aria-labelledby="hero-title"
      data-shape={section.shape}
      data-accent={section.accent}
      className={`${styles.section} ${styles.hero}`}
    >
      <Reveal>
        <p className={styles.kicker}>{person.kicker}</p>
      </Reveal>
      <Reveal delay={1}>
        <h1 id="hero-title" className={styles.h1} tabIndex={-1} data-section-heading>
          <span>{first}</span> <span>{rest.join(' ')}</span>
        </h1>
      </Reveal>
      <Reveal delay={2}>
        <p className={`${styles.tagline} halo`}>{person.tagline}</p>
      </Reveal>
      <Reveal delay={3}>
        <ul className={styles.meta}>
          {person.meta.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      </Reveal>
      <ScrollCue />
    </section>
  );
}
