import type { ReactNode } from 'react';
import type { Section } from '../content/types';
import styles from './sections.module.css';

/** Shared <section> wrapper: id, heading link, and the data attributes the director reads. */
export function SectionShell({ section, children }: { section: Section; children: ReactNode }) {
  return (
    <section
      id={section.id}
      aria-labelledby={`${section.id}-title`}
      data-shape={section.shape}
      data-accent={section.accent}
      className={styles.section}
    >
      <div className={styles.container}>{children}</div>
    </section>
  );
}
