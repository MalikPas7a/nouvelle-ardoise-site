// Exporte chaque SVG du dossier logo/ en PNG (x4, fond transparent).
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT ?? 'playwright');
import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const dossier = join(dirname(fileURLToPath(import.meta.url)), '..', 'logo');
const nav = await chromium.launch();
const page = await nav.newPage();
for (const f of readdirSync(dossier).filter((f) => f.endsWith('.svg'))) {
  const svg = readFileSync(join(dossier, f), 'utf8');
  const [, l, h] = svg.match(/viewBox="0 0 (\d+) (\d+)"/).map(Number);
  const k = f.startsWith('avatar') ? 1 : f.startsWith('symbole') ? 1024 / 28 : 4;
  await page.setViewportSize({ width: Math.round(l * k), height: Math.round(h * k) });
  await page.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block;width:100vw;height:100vh}</style>${svg}`);
  await page.screenshot({ path: join(dossier, f.replace('.svg', '.png')), omitBackground: true });
}
await nav.close();
