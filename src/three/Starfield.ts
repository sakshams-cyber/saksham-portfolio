import {
  BufferAttribute,
  BufferGeometry,
  CustomBlending,
  OneFactor,
  Points,
  ShaderMaterial,
} from 'three';
import { mulberry32 } from './shapes/rng';
import vert from './shaders/stars.vert.glsl?raw';
import frag from './shaders/stars.frag.glsl?raw';

/** Static, dim background stars on a shell of radius 46–101, pushed back to z ≈ −22. */
export function createStarfield(n: number) {
  const rand = mulberry32(1234);
  const pos = new Float32Array(n * 3);
  const bright = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const th = 2 * Math.PI * rand();
    const ph = Math.acos(2 * rand() - 1);
    const r = 46 + rand() * 55;
    pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
    pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
    pos[i * 3 + 2] = r * Math.cos(ph) - 22;
    bright[i] = 0.14 + rand() * 0.2;
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(pos, 3));
  geometry.setAttribute('aBright', new BufferAttribute(bright, 1));
  const uniforms = { uScale: { value: 1 }, uSize: { value: 0.08 * 3.2 }, uOpacity: { value: 0 } };
  const material = new ShaderMaterial({
    vertexShader: vert,
    fragmentShader: frag,
    uniforms,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    blending: CustomBlending,
    blendSrc: OneFactor,
    blendDst: OneFactor,
    blendSrcAlpha: OneFactor,
    blendDstAlpha: OneFactor,
  });
  const points = new Points(geometry, material);
  points.frustumCulled = false;
  return {
    points,
    uniforms,
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}
