import type { Rand } from './rng';

type AnyCanvas = HTMLCanvasElement | OffscreenCanvas;

/** Create a 2D canvas on the main thread or in a worker. */
export function makeCanvas(w: number, h: number): AnyCanvas {
  if (typeof document !== 'undefined') {
    const cv = document.createElement('canvas');
    cv.width = w;
    cv.height = h;
    return cv;
  }
  return new OffscreenCanvas(w, h);
}

export function ctx2d(cv: AnyCanvas) {
  return cv.getContext('2d', { willReadFrequently: true }) as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D;
}

/** Sample n points from the filled pixels of a 2D canvas.
 *  Output is centered, y-up, scaled so the canvas height maps to `extent` world units. */
export function sampleCanvas(
  cv: AnyCanvas,
  n: number,
  rand: Rand,
  extent = 10,
  depthJitter = 0,
): Float32Array {
  const ctx = ctx2d(cv);
  const { width: w, height: h } = cv;
  const data = ctx.getImageData(0, 0, w, h).data;
  // Collect filled pixel coordinates once (alpha threshold 40/255 drops antialiased fringes).
  const xs: number[] = [];
  const ys: number[] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > 40) {
        xs.push(x);
        ys.push(y);
      }
    }
  }
  const out = new Float32Array(n * 3);
  const m = xs.length;
  if (m === 0) return out; // caller treats an all-zero shape as an error in dev
  const aspect = w / h;
  for (let i = 0; i < n; i++) {
    const k = Math.floor(rand() * m);
    // ±0.5px jitter inside the pixel so points never stack on an exact grid.
    const px = xs[k] + rand() - 0.5;
    const py = ys[k] + rand() - 0.5;
    out[i * 3] = (px / w - 0.5) * 2 * aspect * (extent / 2);
    out[i * 3 + 1] = -(py / h - 0.5) * 2 * (extent / 2);
    out[i * 3 + 2] = (rand() - 0.5) * depthJitter;
  }
  return out;
}
