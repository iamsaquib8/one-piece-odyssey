import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';

test('a poster downloads as a PNG and survives its share link', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/poster/');
  await page.getByLabel('Name', { exact: true }).fill('Captain Test');
  await page.getByLabel('Bounty in berries').fill('1500000000');
  await page.getByLabel('Hat', { exact: true }).selectOption('crown');
  const preview = page.locator('.poster-preview > svg');
  await expect(preview).toHaveAttribute('aria-label', /Captain Test, bounty 1,500,000,000 berries/);

  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download PNG' }).click()]);
  expect(download.suggestedFilename()).toBe('wanted-captain-test.png');
  const png = await readFile((await download.path())!);
  expect(png.subarray(1, 4).toString()).toBe('PNG');
  expect(png.length).toBeGreaterThan(5_000);

  await expect(page).toHaveURL(/\/poster\/\?r=[A-Za-z0-9_-]+$/);
  await page.reload();
  await expect(page.getByLabel('Name', { exact: true })).toHaveValue('Captain Test');
  await expect(page.getByLabel('Hat', { exact: true })).toHaveValue('crown');
  expect(errors).toEqual([]);
});

test('a broken share link opens the default poster, and the maker fits a phone', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/poster/?r=not-a-real-poster');
  await expect(page.getByLabel('Name', { exact: true })).toHaveValue('Your Name Here');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const axe = await new AxeBuilder({ page }).include('.discovery-view').analyze();
  expect(axe.violations).toEqual([]);
});

test('a character dossier starts a poster in that character’s style', async ({ page }) => {
  await page.goto('/character/zoro/');
  await page.getByRole('link', { name: /Make a wanted poster in this style/ }).click();
  await expect(page).toHaveURL(/\/poster\//);
  await expect(page.getByLabel('Scar', { exact: true })).toHaveValue('eye');
});
