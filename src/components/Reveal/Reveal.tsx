import { createElement, useEffect, useRef, type ReactNode } from 'react';
import { whenRevealed } from './whenRevealed';

type Tag = 'div' | 'p' | 'li' | 'span' | 'h2' | 'header' | 'tr';

interface Props {
  children: ReactNode;
  delay?: 0 | 1 | 2 | 3 | 4;
  as?: Tag;
  className?: string;
  id?: string;
}

/** Fades/lifts children in once when they enter the viewport (§6.6). Under reduced motion or
 *  without JS the `.reveal` class has no effect, so content is visible from the start. */
export function Reveal({ children, delay = 0, as = 'div', className, id }: Props) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return whenRevealed(el, () => el.classList.add('in'));
  }, []);
  const cls = ['reveal', delay ? `d${delay}` : '', className ?? ''].filter(Boolean).join(' ');
  return createElement(as, { ref, className: cls, id }, children);
}
