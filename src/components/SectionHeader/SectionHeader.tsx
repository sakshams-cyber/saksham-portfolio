import { Eyebrow } from '../Eyebrow/Eyebrow';
import { Reveal } from '../Reveal/Reveal';
import styles from './SectionHeader.module.css';

interface Props {
  id: string;
  num: string;
  eyebrow: string;
  heading?: string;
  /** Rendered visually hidden when the design shows no H2, so the outline stays complete. */
  hiddenHeading?: string;
  lead?: string;
  center?: boolean;
}

export function SectionHeader({ id, num, eyebrow, heading, hiddenHeading, lead, center }: Props) {
  return (
    <header className={`${styles.header} ${center ? styles.center : ''}`}>
      <Reveal>
        <Eyebrow num={num} label={eyebrow} center={center} />
      </Reveal>
      {heading ? (
        <Reveal delay={1}>
          <h2 id={`${id}-title`} className={`${styles.h2} halo`} tabIndex={-1} data-section-heading>
            {heading}
          </h2>
        </Reveal>
      ) : (
        <h2 id={`${id}-title`} className="visually-hidden" tabIndex={-1} data-section-heading>
          {hiddenHeading ?? eyebrow}
        </h2>
      )}
      {lead && (
        <Reveal delay={2}>
          <p className={`${styles.lead} halo`}>{lead}</p>
        </Reveal>
      )}
    </header>
  );
}
