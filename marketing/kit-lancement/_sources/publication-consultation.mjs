// Exporte le visuel fixe 4:5 (1080×1350) de la consultation « 15 minutes offertes ».
import { createRequire } from 'node:module';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT ?? 'playwright');
const ici = dirname(fileURLToPath(import.meta.url));
const nav = await chromium.launch({ args: ['--allow-file-access-from-files'] });
const page = await nav.newPage({ viewport: { width: 1080, height: 1350 } });
await page.goto(`${pathToFileURL(join(ici, 'reel-consultation.html')).href}?quoi=publication`);
await page.evaluate(() => window.pret);
await page.locator('canvas').screenshot({ path: join(ici, '..', 'publication', 'consultation-15min-4x5.png') });
await nav.close();
