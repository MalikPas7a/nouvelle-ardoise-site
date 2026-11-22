// Capture d'une page à la largeur de la référence, pour comparer avec compare.py.
// Usage : node capture.mjs <url> <largeur> <sortie.png> [mobile]
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let playwright;
try { playwright = require('playwright'); } catch { playwright = require('/usr/lib/node_modules/playwright'); }
const [url, width = '1440', out = 'rendu.png', mobile] = process.argv.slice(2);
if (!url) { console.error('Usage : node capture.mjs <url> <largeur> <sortie.png> [mobile]'); process.exit(1); }
const browser = await playwright.chromium.launch();
const ctx = mobile
  ? await browser.newContext({ ...playwright.devices['iPhone 15'], deviceScaleFactor: 1 })
  : await browser.newContext({ viewport: { width: Number(width), height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.emulateMedia({ reducedMotion: 'reduce' });
await page.goto(url, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts && document.fonts.ready);
await page.screenshot({ path: out, fullPage: true });
await browser.close();
console.log('capture :', out);
