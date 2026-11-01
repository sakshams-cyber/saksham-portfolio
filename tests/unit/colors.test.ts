import { describe, expect, it } from 'vitest';
import { accentBuffer, getAccentBuffer } from '../../src/three/colors';
import { mulberry32 } from '../../src/three/shapes/rng';
import { hexToRgb01 } from '../../src/utils/color';

describe('accent colors', () => {
  const hex = '#35dca0';
  const n = 500;
  const buf = accentBuffer(hex, n, mulberry32(888));

  it('stays within [0, 1]', () => {
    for (const v of buf) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });

  it('puts every particle between the accent and white (≤ 50% toward white)', () => {
    const [r, g, b] = hexToRgb01(hex);
    const base = [r, g, b];
    for (let i = 0; i < n; i++) {
      // All three channels must share one mix factor m ∈ [0, 0.5].
      const ms = [0, 1, 2]
        .filter((c) => base[c] < 0.999)
        .map((c) => (buf[i * 3 + c] - base[c]) / (1 - base[c]));
      for (const m of ms) {
        expect(m).toBeGreaterThanOrEqual(-1e-6);
        expect(m).toBeLessThanOrEqual(0.5 + 1e-6);
        expect(m).toBeCloseTo(ms[0], 5);
      }
    }
  });

  it('is deterministic per accent', () => {
    expect(accentBuffer(hex, n, mulberry32(888))).toEqual(buf);
    expect(getAccentBuffer(hex, n)).toEqual(buf);
    expect(getAccentBuffer(hex, n)).toBe(getAccentBuffer(hex, n)); // cached
  });
});
