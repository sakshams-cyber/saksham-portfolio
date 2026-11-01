import type { Rand } from './rng';

/** A horizontal orbit/torus in the xz-plane. The engine tilts it toward the camera. */
export function ring(n: number, rand: Rand): Float32Array {
  const out = new Float32Array(n * 3);
  const R = 5,
    r = 0.9;
  for (let i = 0; i < n; i++) {
    const a = rand() * Math.PI * 2,
      b = rand() * Math.PI * 2;
    const rr = r * (0.6 + rand() * 0.5);
    const cx = R + rr * Math.cos(b);
    out[i * 3] = cx * Math.cos(a);
    out[i * 3 + 1] = rr * Math.sin(b) * 1.4;
    out[i * 3 + 2] = cx * Math.sin(a);
  }
  return out;
}
