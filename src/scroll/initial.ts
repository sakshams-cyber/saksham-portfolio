import { sections } from '../content/portfolio';
import type { Section, ShapeKey } from '../content/types';
import { flags } from '../utils/params';

/** The section under the viewport's vertical centre (the same line ScrollTrigger uses). */
export function sectionAtViewport(): Section {
  const mid = window.innerHeight / 2;
  for (const s of sections) {
    const r = document.getElementById(s.id)?.getBoundingClientRect();
    if (r && r.top <= mid && r.bottom > mid) return s;
  }
  return window.scrollY < 10 ? sections[0] : sections[sections.length - 1];
}

/** The hero intro only plays at the very top, on a plain load, when not disabled. */
export function introEligible(): boolean {
  return !flags.nointro && !location.hash && window.scrollY < 10;
}

/** Where the engine should start: undefined = the scattered entrance cloud (intro plays). */
export function initialTarget(): { shape: ShapeKey; accent: string } | undefined {
  if (introEligible()) return undefined;
  const s = sectionAtViewport();
  return { shape: s.shape, accent: s.accent };
}
