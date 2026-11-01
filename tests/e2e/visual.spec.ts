import { expect, test } from '@playwright/test';
import { centerSection } from './helpers';

// Deterministic frames: ?nointro=1&freeze=1 freezes uTime and makes every tween instant.
// Baselines must be approved by the owner before they're committed (§17.3).
const SHOTS = ['top', 'research', 'birdthread', 'awards', 'about'];
const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'mobile', width: 390, height: 844 },
];

for (const vp of VIEWPORTS) {
  test.describe(vp.name, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });
    for (const id of SHOTS) {
      test(id, async ({ page }) => {
        await page.goto('/?nointro=1&freeze=1');
        await expect(page.getByTestId('particles')).toHaveClass(/visible/, { timeout: 30_000 });
        if (id !== 'top') await centerSection(page, id);
        // Let reveals finish and the director settle the target.
        await page.waitForTimeout(2000);
        await expect(page).toHaveScreenshot(`${id}-${vp.name}.png`, { maxDiffPixelRatio: 0.02 });
      });
    }
  });
}
