import type { Rand } from './rng';

/** Center-weighted waveform ribbon with one tall central spike (a distress call). */
export function wave(n: number, rand: Rand): Float32Array {
  const out = new Float32Array(n * 3);
  const W = 17; // narrowed from 20 so the ribbon stays inside |x| ≤ 9 (see DECISIONS)
  for (let i = 0; i < n; i++) {
    const x = (rand() - 0.5) * W;
    const xn = x / (W / 2);
    // Gaussian envelope (σ = 0.33) makes the centre loud and the edges quiet.
    const env = Math.exp(-(xn * xn) / (2 * 0.33 * 0.33));
    const amp =
      env * (0.55 * Math.sin(xn * 9) + 0.28 * Math.sin(xn * 23 + 1.3) + 0.14 * Math.sin(xn * 47));
    // Vertical spread grows with amplitude so peaks look like filled bars, not a thin line.
    const y = amp * 4.2 + (rand() - 0.5) * (0.6 + Math.abs(amp) * 5);
    out[i * 3] = x;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = (rand() - 0.5) * 1.2;
  }
  return out;
}
