/*
 * Re-shoots the README screenshots and the animated demo from the built site.
 * Run `npm run build` first, then `npm run capture`. The demo needs ffmpeg on the PATH.
 *
 * journey.webp, arc-title-card.webp and mobile-arc.webp show edition facts (chapter numbers,
 * counts), so a chapter refresh re-runs this. The other screenshots only change with the UI.
 */
import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, type Page } from '@playwright/test';
import sharp from 'sharp';
import { crewRowCard } from './og/cards';
import { characters as strawHats } from '../src/data/characters';

const root = fileURLToPath(new URL('..', import.meta.url));
const out = join(root, 'docs', 'screenshots');
const PORT = 4174;
const FPS = 12;
const base = `http://127.0.0.1:${PORT}`;
const reader = (motion: boolean) => JSON.stringify({ version: 1, saved: [], explored: [], motion, spoilerThrough: null, resume: { y: 0 } });

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort', '--host', '127.0.0.1'], { cwd: root, stdio: 'ignore' });
try {
  for (let i = 0; i < 50; i++) {
    try { if ((await fetch(base)).ok) break; } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 200));
  }
  const browser = await chromium.launch();

  const shoot = async (page: Page, name: string) => {
    await sharp(await page.screenshot()).webp({ quality: 82 }).toFile(join(out, `${name}.webp`));
    console.log(`  docs/screenshots/${name}.webp`);
  };
  const settle = (page: Page) => page.waitForTimeout(1600);

  const desktop = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await desktop.addInitScript((value) => localStorage.setItem('grand-line-logbook-v1', value), reader(false));
  const page = await desktop.newPage();
  await page.goto(`${base}/`); await settle(page); await shoot(page, 'journey');
  await page.goto(`${base}/arc/wano/`); await settle(page); await shoot(page, 'arc-title-card');
  await desktop.close();

  const phone = await browser.newContext({ viewport: { width: 260, height: 578 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await phone.addInitScript((value) => localStorage.setItem('grand-line-logbook-v1', value), reader(false));
  const mobile = await phone.newPage();
  await mobile.goto(`${base}/arc/wano/`); await settle(mobile); await shoot(mobile, 'mobile-arc');
  await phone.close();

  // The demo: scroll the voyage, open an island, read a little, close it again.
  const videoDir = mkdtempSync(join(tmpdir(), 'odyssey-demo-'));
  const recorder = await browser.newContext({ viewport: { width: 1280, height: 800 }, recordVideo: { dir: videoDir, size: { width: 1280, height: 800 } } });
  await recorder.addInitScript((value) => localStorage.setItem('grand-line-logbook-v1', value), reader(true));
  const demo = await recorder.newPage();
  await demo.goto(`${base}/`); await demo.waitForTimeout(1800);
  for (let i = 0; i < 24; i++) { await demo.mouse.wheel(0, 70); await demo.waitForTimeout(60); }
  await demo.waitForTimeout(700);
  await demo.locator('.arc-stop .island-hotspot').filter({ visible: true }).first().click();
  await demo.waitForTimeout(2600);
  for (let i = 0; i < 10; i++) { await demo.mouse.wheel(0, 90); await demo.waitForTimeout(80); }
  await demo.waitForTimeout(1500);
  await demo.keyboard.press('Escape');
  await demo.waitForTimeout(1200);
  await recorder.close();
  const video = readdirSync(videoDir).find((f) => f.endsWith('.webm'));
  if (!video) throw new Error('capture: Playwright wrote no video');
  // ffmpeg only decodes the video into frames (many builds lack a WebP encoder); sharp animates them.
  const ffmpeg = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', join(videoDir, video), '-vf', `fps=${FPS},scale=800:-1:flags=lanczos`, join(videoDir, 'frame-%04d.png')], { stdio: 'inherit' });
  if (ffmpeg.status !== 0) throw new Error('capture: ffmpeg failed; is it installed?');
  const frames = readdirSync(videoDir).filter((f) => f.startsWith('frame-')).sort().map((f) => join(videoDir, f));
  await sharp(frames, { join: { animated: true } }).webp({ quality: 55, effort: 6, loop: 0, delay: Math.round(1000 / FPS) }).toFile(join(out, 'demo.webp'));
  rmSync(videoDir, { recursive: true, force: true });
  console.log(`  docs/screenshots/demo.webp (${frames.length} frames)`);
  await browser.close();

  // GitHub's social preview (Settings → Social preview takes a 1280×640 upload; the API cannot set it).
  await sharp(Buffer.from(crewRowCard({ eyebrow: 'Every arc, drawn in code', title: 'One Piece Odyssey', subtitle: 'An illustrated voyage through the One Piece manga.', portraits: strawHats })))
    .resize(1280, 640, { fit: 'cover' }).png({ palette: true }).toFile(join(root, 'docs', 'social-preview.png'));
  console.log('  docs/social-preview.png');
} finally {
  server.kill();
}
