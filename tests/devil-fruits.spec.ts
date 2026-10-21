import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { devilFruits } from '../src/data/devil-fruits';

async function progressControl(page: Page) {
  const control = page.getByRole('combobox', { name: 'I’ve read through' });
  if (!await control.isVisible()) await page.locator('.reading-settings > summary').click();
  return control;
}

test('the encyclopedia filters, searches and opens a fruit record', async ({ page }) => {
  await page.goto('/devil-fruits/');
  const cards = page.locator('.fruit-grid > li');
  await expect(cards).toHaveCount(devilFruits.length);
  await page.locator('.fruit-filters').getByRole('button', { name: /^Logia/ }).click();
  await expect(cards).toHaveCount(devilFruits.filter((f) => f.type === 'logia').length);
  await page.locator('.fruit-filters').getByRole('button', { name: /^All/ }).click();
  await page.getByRole('searchbox', { name: 'Search Devil Fruits' }).fill('trafalgar');
  await expect(cards).toHaveCount(1);
  await cards.first().getByRole('button').click();
  await expect(page.getByRole('dialog')).toContainText('Op-Op Fruit');
  await expect(page).toHaveURL(/\/fruit\/ope-ope\/\?view=devil-fruits/);
  await page.getByRole('dialog').getByRole('button', { name: /Trafalgar D\. Water Law/ }).click();
  await expect(page.getByRole('dialog')).toContainText('CHARACTER DOSSIER');
  await expect(page.locator('.character-fruits')).toContainText('Op-Op Fruit');
});

test('a reader early in the story sees fruits under the names they knew', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/devil-fruits/');
  await (await progressControl(page)).selectOption('105');
  await page.locator('.reading-settings > summary').click();
  const grid = page.locator('.fruit-grid');
  await expect(grid).toContainText('Gum-Gum Fruit');
  await expect(grid).not.toContainText('Nika');
  await expect(grid).not.toContainText('Flame-Flame');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const axe = await new AxeBuilder({ page }).include('.discovery-view').analyze();
  expect(axe.violations).toEqual([]);
  await page.goto('/fruit/mera-mera/');
  await expect(page.getByRole('dialog')).toContainText('outside your reading progress');
});
