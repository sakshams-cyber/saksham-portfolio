import type { ShapeKey } from '../../content/types';
import { bird } from './bird';
import { helix } from './helix';
import { name } from './name';
import { ring } from './ring';
import { mulberry32, type Rand } from './rng';
import { sphere } from './sphere';
import { wave } from './wave';

export const SHAPES: Record<
  ShapeKey,
  (n: number, r: Rand) => Float32Array | Promise<Float32Array>
> = {
  bird,
  helix,
  wave,
  name,
  sphere,
  ring,
};

export const SHAPE_SEEDS: Record<ShapeKey, number> = {
  bird: 101,
  helix: 202,
  wave: 303,
  name: 404,
  sphere: 505,
  ring: 606,
};

/** Build every shape for n particles. `name` is built last so the font has the most time to load. */
export async function buildAllShapes(n: number): Promise<Record<ShapeKey, Float32Array>> {
  const order: ShapeKey[] = ['bird', 'helix', 'wave', 'sphere', 'ring', 'name'];
  const out = {} as Record<ShapeKey, Float32Array>;
  for (const k of order) out[k] = await SHAPES[k](n, mulberry32(SHAPE_SEEDS[k]));
  return out;
}
