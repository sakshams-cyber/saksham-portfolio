import { gsap } from 'gsap';
import type { ShapeKey } from '../content/types';
import type { EngineApi } from '../three/bridge';

/** The story in eight seconds: where it started, the research, the app, the person (§9.2). */
export const INTRO: { at: number; shape: ShapeKey; accent: string }[] = [
  { at: 0, shape: 'bird', accent: '#8bd4ff' },
  { at: 2.6, shape: 'helix', accent: '#35dca0' },
  { at: 5.2, shape: 'wave', accent: '#ffae45' },
  { at: 7.8, shape: 'name', accent: '#8bd4ff' },
];

const YIELD_KEYS = new Set(['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'End', 'Home']);

/**
 * Plays the intro on the particles only — the DOM accent stays the hero's, so the UI doesn't
 * flash four colours on load. Yields on the first user scroll input. Returns a cancel function.
 */
export function playHeroIntro(api: EngineApi, onEnd: (yielded: boolean) => void): () => void {
  let ended = false;
  const tl = gsap.timeline({ onComplete: () => finish(false) });
  for (const step of INTRO) tl.call(() => api.setTarget(step.shape, step.accent), [], step.at);
  // Let the final morph land before handing control back.
  tl.to({}, { duration: 1.8 });

  const onInput = (e: Event) => {
    if (e instanceof KeyboardEvent && !YIELD_KEYS.has(e.key)) return;
    finish(true);
  };
  const onScroll = () => {
    if (window.scrollY > 4) finish(true);
  };
  const opts = { passive: true } as const;
  window.addEventListener('wheel', onInput, opts);
  window.addEventListener('touchmove', onInput, opts);
  window.addEventListener('keydown', onInput);
  window.addEventListener('scroll', onScroll, opts);

  function finish(yielded: boolean) {
    if (ended) return;
    ended = true;
    tl.kill();
    window.removeEventListener('wheel', onInput);
    window.removeEventListener('touchmove', onInput);
    window.removeEventListener('keydown', onInput);
    window.removeEventListener('scroll', onScroll);
    onEnd(yielded);
  }
  return () => finish(true);
}
