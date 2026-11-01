import type { Rand } from './rng';

/** Entrance state: a wide, sparse cloud the particles gather from on first load. */
export function scatter(n: number, rand: Rand): Float32Array {
  const out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const th = 2 * Math.PI * rand();
    const ph = Math.acos(2 * rand() - 1);
    const r = 9 + rand() * 14;
    out[i * 3] = r * Math.sin(ph) * Math.cos(th);
    out[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.7;
    out[i * 3 + 2] = r * Math.cos(ph) * 0.5 - 4;
  }
  return out;
}
