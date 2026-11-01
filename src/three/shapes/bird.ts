import type { Rand } from './rng';
import { ctx2d, makeCanvas, sampleCanvas } from './sampleCanvas';

/** A bird in flight, one wing raised and one lowered so it reads mid-flap. */
export function bird(n: number, rand: Rand): Float32Array {
  const cv = makeCanvas(420, 300);
  const c = ctx2d(cv);
  c.fillStyle = '#fff';
  c.translate(210, 160);
  c.beginPath();
  c.ellipse(0, 6, 26, 15, 0, 0, Math.PI * 2);
  c.fill(); // body
  c.beginPath();
  c.ellipse(28, -4, 12, 11, 0, 0, Math.PI * 2);
  c.fill(); // head
  c.beginPath();
  c.moveTo(39, -6);
  c.lineTo(58, -2);
  c.lineTo(39, 3);
  c.closePath();
  c.fill(); // beak
  c.beginPath();
  c.moveTo(-24, 4);
  c.lineTo(-62, 22);
  c.lineTo(-26, 16);
  c.closePath();
  c.fill(); // tail
  c.beginPath();
  c.moveTo(-6, -2); // raised wing
  c.bezierCurveTo(-40, -70, -120, -96, -182, -70);
  c.bezierCurveTo(-120, -50, -60, -24, -8, 8);
  c.closePath();
  c.fill();
  c.beginPath();
  c.moveTo(6, 2); // lowered wing
  c.bezierCurveTo(34, 64, 112, 86, 176, 66);
  c.bezierCurveTo(112, 44, 52, 22, 8, -4);
  c.closePath();
  c.fill();
  return sampleCanvas(cv, n, rand, 10, 1.0);
}
