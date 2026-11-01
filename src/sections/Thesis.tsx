import type { Section } from '../content/types';
import { SectionHeader } from '../components/SectionHeader/SectionHeader';
import { Reveal } from '../components/Reveal/Reveal';
import { StatRow } from '../components/StatRow/StatRow';
import { SectionShell } from './SectionShell';
import styles from './sections.module.css';

export function Thesis({ section }: { section: Section }) {
  const st = section.statement!;
  return (
    <SectionShell section={section}>
      <div className={styles.center}>
        <SectionHeader id={section.id} num={section.num} eyebrow={section.eyebrow} center />
        <Reveal delay={1}>
          <p className={`${styles.statement} halo`}>
            {st.before}
            <em className="hl">{st.highlight}</em>
            {st.after}
          </p>
        </Reveal>
        <StatRow stats={section.stats ?? []} />
      </div>
    </SectionShell>
  );
}
