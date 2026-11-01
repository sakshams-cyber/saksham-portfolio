import { hexToRgb01 } from '../utils/color';
import { mulberry32, type Rand } from './shapes/rng';

/** Per-particle two-tone within an accent family: accent → up to 50% toward white. */
export function accentBuffer(hex: string, n: number, rand: Rand, out?: Float32Array): Float32Array {
  const [r, g, b] = hexToRgb01(hex);
  const buf = out ?? new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const m = rand() * 0.5;
    buf[i * 3] = r + m * (1 - r);
    buf[i * 3 + 1] = g + m * (1 - g);
    buf[i * 3 + 2] = b + m * (1 - b);
  }
  return buf;
}

const cache = new Map<string, Float32Array>();

/** Cached accent buffer (fixed seed 888, so one accent always yields one distribution). */
export function getAccentBuffer(hex: string, n: number): Float32Array {
  const key = `${hex.toLowerCase()}:${n}`;
  let buf = cache.get(key);
  if (!buf) {
    buf = accentBuffer(hex, n, mulberry32(888));
    cache.set(key, buf);
  }
  return buf;
}
