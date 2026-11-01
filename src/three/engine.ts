import {
  BufferAttribute,
  BufferGeometry,
  CustomBlending,
  DynamicDrawUsage,
  OneFactor,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from 'three';
import { gsap } from 'gsap';
import type { ShapeKey } from '../content/types';
import { debugLog } from '../utils/debug';
import type { EngineApi } from './bridge';
import { MorphController, type MorphKey, type SetTargetOptions } from './morph';
import { qualityFor, type Quality, type Tier } from './quality';
import { buildAllShapes } from './shapes';
import { mulberry32 } from './shapes/rng';
import { scatter } from './shapes/scatter';
import { createStarfield } from './Starfield';
import vert from './shaders/particles.vert.glsl?raw';
import frag from './shaders/particles.frag.glsl?raw';

const FOV = 55;
const CAMERA_Z = 18.5;
const RING_TILT = (18 * Math.PI) / 180;

/** Point size that keeps total additive brightness roughly constant across tiers: covered area
 *  ∝ N·size², so size ∝ 1/√N, anchored to the prototype's look (~11k points at 0.11). */
function pointSizeFor(n: number): number {
  return Math.min(0.11, 0.11 * Math.sqrt(11000 / n));
}

export interface EngineOptions {
  canvas: HTMLCanvasElement;
  quality: Quality;
  freeze: boolean;
  maxPointSize: number;
  /** Start settled on this target; omit to start from the scattered entrance cloud. */
  initial?: { shape: ShapeKey; accent: string };
  onStatus(status: 'running' | 'lost'): void;
}

export interface EngineStats {
  fps: number;
  particles: number;
  tier: Tier;
}

export interface Engine extends EngineApi {
  stats(): EngineStats;
  shapes(): Record<ShapeKey, Float32Array>;
  current(): { shape: MorphKey; accent: string };
  /** Fire the frame-time check (downgrade a tier if slow) starting now. */
  armPerfMonitor(): void;
  dispose(): void;
}

interface Layer {
  n: number;
  geometry: BufferGeometry;
  points: Points;
  morph: MorphController;
  shapes: Record<ShapeKey, Float32Array>;
}

/** Build geometry + controller for n particles. Allocations happen here, never per frame. */
function buildLayer(
  n: number,
  shapes: Record<ShapeKey, Float32Array>,
  material: ShaderMaterial,
  uniforms: { uProgress: { value: number } },
  initial: { key: MorphKey; positions: Float32Array },
  accent: string,
): Layer {
  const geometry = new BufferGeometry();
  const mk = (size: number, dynamic: boolean) => {
    const a = new BufferAttribute(new Float32Array(n * size), size);
    if (dynamic) a.setUsage(DynamicDrawUsage);
    return a;
  };
  const posA = mk(3, true);
  const posB = mk(3, true);
  const colA = mk(3, true);
  const colB = mk(3, true);
  const seed = mk(1, false);
  const rand = mulberry32(777);
  for (let i = 0; i < n; i++) seed.array[i] = rand();
  geometry.setAttribute('aPosA', posA);
  geometry.setAttribute('aPosB', posB);
  geometry.setAttribute('aColA', colA);
  geometry.setAttribute('aColB', colB);
  geometry.setAttribute('aSeed', seed);
  // three needs `position` for bounds; reuse posA (same buffer, no extra upload).
  geometry.setAttribute('position', posA);
  const points = new Points(geometry, material);
  points.frustumCulled = false;
  const morph = new MorphController(
    n,
    shapes,
    { posA, posB, colA, colB, seed },
    uniforms,
    initial,
    accent,
  );
  return { n, geometry, points, morph, shapes };
}

export async function createEngine(opts: EngineOptions): Promise<Engine> {
  const { canvas, freeze } = opts;
  let quality = opts.quality;

  const renderer = new WebGLRenderer({
    canvas,
    antialias: false,
    alpha: true,
    premultipliedAlpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality.dprCap));

  const scene = new Scene();
  const camera = new PerspectiveCamera(FOV, 1, 0.1, 400);
  camera.position.set(0, 0, CAMERA_Z);

  const uniforms = {
    uProgress: { value: 1 },
    uTime: { value: 0 },
    uSize: { value: pointSizeFor(quality.particles) },
    uScale: { value: 1 },
    uMaxPoint: { value: opts.maxPointSize },
    uShapeScale: { value: 1 },
    uOpacity: { value: 0 },
  };
  const material = new ShaderMaterial({
    vertexShader: vert,
    fragmentShader: frag,
    uniforms,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    // Premultiplied additive: src·1 + dst·1 for both color and alpha (see particles.frag.glsl).
    blending: CustomBlending,
    blendSrc: OneFactor,
    blendDst: OneFactor,
    blendSrcAlpha: OneFactor,
    blendDstAlpha: OneFactor,
  });

  const shapes = await buildAllShapes(quality.particles);
  const startAccent = opts.initial?.accent ?? '#8bd4ff';
  const initialPositions = opts.initial
    ? shapes[opts.initial.shape]
    : scatter(quality.particles, mulberry32(999));
  let layer = buildLayer(
    quality.particles,
    shapes,
    material,
    uniforms,
    { key: opts.initial?.shape ?? 'scatter', positions: initialPositions },
    startAccent,
  );
  scene.add(layer.points);

  const stars = createStarfield(quality.stars);
  scene.add(stars.points);

  // ---- per-frame state (preallocated; the frame loop allocates nothing) ----
  const mouse = { x: 0, y: 0 };
  const cam = { x: 0, y: 0 };
  const tilt = { x: 0 };
  const hoverCapable = matchMedia('(hover: hover) and (pointer: fine)').matches;
  let last = performance.now();
  let elapsed = 0;
  let fpsAcc = 0;
  let fpsFrames = 0;
  let fps = 0;
  let running = false;
  let disposed = false;
  // Frame-time monitor (§8.2): average of 90 frames after arming.
  let perfArmed = false;
  let perfSum = 0;
  let perfFrames = 0;
  let downgraded = false;

  const onPointer = (e: PointerEvent) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
  };
  if (hoverCapable && !freeze) window.addEventListener('pointermove', onPointer, { passive: true });

  function resize() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const scale = renderer.getContext().drawingBufferHeight / (2 * Math.tan((FOV * Math.PI) / 360));
    uniforms.uScale.value = scale;
    stars.uniforms.uScale.value = scale;
    // Portrait: shrink shapes so the widest one (the name, 15 units) still fits with margins.
    uniforms.uShapeScale.value = Math.min(1, camera.aspect * 1.05);
  }
  resize();
  let resizeRaf = 0;
  const onResize = () => {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(resize);
  };
  window.addEventListener('resize', onResize);

  function frame(now: number) {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    if (!freeze) elapsed += dt;
    const t = elapsed;
    uniforms.uTime.value = t;

    fpsAcc += dt;
    fpsFrames++;
    if (fpsAcc >= 0.5) {
      fps = fpsFrames / fpsAcc;
      fpsAcc = 0;
      fpsFrames = 0;
    }
    if (perfArmed && !downgraded) {
      perfSum += dt * 1000;
      if (++perfFrames >= 90) {
        perfArmed = false;
        if (perfSum / perfFrames > 22) void downgrade();
      }
    }

    // Damped camera parallax toward the pointer (lerp 0.04 per frame).
    cam.x += (mouse.x * 1.6 - cam.x) * 0.04;
    cam.y += (-mouse.y * 1.1 - cam.y) * 0.04;
    camera.position.set(cam.x, cam.y, CAMERA_Z);
    camera.lookAt(0, 0, 0);

    // Bounded sway rather than continuous spin so the name never turns edge-on (see DECISIONS).
    const p = layer.points;
    p.rotation.y = Math.sin(t * 0.12) * 0.32 + mouse.x * 0.3;
    p.rotation.x = Math.sin(t * 0.25) * 0.05 - mouse.y * 0.2 + tilt.x;
    stars.points.rotation.y = t * 0.004;

    renderer.render(scene, camera);
  }

  function start() {
    if (running || disposed) return;
    running = true;
    last = performance.now();
    renderer.setAnimationLoop(frame);
  }
  function stop() {
    running = false;
    renderer.setAnimationLoop(null);
  }

  // Pause when the tab is hidden; resume when visible.
  const onVisibility = () => (document.visibilityState === 'hidden' ? stop() : start());
  document.addEventListener('visibilitychange', onVisibility);

  // Context loss → static backdrop; restore → three re-creates GPU state on the next render.
  const onLost = (e: Event) => {
    e.preventDefault();
    stop();
    opts.onStatus('lost');
  };
  const onRestored = () => {
    const g = layer.geometry;
    for (const name of ['aPosA', 'aPosB', 'aColA', 'aColB', 'aSeed'])
      (g.getAttribute(name) as BufferAttribute).needsUpdate = true;
    resize();
    start();
    opts.onStatus('running');
  };
  canvas.addEventListener('webglcontextlost', onLost);
  canvas.addEventListener('webglcontextrestored', onRestored);

  /** Drop one tier: rebuild buffers with fewer particles, keeping the current target. */
  async function downgrade() {
    if (quality.tier <= 1) return;
    downgraded = true;
    const next = qualityFor((quality.tier - 1) as 1 | 2);
    debugLog(`frame time high; downgrading tier ${quality.tier} → ${next.tier}`);
    const cur = layer.morph.current;
    const newShapes = await buildAllShapes(next.particles);
    if (disposed) return;
    const settled: ShapeKey = cur.shape === 'scatter' ? 'name' : cur.shape;
    const old = layer;
    layer = buildLayer(
      next.particles,
      newShapes,
      material,
      uniforms,
      { key: settled, positions: newShapes[settled] },
      cur.accent,
    );
    scene.remove(old.points);
    old.morph.dispose();
    old.geometry.dispose();
    scene.add(layer.points);
    quality = next;
    uniforms.uSize.value = pointSizeFor(next.particles);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality.dprCap));
    resize();
  }

  // Fade in from transparent.
  gsap.to(uniforms.uOpacity, { value: 1, duration: freeze ? 0 : 1.2, ease: 'power1.out' });
  gsap.to(stars.uniforms.uOpacity, { value: 1, duration: freeze ? 0 : 2, ease: 'power1.out' });
  start();
  opts.onStatus('running');

  return {
    setTarget(shape: ShapeKey, accent: string, o: SetTargetOptions = {}) {
      const immediate = o.immediate || freeze;
      const changed = layer.morph.setTarget(shape, accent, { ...o, immediate });
      if (!changed) return;
      // The ring is tilted in the model matrix, not the data, so morphs stay simple.
      gsap.to(tilt, {
        x: shape === 'ring' ? RING_TILT : 0,
        duration: immediate ? 0 : (o.duration ?? 1.7),
        ease: 'power2.inOut',
        overwrite: true,
      });
    },
    setOpacity(value: number, o: { duration?: number } = {}) {
      gsap.to(uniforms.uOpacity, {
        value,
        duration: freeze ? 0 : (o.duration ?? 1.2),
        ease: 'power1.inOut',
        overwrite: true,
      });
    },
    stats: () => ({ fps, particles: layer.n, tier: quality.tier }),
    shapes: () => layer.shapes,
    current: () => layer.morph.current,
    armPerfMonitor() {
      if (freeze || downgraded) return;
      perfArmed = true;
      perfSum = 0;
      perfFrames = 0;
    },
    dispose() {
      disposed = true;
      stop();
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('webglcontextlost', onLost);
      canvas.removeEventListener('webglcontextrestored', onRestored);
      gsap.killTweensOf([uniforms.uOpacity, stars.uniforms.uOpacity, tilt]);
      layer.morph.dispose();
      layer.geometry.dispose();
      material.dispose();
      stars.dispose();
      renderer.dispose();
    },
  };
}
