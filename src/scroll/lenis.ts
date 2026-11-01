import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { setScrollImpl } from '../state/store';
import { prefersReducedMotion } from '../utils/prefersReducedMotion';

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;

export function getLenis(): Lenis | null {
  return lenis;
}

/** Smooth inertial scroll that still moves the real window scroll (no scroll-jacking). */
export function initSmoothScroll(): Lenis | null {
  if (prefersReducedMotion()) return null; // native scroll under reduced motion
  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  // Route every in-page jump through Lenis so ScrollTrigger never desyncs (§24.3).
  setScrollImpl((target, { immediate }) => {
    lenis?.scrollTo(target, { offset: target.id === 'top' ? 0 : -56, immediate: !!immediate });
  });
  return lenis;
}
