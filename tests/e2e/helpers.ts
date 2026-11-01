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
    .poll(() => page.evaluate(() => document.documentElement.style.getPropertyValue('--accent')), {
      timeout: 25_000,
    })
    .not.toBe('');
}

/** Scroll through the whole page so every reveal has fired. */
export async function revealAll(page: Page) {
  // Visit each section in turn and let observers catch up; slow CI runners need the pauses.
  for (const id of SECTION_IDS) {
    await page.evaluate(
      (sid) => document.getElementById(sid)?.scrollIntoView({ block: 'start' }),
      id,
    );
    await page.waitForTimeout(250);
  }
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  // Every reveal has fired and finished its transition (axe measures real opacity).
  await expect
    .poll(
      () =>
        page.evaluate(() =>
          [...document.querySelectorAll('.reveal:not(.in)')].map(
            (e) => `${e.closest('section')?.id ?? '?'} ${e.className}`,
          ),
        ),
      { timeout: 20_000 },
    )
    .toEqual([]);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1500);
}
