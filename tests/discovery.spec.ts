import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function progressControl(page: Page) {
  const control = page.getByRole('combobox', { name: 'I’ve read through' });
  if (!await control.isVisible()) await page.locator('.reading-settings > summary').click();
  return control;
}

test('reading progress persists and blocks future links, profiles, and search results', async ({ page }) => {
  await page.goto('/');
  await (await progressControl(page)).selectOption('7');
  await expect(page.getByRole('button', { name: 'Explore arc', exact: true })).toHaveCount(1);
  await page.reload();
  await expect((await progressControl(page))).toHaveValue('7');
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
  await (await progressControl(page)).selectOption('7');
  await page.goto('/?view=saved');
  await expect(page.getByRole('heading', { name: 'No saves within your reading progress.' })).toBeVisible();
  await (await progressControl(page)).selectOption('all');
  await expect(page.locator('.saved-groups')).toContainText('Wano Country');
});

test('character trails open exact moments and battles with history preserved', async ({ page }) => {
  await page.goto('/?view=trails');
  await (await progressControl(page)).selectOption('7');
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
  await (await progressControl(page)).selectOption('105');
  const mystery = page.locator('details').filter({ hasText: 'Who is Laboon still waiting for?' });
  await expect(mystery.locator('summary')).toContainText('open');
  await expect(mystery).not.toContainText('Brook');
  await mystery.locator('summary').click();
  await mystery.getByRole('button', { name: 'Open story moment' }).first().click();
  await expect(page).toHaveURL(/view=mysteries&arc=reverse-mountain&beat=inside-the-whale/);
  await expect(page.locator('#beat-inside-the-whale')).toBeInViewport();
  await page.getByRole('button', { name: 'Close details' }).click();
  await (await progressControl(page)).selectOption('489');
  await expect(mystery.locator('summary')).toContainText('resolved');
  await mystery.locator('summary').click();
  await expect(mystery).toContainText('Brook');
});

test('both atlas modes and crew discovery respect early and empty progress', async ({ page }) => {
  await page.goto('/?view=world&mapPlace=water-seven');
  await (await progressControl(page)).selectOption('7');
  await page.getByRole('button', { name: 'Close reading settings' }).click();
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
  await (await progressControl(page)).selectOption('0');
  await expect(page.getByRole('heading', { name: 'No crews in your reading horizon yet.' })).toBeVisible();
  await page.goto('/?view=world');
  await expect(page.getByRole('heading', { name: 'No places charted yet.' })).toBeVisible();
});

test('discovery controls fit narrow screens and support keyboard disclosures', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?view=mysteries');
  await (await progressControl(page)).selectOption('105');
  const summary = page.locator('.mystery-card summary').first();
  await summary.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.mystery-card').first()).toHaveAttribute('open', '');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const axe = await new AxeBuilder({ page }).include('.reading-controls').include('.discovery-view').analyze();
  expect(axe.violations).toEqual([]);
});

test('header reading settings dismiss cleanly and empty discovery can reopen them', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/');
  await expect(page.locator('.hero')).toBeInViewport();
  const headerBox = await page.locator('.site-header').boundingBox();
  const motionBox = await page.locator('.motion-toggle').boundingBox();
  expect(motionBox!.y + motionBox!.height).toBeLessThanOrEqual(headerBox!.y + headerBox!.height);
  await expect(page.locator('main > .reading-controls')).toHaveCount(0);
  const input = await progressControl(page);
  await input.selectOption('0');
  await page.getByRole('button', { name: 'Close reading settings' }).click();
  await expect(page.locator('.reading-settings > summary')).toBeFocused();
  await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('button', { name: 'Discover' }).click();
  await page.getByRole('button', { name: 'Set reading progress', exact: true }).click();
  await expect(input).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(input).not.toBeVisible();
  await expect(page.locator('.reading-settings > summary')).toBeFocused();
  await progressControl(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const axe = await new AxeBuilder({ page }).include('.site-header').include('.discovery-view').analyze();
  expect(axe.violations).toEqual([]);
});

test('trail entry opens its timeline and filters retain bounded story links', async ({ page }) => {
  await page.goto('/?view=trails');
  await (await progressControl(page)).selectOption('7');
  await page.getByRole('button', { name: 'Close reading settings' }).click();
  await page.getByRole('searchbox', { name: 'Search character trails' }).fill('Roronoa Zoro');
  await expect(page.locator('.trail-card-route').getByRole('button').first()).toContainText('A swordsman in the Marine yard');
  await page.getByRole('button', { name: 'Read the full trail' }).click();
  await expect(page.getByRole('heading', { name: 'Course through the story' })).toBeInViewport();
  const filters = page.getByRole('group', { name: 'Filter character journey' });
  await filters.getByRole('button', { name: /^Battles/ }).click();
  await expect(page.locator('.discovery-timeline-entry')).toHaveCount(1);
  await expect(page.locator('.discovery-timeline-entry')).toHaveClass(/is-battle/);
  await filters.getByRole('button', { name: /^Bounties/ }).click();
  await expect(page.getByText('No bounty changes recorded within your reading progress.')).toBeVisible();
  await page.getByRole('button', { name: 'Show all entries' }).click();
  await expect(page.locator('.discovery-timeline-entry')).toHaveCount(4);
});
