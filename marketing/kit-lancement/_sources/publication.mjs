// Exporte la publication (1080×1350) et la photo de profil (1080×1080) en PNG.
import { createRequire } from 'node:module';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT ?? 'playwright');
const ici = dirname(fileURLToPath(import.meta.url));
const nav = await chromium.launch({ args: ['--allow-file-access-from-files'] });
const page = await nav.newPage({ viewport: { width: 1080, height: 1350 } });
const url = pathToFileURL(join(ici, 'publication.html')).href;
for (const [quoi, fichier] of [['publication', 'publication/publication-lancement.png'], ['avatar', 'logo/avatar-instagram-ardoise.png']]) {
  await page.goto(`${url}?quoi=${quoi}`);
  await page.evaluate(() => window.pret);
  await page.locator('canvas').screenshot({ path: join(ici, '..', fichier) });
}
await nav.close();
