import { gsap } from 'gsap';
import type { ShapeKey } from '../content/types';
import { getAccentBuffer } from './colors';

/** The subset of THREE.BufferAttribute the controller needs (keeps it unit-testable). */
export interface MorphAttr {
  array: ArrayLike<number> & { set(src: ArrayLike<number>): void };
  needsUpdate: boolean;
}

export interface MorphAttrs {
  posA: MorphAttr;
  posB: MorphAttr;
  colA: MorphAttr;
  colB: MorphAttr;
  seed: { array: ArrayLike<number> };
}

export type MorphKey = ShapeKey | 'scatter';

/** Per-particle eased progress — the CPU mirror of the vertex shader's stagger + smoothstep. */
export function particleEase(progress: number, seed: number): number {
  const d = seed * 0.5;
  let le = Math.min(1, Math.max(0, (progress - d) / (1 - d)));
  le = le * le * (3 - 2 * le);
  return le;
}

/** The z-offset the shader adds mid-flight: sin(π·le) is 0 at both ends of the morph. */
export function particleBulge(le: number, seed: number): number {
  return Math.sin(le * Math.PI) * 1.3 * (0.4 + seed) * (seed - 0.5);
}

/**
 * Where particle i is on screen at a given progress (shape space, before uShapeScale and idle
 * drift — drift is ≤ 0.055 units and invisible as a jump). Writes x, y, z into out[0..2].
 */
export function resolveInto(
  out: Float32Array | number[],
  A: ArrayLike<number>,
  B: ArrayLike<number>,
  seed: number,
  progress: number,
  i: number,
): void {
  const le = particleEase(progress, seed);
  const j = i * 3;
  out[0] = A[j] + (B[j] - A[j]) * le;
  out[1] = A[j + 1] + (B[j + 1] - A[j + 1]) * le;
  out[2] = A[j + 2] + (B[j + 2] - A[j + 2]) * le + particleBulge(le, seed);
}

export interface SetTargetOptions {
  /** seconds; 0 (or `immediate`) snaps without animating */
  duration?: number;
  immediate?: boolean;
}

/**
 * Owns the morph attribute buffers. A morph is: A = what's on screen now, B = the target,
 * and one float (uProgress) tweened 0 → 1. The GPU does every per-particle step.
 */
export class MorphController {
  private shapeKey: MorphKey;
  private accent: string;
  private tween?: gsap.core.Tween;

  constructor(
    private n: number,
    private shapes: Record<ShapeKey, Float32Array>,
    private attrs: MorphAttrs,
    private uniforms: { uProgress: { value: number } },
    initial: { key: MorphKey; positions: Float32Array },
    initialAccent: string,
  ) {
    this.shapeKey = initial.key;
    this.accent = initialAccent;
    const col = getAccentBuffer(initialAccent, n);
    attrs.posA.array.set(initial.positions);
    attrs.posB.array.set(initial.positions);
    attrs.colA.array.set(col);
    attrs.colB.array.set(col);
    this.markDirty();
    uniforms.uProgress.value = 1;
  }

  get current(): { shape: MorphKey; accent: string } {
    return { shape: this.shapeKey, accent: this.accent };
  }

  get isMorphing(): boolean {
    return !!this.tween?.isActive();
  }

  /** Idempotent: calling with the current shape+accent is a no-op (prevents shimmer). */
  setTarget(shape: ShapeKey, accent: string, opts: SetTargetOptions = {}): boolean {
    if (shape === this.shapeKey && accent === this.accent) return false;
    const duration = opts.immediate ? 0 : (opts.duration ?? 1.7);
    this.snapshotCurrentIntoA();
    this.attrs.posB.array.set(this.shapes[shape]);
    this.attrs.colB.array.set(getAccentBuffer(accent, this.n));
    this.markDirty();
    this.shapeKey = shape;
    this.accent = accent;
    this.tween?.kill();
    this.tween = undefined;
    if (duration <= 0) {
      this.uniforms.uProgress.value = 1;
      return true;
    }
    this.uniforms.uProgress.value = 0;
    this.tween = gsap.to(this.uniforms.uProgress, { value: 1, duration, ease: 'power2.inOut' });
    return true;
  }

  /** Jump the running morph to its end (used by ?freeze=1 and tests). */
  finish(): void {
    this.tween?.progress(1);
    this.tween?.kill();
    this.tween = undefined;
    this.uniforms.uProgress.value = 1;
  }

  /** For tests: set the running morph to a given tween progress. */
  seek(progress: number): void {
    this.tween?.progress(progress);
  }

  dispose(): void {
    this.tween?.kill();
  }

  /**
   * CPU mirror of the vertex shader's position + color math. This is what makes interrupted
   * morphs seamless: if a new target arrives at uProgress = 0.4, A becomes the *actual*
   * on-screen state (including the mid-flight bulge), and the new morph starts from there.
   */
  private snapshotCurrentIntoA(): void {
    const p = this.uniforms.uProgress.value;
    const A = this.attrs.posA.array as Float32Array;
    const B = this.attrs.posB.array as Float32Array;
    const CA = this.attrs.colA.array as Float32Array;
    const CB = this.attrs.colB.array as Float32Array;
    const S = this.attrs.seed.array;
    if (p >= 1) {
      // Settled: no bulge, A simply becomes B. Fast path avoids a per-particle loop.
      A.set(B);
      CA.set(CB);
      return;
    }
    for (let i = 0; i < this.n; i++) {
      const s = S[i];
      const le = particleEase(p, s);
      const j = i * 3;
      A[j] = A[j] + (B[j] - A[j]) * le;
      A[j + 1] = A[j + 1] + (B[j + 1] - A[j + 1]) * le;
      A[j + 2] = A[j + 2] + (B[j + 2] - A[j + 2]) * le + particleBulge(le, s);
      CA[j] = CA[j] + (CB[j] - CA[j]) * le;
      CA[j + 1] = CA[j + 1] + (CB[j + 1] - CA[j + 1]) * le;
      CA[j + 2] = CA[j + 2] + (CB[j + 2] - CA[j + 2]) * le;
    }
  }

  private markDirty() {
    this.attrs.posA.needsUpdate = true;
    this.attrs.posB.needsUpdate = true;
    this.attrs.colA.needsUpdate = true;
    this.attrs.colB.needsUpdate = true;
  }
}
