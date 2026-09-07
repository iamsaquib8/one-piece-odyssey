import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('Laboon playback, pause, keyboard seeking and replay share one clock', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/?arc=reverse-mountain');
  const battle = page.locator('.motion-comic');
  await battle.getByRole('button', { name: 'Play sequence', exact: true }).scrollIntoViewIfNeeded();
  await expect(battle).toHaveAttribute('data-time', '0');
  await battle.getByRole('button', { name: 'Play sequence', exact: true }).click();
  await expect.poll(async () => Number(await battle.getAttribute('data-time'))).toBeGreaterThan(250);
  await battle.getByRole('button', { name: 'Pause', exact: true }).click();
  await expect(battle).toHaveAttribute('data-playing', 'false');
  const paused = await battle.getAttribute('data-time');
  const pose = await battle.locator('[data-part="laboon"]').getAttribute('transform');
  await page.waitForTimeout(300);
  await expect(battle).toHaveAttribute('data-time', paused!);
  await expect(battle.locator('[data-part="laboon"]')).toHaveAttribute('transform', pose!);
  await battle.getByRole('slider', { name: 'Battle timeline' }).press('End');
  await expect(battle.locator('.comic-caption')).toContainText('Fresh paint');
  await expect(battle.getByRole('button', { name: 'Next frame' })).toBeDisabled();
  await battle.getByRole('button', { name: '0.5 times speed' }).click();
  await expect(battle.getByRole('button', { name: '0.5 times speed' })).toHaveAttribute('aria-pressed', 'true');
  await battle.getByRole('button', { name: 'Replay sequence', exact: true }).click();
  await expect(battle).toHaveAttribute('data-playing', 'true');
  await expect(battle.locator('.comic-caption')).toContainText('Laboon lowers');
  await battle.getByRole('button', { name: 'Next frame' }).click();
  await expect(battle).toHaveAttribute('data-playing', 'false');
  await expect(battle.locator('.comic-caption')).toContainText('The mast');
  await battle.getByRole('button', { name: 'Play illustrated battle', exact: true }).press('ArrowRight');
  await expect(battle.locator('.comic-caption')).toContainText('A rubber boy');
  const violations = await new AxeBuilder({ page }).include('.motion-comic').analyze();
  expect(violations.violations).toEqual([]);
  expect(errors).toEqual([]);
});

test('reduced motion preserves readable scenes and narrow layout', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?arc=reverse-mountain');
  const battle = page.locator('.motion-comic');
  await battle.scrollIntoViewIfNeeded();
  await expect(battle.getByRole('button', { name: 'Play sequence', exact: true })).toBeDisabled();
  await battle.getByRole('button', { name: 'Next frame' }).click();
  await expect(battle.locator('.comic-caption')).toContainText('The mast');
  const time = await battle.getAttribute('data-time');
  await page.waitForTimeout(200);
  await expect(battle).toHaveAttribute('data-time', time!);
  await battle.getByRole('slider').press('End');
  await expect(battle.locator('.comic-caption')).toContainText('Fresh paint');
  await battle.locator('.comic-player').screenshot({ path: testInfo.outputPath('battle-player.png') });
  expect(await battle.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true);
  for (const control of await battle.locator('.battle-controls button').all()) {
    const box = await control.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    expect(box!.width).toBeGreaterThanOrEqual(44);
  }
});

test('the shared battle scene animates and stops when scrolled away', async ({ page }) => {
  await page.goto('/?arc=baratie');
  await page.getByRole('button', { name: 'Battles', exact: true }).click();
  const battle = page.locator('.motion-comic').first();
  await battle.getByRole('button', { name: 'Next frame' }).click();
  await expect(battle.locator('.comic-scene')).toHaveAttribute('data-shot', 'strike');
  const before = await battle.locator('.comic-world').getAttribute('style');
  await battle.getByRole('button', { name: 'Play sequence', exact: true }).click();
  await expect.poll(() => battle.locator('.comic-world').getAttribute('style')).not.toBe(before);
  await page.getByRole('button', { name: 'Overview', exact: true }).click();
  await expect(battle).toHaveAttribute('data-playing', 'false');
});
