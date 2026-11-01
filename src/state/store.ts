import { useSyncExternalStore } from 'react';
import type { Level } from '../content/types';

export type Filter = 'all' | Level;
export type EngineStatus = 'idle' | 'loading' | 'running' | 'lost' | 'static';

export interface State {
  activeSection: string;
  accent: string;
  filter: Filter;
  engineStatus: EngineStatus;
}

type Listener = () => void;

/** A deliberately tiny store: one state object, shallow merges, subscribers notified per set. */
function createStore(initial: State) {
  let state = initial;
  const listeners = new Set<Listener>();
  return {
    get: () => state,
    set(patch: Partial<State>) {
      let changed = false;
      for (const k of Object.keys(patch) as (keyof State)[]) {
        if (state[k] !== patch[k]) changed = true;
      }
      if (!changed) return;
      state = { ...state, ...patch };
      listeners.forEach((l) => l());
    },
    subscribe(l: Listener) {
      listeners.add(l);
      return () => listeners.delete(l);
    },
  };
}

export const store = createStore({
  activeSection: 'top',
  accent: '#8bd4ff',
  filter: 'all',
  engineStatus: 'idle',
});

export function useStore<T>(select: (s: State) => T): T {
  return useSyncExternalStore(
    store.subscribe,
    () => select(store.get()),
    () => select(store.get()),
  );
}

/**
 * Scrolling to a section. Starts as native scrolling; the orchestration chunk swaps in a Lenis
 * implementation once it loads, so nav links never bypass smooth scroll (§24.3).
 */
type ScrollImpl = (target: HTMLElement, opts: { immediate?: boolean }) => void;
let scrollImpl: ScrollImpl = (target, { immediate }) => {
  const smooth = !immediate && !document.documentElement.classList.contains('reduce');
  const y = target.getBoundingClientRect().top + window.scrollY - (target.id === 'top' ? 0 : 56);
  window.scrollTo({ top: Math.max(0, y), behavior: smooth ? 'smooth' : 'auto' });
};
export function setScrollImpl(fn: ScrollImpl) {
  scrollImpl = fn;
}

/** Scroll to a section by id, update the hash, and move focus to its heading. */
export function goToSection(id: string, opts: { immediate?: boolean } = {}) {
  const el = document.getElementById(id);
  if (!el) return;
  scrollImpl(el, opts);
  if (id === 'top') history.replaceState(null, '', location.pathname + location.search);
  else history.replaceState(null, '', `#${id}`);
  const heading = el.querySelector<HTMLElement>('[data-section-heading]');
  heading?.focus({ preventScroll: true });
}
