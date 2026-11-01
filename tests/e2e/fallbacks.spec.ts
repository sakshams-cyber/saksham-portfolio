import { expect, test } from '@playwright/test';
import { trackErrors, waitForDirector } from './helpers';

test('?forceStatic=1 renders no canvas but all content', async ({ page }) => {
  await page.goto('/?forceStatic=1');
  await waitForDirector(page);
  await page.waitForTimeout(800);
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.getByTestId('static-backdrop')).toBeVisible();
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('article')).toHaveCount(20);
});

test('reduced motion: no canvas, no Lenis, content visible immediately', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await waitForDirector(page);
  await page.waitForTimeout(800);
  await expect(page.locator('canvas')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.classList.contains('lenis'))).toBe(
    false,
  );
  // Every reveal — even far below the fold — is fully opaque without scrolling.
  const opacities = await page
    .locator('.reveal')
    .evaluateAll((els) => els.map((e) => getComputedStyle(e).opacity));
  expect(opacities.every((o) => o === '1')).toBe(true);
});

test('WebGL context loss falls back to the static backdrop, then recovers', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'WEBGL_lose_context simulation is Chromium-only here');
  const errors = trackErrors(page);
  await page.goto('/?nointro=1');
  const canvas = page.getByTestId('particles');
  await expect(canvas).toHaveClass(/visible/, { timeout: 20_000 });

  await page.evaluate(() => {
    const c = document.querySelector('canvas')!;
    const gl = (c.getContext('webgl2') ?? c.getContext('webgl'))!;
    (window as unknown as { __lose: WEBGL_lose_context }).__lose =
      gl.getExtension('WEBGL_lose_context')!;
    (window as unknown as { __lose: WEBGL_lose_context }).__lose.loseContext();
  });
  await expect(canvas).not.toHaveClass(/visible/);
  await expect(page.getByTestId('static-backdrop')).toBeVisible();

  await page.evaluate(() =>
    (window as unknown as { __lose: WEBGL_lose_context }).__lose.restoreContext(),
  );
  await expect(canvas).toHaveClass(/visible/, { timeout: 20_000 });
  // Chromium logs a WebGL warning for the deliberate loss; anything else is a real error.
  expect(errors.filter((e) => !/CONTEXT_LOST|context lost/i.test(e))).toEqual([]);
});
