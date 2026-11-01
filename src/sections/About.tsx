import { person } from '../content/portfolio';
import type { Section } from '../content/types';
import { Button } from '../components/Button/Button';
import { Reveal } from '../components/Reveal/Reveal';
import { SectionHeader } from '../components/SectionHeader/SectionHeader';
import { SectionShell } from './SectionShell';
import styles from './sections.module.css';

export function About({ section }: { section: Section }) {
  const links = section.links ?? person.links;
  return (
    <SectionShell section={section}>
      <div className={styles.center}>
        <SectionHeader
          id={section.id}
          num={section.num}
          eyebrow={section.eyebrow}
          heading={section.heading}
          lead={section.lead}
          center
        />
        <Reveal delay={3}>
          <div className={styles.links}>
            {links.map((l) => (
              <Button key={l.label} link={l} />
            ))}
          </div>
        </Reveal>
      </div>
    </SectionShell>
  );
}
