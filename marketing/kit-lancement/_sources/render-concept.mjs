// Rend la vidéo concept image par image puis l'assemble en MP4 (H.264, 30 i/s), avec la voix off
// et la musique de son_concept.py.
//   node render-concept.mjs                    → 9:16, 1080×1920
//   FORMAT=16x9 node render-concept.mjs        → 16:9, 1920×1080
//   node render-concept.mjs --apercu 1,4,9     → captures PNG de ces instants
//   PLAN=rythme node render-concept.mjs       → le réel rythmé de 30 s sans voix (voix/plan-rythme.js)
//   PLAN=court node render-concept.mjs        → la version courte avec voix (voix/plan-court.js)
//   PAGE=reel-artisans PLAN=artisans node render-concept.mjs → le réel artisans
//   SORTIE=dossier                              → où écrire les MP4 (par défaut ../video-concept)
import { createRequire } from 'node:module';
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT ?? 'playwright');
const ici = dirname(fileURLToPath(import.meta.url));
const PAYSAGE = process.env.FORMAT === '16x9';
const PLAN = process.env.PLAN ?? '';
const PAGES = 4; // images rendues en parallèle
const [l, h] = PAYSAGE ? [1920, 1080] : [1080, 1920];
const sortie = process.env.SORTIE ?? join(ici, '..', 'video-concept');
const IPS = 30;
const tmp = process.env.TMP_REEL ?? mkdtempSync(join(tmpdir(), 'concept-'));

const nav = await chromium.launch({ args: ['--allow-file-access-from-files'] });
const adresse = pathToFileURL(join(ici, `${process.env.PAGE ?? 'video-concept'}.html`)).href + '?' + new URLSearchParams({ ...(PAYSAGE && { f: '16x9' }), ...(PLAN && !process.env.PAGE && { plan: PLAN }) });
const pages = await Promise.all(Array.from({ length: PAGES }, async () => {
  const p = await nav.newPage({ viewport: { width: l, height: h } });
  p.on('pageerror', (e) => { console.error(e); process.exit(1); });
  await p.goto(adresse);
  await p.evaluate(() => window.pret);
  return p;
}));
const page = pages[0];
const DUREE = await page.evaluate(() => window.DUREE);
const canvas = page.locator('canvas');
const nom = `nouvelle-ardoise-${PLAN === 'artisans' ? 'reel-artisans' : PLAN === 'rythme' ? 'reel' : 'concept'}-${Math.round(DUREE)}s-${PAYSAGE ? '16x9' : '9x16'}`;

const apercu = process.argv.indexOf('--apercu');
if (apercu > 0) {
  for (const t of process.argv[apercu + 1].split(',').map(Number)) {
    await page.evaluate((t) => window.rendu(t), t);
    await canvas.screenshot({ path: join(tmp, `apercu-${PAYSAGE ? 'h' : 'v'}-${t}.png`) });
  }
  console.log(tmp);
} else {
  mkdirSync(sortie, { recursive: true });
  const n = Math.round(IPS * DUREE);
  await Promise.all(pages.map(async (p, j) => {
    const toile = p.locator('canvas');
    for (let i = j; i < n; i += PAGES) {
      await p.evaluate((t) => window.rendu(t), i / IPS);
      await toile.screenshot({ path: join(tmp, `${String(i).padStart(4, '0')}.png`) });
      if (i % 300 === 0) console.log(`${i}/${n}`);
    }
  }));
  const son = PLAN === 'artisans' ? ['son_rythme.py', 'artisans'] : PLAN === 'rythme' ? ['son_rythme.py'] : ['son_concept.py', ...(PLAN === 'court' ? ['court'] : [])];
  execFileSync('python3', [join(ici, son[0]), join(tmp, 'son.wav'), ...son.slice(1)], { stdio: 'inherit' });
  const x264 = ['-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart'];
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(IPS), '-i', join(tmp, '%04d.png'), '-i', join(tmp, 'son.wav'),
    ...x264, '-c:a', 'aac', '-b:a', '192k', '-shortest', join(sortie, `${nom}.mp4`)]);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(IPS), '-i', join(tmp, '%04d.png'), ...x264, '-an',
    join(sortie, `${nom}-sans-son.mp4`)]);
  // couverture : le site d'Osteria del Lago dans le téléphone
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', join(tmp, `${String(Math.round(IPS * (PLAN === 'artisans' ? 12.5 : PLAN === 'rythme' ? 2 : PLAN === 'court' ? 9 : 21))).padStart(4, '0')}.png`), '-q:v', '2',
    join(sortie, `couverture-${nom}.jpg`)]);
  if (!process.env.TMP_REEL) rmSync(tmp, { recursive: true });
  console.log('Vidéo écrite dans', sortie, nom);
}
await nav.close();
