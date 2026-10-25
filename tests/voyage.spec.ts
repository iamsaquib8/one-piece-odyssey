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
  // Luffy, Coby beside him as the story stages it, and Alvida.
  await expect(page.locator('.as-svg .as-puppet')).toHaveCount(3);
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

test('a finished saga redraws the crew’s posters, sails on to the next, and the logbook remembers it', async ({ page }) => {
  const { newGame, step, reachable, eventFor, nodeById } = await import('../src/game/engine');
  const { autoPlan } = await import('../src/game/combat');
  // Play the East Blue headlessly with the engine itself, then hand the finished voyage to the page.
  let state = newGame(9, 'story', null);
  for (let i = 0; i < 4000 && state.phase.type !== 'saga-end'; i++) {
    const phase = state.phase;
    if (phase.type === 'map') state = step(state, { type: 'sail', nodeId: reachable(state)[0].id });
    else if (phase.type === 'event') state = step(state, phase.outcome ? { type: 'continue' } : { type: 'choose', choiceId: eventFor(state, nodeById(state, phase.nodeId)!).choices[0].id });
    else if (phase.type === 'port') state = step(state, { type: 'leave' });
    else if (phase.type === 'battle' && !phase.battle.result) {
      const missing = autoPlan(phase.battle).find((p) => !phase.battle.planned.some((q) => q.actorId === p.actorId));
      state = step(state, missing ? { type: 'plan', action: missing } : { type: 'fight' });
    } else state = step(state, { type: 'continue' });
  }
  await page.addInitScript((saved) => { if (!sessionStorage.getItem('seeded')) { localStorage.setItem('grand-line-voyage-v1', saved); sessionStorage.setItem('seeded', '1'); } }, JSON.stringify(state));
  await page.goto('/voyage/');
  await expect(page.getByRole('heading', { name: 'New bounties' })).toBeVisible();
  await expect(page.getByRole('list', { name: 'The crew’s new bounties' }).getByRole('listitem')).toHaveCount(4);
  await page.getByRole('button', { name: 'Sail on to Alabasta' }).click();
  await expect(page.locator('.vg-chart')).toBeVisible();
  await expect(page.getByRole('button', { name: /^Island: / }).first()).toBeEnabled();
  await page.getByRole('button', { name: /New voyage/ }).click();
  await page.getByRole('button', { name: /abandon this voyage/ }).click();
  const logbook = page.getByRole('region', { name: 'Voyage logbook' }).or(page.locator('.vg-logbook'));
  await expect(logbook).toContainText('✓ East Blue');
  await expect(page.getByRole('combobox', { name: 'Start at' })).toContainText('Alabasta');
});
