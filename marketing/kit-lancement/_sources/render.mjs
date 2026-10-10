// Rend le réel image par image puis l'assemble en MP4 (H.264, 30 i/s, 1080×1920).
//   node render.mjs                 → reel/reel-sushi-15s.mp4 (+ version muette)
//   REEL=reel-carte node render.mjs  → reel/reel-carte-15s.mp4 (page reel-carte.html, son son_carte.py)
//   node render.mjs --apercu 1,4,9  → captures PNG de ces instants dans le dossier temporaire
import { createRequire } from 'node:module';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT ?? 'playwright');
const ici = dirname(fileURLToPath(import.meta.url));
const sortie = join(ici, '..', 'reel');
const IPS = 30;
const REEL = process.env.REEL ?? 'reel';
const NOM = { reel: 'reel-sushi-15s', 'reel-carte': 'reel-carte-15s', 'reel-reseaux': 'reel-reseaux-18s', 'reel-menu': 'reel-menu-du-jour-16s', 'reel-ardoise': 'reel-sur-mesure-23s', 'reel-artisan': 'reel-artisan-24s', 'reel-coulisses': 'reel-coulisses-20s', 'reel-ouverture': 'reel-nouvelles-ouvertures-27s' }[REEL];
const SON = { reel: 'son.py', 'reel-carte': 'son_carte.py', 'reel-reseaux': 'son_reseaux.py', 'reel-menu': 'son_menu.py', 'reel-ardoise': 'son_ardoise.py', 'reel-artisan': 'son_artisan.py', 'reel-coulisses': 'son_coulisses.py', 'reel-ouverture': 'son_ouverture.py' }[REEL];
const COUVERTURE = { reel: '0210', 'reel-carte': '0240', 'reel-reseaux': '0165', 'reel-menu': '0330', 'reel-ardoise': '0540', 'reel-artisan': '0510', 'reel-coulisses': '0450', 'reel-ouverture': '0225' }[REEL];
const tmp = process.env.TMP_REEL ?? mkdtempSync(join(tmpdir(), 'reel-'));

const nav = await chromium.launch({ args: ['--allow-file-access-from-files'] });
const page = await nav.newPage({ viewport: { width: 1080, height: 1920 } });
await page.goto(pathToFileURL(join(ici, `${REEL}.html`)).href);
await page.evaluate(() => window.pret);
const DUREE = await page.evaluate(() => window.DUREE ?? 15);
const canvas = page.locator('canvas');

const apercu = process.argv.indexOf('--apercu');
if (apercu > 0) {
  for (const t of process.argv[apercu + 1].split(',').map(Number)) {
    await page.evaluate((t) => window.rendu(t), t);
    await canvas.screenshot({ path: join(tmp, `apercu-${t}.png`) });
  }
  console.log(tmp);
} else {
  for (let i = 0; i < IPS * DUREE; i++) {
    await page.evaluate((t) => window.rendu(t), i / IPS);
    await canvas.screenshot({ path: join(tmp, `${String(i).padStart(4, '0')}.png`) });
  }
  execFileSync('python3', [join(ici, SON), join(tmp, 'son.wav')]);
  const x264 = ['-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-movflags', '+faststart'];
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(IPS), '-i', join(tmp, '%04d.png'), '-i', join(tmp, 'son.wav'),
    ...x264, '-c:a', 'aac', '-b:a', '192k', '-shortest', join(sortie, `${NOM}.mp4`)]);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(IPS), '-i', join(tmp, '%04d.png'), ...x264, '-an',
    join(sortie, `${NOM}-sans-son.mp4`)]);
  // image de couverture du réel : le maki éclaté et ses étiquettes
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', join(tmp, `${COUVERTURE}.png`), join(sortie, REEL === 'reel' ? 'couverture-reel.jpg' : `couverture-${REEL}.jpg`)]);
  if (!process.env.TMP_REEL) rmSync(tmp, { recursive: true });
  console.log('Réel écrit dans', sortie);
}
await nav.close();
