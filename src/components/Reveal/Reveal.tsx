import { createElement, useEffect, useRef, type ReactNode } from 'react';

type Tag = 'div' | 'p' | 'li' | 'span' | 'h2' | 'header' | 'tr';

// One shared observer for every Reveal on the page: cheaper than one per element.
let observer: IntersectionObserver | null = null;
function getObserver(): IntersectionObserver | null {
  if (typeof IntersectionObserver === 'undefined') return null;
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          observer?.unobserve(e.target);
        }
      }
    },
    { threshold: 0.18, rootMargin: '0px 0px -8% 0px' },
  );
  return observer;
}

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
    const io = getObserver();
    if (!el) return;
    if (!io) {
      el.classList.add('in');
      return;
    }
    io.observe(el);
    return () => io.unobserve(el);
  }, []);
  const cls = ['reveal', delay ? `d${delay}` : '', className ?? ''].filter(Boolean).join(' ');
  return createElement(as, { ref, className: cls, id }, children);
}
