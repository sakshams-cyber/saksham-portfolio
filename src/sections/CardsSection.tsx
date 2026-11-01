import type { Section } from '../content/types';
import { Card } from '../components/Card/Card';
import { FilterChips } from '../components/FilterChips/FilterChips';
import { Reveal } from '../components/Reveal/Reveal';
import { SectionHeader } from '../components/SectionHeader/SectionHeader';
import { SectionShell } from './SectionShell';
import styles from './sections.module.css';

/** Generic renderer for every card-grid section (research, building, voice, advocacy, leading). */
export function CardsSection({ section }: { section: Section }) {
  const projects = section.projects ?? [];
  return (
    <SectionShell section={section}>
      <SectionHeader
        id={section.id}
        num={section.num}
        eyebrow={section.eyebrow}
        heading={section.heading}
        lead={section.lead}
      />
      {section.showFilter && (
        <Reveal delay={2}>
          <FilterChips />
        </Reveal>
      )}
      <div className={styles.grid}>
        {projects.map((p, i) => (
          <Card key={p.id} project={p} delay={(i % 3) as 0 | 1 | 2} />
        ))}
      </div>
    </SectionShell>
  );
}
