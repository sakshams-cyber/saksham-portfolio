import type { Section } from '../content/types';
import { AwardsTable } from '../components/AwardsTable/AwardsTable';
import { Reveal } from '../components/Reveal/Reveal';
import { SectionHeader } from '../components/SectionHeader/SectionHeader';
import { SectionShell } from './SectionShell';
import styles from './sections.module.css';

export function Awards({ section }: { section: Section }) {
  return (
    <SectionShell section={section}>
      <SectionHeader
        id={section.id}
        num={section.num}
        eyebrow={section.eyebrow}
        heading={section.heading}
      />
      <AwardsTable awards={section.awards ?? []} caption="Awards and recognition" />
      {section.closing && (
        <Reveal>
          <p className={`${styles.closing} halo`}>{section.closing}</p>
        </Reveal>
      )}
    </SectionShell>
  );
}
