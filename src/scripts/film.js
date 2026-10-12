// Le film « La mise en place » : 264 images WebP dessinées sur une toile au rythme du défilement.
// Pas de vidéo, rien d'automatique : la progression du film est celle de la section collante.
// Au doigt, huit jalons aimantés et des paliers tiennent les images stables ; à la souris, Lenis suffit.
// Les textes sont du vrai HTML au-dessus de la toile, fenêtrés en progression du film (data-de / data-a / data-f).
// Chargement : l'affiche 001 d'abord, la craie (2-60) tout de suite, les jalons, puis 1/8 → 1/4 → 1/2 → tout ;
// décodage dans un anneau d'ImageBitmap autour de l'image affichée, mémoire bornée. Aucune boucle propre :
// une tâche dans la boucle de defilement.js, qui s'endort quand plus rien ne bouge.
// Recette : section.aller(0.65) fige le film (aller(null) rend la main), section.etat() dit où il en est.
import { taches, calme, borne, reveiller } from './defilement.js';
import '@fontsource/caveat/600.css';

function film(section) {
  /* ---------- mode, taille, source ---------- */
  const souris = matchMedia('(hover: hover) and (pointer: fine)').matches;   // même test que motion.js
  const tactile = !souris;
  const html = document.documentElement;
  html.classList.toggle('tactile', tactile);
  const tailles = (section.dataset.tailles || 'm').split(',');
  // choisie une fois : jamais de 404 sur un dossier absent
  const taille = innerWidth >= 900 && tailles.includes('g') ? 'g' : 'm';
  section.dataset.taille = taille;
  const [SRC_W, SRC_H] = (section.dataset['source' + taille.toUpperCase()] || '720,1280').split(',').map(Number);
  const dossier = `/sequences/${section.dataset.film}/${taille}`;
  const total = Number(section.dataset.images) || 264;
  // lissage : le film colle à la molette, amortit l'aimant au doigt (0.22 si la craie glisse trop vite entre J0 et J1)
  const TAU = souris ? 0.05 : 0.16;
  // mouvement réduit : la page reste statique (affiche 057 via <source media>, textes en flux), rien n'est téléchargé
  if (calme) return;

  const colle = section.querySelector('.film__colle');
  const scene = section.querySelector('.film__scene');
  const toile = section.querySelector('.film__toile');
  const affiche = section.querySelector('.film__affiche');
  const halo = section.querySelector('.film__halo');
  const ctx = toile?.getContext('2d', { alpha: false });
  if (!colle || !scene || !ctx) return;                                      // toile indisponible : page statique
  const hctx = halo?.getContext('2d', { alpha: false });

  /* ---------- jalons et paliers ---------- */
  const jalons = (section.dataset.jalons || '0,0.213,0.361,0.483,0.650,0.772,0.871,1').split(',').map(Number);
  const indexJalons = jalons.map((j) => Math.round(j * (total - 1)));
  const PALIERS = jalons.filter((j) => j > 0 && j < 1);
  const DEMI = 0.015;
  // au doigt, la progression passe par des paliers : l'image clé est tenue à ±0.015 autour de chaque jalon,
  // interpolation linéaire entre deux paliers. Avec Lenis, identité : pas de zone morte à la molette.
  function montage(s) {
    if (!tactile) return s;
    let s0 = 0, p0 = 0;
    for (const pj of PALIERS) {
      const s1 = pj - DEMI;
      if (s < s1) return p0 + ((s - s0) / (s1 - s0)) * (pj - p0);
      if (s <= pj + DEMI) return pj;
      s0 = pj + DEMI; p0 = pj;
    }
    return p0 + ((s - s0) / (1 - s0)) * (1 - p0);
  }

  /* ---------- textes, zones cliquables, trace de l'éponge ---------- */
  // l'éponge efface aussi le texte HTML : derrière chaque bloc [data-efface], une copie floue, la traînée de craie humide
  section.querySelectorAll('[data-efface]').forEach((bloc) => {
    const trace = bloc.cloneNode(true);
    trace.classList.add('film__trace');
    trace.setAttribute('aria-hidden', 'true');
    [...trace.attributes].forEach((at) => { if (at.name.startsWith('data-') || at.name === 'id') trace.removeAttribute(at.name); });
    trace.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));
    trace.querySelectorAll('a[href]').forEach((a) => a.removeAttribute('href'));
    bloc.prepend(trace);
  });
  // data-zone-m="p:x,y,w,h;…" : fractions de l'image, interpolées entre les clés, tenues avant la première et après la dernière
  const lireZone = (s) => (s ? s.split(';').map((cle) => { const [p, v] = cle.split(':'); return { p: Number(p), v: v.split(',').map(Number) }; }).sort((u, w) => u.p - w.p) : null);
  function zoneA(cles, p) {
    let u = cles[0];
    for (const w of cles) {
      if (p <= w.p) { const t = w === u ? 0 : (p - u.p) / (w.p - u.p); return u.v.map((x, n) => x + (w.v[n] - x) * t); }
      u = w;
    }
    return u.v;
  }
  const textes = [...section.querySelectorAll('[data-de]')].map((el) => ({
    el, de: Number(el.dataset.de), a: Number(el.dataset.a), f: Number(el.dataset.f) || 0.03,
    toujours: 'toujours' in el.dataset, efface: 'efface' in el.dataset,
    zone: lireZone(el.dataset['zone' + taille.toUpperCase()] || el.dataset.zoneM), o: -1, actif: false, zv: '',
  }));
  const fin = section.querySelector('.film__fin');
  const bon = [...section.querySelectorAll('.film__bon li')].map((li) => ({ li, s: Number(li.dataset.s) }));
  const memo = new Map();
  // une variable CSS n'est écrite que si sa valeur change
  const poser = (el, nom, val) => { const cle = el === section ? nom : `${nom}@html`; if (memo.get(cle) !== val) { memo.set(cle, val); el.style.setProperty(nom, val); } };

  /* ---------- chargement : Blob conservés, 8 ouvriers, fenêtre chaude dans le sens du scroll ---------- */
  const co = navigator.connection;
  const economie = !!co && (co.saveData || /2g|3g/.test(co.effectiveType || ''));
  const sources = new Array(total).fill(null);     // Blob de chaque image (l'affiche elle-même pour la 001)
  const enCours = new Set(), attente = new Set(), rates = new Set();
  const essais = new Uint8Array(total);
  // lot 1 : images 1-60 (la craie exige toutes ses images ; une sur deux en économie de données), puis les jalons
  const lot0 = [0];
  for (let k = 1; k < Math.min(60, total); k++) if (!economie || k % 2 === 0 || indexJalons.includes(k)) lot0.push(k);
  const file = [...lot0.slice(1), ...indexJalons.filter((k) => k >= 60)];
  const url = (k) => `${dossier}/${String(k + 1).padStart(3, '0')}.webp`;
  let demandes = 0, ouvriers = 0, iCourant = 0, direction = 1, arret = false;
  const libre = (k) => k >= 0 && k < total && !sources[k] && !enCours.has(k) && !rates.has(k) && !attente.has(k);
  // avant de piocher dans la file, chaque ouvrier sert la fenêtre chaude [i − 6, i + 18 × direction]
  function prochain() {
    for (let d = 0; d <= 18; d++) if (libre(iCourant + d * direction)) return iCourant + d * direction;
    for (let d = 1; d <= 6; d++) if (libre(iCourant - d * direction)) return iCourant - d * direction;
    while (file.length) { const k = file.shift(); if (libre(k)) return k; }
    return null;
  }
  async function telecharger(k) {
    enCours.add(k);
    try {
      // HTTP/2 : les 60 premières demandes passent devant tout le reste
      const rep = await fetch(url(k), { priority: demandes++ < 60 ? 'high' : 'low' });
      if (!rep.ok) throw new Error(String(rep.status));
      sources[k] = await rep.blob();
      enCours.delete(k);
      arrivee(k);
    } catch {
      enCours.delete(k);
      // une seconde chance 2 s plus tard, puis abandon : la recherche de voisin saute les ratées
      if (++essais[k] < 2) { attente.add(k); setTimeout(() => { attente.delete(k); file.unshift(k); embaucher(); }, 2000); }
      else { rates.add(k); verifierLot(); }
    }
  }
  async function ouvrier() {
    ouvriers++;
    for (let k; !arret && (k = prochain()) != null;) await telecharger(k);
    ouvriers--;
  }
  const embaucher = () => { for (let n = ouvriers; n < 8 && !arret; n++) ouvrier(); };
  function arrivee(k) {
    if (k < 60) verifierLot();
    reveiller();                                   // la boucle décode et redessine
  }
  // plus de 10 % d'échecs sur le lot 1-60 (dossier absent, mauvaise version) : page statique propre ;
  // lot complet : l'indice « Faites défiler » clignote
  function verifierLot() {
    const echecs = lot0.filter((k) => rates.has(k)).length;
    if (echecs > lot0.length / 10) return mourir(`${echecs} images manquantes sur ${lot0.length} dans ${dossier}`);
    if (!section.classList.contains('pret') && lot0.every((k) => sources[k] || rates.has(k))) section.classList.add('pret');
  }

  /* ---------- décodage : un anneau d'ImageBitmap autour de l'image affichée ---------- */
  const bitmaps = new Map(), decodage = new Set();
  const EPINGLES = new Set([0, 56, total - 1]);    // l'ardoise vide, la phrase écrite, la fin : jamais fermées
  // 96 Mo au téléphone (±13 images en 720×1280), 256 Mo à l'ordinateur (±15 en 1920×1080, ±34 en 720)
  const RAYON = Math.max(4, Math.floor((souris ? 256e6 : 96e6) / (SRC_W * SRC_H * 4) / 2));
  const fermer = (b) => { if (b.close) b.close(); else if (b.src?.startsWith('blob:')) URL.revokeObjectURL(b.src); };
  // sans createImageBitmap : une HTMLImageElement décodée fait le même travail
  const decoderImage = (src) => { if (!(src instanceof Blob)) return Promise.resolve(src); const img = new Image(); img.src = URL.createObjectURL(src); return img.decode().then(() => img); };
  async function decoder(k) {
    decodage.add(k);
    try {
      const bmp = typeof createImageBitmap === 'function' ? await createImageBitmap(sources[k]) : await decoderImage(sources[k]);
      if (bitmaps.has(k) || mort) fermer(bmp); else bitmaps.set(k, bmp);
      // à ±8 de l'image voulue, ou plus proche d'elle que celle dessinée : redessin forcé
      if (Math.abs(k - affichee) <= 8 || Math.abs(k - affichee) < Math.abs(dessinee - affichee)) affichee = -1;
    } catch {
      // fichier illisible : on l'oublie, le voisin fera l'affaire (l'affiche, elle, est retéléchargée)
      const etaitAffiche = sources[k] === affiche;
      sources[k] = null;
      if (etaitAffiche) { file.unshift(k); embaucher(); } else { rates.add(k); verifierLot(); }
    }
    decodage.delete(k);
    reveiller();
  }
  const aDecoder = (k) => k >= 0 && k < total && !!sources[k] && !bitmaps.has(k) && !decodage.has(k);
  const presente = (k) => bitmaps.has(k) || decodage.has(k);
  // à chaque tour : fermer hors anneau (le Blob reste), décoder [i − 4, i + R × direction], au plus 2 en vol
  function assurer() {
    const R = lent ? Math.min(RAYON, 6) : RAYON, max = lent ? 1 : 2;
    // la plus proche de l'image voulue est celle qui sera dessinée : jamais fermée, même loin (rendu partiel)
    let garde = -1, dist = Infinity;
    for (const k of bitmaps.keys()) { const d = Math.abs(k - iCourant); if (d < dist) { dist = d; garde = k; } }
    for (const [k, b] of bitmaps) if (Math.abs(k - iCourant) > R && !EPINGLES.has(k) && k !== garde) { fermer(b); bitmaps.delete(k); }
    let proche = false;                              // une image décodée ou en vol à moins de 4 de l'image voulue
    for (let d = 0; d <= R && decodage.size < max; d++) {
      const devant = iCourant + d * direction, derriere = iCourant - d * direction;
      if (d <= 4 && (presente(devant) || presente(derriere))) proche = true;
      if (aDecoder(devant)) decoder(devant);
      if (d > 0 && d <= 4 && decodage.size < max && aDecoder(derriere)) decoder(derriere);
    }
    // image manquante, rendu partiel : rien de proche → le voisin disponible le plus proche, où qu'il soit
    if (proche || decodage.size >= max) return;
    for (let d = 5; d < total; d++) {
      for (const k of [iCourant - d, iCourant + d]) {
        if (k < 0 || k >= total) continue;
        if (presente(k)) return;                      // le plus proche est déjà là
        if (aDecoder(k)) { decoder(k); return; }
      }
    }
  }

  /* ---------- dessin ---------- */
  let W = 0, H = 0, dx = 0, dy = 0, dw = 0, dh = 0, qualite = 1, haloActif = false, haloCoupe = false;
  let affichee = -1, dessinee = -1, vivant = false, mort = false, lent = false;
  // la toile n'est jamais plus définie que la source (l'agrandissement final revient au compositeur) ;
  // Safari tire resize au repli de sa barre : on ne touche la taille (qui vide la toile) que si elle change
  function tailler() {
    const cw = toile.clientWidth, ch = toile.clientHeight;
    if (!cw || !ch) return;
    const k = Math.min(devicePixelRatio || 1, SRC_W / cw, SRC_H / ch) * qualite;
    const w = Math.round(cw * k), h = Math.round(ch * k);
    // couvre, centré 50/50 : la scène est 9:16 à l'ordinateur, le téléphone rogne les côtés
    const z = Math.max(w / SRC_W, h / SRC_H);
    dw = SRC_W * z; dh = SRC_H * z; dx = (w - dw) / 2; dy = (h - dh) / 2;
    // le rectangle réellement dessiné, en px CSS : les zones cliquables le suivent
    const e = cw / w;
    scene.style.setProperty('--ix', `${(dx * e).toFixed(1)}px`);
    scene.style.setProperty('--iy', `${(dy * e).toFixed(1)}px`);
    scene.style.setProperty('--iw', `${(dw * e).toFixed(1)}px`);
    scene.style.setProperty('--ih', `${(dh * e).toFixed(1)}px`);
    haloActif = !!hctx && taille === 'm' && !haloCoupe && matchMedia('(min-width: 900px)').matches;
    if (w !== toile.width || h !== toile.height) {
      toile.width = W = w; toile.height = H = h;
      ctx.imageSmoothingQuality = 'high';
      affichee = -1;
      if (vivant) dessiner(iCourant);                 // la toile vient d'être vidée : on la remplit avant la peinture
    }
    reveiller();
  }
  // l'image voulue, sinon la décodée la plus proche ; pas de fillRect : l'image couvre toute la toile
  function dessiner(i) {
    let k = -1, dist = Infinity;
    for (const j of bitmaps.keys()) { const d = Math.abs(j - i); if (d < dist) { dist = d; k = j; } }
    if (k < 0 || !W || !H) return false;
    const bmp = bitmaps.get(k);
    ctx.drawImage(bmp, dx, dy, dw, dh);
    if (haloActif) hctx.drawImage(bmp, 0, 0, halo.width, halo.height);   // 36×64, étiré et flouté en CSS : coût nul
    affichee = i; dessinee = k;
    return true;
  }
  // premier dessin réussi : la toile prend le relais de l'affiche (même image, aucun saut), la section devient collante
  function vivifier() {
    section.classList.add('vivant');
    tailler();
    if (!dessiner(iCourant)) { section.classList.remove('vivant'); return; }
    vivant = true;
    courant = null;                                   // la mise en page vient de changer : calage direct
    if ('ResizeObserver' in window) new ResizeObserver(tailler).observe(colle);
    else addEventListener('resize', tailler, { passive: true });
  }
  function mourir(raison) {
    if (mort) return;
    mort = true; arret = true;
    console.warn('film :', raison, '→ page statique');
    section.classList.remove('vivant', 'pret', 'pique');
    aimanter(false);
    textes.forEach((t) => { t.el.style.visibility = ''; t.el.classList.remove('actif'); });
    bitmaps.forEach(fermer); bitmaps.clear();
  }

  /* ---------- la tâche : mesure, lissage, montage, dessin, textes ---------- */
  let courant = null, avant = null, pCourant = 0, force = null, precedent = performance.now(), lents = 0, aimante = false, bonIci = -2, pique = false;
  const aimanter = (oui) => { if (oui !== aimante) { aimante = oui; html.classList.toggle('aimante', oui); } };
  function tache(t) {
    if (mort) return false;
    const brut = t - precedent, dt = Math.min(0.05, brut / 1000);
    precedent = t;
    // tant que la toile n'a rien à montrer : on décode l'affiche, rien d'autre
    if (!vivant) { if (bitmaps.size) vivifier(); else assurer(); return decodage.size > 0; }
    const r = section.getBoundingClientRect(), c = colle.getBoundingClientRect();
    if (r.bottom < -200 || r.top > innerHeight + 200) { aimanter(false); return false; }
    // la progression se mesure sur l'élément collant lui-même : insensible à la barre de Safari qui se replie
    const s = force ?? borne((c.top - r.top) / Math.max(r.height - c.height, 1));
    // calage direct au premier passage et au retour arrière ; sinon lissage en constante de temps
    courant = courant === null ? s : courant + (s - courant) * (1 - Math.exp(-dt / TAU));
    if (avant !== null && Math.abs(courant - avant) > 1e-5) direction = courant > avant ? 1 : -1;
    avant = courant;
    const p = pCourant = force != null ? courant : montage(courant);
    const i = Math.round(p * (total - 1));
    if (i !== iCourant) { iCourant = i; embaucher(); }   // la fenêtre chaude a bougé : des ouvriers s'il en manque
    assurer();
    if (i !== affichee && dessiner(i)) {
      // appareil lent : au-delà de 28 ms sur 30 images consécutives, définition × 0,75 (une fois) et halo coupé
      if (brut <= 28) lents = 0;
      else if (++lents >= 30 && !lent) { lent = true; qualite = 0.75; haloCoupe = true; tailler(); }
    }
    // l'aimant du doigt, posé loin des bords (hystérésis) : on entre et on sort du film librement
    if (!tactile || force != null) aimanter(false);
    else if (s > 0.02 && s < 0.985) aimanter(true);
    else if (s < 0.005 || s > 0.992) aimanter(false);

    // variables de la section : progression, flash (pic sec : flash²), éponge, sortie
    poser(section, '--p', p.toFixed(4));
    const fl = p < 0.749 ? borne((p - 0.7414) / 0.0076) : borne(1 - (p - 0.749) / 0.019);
    const flash = (fl * fl).toFixed(3);
    poser(section, '--flash', flash); poser(html, '--flash', flash);
    poser(section, '--eponge', borne((p - 0.8175) / 0.0532).toFixed(3));
    poser(section, '--fin', borne(1 - r.bottom / innerHeight).toFixed(3));
    // en haut de page, le bandeau pousse la colle sous le bord de l'écran : ce qui est caché, en px (l'indice remonte d'autant)
    poser(section, '--cache', `${Math.max(0, Math.round(c.bottom - innerHeight))}px`);
    if ((p >= 0.99) !== pique) { pique = p >= 0.99; section.classList.toggle('pique', pique); }
    // le bon : barré ce qui est passé, le point sur l'étape en cours
    let ici = -1;
    bon.forEach((b, j) => { if (p >= b.s) ici = j; });
    if (ici !== bonIci) { bonIci = ici; bon.forEach((b, j) => { b.li.classList.toggle('passe', j <= ici); b.li.classList.toggle('ici', j === ici); }); }

    // chaque texte, zone et cliché : fenêtre [de, a] avec fondu f, en p du film (les paliers tiennent donc aussi les textes)
    for (const x of textes) {
      // un bloc effacé par l'éponge n'a pas de fondu de sortie : la craie humide s'en charge
      const o = x.efface ? (p <= x.a ? borne((p - x.de) / x.f) : 0) : borne(Math.min((p - x.de) / x.f, (x.a - p) / x.f));
      if (x.o < 0 || Math.abs(o - x.o) > 0.003 || (o === 0) !== (x.o === 0) || (o === 1) !== (x.o === 1)) {
        // 24 px : vers le haut en entrant, vers le bas en sortant ; immobile pendant un effacement
        const y = x.efface && p > (x.de + x.a) / 2 ? 0 : (1 - o) * 24;
        x.el.style.setProperty('--o', o.toFixed(3));
        x.el.style.setProperty('--y', `${y.toFixed(1)}px`);
        // hors fenêtre, hors de l'arbre d'accessibilité (jamais de lien focusable invisible), sauf h1 et sur-titre
        if (!x.toujours) x.el.style.visibility = o === 0 ? 'hidden' : '';
        x.o = o;
      }
      if ((o > 0.3) !== x.actif) { x.actif = o > 0.3; x.el.classList.toggle('actif', x.actif); }
      if (x.zone && o > 0) {
        const v = zoneA(x.zone, p).map((n) => n.toFixed(4));
        const cle = v.join(',');
        if (cle !== x.zv) { x.zv = cle; ['--zx', '--zy', '--zw', '--zh'].forEach((nom, n) => x.el.style.setProperty(nom, v[n])); }
      }
      if (x.el === fin) poser(section, '--voile', o.toFixed(3));
    }
    // veille : la boucle peut s'endormir dès que le film est arrivé et que rien ne se décode
    return Math.abs(s - courant) > 0.0003 || decodage.size > 0;
  }
  taches.push(tache);

  // retour arrière (bfcache) et retour d'onglet : resynchronisation directe, pas d'avance rapide
  const resync = () => { courant = null; affichee = -1; reveiller(); };
  addEventListener('pageshow', (e) => { if (e.persisted) resync(); });
  document.addEventListener('visibilitychange', resync);

  // pour les captures et la recette : aller(p) force la progression (lissage coupé), aller(null) rend la main
  section.aller = (p) => { force = p == null ? null : borne(Number(p)); courant = null; affichee = -1; reveiller(); };
  section.etat = () => ({ p: +pCourant.toFixed(4), image: iCourant + 1, dessinee: dessinee + 1, decodees: bitmaps.size, chargees: sources.filter(Boolean).length, taille, mode: souris ? 'souris' : 'tactile' });

  /* ---------- départ ---------- */
  async function demarrer() {
    // pré-rendu (Speculation Rules de Base.astro) : pas une image avant que la page soit vraiment affichée
    if (document.prerendering) await new Promise((ok) => document.addEventListener('prerenderingchange', ok, { once: true }));
    // l'image 1 est l'affiche, préchargée : on la décode telle quelle, relais invisible ; sinon on la demande comme les autres
    attente.add(0);
    (affiche ? affiche.decode() : Promise.reject()).then(() => {
      if (!affiche.naturalWidth || !/\/001\.webp$/.test(affiche.currentSrc)) throw new Error('affiche');
      sources[0] = affiche; attente.delete(0); arrivee(0);
    }).catch(() => { attente.delete(0); file.unshift(0); embaucher(); });
    embaucher();
    // 61 → 264 une sur 8, puis une sur 4, une sur 2, puis toutes (une sur 8 seulement en économie de données) :
    // après load, ou 1,5 s après l'init, au premier des deux
    let suite = false;
    const lancerSuite = () => {
      if (suite) return;
      suite = true;
      const vu = new Set(file);
      for (const pas of economie ? [8] : [8, 4, 2, 1]) for (let k = 60; k < total; k += pas) if (!vu.has(k)) { vu.add(k); file.push(k); }
      embaucher();
    };
    if (document.readyState === 'complete') lancerSuite();
    else { addEventListener('load', lancerSuite, { once: true }); setTimeout(lancerSuite, 1500); }
    reveiller();
  }
  demarrer();
}
document.querySelectorAll('[data-film]').forEach(film);
