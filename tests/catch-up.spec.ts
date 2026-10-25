import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { chapterForEpisode } from '../src/data/where-am-i';

async function progressControl(page: Page) {
  const control = page.getByRole('combobox', { name: 'I’ve read through' });
  if (!await control.isVisible()) await page.locator('.reading-settings > summary').click();
  return control;
}

test('an anime episode becomes a chapter to continue from, with a recap and a shareable link', async ({ page }) => {
  const expected = chapterForEpisode(1000);
  if (expected.kind !== 'canon') throw new Error('episode 1000 should be canon');
  await page.goto('/catch-up/');
  await page.getByLabel('Last episode I watched').fill('1000');
  await expect(page.locator('.catchup-answer').first()).toContainText(`chapter ${expected.chapter}`);
  await expect(page.locator('.catchup-next')).toContainText(`Chapter ${expected.chapter + 1}`);
  await expect(page.locator('.catchup-recap h2')).toContainText('Wano');
  await expect(page).toHaveURL(/\/catch-up\/\?ep=1000$/);
  await page.locator('.catchup-beats .text-link').first().click();
  await expect(page.getByRole('dialog')).toContainText('Wano');
});

test('fillers are named, and reading progress caps the recap', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/catch-up/?ep=54');
  await expect(page.locator('.catchup-answer').first()).toContainText('Warship Island');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const axe = await new AxeBuilder({ page }).include('.discovery-view').analyze();
  expect(axe.violations).toEqual([]);
  await (await progressControl(page)).selectOption('7');
  await page.locator('.reading-settings > summary').click();
  await expect(page.locator('.catchup-limited')).toBeVisible();
  await expect(page.locator('.catchup-recap')).toHaveCount(0);
});
