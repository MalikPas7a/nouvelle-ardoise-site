// Exporte l'image « concept » (les quatre métiers) en publication 4:5 et en story 9:16, en PNG.
import { createRequire } from 'node:module';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT ?? 'playwright');
const ici = dirname(fileURLToPath(import.meta.url));
const nav = await chromium.launch({ args: ['--allow-file-access-from-files'] });
const page = await nav.newPage({ viewport: { width: 1080, height: 1920 } });
const url = pathToFileURL(join(ici, 'concept.html')).href;
for (const [quoi, fichier] of [['publication', 'publication/concept-4x5.png'], ['story', 'publication/concept-story-9x16.png']]) {
  await page.goto(`${url}?quoi=${quoi}`);
  await page.evaluate(() => window.pret);
  await page.locator('canvas').screenshot({ path: join(ici, '..', fichier) });
}
await nav.close();
