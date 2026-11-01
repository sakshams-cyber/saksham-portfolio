import { expect, type Page } from '@playwright/test';

export const SECTION_IDS = [
  'top',
  'thesis',
  'research',
  'testing',
  'building',
  'voice',
  'advocacy',
  'leading',
  'birdthread',
  'awards',
  'about',
];

/** Collect console errors and page errors for the lifetime of the page. */
export function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(String(e)));
  return errors;
}

/** Put a section's middle on the viewport's centre line (the director's activation line). */
export async function centerSection(page: Page, id: string) {
  await page.evaluate((sid) => {
    const el = document.getElementById(sid)!;
    const r = el.getBoundingClientRect();
    const y = window.scrollY + r.top + r.height / 2 - window.innerHeight / 2;
    window.scrollTo(0, Math.max(0, y));
  }, id);
}

/** Wait until the orchestration chunk has run (it sets --accent inline on <html>). */
export async function waitForDirector(page: Page) {
  await expect
    .poll(() => page.evaluate(() => document.documentElement.style.getPropertyValue('--accent')))
    .not.toBe('');
}

/** Scroll through the whole page so every reveal has fired. */
export async function revealAll(page: Page) {
  await page.evaluate(async () => {
    const step = window.innerHeight / 2;
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 40));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1200);
}
