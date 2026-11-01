import type { Section } from '../content/types';
import { PullQuote } from '../components/PullQuote/PullQuote';
import { Reveal } from '../components/Reveal/Reveal';
import { SectionHeader } from '../components/SectionHeader/SectionHeader';
import { Steps } from '../components/Steps/Steps';
import { SectionShell } from './SectionShell';
import styles from './sections.module.css';

export function Habit({ section }: { section: Section }) {
  return (
    <SectionShell section={section}>
      <SectionHeader id={section.id} num={section.num} eyebrow={section.eyebrow} />
      <Reveal delay={1} className={styles.panel}>
        <PullQuote quote={section.pull!} />
        <Steps steps={section.steps ?? []} />
      </Reveal>
    </SectionShell>
  );
}
