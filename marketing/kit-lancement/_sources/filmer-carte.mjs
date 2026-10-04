// Filme la carte de démo (Sora) au format téléphone, avec de vraies interactions.
//   (npx astro preview --port 4399 &) ; node filmer-carte.mjs .   → images dans _sources/ecran/
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT ?? 'playwright');
const S = process.argv[2];
const nav = await chromium.launch();
const page = await nav.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
await page.goto('http://localhost:4399/', { waitUntil: 'load' });
await page.evaluate(() => {
  const v = document.querySelector('.vitrine--sora[data-carte]');
  document.body.replaceChildren(v);
  const st = document.createElement('style');
  st.textContent = `html,body{margin:0;background:#17161A;scroll-behavior:auto}
    .vitrine--sora[data-carte]{width:100%!important;max-width:none!important;margin:0!important;border-radius:0!important;height:auto!important;overflow:visible!important;padding-top:64px!important;padding-bottom:120px!important;box-sizing:border-box}
    .carte__prix{display:none!important}`;
  document.head.append(st);
  window.scrollTo(0, 0);
});
await page.waitForTimeout(800);
const cdp = await page.context().newCDPSession(page);
const frames = [];
cdp.on('Page.screencastFrame', async (f) => {
  frames.push({ t: f.metadata.timestamp, data: f.data });
  try { await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }); } catch {}
});
const t0 = Date.now() / 1000;
const taps = [];
const now = () => Date.now() / 1000 - t0;
await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 95, maxWidth: 1170, maxHeight: 2532, everyNthFrame: 1 });
// petite animation continue pour forcer des images même à l'arrêt
await page.evaluate(() => { const d = document.createElement('div'); d.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;opacity:.01;pointer-events:none'; document.body.append(d); let k = 0; (function f(){ d.style.transform = `translateX(${(k++ % 2)}px)`; requestAnimationFrame(f); })(); });
const defiler = (y, ms) => page.evaluate(([y, ms]) => new Promise((ok) => {
  const y0 = scrollY, d = performance.now();
  const e = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
  (function f(n) { const k = Math.min(1, (n - d) / ms); scrollTo(0, y0 + (y - y0) * e(k)); k < 1 ? requestAnimationFrame(f) : ok(); })(d);
}), [y, ms]);
const toucher = async (sel) => {
  const b = await page.locator(sel).first().boundingBox();
  const x = b.x + b.width / 2, y = b.y + b.height / 2;
  taps.push({ t: now(), x: x / 390, y: y / 844 });
  await page.touchscreen.tap(x, y);
};
await page.waitForTimeout(900);
await defiler(760, 1900);                 // la carte défile
await page.waitForTimeout(300);
await defiler(0, 1000);
await page.waitForTimeout(250);
await toucher('[data-filtre="vege"]');     // végétarien
await page.waitForTimeout(1300);
await toucher('[data-langue="en"]');       // en anglais
await page.waitForTimeout(1300);
await toucher('[data-filtre="epice"]');    // épicé
await page.waitForTimeout(1100);
await toucher('[data-filtre="tout"]');     // tout
await page.waitForTimeout(300);
await defiler(420, 1300);
await page.waitForTimeout(500);
await cdp.send('Page.stopScreencast');
const debut = frames[0].t;
frames.forEach((f, i) => writeFileSync(`${S}/ecran/${String(i).padStart(4, '0')}.jpg`, Buffer.from(f.data, 'base64')));
const donnees = JSON.stringify({ temps: frames.map((f) => f.t - debut), taps: taps.map((p) => ({ ...p, t: p.t - (debut - t0) })) });
writeFileSync(`${S}/ecran/index.json`, donnees);
// chargé par reel-carte.html (un fetch ne marche pas en file://)
writeFileSync(`${S}/ecran/index.js`, `window.ECRAN_DONNEES = ${donnees};\n`);
console.log(frames.length, 'images', (frames.at(-1).t - debut).toFixed(2), 's', JSON.stringify(taps));
await nav.close();
// Ensuite, réduire les images à la taille de l'écran du réel :
//   for f in ecran/*.jpg; do ffmpeg -v error -y -i $f -vf scale=700:-2:flags=lanczos -q:v 2 ecran/p/$(basename $f); done
