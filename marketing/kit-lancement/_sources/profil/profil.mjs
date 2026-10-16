// Exporte le profil Instagram : la bannière coupée en 3 publications épinglées (1080×1350, double résolution)
// et les 5 couvertures des stories à la une.
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT ?? 'playwright');
const ici = dirname(fileURLToPath(import.meta.url));
const sortie = join(ici, '..', '..', 'publication', 'profil');
mkdirSync(sortie, { recursive: true });
const nav = await chromium.launch({ args: ['--allow-file-access-from-files'] });
const page = await nav.newPage({ viewport: { width: 3240, height: 1350 }, deviceScaleFactor: 2 });
const url = pathToFileURL(join(ici, 'profil.html')).href;
await page.goto(`${url}?quoi=banniere`); await page.evaluate(() => window.pret);
await page.locator('canvas').screenshot({ path: join(sortie, 'banniere-complete.png') });
// ordre de publication : la partie droite d'abord, pour qu'elle finisse à droite de la grille
for (const [i, nom] of [[2, '1-publier-en-premier-droite'], [1, '2-publier-en-deuxieme-milieu'], [0, '3-publier-en-dernier-gauche']])
  await page.screenshot({ path: join(sortie, `epingle-${nom}.png`), clip: { x: i * 1080, y: 0, width: 1080, height: 1350 } });
const noms = ['services', 'realisations', 'click-collect', 'methode', 'contact'];
for (let n = 0; n < 5; n++) {
  await page.goto(`${url}?quoi=icone&n=${n}`); await page.evaluate(() => window.pret);
  await page.locator('canvas').screenshot({ path: join(sortie, `une-${n + 1}-${noms[n]}.png`) });
}
await nav.close();
