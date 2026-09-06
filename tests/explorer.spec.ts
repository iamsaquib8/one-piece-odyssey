import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('One Piece Odyssey', () => {
  test('journey renders every saga with islands and passes axe', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('A grand adventure.');
    await expect(page.locator('[data-saga]')).toHaveCount(13);
    await expect(page.locator('.arc-stop')).toHaveCount(33);
    const results = await new AxeBuilder({ page }).disableRules(['color-contrast']).analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });

  test('opens an arc, deep-links a beat, and closes back to the origin', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Explore arc' }).first().click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('#detail-overview').getByRole('heading', { level: 2, name: 'Romance Dawn' })).toBeVisible();
    await expect(page).toHaveURL(/arc=romance-dawn/);
    await dialog.getByRole('button', { name: /Resume here/ }).first().click();
    await expect(page).toHaveURL(/beat=/);
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(page).not.toHaveURL(/arc=/);
  });

  test('arc reader shows the cast, an illustrated voyage, versus battles and next-stop navigation', async ({ page }) => {
    await page.goto('/?arc=baratie');
    const dialog = page.getByRole('dialog');
    await expect(dialog.locator('.arc-hero h2')).toHaveText('Baratie');
    await expect(dialog.locator('.arc-stats li')).toHaveCount(5);
    await expect(dialog.locator('.crew-deck .deck-member')).toHaveCount(5);
    await expect(dialog.locator('.deck-member.joins')).toHaveText(/Sanji/);
    expect(await dialog.locator('.cast-card').count()).toBeGreaterThanOrEqual(6);
    const foe = dialog.locator('.cast-group.side-foe .cast-card').first();
    await foe.focus();
    await page.keyboard.press('Enter');
    await expect(foe).toHaveClass(/flipped/);
    expect(await dialog.locator('.beat-page').count()).toBeGreaterThanOrEqual(5);
    await expect(dialog.locator('.beat-page').first().locator('.beat-figures .figure').first()).toBeVisible();
    await expect(dialog.locator('.versus').first()).toBeVisible();
    if (await dialog.locator('.nav-beats').isVisible()) {
      await dialog.locator('.nav-beats button').nth(2).click();
      await expect(dialog.locator('.nav-beats button.active')).toHaveCount(1);
    }
    await dialog.locator('.stop-card.next').click();
    await expect(page).toHaveURL(/arc=arlong-park/);
    await expect(dialog.locator('.arc-hero h2')).toHaveText('Arlong Park');
  });

  test('the ongoing Elbaf arc runs to the latest chapter', async ({ page }) => {
    await page.goto('/?arc=elbaf');
    const dialog = page.getByRole('dialog');
    await expect(dialog.locator('.arc-hero-kicker')).toContainText('1191');
    await expect(dialog.locator('.editorial-note')).toContainText('chapter 1191');
    expect(await dialog.locator('.beat-page').count()).toBeGreaterThanOrEqual(10);
    await expect(dialog.locator('.beat-page.kind-flashback, .beat-scene.kind-flashback').first()).toBeVisible();
  });

  test('saves survive a reload and appear in the logbook', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Save Romance Dawn' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Saved to your logbook' })).toBeVisible();
    await page.reload();
    await page.goto('/?view=saved');
    await expect(page.getByRole('button', { name: /Romance Dawn/ })).toBeVisible();
  });

  test('search keeps a shareable query and finds places', async ({ page }) => {
    await page.goto('/?view=search&q=water%20seven');
    await expect(page.getByRole('searchbox').first()).toHaveValue('water seven');
    const results = page.locator('.result-groups');
    await expect(results.getByRole('button', { name: /Water Seven/ }).first()).toBeVisible();
    await results.getByRole('button', { name: /Water Seven/ }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('world atlas opens with a searchable chart', async ({ page }) => {
    await page.goto('/?view=world');
    await expect(page.locator('.atlas-page')).toBeVisible();
    const find = page.getByLabel('Find a place');
    await expect(find).toBeVisible();
    await find.fill('Water Seven');
    await expect(page.locator('.atlas-inspector')).toContainText(/Water Seven/);
  });

  test('invalid deep links show a recovery state', async ({ page }) => {
    await page.goto('/?location=nowhere-island');
    await expect(page.getByRole('dialog')).toContainText('isn’t on the chart');
    await page.getByRole('button', { name: 'Back to the explorer' }).click();
    await expect(page.getByRole('dialog')).toBeHidden();
  });
});
