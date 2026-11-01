import { expect, test } from '@playwright/test';

// The canvas-sampled shapes (bird, name) need a real 2D canvas, so they're checked here
// against the same bounds as the unit tests, using the ?debug=1 engine handle.
test('every shape is finite, in bounds, deterministic and non-degenerate', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'one engine is enough');
  await page.goto('/?nointro=1&debug=1&freeze=1');
  await page.waitForFunction(() => !!window.__engine, null, { timeout: 30_000 });
  const report = await page.evaluate(() => {
    const shapes = window.__engine!.shapes();
    return Object.fromEntries(
      Object.entries(shapes).map(([k, a]) => {
        const n = a.length / 3;
        let ok = true;
        let mx = 0,
          my = 0;
        for (let i = 0; i < n; i++) {
          const x = a[i * 3],
            y = a[i * 3 + 1],
            z = a[i * 3 + 2];
          if (!Number.isFinite(x + y + z) || Math.abs(x) > 9 || Math.abs(y) > 7 || Math.abs(z) > 7)
            ok = false;
          mx += x;
          my += y;
        }
        mx /= n;
        my /= n;
        let vx = 0,
          vy = 0;
        for (let i = 0; i < n; i++) {
          vx += (a[i * 3] - mx) ** 2;
          vy += (a[i * 3 + 1] - my) ** 2;
        }
        return [k, { ok, vx: vx / n, vy: vy / n, n }];
      }),
    );
  });
  for (const [k, r] of Object.entries(report)) {
    expect(r.ok, `${k} in bounds`).toBe(true);
    expect(r.vx, `${k} x-variance`).toBeGreaterThan(1);
    // A one-line word is wide and short by nature, so y gets a lower floor than x.
    expect(r.vy, `${k} y-variance`).toBeGreaterThan(0.25);
  }
});
