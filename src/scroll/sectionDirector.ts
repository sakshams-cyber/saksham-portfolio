import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { sections } from '../content/portfolio';
import type { Section } from '../content/types';
import { store } from '../state/store';
import { engineBridge, type EngineApi } from '../three/bridge';
import { playHeroIntro } from './heroIntro';
import { introEligible, sectionAtViewport } from './initial';

export { initialTarget } from './initial';

gsap.registerPlugin(ScrollTrigger);

let current: Section = sections[0];
let introRunning = false;
let firstPaint = 0;

/** Particle opacity per section kind. Free-standing text (hero, thesis, about) gets a dimmer
 *  field than text on opaque panels; the bird thread is the story's payoff, so it's brightest.
 *  The settled name sits behind the H1, so the hero dims it to a backdrop (see DECISIONS). */
const OPACITY: Record<Section['kind'], number> = {
  hero: 0.55,
  thesis: 0.45,
  cards: 0.6,
  habit: 0.6,
  thread: 0.75,
  awards: 0.6,
  contact: 0.4,
};

/** Push the active section to the particles (unless the intro owns them right now). */
function applyEngine(api: EngineApi | null, immediate = false) {
  if (!api || introRunning) return;
  api.setTarget(current.shape, current.accent, { immediate });
  api.setOpacity(OPACITY[current.kind], { duration: immediate ? 0 : 1.2 });
}

/** Section becomes active: morph, recolour the UI, sync the nav (§9.3). */
function activate(section: Section, immediate = false) {
  current = section;
  document.documentElement.style.setProperty('--accent', section.accent);
  store.set({ activeSection: section.id, accent: section.accent });
  applyEngine(engineBridge.get(), immediate);
}

function fcpTime(): number {
  const e = performance.getEntriesByName('first-contentful-paint')[0];
  return e ? e.startTime : performance.now();
}

export function initSectionDirector(): () => void {
  firstPaint = fcpTime();
  const triggers = sections.map((s) => {
    const el = document.getElementById(s.id)!;
    // Centre-line handoff: a section is active while it crosses the viewport's middle. Adjacent
    // sections share a boundary, so exactly one is active at a time (see DECISIONS).
    return ScrollTrigger.create({
      trigger: el,
      start: 'top 50%',
      end: 'bottom 50%',
      onToggle: (self) => {
        if (self.isActive) activate(s);
      },
    });
  });

  // Whatever is on screen at boot (deep links included) activates without animation.
  activate(sectionAtViewport(), true);

  const offReady = engineBridge.onReady((api) => {
    const late = performance.now() - firstPaint > 1500;
    const engine = api as EngineApi & { armPerfMonitor?: () => void };
    if (introEligible() && !late && current.kind === 'hero') {
      introRunning = true;
      playHeroIntro(api, () => {
        introRunning = false;
        applyEngine(api);
        engine.armPerfMonitor?.();
      });
    } else {
      applyEngine(api);
      window.setTimeout(() => engine.armPerfMonitor?.(), 2000);
    }
  });

  // Layout can move after fonts load or the engine mounts: re-measure, then re-evaluate.
  let resizeTimer = 0;
  const refresh = () => {
    ScrollTrigger.refresh();
    activate(sectionAtViewport());
  };
  const onResize = () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(refresh, 150);
  };
  window.addEventListener('resize', onResize);
  void document.fonts?.ready.then(refresh);
  const onPageShow = (e: PageTransitionEvent) => e.persisted && refresh();
  window.addEventListener('pageshow', onPageShow);

  return () => {
    triggers.forEach((t) => t.kill());
    offReady();
    window.removeEventListener('resize', onResize);
    window.removeEventListener('pageshow', onPageShow);
  };
}
