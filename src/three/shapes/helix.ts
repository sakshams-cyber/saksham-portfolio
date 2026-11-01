import type { Rand } from './rng';

/** DNA/RNA double helix: two strands plus base-pair rungs at discrete steps. */
export function helix(n: number, rand: Rand): Float32Array {
  const out = new Float32Array(n * 3);
  const turns = 3.1,
    H = 12,
    R = 2.6,
    TAU = Math.PI * 2;
  // Base pairs every ~18° of rotation (real B-DNA is ~36°, but that reads too sparse at this size).
  const rungStep = (18 / 360) * TAU;
  for (let i = 0; i < n; i++) {
    const t = i / n;
    let a = t * TAU * turns;
    let y = (t - 0.5) * H;
    const pick = rand();
    let x: number, z: number;
    if (pick < 0.42) {
      x = Math.cos(a) * R;
      z = Math.sin(a) * R; // strand A
    } else if (pick < 0.84) {
      x = Math.cos(a + Math.PI) * R;
      z = Math.sin(a + Math.PI) * R; // strand B (opposite phase)
    } else {
      // Rung: snap to the nearest base-pair angle, then pick a point along the chord A→B.
      a = Math.round(a / rungStep) * rungStep;
      y = (a / (TAU * turns) - 0.5) * H;
      const k = rand();
      const ax = Math.cos(a) * R,
        az = Math.sin(a) * R;
      const bx = -ax,
        bz = -az;
      x = ax + (bx - ax) * k;
      z = az + (bz - az) * k;
    }
    out[i * 3] = x + (rand() - 0.5) * 0.18;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = z + (rand() - 0.5) * 0.18;
  }
  return out;
}
