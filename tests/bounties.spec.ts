import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function progressControl(page: Page) {
  const control = page.getByRole('combobox', { name: 'I’ve read through' });
  if (!await control.isVisible()) await page.locator('.reading-settings > summary').click();
  return control;
}

test('the bounty board ranks posters, compares growth and opens dossiers', async ({ page }) => {
  await page.goto('/bounties/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Every price');
  const lines = page.locator('.wanted-list > li');
  expect(await lines.count()).toBeGreaterThan(40);
  await expect(lines.first().locator('.bounty-rank')).toHaveText('1');
  await expect(page.locator('.step-legend li')).toHaveCount(3);

  const luffy = lines.filter({ hasText: 'Monkey D. Luffy' });
  await luffy.getByRole('button', { name: /Stop comparing/ }).click();
  await expect(page.locator('.step-legend li')).toHaveCount(2);
  await page.getByRole('button', { name: /^Compare Nami/ }).click();
  await expect(page.locator('.step-legend')).toContainText('Nami');

  await page.getByRole('button', { name: /^Straw Hats/ }).click();
  await expect(lines).toHaveCount(10);

  const chart = page.locator('.step-plot svg').first();
  await chart.focus();
  await page.keyboard.press('End');
  await expect(page.locator('.step-tip')).toBeVisible();

  await luffy.locator('.bounty-person').click();
  await expect(page.getByRole('dialog')).toContainText('Monkey D. Luffy');
  await expect(page).toHaveURL(/\/character\/luffy\/\?view=bounties/);
});

test('reading progress limits the board, and it fits a narrow screen', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/bounties/');
  await (await progressControl(page)).selectOption('105');
  await page.locator('.reading-settings > summary').click();
  await expect(page.locator('.wanted-list')).toContainText('Monkey D. Luffy');
  await expect(page.locator('.wanted-list')).not.toContainText('Shanks');
  await expect(page.locator('.wanted-list')).not.toContainText('3,000,000,000');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const axe = await new AxeBuilder({ page }).include('.discovery-view').analyze();
  expect(axe.violations).toEqual([]);
});
