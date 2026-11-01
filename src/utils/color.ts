/** "#rrggbb" → [r, g, b] in 0..1. */
export function hexToRgb01(hex: string): [number, number, number] {
  const v = parseInt(hex.slice(1, 7), 16);
  return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255];
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
