import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('a voyage starts, plays an island and a battle, and survives a reload', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/voyage/');
  await page.getByRole('button', { name: 'Set sail' }).click();

  await page.getByRole('button', { name: /^Island: / }).first().click();
  await page.locator('.vg-choice').first().click();
  await expect(page.locator('.vg-outcome')).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();

  await page.getByRole('button', { name: /^Battle: / }).first().click();
  await expect(page.locator('.vg-battle')).toBeVisible();
  await expect(page.locator('.vg-intent').first()).toBeVisible();
  await expect(page.locator('.as-svg .as-puppet')).toHaveCount(2);
  // Fight by keyboard: focus the attack button and press Enter, then Fight.
  await page.locator('.vg-moves button').first().focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.vg-plan-count')).toContainText('1/');
  await page.getByRole('button', { name: 'Fight!' }).click();
  await expect(page.locator('.vg-log li').first()).toBeVisible();
  for (let i = 0; i < 25 && !(await page.locator('.vg-result').isVisible()); i++) await page.getByRole('button', { name: 'Auto round' }).click();
  await expect(page.locator('.vg-result')).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.locator('.vg-chart')).toBeVisible();

  const before = await page.locator('.vg-hud-stats').textContent();
  await page.reload();
  await expect(page.locator('.vg-hud-stats')).toHaveText(before!);
  expect(errors).toEqual([]);
});

test('the voyage is findable, fits a phone and passes axe', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/');
  await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('button', { name: 'Play' }).click();
  await expect(page).toHaveURL(/\/voyage\/$/);
  // Wait for the game itself: the home page has its own voyage buttons.
  await expect(page.locator('.voyage').getByRole('button', { name: 'Set sail', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).include('.voyage').analyze()).violations).toEqual([]);
  await page.locator('.voyage').getByRole('button', { name: 'Set sail', exact: true }).click();
  await page.getByRole('button', { name: /^Island: / }).first().click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).include('.voyage').analyze()).violations).toEqual([]);
});
