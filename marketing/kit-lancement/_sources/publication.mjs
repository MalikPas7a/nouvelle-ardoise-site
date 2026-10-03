// Exporte publication.html en PNG 1080×1350 dans ../publication/
import { createRequire } from 'node:module';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT ?? 'playwright');
const ici = dirname(fileURLToPath(import.meta.url));
const nav = await chromium.launch({ args: ['--allow-file-access-from-files'] });
const page = await nav.newPage({ viewport: { width: 1080, height: 1350 } });
await page.goto(pathToFileURL(join(ici, 'publication.html')).href, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
await page.locator('.pub').screenshot({ path: join(ici, '..', 'publication', 'publication-lancement.png') });
await nav.close();
