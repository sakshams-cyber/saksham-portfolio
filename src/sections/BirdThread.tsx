import type { Section } from '../content/types';
import { PullQuote } from '../components/PullQuote/PullQuote';
import { Reveal } from '../components/Reveal/Reveal';
import { SectionHeader } from '../components/SectionHeader/SectionHeader';
import { ThreadRow } from '../components/ThreadRow/ThreadRow';
import { SectionShell } from './SectionShell';

export function BirdThread({ section }: { section: Section }) {
  return (
    <SectionShell section={section}>
      <SectionHeader id={section.id} num={section.num} eyebrow={section.eyebrow} />
      <Reveal delay={1}>
        <PullQuote quote={section.pull!} />
      </Reveal>
      <ThreadRow nodes={section.nodes ?? []} />
    </SectionShell>
  );
}
