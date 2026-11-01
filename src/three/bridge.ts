import type { ShapeKey } from '../content/types';
import type { SetTargetOptions } from './morph';

/** What the lazily loaded engine exposes to the scroll orchestration (initial bundle). */
export interface EngineApi {
  setTarget(shape: ShapeKey, accent: string, opts?: SetTargetOptions): void;
  setOpacity(value: number, opts?: { duration?: number }): void;
}

let api: EngineApi | null = null;
const waiters = new Set<(a: EngineApi) => void>();

export const engineBridge = {
  get(): EngineApi | null {
    return api;
  },
  register(a: EngineApi | null) {
    api = a;
    if (a) waiters.forEach((w) => w(a));
  },
  /** Calls fn now if the engine is ready, and again on every later (re-)registration. */
  onReady(fn: (a: EngineApi) => void): () => void {
    waiters.add(fn);
    if (api) fn(api);
    return () => waiters.delete(fn);
  },
};
