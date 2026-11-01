import { lazy, Suspense, useEffect, useState } from 'react';
import { sections } from './content/portfolio';
import type { Section } from './content/types';
import { LEVELS } from './content/types';
import { Footer } from './components/Footer/Footer';
import { FilterStatus } from './components/FilterStatus/FilterStatus';
import { Nav } from './components/Nav/Nav';
import { ProgressBar } from './components/ProgressBar/ProgressBar';
import { SkipLink } from './components/SkipLink/SkipLink';
import { StaticBackdrop } from './components/StaticBackdrop/StaticBackdrop';
import { About } from './sections/About';
import { Awards } from './sections/Awards';
import { BirdThread } from './sections/BirdThread';
import { CardsSection } from './sections/CardsSection';
import { Habit } from './sections/Habit';
import { Hero } from './sections/Hero';
import { Thesis } from './sections/Thesis';
import { store, type Filter } from './state/store';
import { webglSupported } from './three/webgl-support';
import { flags } from './utils/params';
import { prefersReducedMotion } from './utils/prefersReducedMotion';

const ParticleField = lazy(() => import('./three/ParticleField'));

function renderSection(s: Section) {
  switch (s.kind) {
    case 'hero':
      return <Hero key={s.id} section={s} />;
    case 'thesis':
      return <Thesis key={s.id} section={s} />;
    case 'cards':
      return <CardsSection key={s.id} section={s} />;
    case 'habit':
      return <Habit key={s.id} section={s} />;
    case 'thread':
      return <BirdThread key={s.id} section={s} />;
    case 'awards':
      return <Awards key={s.id} section={s} />;
    case 'contact':
      return <About key={s.id} section={s} />;
  }
}

/** Scroll progress → transform: scaleX (compositor-only). Works with Lenis or native scroll. */
function useProgressBar() {
  useEffect(() => {
    const bar = document.getElementById('progress');
    if (!bar) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
}

export function App() {
  const [mountEngine, setMountEngine] = useState(false);
  useProgressBar();

  useEffect(() => {
    // Restore ?level= after hydration (the server always renders "all").
    const level = new URLSearchParams(location.search).get('level');
    if (level && (LEVELS as readonly string[]).includes(level))
      store.set({ filter: level as Filter });

    // Deep links: the browser's own jump can happen before layout settles (and always misses in
    // dev, where nothing is pre-rendered), so land on the section explicitly.
    const hashTarget = location.hash.length > 1 && document.getElementById(location.hash.slice(1));
    if (hashTarget)
      window.scrollTo(0, hashTarget.getBoundingClientRect().top + window.scrollY - 56);

    const reduce = prefersReducedMotion();
    const canRender = !flags.forceStatic && !reduce && webglSupported();
    if (!canRender) store.set({ engineStatus: 'static' });

    // Everything below is deferred past first paint: text never waits on JS animation.
    const start = () => {
      void import('./scroll/orchestrate').then((m) => m.initOrchestration());
      if (canRender) setMountEngine(true);
    };
    const t = window.setTimeout(start, 0);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <>
      <SkipLink />
      <ProgressBar />
      <Nav />
      <StaticBackdrop />
      {mountEngine && (
        <Suspense fallback={null}>
          <ParticleField />
        </Suspense>
      )}
      <main id="main" tabIndex={-1}>
        {sections.map(renderSection)}
      </main>
      <Footer />
      <FilterStatus />
    </>
  );
}
