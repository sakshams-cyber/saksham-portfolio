import { expect, test } from '@playwright/test';
import { sections } from '../../src/content/portfolio';
import { centerSection, SECTION_IDS, trackErrors, waitForDirector } from './helpers';

test('loads with no console or page errors', async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto('/?nointro=1');
  await waitForDirector(page);
  await page.waitForTimeout(1500);
  expect(errors).toEqual([]);
});

test('renders the hero, every section, and valid nav anchors', async ({ page }) => {
  await page.goto('/?nointro=1');
  await expect(page.locator('h1')).toHaveText('Saksham Srivastava');
  await expect(page.locator('h1')).toHaveCount(1);
  for (const id of SECTION_IDS) await expect(page.locator(`section#${id}`)).toHaveCount(1);
  const hrefs = await page
    .locator('nav[aria-label="Primary"] a')
    .evaluateAll((as) => as.map((a) => a.getAttribute('href')));
  expect(hrefs.length).toBeGreaterThan(0);
  for (const h of hrefs) {
    expect(h).toMatch(/^#/);
    await expect(page.locator(h!)).toHaveCount(1);
  }
});

test('nav links scroll to the section and focus its heading', async ({ page }) => {
  await page.goto('/?nointro=1');
  await waitForDirector(page);
  for (const s of sections.filter((x) => x.navLabel)) {
    await page.locator(`nav[aria-label="Primary"] a[href="#${s.id}"]`).first().click();
    await expect(page.locator(`#${s.id}`)).toBeInViewport();
    await expect(page.locator(`#${s.id} [data-section-heading]`)).toBeFocused();
  }
});

test('each section sets its accent on <html> when scrolled to', async ({ page }) => {
  await page.goto('/?nointro=1');
  await waitForDirector(page);
  for (const s of sections) {
    await centerSection(page, s.id);
    await expect
      .poll(() => page.evaluate(() => document.documentElement.style.getPropertyValue('--accent')))
      .toBe(s.accent);
  }
});

test('deep link activates the section immediately', async ({ page }) => {
  await page.goto('/?nointro=1#awards');
  await waitForDirector(page);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.style.getPropertyValue('--accent')))
    .toBe('#ffcf4d');
});

test('pre-rendered HTML contains the content without JavaScript', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('Saksham Srivastava');
  await expect(page.getByText('SMN2-RescueDiff', { exact: true })).toBeVisible();
  await expect(page.getByText('The hard credentials.')).toBeVisible();
  await ctx.close();
});
