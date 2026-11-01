import { expect, test } from '@playwright/test';
import { sections } from '../../src/content/portfolio';

const countAt = (level: string) =>
  sections.reduce(
    (n, s) =>
      n +
      (s.projects ?? []).filter((p) => p.level === level).length +
      (s.awards ?? []).filter((a) => a.level === level).length,
    0,
  );
const totalItems = sections.reduce(
  (n, s) => n + (s.projects?.length ?? 0) + (s.awards?.length ?? 0),
  0,
);

test('Confirmed filter dims everything else page-wide and announces the count', async ({
  page,
}) => {
  await page.goto('/?nointro=1');
  await page.getByRole('radio', { name: 'Confirmed' }).click();
  await expect(page.getByRole('radio', { name: 'Confirmed' })).toHaveAttribute(
    'aria-checked',
    'true',
  );

  const items = page.locator('[data-level]');
  await expect(items).toHaveCount(totalItems);
  const undimmed = page.locator('[data-level][data-dimmed="false"]');
  await expect(undimmed).toHaveCount(countAt('confirmed'));
  for (const lvl of await undimmed.evaluateAll((els) =>
    els.map((e) => e.getAttribute('data-level')),
  ))
    expect(lvl).toBe('confirmed');
  await expect(page.locator('[data-dimmed="true"]')).toHaveCount(totalItems - countAt('confirmed'));

  await expect(page.getByTestId('filter-live')).toHaveText(
    `Showing ${countAt('confirmed')} confirmed items`,
  );
  await expect(page.getByTestId('filter-pill')).toBeVisible();
  expect(new URL(page.url()).searchParams.get('level')).toBe('confirmed');
});

test('?level=built is restored on load', async ({ page }) => {
  await page.goto('/?nointro=1&level=built');
  await expect(page.getByRole('radio', { name: 'Built' })).toHaveAttribute('aria-checked', 'true');
  await expect(page.locator('[data-level][data-dimmed="false"]')).toHaveCount(countAt('built'));
});

test('arrow keys move the selection (roving tabindex)', async ({ page }) => {
  await page.goto('/?nointro=1');
  const all = page.getByRole('radio', { name: 'All' });
  await all.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('radio', { name: 'Confirmed' })).toBeFocused();
  await expect(page.getByRole('radio', { name: 'Confirmed' })).toHaveAttribute(
    'aria-checked',
    'true',
  );
  await page.keyboard.press('ArrowLeft');
  await expect(all).toHaveAttribute('aria-checked', 'true');
  await page.keyboard.press('ArrowLeft');
  await expect(page.getByRole('radio', { name: 'Prepared' })).toBeFocused();
  // Only the checked radio is in the tab order.
  await expect(page.locator('[role="radio"][tabindex="0"]')).toHaveCount(1);
});

test('Clear in the sticky pill resets the filter', async ({ page }) => {
  await page.goto('/?nointro=1&level=prepared');
  await page.getByTestId('filter-pill').getByRole('button').click();
  await expect(page.getByRole('radio', { name: 'All' })).toHaveAttribute('aria-checked', 'true');
  await expect(page.locator('[data-dimmed="true"]')).toHaveCount(0);
  expect(new URL(page.url()).searchParams.has('level')).toBe(false);
});
