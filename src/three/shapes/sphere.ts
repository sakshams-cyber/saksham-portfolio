import type { Rand } from './rng';

/** A thick spherical shell: uniform directions, radius in [0.86R, R]. */
export function sphere(n: number, rand: Rand): Float32Array {
  const out = new Float32Array(n * 3);
  const R = 4.6;
  for (let i = 0; i < n; i++) {
    const th = 2 * Math.PI * rand();
    const ph = Math.acos(2 * rand() - 1); // acos makes directions uniform on the sphere
    const r = R * (0.86 + rand() * 0.14);
    out[i * 3] = r * Math.sin(ph) * Math.cos(th);
    out[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
    out[i * 3 + 2] = r * Math.cos(ph);
  }
  return out;
}
