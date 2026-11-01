import { describe, expect, it } from 'vitest';
import type { ShapeKey } from '../../src/content/types';
import { MorphController, resolveInto, type MorphAttr } from '../../src/three/morph';
import { mulberry32 } from '../../src/three/shapes/rng';
import { helix } from '../../src/three/shapes/helix';
import { ring } from '../../src/three/shapes/ring';
import { sphere } from '../../src/three/shapes/sphere';
import { wave } from '../../src/three/shapes/wave';

const N = 400;

function attr(size: number): MorphAttr {
  return { array: new Float32Array(N * size), needsUpdate: false };
}

function setup() {
  const shapes = {
    helix: helix(N, mulberry32(202)),
    wave: wave(N, mulberry32(303)),
    sphere: sphere(N, mulberry32(505)),
    ring: ring(N, mulberry32(606)),
    // jsdom has no 2D canvas; stand-ins keep the record complete.
    bird: sphere(N, mulberry32(101)),
    name: wave(N, mulberry32(404)),
  } as Record<ShapeKey, Float32Array>;
  const seed = new Float32Array(N);
  const r = mulberry32(777);
  for (let i = 0; i < N; i++) seed[i] = r();
  const attrs = {
    posA: attr(3),
    posB: attr(3),
    colA: attr(3),
    colB: attr(3),
    seed: { array: seed },
  };
  const uniforms = { uProgress: { value: 1 } };
  const m = new MorphController(
    N,
    shapes,
    attrs,
    uniforms,
    { key: 'sphere', positions: shapes.sphere },
    '#8bd4ff',
  );
  return { m, shapes, attrs, uniforms, seed };
}

/** Every particle's resolved (on-screen) position at the current uProgress. */
function resolveAll(s: ReturnType<typeof setup>): Float32Array {
  const out = new Float32Array(N * 3);
  const tmp = [0, 0, 0];
  const A = s.attrs.posA.array as Float32Array;
  const B = s.attrs.posB.array as Float32Array;
  for (let i = 0; i < N; i++) {
    resolveInto(tmp, A, B, s.seed[i], s.uniforms.uProgress.value, i);
    out.set(tmp, i * 3);
  }
  return out;
}

function maxDiff(a: Float32Array, b: Float32Array): number {
  let d = 0;
  for (let i = 0; i < a.length; i++) d = Math.max(d, Math.abs(a[i] - b[i]));
  return d;
}

describe('MorphController', () => {
  it('settles exactly on the target shape', () => {
    const s = setup();
    s.m.setTarget('helix', '#35dca0');
    expect(s.uniforms.uProgress.value).toBe(0);
    s.m.finish();
    expect(maxDiff(resolveAll(s), s.shapes.helix)).toBeLessThan(1e-5);
  });

  it('is continuous when a morph is interrupted mid-flight', () => {
    const s = setup();
    s.m.setTarget('helix', '#35dca0');
    s.m.seek(0.5);
    const before = resolveAll(s);
    s.m.setTarget('ring', '#ffcf4d');
    const after = resolveAll(s);
    expect(maxDiff(before, after)).toBeLessThan(1e-4);
    s.m.finish();
    expect(maxDiff(resolveAll(s), s.shapes.ring)).toBeLessThan(1e-5);
  });

  it('is a no-op for an unchanged shape + accent (no restart, no shimmer)', () => {
    const s = setup();
    expect(s.m.setTarget('helix', '#35dca0')).toBe(true);
    s.m.seek(0.3);
    const p = s.uniforms.uProgress.value;
    expect(s.m.setTarget('helix', '#35dca0')).toBe(false);
    expect(s.uniforms.uProgress.value).toBe(p);
  });

  it('morphs color only when the shape is unchanged but the accent differs', () => {
    const s = setup();
    s.m.setTarget('wave', '#ffae45', { immediate: true });
    expect(s.m.setTarget('wave', '#b89bff')).toBe(true);
    s.m.finish();
    expect(maxDiff(resolveAll(s), s.shapes.wave)).toBeLessThan(1e-5);
  });

  it('snaps without animating when immediate', () => {
    const s = setup();
    s.m.setTarget('ring', '#ffcf4d', { immediate: true });
    expect(s.uniforms.uProgress.value).toBe(1);
    expect(s.m.isMorphing).toBe(false);
  });
});
