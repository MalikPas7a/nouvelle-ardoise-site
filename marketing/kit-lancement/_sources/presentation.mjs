// Exporte l'image officielle Nouvelle Ardoise aux trois formats Instagram (4:5, 1:1, 9:16) en PNG.
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT ?? 'playwright');
const ici = dirname(fileURLToPath(import.meta.url));
mkdirSync(join(ici, '..', 'publication'), { recursive: true });
const nav = await chromium.launch({ args: ['--allow-file-access-from-files'] });
const page = await nav.newPage({ viewport: { width: 1080, height: 1920 } });
const url = pathToFileURL(join(ici, 'presentation.html')).href;
for (const [quoi, fichier] of [['publication', 'publication/presentation-4x5.png'], ['carre', 'publication/presentation-carre-1x1.png'], ['story', 'publication/presentation-story-9x16.png']]) {
  await page.goto(`${url}?quoi=${quoi}`);
  await page.evaluate(() => window.pret);
  await page.locator('canvas').screenshot({ path: join(ici, '..', fichier) });
}
await nav.close();
