import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { coverage } from '../src/data/coverage';

test.describe('Notices', () => {
  test('footer carries edition facts and every notice, on all views', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('.site-footer');
    await expect(footer.getByRole('navigation', { name: 'Notices' })).toBeVisible();
    for (const title of ['Disclaimer', 'Editorial position', 'Terms of use', 'Privacy', 'Sources & fair use']) {
      await expect(footer.getByRole('button', { name: title, exact: true })).toBeVisible();
    }
    await expect(footer).toContainText('ONE PIECE © Eiichiro Oda / Shueisha');
    await expect(footer).toContainText('no affiliation');
    await expect(footer).toContainText('Full manga spoilers');
    await expect(footer).toContainText(`Story through Ch. ${coverage.coveredThrough}`);
  });

  test('a footer notice opens the legal view at that section and is linkable', async ({ page }) => {
    await page.goto('/');
    await page.locator('.site-footer').getByRole('button', { name: 'Privacy', exact: true }).click();
    await expect(page).toHaveURL(/\?view=legal/);
    await expect(page.getByRole('heading', { name: 'Disclaimer & terms' })).toBeVisible();
    await expect(page.locator('#legal-privacy')).toBeInViewport();
  });

  test('the legal view loads directly with every section and passes axe', async ({ page }) => {
    await page.goto('/?view=legal');
    await expect(page.getByRole('heading', { name: 'Disclaimer & terms' })).toBeVisible();
    await expect(page.locator('.legal-section')).toHaveCount(6); // five notices plus contact
    await expect(page.locator('#legal-privacy')).toContainText('grand-line-logbook-v1');
    await expect(page.locator('#legal-disclaimer')).toContainText('not affiliated with');
    await expect(page.getByRole('link', { name: 'saquibulhassan6@gmail.com' })).toHaveAttribute('href', 'mailto:saquibulhassan6@gmail.com');
    await expect(page.locator('.legal-fineprint')).toContainText('not legal advice');
    const results = await new AxeBuilder({ page }).disableRules(['color-contrast']).analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });

  test('an unknown view still falls back to the voyage', async ({ page }) => {
    await page.goto('/?view=legalese');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('A grand adventure.');
  });
});
