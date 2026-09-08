import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('reading progress persists and blocks future links, profiles, and search results', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('combobox', { name: 'I’ve read through' }).selectOption('7');
  await expect(page.getByRole('button', { name: 'Explore arc', exact: true })).toHaveCount(1);
  await page.reload();
  await expect(page.getByRole('combobox', { name: 'I’ve read through' })).toHaveValue('7');
  await page.goto('/?arc=wano');
  await expect(page.getByRole('dialog')).toContainText('outside your reading progress');
  await expect(page.getByRole('dialog')).not.toContainText('Kaido');
  await page.getByRole('button', { name: 'Close details' }).click();
  await page.goto('/?view=search&q=Brook');
  await expect(page.getByRole('heading', { name: /Nothing on the chart/ })).toBeVisible();
  await page.goto('/?character=luffy');
  await expect(page.getByRole('dialog')).toContainText('Course through the story');
  await expect(page.getByRole('dialog')).not.toContainText('Gear Five');
  await expect(page.getByRole('dialog')).not.toContainText('3,000,000,000');
  await expect(page.getByRole('dialog').getByRole('img', { name: /portrait hidden/ })).toBeVisible();
});

test('hidden saved entries remain stored and reappear in full mode', async ({ page }) => {
  await page.goto('/?arc=wano');
  await page.getByRole('dialog').getByRole('button', { name: 'Save Wano Country', exact: true }).click();
  await page.getByRole('button', { name: 'Close details' }).click();
  await page.getByRole('combobox', { name: 'I’ve read through' }).selectOption('7');
  await page.goto('/?view=saved');
  await expect(page.getByRole('heading', { name: 'No saves within your reading progress.' })).toBeVisible();
  await page.getByRole('combobox', { name: 'I’ve read through' }).selectOption('all');
  await expect(page.locator('.saved-groups')).toContainText('Wano Country');
});

test('character trails open exact moments and battles with history preserved', async ({ page }) => {
  await page.goto('/?view=trails');
  await page.getByRole('combobox', { name: 'I’ve read through' }).selectOption('7');
  await page.getByRole('searchbox', { name: 'Search character trails' }).fill('Roronoa Zoro');
  await expect(page.locator('.trail-card')).toHaveCount(1);
  await page.locator('.trail-card-person').click();
  await page.getByRole('button', { name: 'Character journey', exact: true }).click();
  await page.locator('.discovery-timeline-entry.is-moment').first().getByRole('button', { name: 'Open in story' }).click();
  await expect(page).toHaveURL(/view=trails&arc=romance-dawn&beat=/);
  const beat = new URL(page.url()).searchParams.get('beat');
  await expect(page.locator(`[id="beat-${beat}"]`)).toBeInViewport();
  await page.goBack();
  await expect(page.getByRole('dialog')).toContainText('Roronoa Zoro');
  await page.locator('.discovery-timeline-entry.is-battle').first().getByRole('button', { name: 'Open in story' }).click();
  const battle = new URL(page.url()).searchParams.get('beat');
  await expect(page.locator(`[id="battle-${battle}"]`)).toBeInViewport();
});

test('mystery clues unlock by progress and open the referenced story', async ({ page }) => {
  await page.goto('/?view=mysteries');
  await page.getByRole('combobox', { name: 'I’ve read through' }).selectOption('105');
  const mystery = page.locator('details').filter({ hasText: 'Who is Laboon still waiting for?' });
  await expect(mystery.locator('summary')).toContainText('open');
  await expect(mystery).not.toContainText('Brook');
  await mystery.locator('summary').click();
  await mystery.getByRole('button', { name: 'Open story moment' }).first().click();
  await expect(page).toHaveURL(/view=mysteries&arc=reverse-mountain&beat=inside-the-whale/);
  await expect(page.locator('#beat-inside-the-whale')).toBeInViewport();
  await page.getByRole('button', { name: 'Close details' }).click();
  await page.getByRole('combobox', { name: 'I’ve read through' }).selectOption('489');
  await expect(mystery.locator('summary')).toContainText('resolved');
  await mystery.locator('summary').click();
  await expect(mystery).toContainText('Brook');
});

test('both atlas modes and crew discovery respect early and empty progress', async ({ page }) => {
  await page.goto('/?view=world&mapPlace=water-seven');
  await page.getByRole('combobox', { name: 'I’ve read through' }).selectOption('7');
  await expect(page.getByRole('heading', { name: 'Foosha Village', exact: true })).toBeVisible();
  await expect(page.locator('.atlas-shell')).not.toContainText('Water Seven');
  await expect(page.locator('.atlas-shell')).not.toContainText('Elbaf');
  await page.getByRole('button', { name: 'Flat chart', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Select Water Seven', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Map layers', exact: true }).click();
  await page.getByLabel('Physical connections', { exact: true }).check();
  await page.getByRole('searchbox', { name: 'Find a place' }).fill('Water Seven');
  await expect(page.getByRole('heading', { name: 'No place on this chart.' })).toBeVisible();
  await page.goto('/?view=crew');
  await expect(page.locator('.fleet-view')).not.toContainText('Jinbe');
  await expect(page.locator('.fleet-view')).not.toContainText('Thousand Sunny');
  await page.getByRole('combobox', { name: 'I’ve read through' }).selectOption('0');
  await expect(page.getByRole('heading', { name: 'No crews in your reading horizon yet.' })).toBeVisible();
  await page.goto('/?view=world');
  await expect(page.getByRole('heading', { name: 'No places charted yet.' })).toBeVisible();
});

test('discovery controls fit narrow screens and support keyboard disclosures', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?view=mysteries');
  await page.getByRole('combobox', { name: 'I’ve read through' }).selectOption('105');
  const summary = page.locator('.mystery-card summary').first();
  await summary.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.mystery-card').first()).toHaveAttribute('open', '');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const axe = await new AxeBuilder({ page }).include('.reading-controls').include('.discovery-view').analyze();
  expect(axe.violations).toEqual([]);
});
