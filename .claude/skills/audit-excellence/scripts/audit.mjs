#!/usr/bin/env node
// Audit d'excellence Nouvelle Ardoise : mesures automatiques d'une page.
// Usage : node audit.mjs <url> [--out <dossier>] [--no-lighthouse]
// Lecture seule : ne modifie rien sur le site, écrit seulement le rapport dans --out.
// Dépendances : Playwright (déjà dans le conteneur) ; axe-core et lighthouse sont
// installés une fois dans ~/.cache/na-audit (ou $NA_AUDIT_DEPS) s'ils manquent.

import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const args = process.argv.slice(2);
const url = args.find((a) => /^https?:\/\//.test(a));
if (!url) {
  console.error('Usage : node audit.mjs <url> [--out <dossier>] [--no-lighthouse]');
  process.exit(1);
}
const outIdx = args.indexOf('--out');
const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
const outDir = path.resolve(outIdx > -1 ? args[outIdx + 1] : `audit-${stamp}`);
const withLighthouse = !args.includes('--no-lighthouse');
fs.mkdirSync(outDir, { recursive: true });

// ---------- dépendances ----------
const depsDir = process.env.NA_AUDIT_DEPS || path.join(os.homedir(), '.cache', 'na-audit');
function ensureDeps() {
  const need = ['axe-core', ...(withLighthouse ? ['lighthouse'] : [])].filter(
    (p) => !fs.existsSync(path.join(depsDir, 'node_modules', p)),
  );
  if (!need.length) return;
  fs.mkdirSync(depsDir, { recursive: true });
  if (!fs.existsSync(path.join(depsDir, 'package.json'))) {
    fs.writeFileSync(path.join(depsDir, 'package.json'), '{"name":"na-audit-deps","private":true}');
  }
  const pins = { 'axe-core': 'axe-core@4', lighthouse: 'lighthouse@13' };
  console.error(`Installation unique de : ${need.join(', ')} dans ${depsDir}`);
  execFileSync('npm', ['i', '--silent', '--no-audit', '--no-fund', ...need.map((n) => pins[n])], {
    cwd: depsDir,
    stdio: 'inherit',
  });
}
ensureDeps();
const depsRequire = createRequire(path.join(depsDir, 'package.json'));
const globalRequire = createRequire(import.meta.url);
let playwright;
try {
  playwright = globalRequire('playwright');
} catch {
  playwright = globalRequire(path.join(process.env.NODE_PATH || '/usr/local/lib/node_modules_global', 'playwright'));
}
const { chromium, devices } = playwright;
const axeSource = fs.readFileSync(depsRequire.resolve('axe-core/axe.min.js'), 'utf8');

// ---------- mots interdits (règles Nouvelle Ardoise) ----------
const MOTS_INTERDITS = [
  'alcool', 'vin', 'vins', 'bière', 'bières', 'biere', 'cocktail', 'cocktails', 'apéro', 'apéritif',
  'spritz', 'prosecco', 'champagne', 'whisky', 'vodka', 'rhum', 'gin', 'sangria', 'mojito', 'pastis',
  'wine', 'beer', 'cerveza', 'vino', 'crédit', 'financement', 'prêt', 'leasing', 'paiement en plusieurs fois',
];

// ---------- collecte dans la page ----------
async function collect(page) {
  return page.evaluate((MOTS) => {
    const vis = (el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > 0;
    };
    const meta = (sel) => document.querySelector(sel)?.getAttribute('content') || null;
    const vw = window.innerWidth;

    // Débordement horizontal
    const overflow = document.documentElement.scrollWidth - vw;
    const largeurs = [];
    if (overflow > 1) {
      for (const el of document.querySelectorAll('body *')) {
        const r = el.getBoundingClientRect();
        if (r.right > vw + 1 && r.width > 0 && vis(el)) {
          largeurs.push(`${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : ''} (${Math.round(r.right - vw)} px)`);
          if (largeurs.length >= 8) break;
        }
      }
    }

    // Cibles tactiles trop petites (< 44 px, recommandation Apple)
    const petites = [];
    for (const el of document.querySelectorAll('a[href], button, [role="button"], input, select, textarea, summary')) {
      if (!vis(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 44 || r.height < 44) {
        // lien inline dans un paragraphe : toléré
        const inline = el.tagName === 'A' && getComputedStyle(el).display === 'inline' && el.closest('p, li');
        if (!inline) petites.push(`${(el.innerText || el.getAttribute('aria-label') || el.tagName).trim().slice(0, 40)} (${Math.round(r.width)}×${Math.round(r.height)})`);
      }
    }

    // Champs de saisie < 16 px : zoom automatique sur iPhone
    const champsZoom = [...document.querySelectorAll('input, select, textarea')]
      .filter((el) => vis(el) && parseFloat(getComputedStyle(el).fontSize) < 16).length;

    // Typographie
    const familles = new Set();
    const tailles = new Set();
    let texteMinuscule = 0;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const t = walker.currentNode;
      if (!t.textContent.trim()) continue;
      const el = t.parentElement;
      if (!el || !vis(el)) continue;
      const s = getComputedStyle(el);
      familles.add(s.fontFamily.split(',')[0].replace(/["']/g, '').trim());
      tailles.add(Math.round(parseFloat(s.fontSize)));
      if (parseFloat(s.fontSize) < 12) texteMinuscule++;
    }

    // Signes « IA slop » repérables automatiquement
    const all = [...document.querySelectorAll('body *')];
    const texteDegrade = all.filter((el) => {
      const s = getComputedStyle(el);
      return (s.backgroundClip === 'text' || s.webkitBackgroundClip === 'text') && s.backgroundImage.includes('gradient');
    }).length;
    const emojiRe = /\p{Extended_Pictographic}/u;
    const emojisTitresBoutons = [...document.querySelectorAll('h1,h2,h3,h4,button,a,[role="button"],label')]
      .filter((el) => vis(el) && emojiRe.test(el.innerText || '')).length;
    const majusculesEspacees = all.filter((el) => {
      if (!el.childNodes.length || !vis(el)) return false;
      const s = getComputedStyle(el);
      return s.textTransform === 'uppercase' && parseFloat(s.letterSpacing) >= 1 && (el.innerText || '').trim().length > 0 && el.children.length === 0;
    }).length;
    const curseurCache = all.some((el) => getComputedStyle(el).cursor === 'none') || getComputedStyle(document.body).cursor === 'none';
    const animationsInfinies = all.filter((el) => {
      const s = getComputedStyle(el);
      return s.animationName !== 'none' && s.animationIterationCount === 'infinite' && vis(el);
    }).length;

    // SEO
    const ldjson = [...document.querySelectorAll('script[type="application/ld+json"]')].flatMap((s) => {
      try {
        const j = JSON.parse(s.textContent);
        const arr = Array.isArray(j) ? j : j['@graph'] || [j];
        return arr.map((o) => o['@type']).flat();
      } catch {
        return ['JSON-LD invalide'];
      }
    });
    const imgs = [...document.querySelectorAll('img')];
    const seo = {
      title: document.title,
      titleLen: document.title.length,
      description: meta('meta[name="description"]'),
      descriptionLen: (meta('meta[name="description"]') || '').length,
      canonical: document.querySelector('link[rel="canonical"]')?.href || null,
      robots: meta('meta[name="robots"]'),
      lang: document.documentElement.lang || null,
      hreflang: [...document.querySelectorAll('link[rel="alternate"][hreflang]')].map((l) => l.hreflang),
      ogTitle: meta('meta[property="og:title"]'),
      ogImage: meta('meta[property="og:image"]'),
      h1: [...document.querySelectorAll('h1')].map((h) => h.innerText.trim().slice(0, 80)),
      jsonld: ldjson,
      imgSansAlt: imgs.filter((i) => !i.hasAttribute('alt')).length,
      imgSansDimensions: imgs.filter((i) => !i.getAttribute('width') && !i.getAttribute('height') && !getComputedStyle(i).aspectRatio.includes('/')).length,
      imgSansLazyHorsEcran: imgs.filter((i) => i.getBoundingClientRect().top > window.innerHeight * 1.5 && i.loading !== 'lazy').length,
      liensVides: [...document.querySelectorAll('a')].filter((a) => !a.innerText.trim() && !a.getAttribute('aria-label') && !a.querySelector('img[alt]:not([alt=""]), svg[aria-label], [aria-label]')).length,
    };

    // Conversion : appels à l'action visibles au premier écran
    const motsCTA = /(command|test|rendez|essai|réserv|reserv|book|order|pedir|reservar|appel|call|itinéraire|directions|menu|carte|devis|contact|whatsapp|click|collect|livr)/i;
    const ctaPremierEcran = [...document.querySelectorAll('a[href], button')]
      .filter((el) => vis(el) && el.getBoundingClientRect().top < window.innerHeight && motsCTA.test(el.innerText || el.getAttribute('aria-label') || ''))
      .map((el) => (el.innerText || el.getAttribute('aria-label')).trim().slice(0, 40));
    const telLiens = document.querySelectorAll('a[href^="tel:"]').length;
    const mapsLiens = [...document.querySelectorAll('a[href]')].filter((a) => /maps\.(google|apple)|goo\.gl\/maps|maps\.app/.test(a.href)).length;

    // Règles NA : mots interdits
    const texte = document.body.innerText.toLowerCase();
    const motsTrouves = MOTS.filter((m) => new RegExp(`(^|[^\\p{L}])${m}([^\\p{L}]|$)`, 'u').test(texte));

    return {
      overflow,
      largeurs,
      petites: petites.slice(0, 15),
      nbPetites: petites.length,
      champsZoom,
      familles: [...familles],
      tailles: [...tailles].sort((a, b) => a - b),
      texteMinuscule,
      slop: { texteDegrade, emojisTitresBoutons, majusculesEspacees, curseurCache, animationsInfinies },
      seo,
      conversion: { ctaPremierEcran, telLiens, mapsLiens },
      motsTrouves,
      lenisActif: document.documentElement.classList.contains('lenis'),
      hauteurPage: document.documentElement.scrollHeight,
    };
  }, MOTS_INTERDITS);
}

async function runAxe(page) {
  await page.addScriptTag({ content: axeSource });
  return page.evaluate(async () => {
    const r = await window.axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
      resultTypes: ['violations'],
    });
    return r.violations.map((v) => ({ id: v.id, impact: v.impact, aide: v.help, noeuds: v.nodes.length, exemple: v.nodes[0]?.target?.join(' ') }));
  });
}

async function scrollToBottom(page) {
  // fait apparaître les éléments chargés au défilement (lazy, reveals)
  await page.evaluate(async () => {
    const h = () => document.documentElement.scrollHeight;
    for (let y = 0; y < h(); y += Math.round(innerHeight * 0.8)) {
      window.scrollTo({ top: y, behavior: 'instant' });
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
    await new Promise((r) => setTimeout(r, 400));
  });
}

const PROFILS = {
  iphone: { ...devices['iPhone 15'] },
  bureau: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
};

const browser = await chromium.launch();
const rapport = { url, date: new Date().toISOString(), profils: {} };

for (const [nom, ctxOpts] of Object.entries(PROFILS)) {
  const ctx = await browser.newContext(ctxOpts);
  const page = await ctx.newPage();
  const consoleErreurs = [];
  const requetesEchouees = [];
  let octets = { total: 0, images: 0, js: 0, css: 0, polices: 0 };
  let nbPolices = 0;
  const grossesImages = [];
  page.on('console', (m) => m.type() === 'error' && consoleErreurs.push(m.text().slice(0, 160)));
  page.on('pageerror', (e) => consoleErreurs.push(String(e).slice(0, 160)));
  page.on('response', async (res) => {
    try {
      if (res.status() >= 400) requetesEchouees.push(`${res.status()} ${res.url().slice(0, 120)}`);
      const len = +(res.headers()['content-length'] || 0) || (await res.body().catch(() => Buffer.alloc(0))).length;
      const type = res.request().resourceType();
      octets.total += len;
      if (type === 'image') {
        octets.images += len;
        if (len > 300_000) grossesImages.push(`${Math.round(len / 1024)} Ko ${res.url().split('/').pop().slice(0, 60)}`);
      }
      if (type === 'script') octets.js += len;
      if (type === 'stylesheet') octets.css += len;
      if (type === 'font') { octets.polices += len; nbPolices++; }
    } catch {}
  });
  const t0 = Date.now();
  await page.goto(url, { waitUntil: 'load', timeout: 60_000 });
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
  const chargement = Date.now() - t0;
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(outDir, `${nom}-premier-ecran.jpg`), quality: 80, type: 'jpeg' });
  await scrollToBottom(page);
  const mesures = await collect(page);
  const axe = await runAxe(page);
  // capture pleine page, hauteur plafonnée pour rester lisible
  const maxH = 12000;
  await page.screenshot({
    path: path.join(outDir, `${nom}-page-entiere.jpg`),
    type: 'jpeg',
    quality: 60,
    fullPage: mesures.hauteurPage <= maxH,
    ...(mesures.hauteurPage > maxH ? { clip: { x: 0, y: 0, width: page.viewportSize().width, height: maxH } } : {}),
  }).catch(() => {});
  await ctx.close();

  // Mouvement réduit : Lenis doit être coupé
  const ctxR = await browser.newContext({ ...ctxOpts, reducedMotion: 'reduce' });
  const pR = await ctxR.newPage();
  await pR.goto(url, { waitUntil: 'load', timeout: 60_000 });
  await pR.waitForTimeout(1500);
  const lenisSousReduced = await pR.evaluate(() => document.documentElement.classList.contains('lenis'));
  await ctxR.close();

  rapport.profils[nom] = {
    chargementMs: chargement,
    octets: Object.fromEntries(Object.entries(octets).map(([k, v]) => [k, Math.round(v / 1024)])),
    nbPolices,
    grossesImages: grossesImages.slice(0, 10),
    consoleErreurs: [...new Set(consoleErreurs)].slice(0, 10),
    requetesEchouees: [...new Set(requetesEchouees)].slice(0, 10),
    lenisSousReduced,
    axe,
    ...mesures,
  };
}
await browser.close();

// ---------- Lighthouse mobile (Core Web Vitals de labo) ----------
if (withLighthouse) {
  try {
    const lhBin = path.join(depsDir, 'node_modules', '.bin', 'lighthouse');
    const lhOut = path.join(outDir, 'lighthouse.json');
    execFileSync(lhBin, [url, '--quiet', '--output=json', `--output-path=${lhOut}`, '--form-factor=mobile',
      `--chrome-path=${chromium.executablePath()}`, '--chrome-flags=--headless=new --no-sandbox'], { stdio: 'ignore', timeout: 180_000 });
    const lh = JSON.parse(fs.readFileSync(lhOut, 'utf8'));
    const a = lh.audits;
    rapport.lighthouse = {
      scores: Object.fromEntries(Object.entries(lh.categories).map(([k, c]) => [k, Math.round(c.score * 100)])),
      LCP: a['largest-contentful-paint']?.displayValue,
      CLS: a['cumulative-layout-shift']?.displayValue,
      TBT: a['total-blocking-time']?.displayValue,
      FCP: a['first-contentful-paint']?.displayValue,
      SI: a['speed-index']?.displayValue,
      lcpMs: a['largest-contentful-paint']?.numericValue,
      clsVal: a['cumulative-layout-shift']?.numericValue,
      tbtMs: a['total-blocking-time']?.numericValue,
      pistes: Object.values(a).filter((x) => x.details?.type === 'opportunity' && (x.details.overallSavingsMs || 0) > 150)
        .sort((x, y) => y.details.overallSavingsMs - x.details.overallSavingsMs).slice(0, 6)
        .map((x) => `${x.title} (≈ ${Math.round(x.details.overallSavingsMs)} ms)`),
    };
  } catch (e) {
    rapport.lighthouse = { erreur: String(e.message || e).slice(0, 200) };
  }
}

// ---------- Bloquants automatiques ----------
const B = [];
const ip = rapport.profils.iphone;
const bu = rapport.profils.bureau;
const lh = rapport.lighthouse || {};
if (ip.overflow > 1) B.push(`iPhone : la page déborde de ${ip.overflow} px à droite (${ip.largeurs.slice(0, 3).join(', ')})`);
if (ip.champsZoom) B.push(`iPhone : ${ip.champsZoom} champ(s) de saisie en dessous de 16 px (zoom forcé)`);
for (const p of [ip, bu]) {
  const graves = p.axe.filter((v) => v.impact === 'critical' || v.impact === 'serious');
  if (graves.length) { B.push(`Accessibilité : ${graves.length} problème(s) grave(s) (${graves.map((v) => v.id).join(', ')})`); break; }
}
if (ip.motsTrouves.length) B.push(`Règle Nouvelle Ardoise : mots interdits trouvés (${ip.motsTrouves.join(', ')}) : vérifier le contexte`);
if (ip.slop.curseurCache || bu.slop.curseurCache) B.push('Curseur personnalisé ou masqué : interdit sur un site de restaurant sauf demande');
if (ip.lenisSousReduced || bu.lenisSousReduced) B.push('Lenis reste actif sous prefers-reduced-motion');
if (ip.consoleErreurs.length || bu.consoleErreurs.length) B.push(`Erreurs JavaScript dans la console (${(ip.consoleErreurs[0] || bu.consoleErreurs[0])})`);
if (ip.requetesEchouees.length) B.push(`Ressources en erreur (${ip.requetesEchouees.slice(0, 2).join(' ; ')})`);
if (ip.seo.h1.length !== 1) B.push(`SEO : ${ip.seo.h1.length} titre(s) H1 au lieu d'un seul`);
if (!ip.seo.description) B.push('SEO : meta description absente');
if (!ip.seo.lang) B.push('SEO/accessibilité : attribut lang absent sur <html>');
if (!ip.conversion.ctaPremierEcran.length) B.push('Conversion : aucune action claire (commander, réserver, appeler…) au premier écran iPhone');
if (lh.lcpMs > 2500) B.push(`Performance : LCP mobile ${lh.LCP} (objectif ≤ 2,5 s)`);
if (lh.clsVal > 0.1) B.push(`Performance : CLS ${lh.CLS} (objectif ≤ 0,1)`);
rapport.bloquants = B;

const A = [];
if (ip.nbPetites) A.push(`iPhone : ${ip.nbPetites} cible(s) tactile(s) < 44 px (${ip.petites.slice(0, 4).join(' ; ')})`);
if (ip.familles.length > 3) A.push(`Typo : ${ip.familles.length} familles de polices visibles (${ip.familles.join(', ')}) : 2, 3 maximum`);
if (ip.tailles.length > 10) A.push(`Typo : ${ip.tailles.length} tailles de texte différentes (${ip.tailles.join(', ')}) : resserrer l'échelle`);
if (ip.texteMinuscule) A.push(`Typo : ${ip.texteMinuscule} bloc(s) de texte sous 12 px sur iPhone`);
if (ip.slop.texteDegrade) A.push(`Signe IA : ${ip.slop.texteDegrade} texte(s) en dégradé`);
if (ip.slop.emojisTitresBoutons) A.push(`Signe IA : ${ip.slop.emojisTitresBoutons} titre(s)/bouton(s) avec emoji`);
if (ip.slop.majusculesEspacees > 6) A.push(`Signe IA possible : ${ip.slop.majusculesEspacees} petits libellés en majuscules espacées`);
if (ip.slop.animationsInfinies > 2) A.push(`Mouvement : ${ip.slop.animationsInfinies} animations en boucle infinie visibles`);
if (ip.seo.titleLen < 25 || ip.seo.titleLen > 65) A.push(`SEO : titre de ${ip.seo.titleLen} caractères (viser 30-60)`);
if (ip.seo.description && (ip.seo.descriptionLen < 70 || ip.seo.descriptionLen > 165)) A.push(`SEO : description de ${ip.seo.descriptionLen} caractères (viser 120-160)`);
if (!ip.seo.canonical) A.push('SEO : pas de lien canonical');
if (!ip.seo.ogImage) A.push('Partage : pas d\'image og:image (aperçu WhatsApp/Instagram vide)');
if (!ip.seo.jsonld.some((t) => /Restaurant|FoodEstablishment|Bakery|LocalBusiness|Organization|CafeOrCoffeeShop/.test(String(t)))) A.push(`SEO local : pas de JSON-LD Restaurant/LocalBusiness (trouvé : ${ip.seo.jsonld.join(', ') || 'rien'})`);
if (ip.seo.imgSansAlt) A.push(`Accessibilité : ${ip.seo.imgSansAlt} image(s) sans attribut alt`);
if (ip.seo.imgSansLazyHorsEcran > 2) A.push(`Performance : ${ip.seo.imgSansLazyHorsEcran} images hors écran sans loading="lazy"`);
if (ip.grossesImages.length) A.push(`Performance : images lourdes (${ip.grossesImages.slice(0, 3).join(' ; ')})`);
if (ip.octets.total > 3000) A.push(`Performance : page de ${ip.octets.total} Ko sur iPhone (viser < 2 500 Ko)`);
if (ip.nbPolices > 6) A.push(`Performance : ${ip.nbPolices} fichiers de police chargés`);
if (!ip.conversion.telLiens) A.push('Conversion : aucun lien tel: (appel en un geste sur iPhone)');
if (!ip.conversion.mapsLiens) A.push('Conversion : aucun lien itinéraire Google/Apple Maps');
for (const v of ip.axe.filter((v) => v.impact === 'moderate' || v.impact === 'minor')) A.push(`Accessibilité (${v.impact}) : ${v.aide} [${v.id}, ${v.noeuds}×]`);
if (lh.tbtMs > 200) A.push(`Performance : TBT ${lh.TBT} (indice de réactivité INP, viser < 200 ms)`);
for (const p of lh.pistes || []) A.push(`Lighthouse : ${p}`);
rapport.ameliorations = A;

fs.writeFileSync(path.join(outDir, 'rapport.json'), JSON.stringify(rapport, null, 2));

// ---------- Rapport lisible ----------
const lignes = [];
lignes.push(`# Mesures automatiques : ${url}`, '', `Date : ${rapport.date.slice(0, 16).replace('T', ' ')} UTC`, '');
if (lh.scores) {
  lignes.push('## Lighthouse mobile', '', '| Performance | Accessibilité | Bonnes pratiques | SEO |', '|---|---|---|---|',
    `| ${lh.scores.performance} | ${lh.scores.accessibility} | ${lh.scores['best-practices']} | ${lh.scores.seo} |`, '',
    `LCP ${lh.LCP} · CLS ${lh.CLS} · TBT ${lh.TBT} · FCP ${lh.FCP}`, '');
} else if (lh.erreur) lignes.push(`Lighthouse non lancé : ${lh.erreur}`, '');
lignes.push(`## Bloquants (${B.length})`, '', ...(B.length ? B.map((b) => `- ${b}`) : ['- Aucun bloquant automatique.']), '');
lignes.push(`## À améliorer (${A.length})`, '', ...(A.length ? A.map((b) => `- ${b}`) : ['- Rien à signaler.']), '');
lignes.push('## Chiffres', '', '| | iPhone | Bureau |', '|---|---|---|',
  `| Poids total | ${ip.octets.total} Ko | ${bu.octets.total} Ko |`,
  `| Images / JS / CSS / polices | ${ip.octets.images} / ${ip.octets.js} / ${ip.octets.css} / ${ip.octets.polices} Ko | ${bu.octets.images} / ${bu.octets.js} / ${bu.octets.css} / ${bu.octets.polices} Ko |`,
  `| Chargement (load + réseau calme) | ${ip.chargementMs} ms | ${bu.chargementMs} ms |`,
  `| Polices visibles | ${ip.familles.join(', ')} | ${bu.familles.join(', ')} |`,
  `| Problèmes axe (WCAG 2.2 AA) | ${ip.axe.length} | ${bu.axe.length} |`,
  `| Actions au 1er écran | ${ip.conversion.ctaPremierEcran.join(' · ') || 'aucune'} | ${bu.conversion.ctaPremierEcran.join(' · ') || 'aucune'} |`,
  `| JSON-LD | ${ip.seo.jsonld.join(', ') || 'aucun'} | |`,
  `| Langues (hreflang) | ${ip.seo.hreflang.join(', ') || 'aucune'} | |`, '',
  'Captures : `iphone-premier-ecran.jpg`, `iphone-page-entiere.jpg`, `bureau-premier-ecran.jpg`, `bureau-page-entiere.jpg`.', '',
  'Ces mesures ne remplacent pas la relecture de la grille (design, anti-IA, contenu, comparaison au secteur) : voir `references/grille.md`.');
fs.writeFileSync(path.join(outDir, 'mesures.md'), lignes.join('\n'));
console.log(`Rapport : ${path.join(outDir, 'mesures.md')}`);
console.log(`${B.length} bloquant(s), ${A.length} amélioration(s).`);
