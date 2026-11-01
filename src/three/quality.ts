import { probeWebGL } from './webgl-support';

export type Tier = 0 | 1 | 2 | 3;

export interface Quality {
  tier: Tier;
  particles: number;
  dprCap: number;
  stars: number;
}

const TABLE: Record<Exclude<Tier, 0>, Omit<Quality, 'tier'>> = {
  3: { particles: 30000, dprCap: 2, stars: 1200 },
  2: { particles: 16000, dprCap: 2, stars: 900 },
  1: { particles: 6000, dprCap: 1.5, stars: 500 },
};

export function qualityFor(tier: Exclude<Tier, 0>): Quality {
  return { tier, ...TABLE[tier] };
}

/**
 * GPU tier heuristic. detect-gpu was not used because it fetches its benchmark tables from a CDN
 * at runtime, which §2.5 forbids (see DECISIONS). Signals: renderer string, software/caveat flag,
 * touch + small screen, and core count.
 */
export function detectTier(): Tier {
  const gl = probeWebGL();
  if (!gl.supported) return 0;
  const r = gl.renderer.toLowerCase();
  if (/swiftshader|llvmpipe|softpipe|software|basic render/.test(r) || gl.slow) return 1;
  const touch = matchMedia('(pointer: coarse)').matches;
  const small = Math.max(screen.width, screen.height) < 1100;
  if (touch && small) return 1;
  if (touch) return 2; // tablets
  const cores = navigator.hardwareConcurrency || 4;
  let tier: Tier = 2;
  if (/nvidia|geforce|rtx|radeon|amd|apple m\d (pro|max|ultra)|apple m[3-9]/.test(r)) tier = 3;
  if (cores <= 4) tier = Math.min(tier, 2) as Tier;
  return tier;
}
