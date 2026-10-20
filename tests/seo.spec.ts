import { test, expect } from '@playwright/test';
import { arcs } from '../src/data/arcs';

const STORAGE_KEY = 'grand-line-logbook-v1';
const rootTitle = /an illustrated journey through the One Piece manga/;
const wano = arcs.find((a) => a.id === 'wano')!;

test.describe('prerendered pages', () => {
  test('each record answers with its own title, canonical link and share image', async ({ request }) => {
    for (const [path, title] of [['/arc/wano/', /Wano Country arc/], ['/character/luffy/', /Monkey D\. Luffy/], ['/location/water-seven/', /Water Seven/], ['/crew/', /Crews and factions/]] as const) {
      const html = await (await request.get(path)).text();
      const head = html.slice(0, html.indexOf('</head>'));
      expect(head).toMatch(new RegExp(`<title>[^<]*${title.source}`));
      expect(head).not.toMatch(rootTitle);
      expect(head).toContain(`<link rel="canonical" href="https://one-piece-odyssey.netlify.app${path}"/>`);
      expect(head).toMatch(/<meta property="og:image" content="https:\/\/one-piece-odyssey\.netlify\.app\/og\/[^"]+\.png"\/>/);
      expect(head).toContain('"@type":"BreadcrumbList"');
    }
  });

  test('pages carry readable text and real links for crawlers', async ({ request }) => {
    const html = await (await request.get('/arc/wano/')).text();
    expect(html).toContain('<div id="prerender">');
    expect(html).toContain(wano.beats[0].title.replace(/&/g, '&amp;').replace(/'/g, '&#39;'));
    expect(html).toContain('href="/character/luffy/"');
  });

  test('share images, sitemap and robots are real files', async ({ request }) => {
    const png = await request.get('/og/arc/wano.png');
    expect(png.headers()['content-type']).toBe('image/png');
    expect((await png.body()).subarray(1, 4).toString()).toBe('PNG');
    const sitemap = await (await request.get('/sitemap.xml')).text();
    expect(sitemap).toContain('<urlset');
    expect(sitemap).toContain('/arc/wano/</loc>');
    expect(sitemap).not.toContain('/saved/');
    expect(await (await request.get('/robots.txt')).text()).toContain('Sitemap: https://one-piece-odyssey.netlify.app/sitemap.xml');
  });

  test('a cold path load opens the reader and replaces the static summary', async ({ page }) => {
    await page.goto('/arc/wano/');
    await expect(page.getByRole('dialog')).toContainText(wano.name);
    await expect(page.locator('#prerender')).toHaveCount(0);
  });

  test('links shared before paths existed open the same beat and settle on the path', async ({ page }) => {
    const beat = wano.beats[1].id;
    await page.goto(`/?arc=wano&beat=${beat}`);
    await expect(page.getByRole('dialog')).toContainText(wano.name);
    await expect(page).toHaveURL(new RegExp(`/arc/wano/\\?beat=${beat}$`));
  });
});

test.describe('spoiler guard', () => {
  // Block the app bundle so the page stays as served, the way a slow connection shows it.
  test.beforeEach(async ({ page }) => { await page.route(/\/assets\/index-[^/]+\.js$/, (route) => route.abort()); });

  test('the full-edition summary is readable before the app mounts', async ({ page }) => {
    await page.goto('/character/luffy/');
    await expect(page.locator('#prerender h1')).toBeVisible();
  });

  test('readers who limit spoilers never see it', async ({ page }) => {
    await page.addInitScript((key) => localStorage.setItem(key, JSON.stringify({ version: 1, saved: [], explored: [], motion: false, spoilerThrough: 100, resume: { y: 0 } })), STORAGE_KEY);
    await page.goto('/character/luffy/');
    await expect(page.locator('html')).toHaveClass(/reading-limited/);
    await expect(page.locator('#prerender')).toBeHidden();
  });
});
