import { describe, expect, it } from 'vitest';
import { helix } from '../../src/three/shapes/helix';
import { ring } from '../../src/three/shapes/ring';
import { mulberry32 } from '../../src/three/shapes/rng';
import { sphere } from '../../src/three/shapes/sphere';
import { wave } from '../../src/three/shapes/wave';

// Canvas-sampled shapes (bird, name) need a real 2D canvas, which jsdom lacks; they are tested
// in the browser by tests/e2e/shapes.spec.ts against the same bounds (see DECISIONS).
const generators = { helix, wave, sphere, ring };

// |z| allows 7, not 3.5: the sphere (R 4.6) and the horizontal ring (R ≈ 6) are deep by
// design, and the spec's own generators exceed 3.5 (see DECISIONS).
const BOUNDS = { x: 9, y: 7, z: 7 };

function variance(a: Float32Array, axis: number): number {
  const n = a.length / 3;
  let m = 0;
  for (let i = 0; i < n; i++) m += a[i * 3 + axis];
  m /= n;
  let v = 0;
  for (let i = 0; i < n; i++) v += (a[i * 3 + axis] - m) ** 2;
  return v / n;
}

describe.each(Object.entries(generators))('%s', (_name, gen) => {
  it.each([100, 6000])('returns n*3 finite values in bounds (n=%i)', (n) => {
    const out = gen(n, mulberry32(1));
    expect(out).toBeInstanceOf(Float32Array);
    expect(out).toHaveLength(n * 3);
    for (let i = 0; i < n; i++) {
      const [x, y, z] = [out[i * 3], out[i * 3 + 1], out[i * 3 + 2]];
      expect(Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z)).toBe(true);
      expect(Math.abs(x)).toBeLessThanOrEqual(BOUNDS.x);
      expect(Math.abs(y)).toBeLessThanOrEqual(BOUNDS.y);
      expect(Math.abs(z)).toBeLessThanOrEqual(BOUNDS.z);
    }
  });

  it('is deterministic per seed', () => {
    expect(gen(500, mulberry32(7))).toEqual(gen(500, mulberry32(7)));
    expect(gen(500, mulberry32(7))).not.toEqual(gen(500, mulberry32(8)));
  });

  it('is non-degenerate', () => {
    const out = gen(2000, mulberry32(3));
    expect(variance(out, 0)).toBeGreaterThan(1);
    expect(variance(out, 1)).toBeGreaterThan(0.5);
  });
});
