import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { revealAll, waitForDirector } from './helpers';

async function seriousViolations(page: Page) {
  // AxeBuilder pins its own playwright-core types; the runtime Page is compatible.
  const results = await new AxeBuilder({ page: page as never })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    // Filtered-out items are intentionally de-emphasised (and announced as "(filtered out)");
    // their low contrast is the visual state, not a defect (see DECISIONS).
    .exclude('[data-dimmed="true"]')
    .analyze();
  return results.violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
}

test.describe('axe: zero serious/critical violations', () => {
  test('default', async ({ page }) => {
    await page.goto('/?nointro=1');
    await waitForDirector(page);
    await revealAll(page);
    expect(await seriousViolations(page)).toEqual([]);
  });

  test('filtered', async ({ page }) => {
    await page.goto('/?nointro=1&level=confirmed');
    await waitForDirector(page);
    await revealAll(page);
    expect(await seriousViolations(page)).toEqual([]);
  });

  test('reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await waitForDirector(page);
    expect(await seriousViolations(page)).toEqual([]);
  });

  test('static (no WebGL)', async ({ page }) => {
    await page.goto('/?forceStatic=1');
    await waitForDirector(page);
    await revealAll(page);
    expect(await seriousViolations(page)).toEqual([]);
  });
});

test('skip link is first in tab order and targets main', async ({ page }) => {
  await page.goto('/?nointro=1');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await expect(skip).toBeFocused();
  await expect(skip).toHaveAttribute('href', '#main');
});

test('mobile menu traps focus and closes on Escape', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?nointro=1');
  const btn = page.getByRole('button', { name: 'Menu' });
  await btn.click();
  await expect(page.getByRole('button', { name: 'Close' })).toHaveAttribute(
    'aria-expanded',
    'true',
  );
  const firstLink = page.locator('#mobile-menu a').first();
  await expect(firstLink).toBeFocused();
  for (let i = 0; i < 10; i++) await page.keyboard.press('Tab');
  const inside = await page.evaluate(() => {
    const a = document.activeElement;
    return (
      !!a && (!!a.closest('#mobile-menu') || a.getAttribute('aria-controls') === 'mobile-menu')
    );
  });
  expect(inside).toBe(true);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Menu' })).toBeFocused();
  await expect(page.locator('#mobile-menu')).toBeHidden();
});

test('no horizontal scroll at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('/?nointro=1');
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
