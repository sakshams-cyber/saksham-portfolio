import type { Project } from '../../content/types';
import { useStore } from '../../state/store';
import { Reveal } from '../Reveal/Reveal';
import { Tag } from '../Tag/Tag';
import styles from './Card.module.css';

export function Card({ project, delay = 0 }: { project: Project; delay?: 0 | 1 | 2 | 3 | 4 }) {
  const filter = useStore((s) => s.filter);
  const dimmed = filter !== 'all' && project.level !== filter;
  const titleId = `card-${project.id}`;
  return (
    <Reveal delay={delay} className={project.feature ? styles.featureCell : undefined}>
      <article
        className={`${styles.card} ${project.feature ? styles.feature : ''} ${dimmed ? styles.dimmed : ''}`}
        aria-labelledby={titleId}
        data-level={project.level}
        data-dimmed={dimmed ? 'true' : 'false'}
      >
        <span className={styles.bar} aria-hidden="true" />
        <div className={styles.head}>
          <h3 id={titleId} className={styles.title}>
            {project.title}
            {dimmed && <span className="visually-hidden"> (filtered out)</span>}
          </h3>
          <Tag level={project.level} />
        </div>
        <p className={styles.role}>{project.role}</p>
        {project.intro && <p className={styles.intro}>{project.intro}</p>}
        <ul className={styles.bullets}>
          {project.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
        {project.note && <p className={styles.note}>{project.note}</p>}
      </article>
    </Reveal>
  );
}
