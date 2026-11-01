import type { Rand } from './rng';
import { ctx2d, makeCanvas, sampleCanvas } from './sampleCanvas';

export const NAME_TEXT = 'SAKSHAM';
// Space Grotesk's variable axis tops out at 700, so 700 is the heaviest real weight.
const FONT = '700 120px "Space Grotesk"';
const WORLD_WIDTH = 15; // settled word spans x ∈ [-7.5, 7.5]

/** "SAKSHAM" from text. Must wait for the web font, or Arial gets baked in forever (§24.2). */
export async function name(n: number, rand: Rand): Promise<Float32Array> {
  try {
    if (typeof document !== 'undefined') await document.fonts.load(FONT);
  } catch {
    /* fall back to whatever renders */
  }
  // Measure first so the canvas hugs the word; that keeps it inside the frame (see DECISIONS).
  const probe = ctx2d(makeCanvas(8, 8));
  probe.font = `${FONT}, Arial, sans-serif`;
  const w = Math.ceil(probe.measureText(NAME_TEXT).width) + 24;
  const h = 150;
  const cv = makeCanvas(w, h);
  const c = ctx2d(cv);
  c.fillStyle = '#fff';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.font = `${FONT}, Arial, sans-serif`;
  c.fillText(NAME_TEXT, w / 2, h / 2 + 4);
  // sampleCanvas maps canvas height → extent; choose extent so the width lands on WORLD_WIDTH.
  return sampleCanvas(cv, n, rand, (WORLD_WIDTH * h) / w, 0.7);
}
