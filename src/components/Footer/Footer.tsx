import { footer } from '../../content/portfolio';
import { goToSection } from '../../state/store';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <p>{footer}</p>
      <a
        className={styles.top}
        href="#top"
        onClick={(e) => {
          e.preventDefault();
          goToSection('top');
        }}
      >
        Back to top
      </a>
    </footer>
  );
}
