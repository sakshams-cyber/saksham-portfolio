import { initSmoothScroll } from './lenis';
import { initSectionDirector } from './sectionDirector';

/** Entry for the lazily loaded orchestration chunk (gsap + ScrollTrigger + Lenis). */
export function initOrchestration(): void {
  initSmoothScroll();
  initSectionDirector();
}
