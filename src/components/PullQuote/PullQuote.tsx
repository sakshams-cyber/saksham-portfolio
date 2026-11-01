import type { Highlighted } from '../../content/types';
import styles from './PullQuote.module.css';

export function PullQuote({ quote, className }: { quote: Highlighted; className?: string }) {
  return (
    <p className={`${styles.pull} halo ${className ?? ''}`}>
      {quote.before}
      <em className="hl">{quote.highlight}</em>
      {quote.after}
    </p>
  );
}
