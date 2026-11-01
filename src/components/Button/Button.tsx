import type { LinkItem } from '../../content/types';
import styles from './Button.module.css';

export function Button({ link }: { link: LinkItem }) {
  return (
    <a
      className={styles.button}
      href={link.href}
      {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {link.label}
      {link.external && <span className="visually-hidden"> (opens in new tab)</span>}
    </a>
  );
}
