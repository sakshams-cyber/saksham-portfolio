/** Seeded PRNG (mulberry32): fast, 32-bit state, good enough for visual sampling. Every shape
 *  uses a fixed seed so each load — and every screenshot test — produces identical particles. */
export function mulberry32(seed: number) {
  return function rand() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export type Rand = () => number;
