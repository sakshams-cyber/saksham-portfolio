import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { person, sections } from '../../content/portfolio';
import { goToSection, useStore } from '../../state/store';
import styles from './Nav.module.css';

const navSections = sections.filter((s) => s.navLabel);

/** The nav link to highlight: the active section if it has a link, else the last one above it. */
function activeNavId(activeId: string): string | null {
  const idx = sections.findIndex((s) => s.id === activeId);
  for (let i = idx; i >= 0; i--) if (sections[i].navLabel) return sections[i].id;
  return null;
}

export function Nav() {
  const active = useStore((s) => activeNavId(s.activeSection));
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  // Hide on scroll-down past 120px, show on scroll-up / at top (§9.4).
  useEffect(() => {
    let last = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y < 120) setHidden(false);
        else if (y > last + 4) setHidden(true);
        else if (y < last - 4) setHidden(false);
        last = y;
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Mobile menu: focus trap, Esc closes, focus returns to the button.
  useEffect(() => {
    if (!open) return;
    const el = panel.current;
    const focusables = () =>
      Array.from(el?.querySelectorAll<HTMLElement>('a, button') ?? []).concat(
        menuBtn.current ? [menuBtn.current] : [],
      );
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        menuBtn.current?.focus();
      } else if (e.key === 'Tab') {
        const f = focusables();
        const i = f.indexOf(document.activeElement as HTMLElement);
        e.preventDefault();
        const next = e.shiftKey ? (i - 1 + f.length) % f.length : (i + 1) % f.length;
        f[next]?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const onLink = (e: MouseEvent, id: string) => {
    e.preventDefault();
    setOpen(false);
    goToSection(id);
  };

  const links = (
    <ul className={styles.links}>
      {navSections.map((s) => (
        <li key={s.id}>
          <a
            href={`#${s.id}`}
            className={`${styles.link} ${active === s.id ? styles.active : ''}`}
            aria-current={active === s.id ? 'true' : undefined}
            onClick={(e) => onLink(e, s.id)}
          >
            {s.navLabel}
          </a>
        </li>
      ))}
    </ul>
  );

  return (
    <header className={`${styles.nav} ${hidden && !open ? styles.hidden : ''}`}>
      <a href="#top" className={styles.brand} onClick={(e) => onLink(e, 'top')}>
        <span className={styles.mark} aria-hidden="true" />
        {person.name}
      </a>
      <nav aria-label="Primary" className={styles.primary}>
        <div className={styles.desktop}>{links}</div>
        <button
          ref={menuBtn}
          type="button"
          className={styles.menuBtn}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? 'Close' : 'Menu'}
        </button>
        <div
          id="mobile-menu"
          ref={panel}
          className={`${styles.panel} ${open ? styles.open : ''}`}
          hidden={!open}
        >
          {links}
        </div>
      </nav>
    </header>
  );
}
