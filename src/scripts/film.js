// Le film « La mise en place » : 264 images WebP dessinées sur une toile au rythme du défilement.
// Pas de vidéo, rien d'automatique : la progression du film est celle de la section collante.
// Au doigt, huit jalons aimantés et des paliers tiennent les images stables ; à la souris, Lenis suffit.
// Les textes sont du vrai HTML au-dessus de la toile, fenêtrés en progression du film (data-de / data-a / data-f).
// Chargement : l'affiche 001 d'abord, la craie (2-60) tout de suite, les jalons, puis 1/8 → 1/4 → 1/2 → tout ;
// décodage dans un anneau d'ImageBitmap autour de l'image affichée, mémoire bornée. Aucune boucle propre :
// une tâche dans la boucle de defilement.js, qui s'endort quand plus rien ne bouge.
// Recette : section.aller(0.65) fige le film (p du film, entre 0 et 1 ; aller(null) rend la main) ;
// section.etat() dit où il en est : image = l'image voulue, dessinee = l'image affichée (sa voisine si elle manque).
import { taches, calme, borne, reveiller, souris } from './defilement.js';
import '@fontsource/caveat/600.css';

// ordinateur en paysage : deux colonnes (texte à gauche, film 9:16 à droite) ; sinon, mise en page téléphone
// (même requête que le bloc « ordinateur » de global.css)
const LARGE = '(min-width: 900px) and (orientation: landscape)';

function film(section) {
  // tant que le film n'est pas monté (mouvement réduit, toile indisponible), la recette le dit au lieu de planter
  section.etat = () => ({ vivant: false, statut: calme ? 'calme' : 'statique', mode: souris ? 'souris' : 'tactile' });
  section.aller = () => {};
  // mouvement réduit : la page reste statique (affiche 057 via <source media>, textes en flux) ; rien n'est téléchargé ni écrit
  if (calme) return;

  /* ---------- mode, taille, source ---------- */
  const tactile = !souris;
  const html = document.documentElement;
  html.classList.toggle('tactile', tactile);
  const tailles = (section.dataset.tailles || 'm').split(',').map((t) => t.trim()).filter(Boolean);
  if (tailles.some((t) => t !== 'm' && t !== 'g')) console.warn('film : data-tailles inconnu', tailles);
  // choisie une fois : jamais de 404 sur un dossier absent
  const taille = matchMedia(LARGE).matches && tailles.includes('g') ? 'g' : 'm';
  const T = taille.toUpperCase();
  const source = section.dataset['source' + T];
  if (!source) { console.warn(`film : data-source-${taille} manquant → page statique`); return; }
  section.dataset.taille = taille;
  const [SRC_W, SRC_H] = source.split(',').map(Number);
  const dossier = `/sequences/${section.dataset.film}/${taille}`;
  const total = Number(section.dataset.images) || 264;
  // lissage : le film colle à la molette, amortit l'aimant au doigt (0.22 si la craie glisse trop vite entre J0 et J1)
  const TAU = souris ? 0.05 : 0.16;

  const colle = section.querySelector('.film__colle');
  const scene = section.querySelector('.film__scene');
  const toile = section.querySelector('.film__toile');
  const affiche = section.querySelector('.film__affiche');
  const halo = section.querySelector('.film__halo');
  const ctx = toile?.getContext('2d', { alpha: false });
  if (!colle || !scene || !ctx) return;                                      // toile indisponible : page statique
  const hctx = halo?.getContext('2d', { alpha: false });

  /* ---------- jalons et paliers ---------- */
  const DEMI = 0.015;
  // la liste vient du HTML (data-jalons, la même que les repères .film__jalons du scroll-snap)
  const jalons = (section.dataset.jalons || '0,0.213,0.361,0.483,0.650,0.772,0.871,1').split(',').map(Number).sort((u, w) => u - w);
  if (jalons.some((j, n) => !(j >= 0 && j <= 1) || (n > 0 && j - jalons[n - 1] <= 2 * DEMI))) console.warn('film : data-jalons à vérifier (entre 0 et 1, écartés de plus de 0.03)', jalons);
  const indexJalons = jalons.map((j) => Math.round(j * (total - 1)));
  const PALIERS = jalons.filter((j) => j > 0 && j < 1);
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
  // l'éponge efface aussi le texte HTML : à côté de chaque bloc [data-efface], une copie floue, la traînée de craie humide.
  // Posée juste avant le bloc, dans la même case de la grille (frère, pas enfant : le clip du bloc la rognerait entièrement) ;
  // elle garde l'encre du bloc et suit sa fenêtre (--o, --y, visibility, actif recopiés à chaque tour).
  const traces = new Map();
  section.querySelectorAll('[data-efface]').forEach((bloc) => {
    const trace = bloc.cloneNode(true);
    trace.classList.add('film__trace');
    trace.setAttribute('aria-hidden', 'true');
    trace.inert = true;
    [...trace.attributes].forEach((at) => { if ((at.name.startsWith('data-') && at.name !== 'data-encre') || at.name === 'id') trace.removeAttribute(at.name); });
    trace.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));
    trace.querySelectorAll('a[href]').forEach((a) => a.removeAttribute('href'));
    bloc.before(trace);
    traces.set(bloc, trace);
  });
  // data-zone-m="p:x,y,w,h;…" : fractions de l'image, interpolées entre les clés, tenues avant la première et après la dernière
  function lireZone(s, el) {
    if (!s) return null;
    try {
      return s.split(';').map((cle) => {
        const [p, v] = cle.split(':');
        const vals = (v || '').split(',').map(Number);
        if (!Number.isFinite(Number(p)) || vals.length !== 4 || !vals.every(Number.isFinite)) throw new Error(cle);
        return { p: Number(p), v: vals };
      }).sort((u, w) => u.p - w.p);
    } catch (e) {
      console.warn('film : data-zone illisible sur', el, e.message);
      return null;
    }
  }
  function zoneA(cles, p) {
    let u = cles[0];
    for (const w of cles) {
      if (p <= w.p) { const t = w === u ? 0 : (p - u.p) / (w.p - u.p); return u.v.map((x, n) => x + (w.v[n] - x) * t); }
      u = w;
    }
    return u.v;
  }
  // data-de absent : depuis le début ; data-a absent : jusqu'à la fin (les sentinelles −1 et 9 du balisage disent la même chose)
  const nombre = (v, defaut) => (v === undefined || v === '' ? defaut : Number(v));
  const textes = [...section.querySelectorAll('[data-de]')].map((el) => {
    const x = {
      el, trace: traces.get(el) || null,
      de: nombre(el.dataset.de, -Infinity), a: nombre(el.dataset.a, Infinity), f: Number(el.dataset.f) || 0.03,
      toujours: 'toujours' in el.dataset, efface: 'efface' in el.dataset,
      zone: lireZone(el.dataset['zone' + T], el), o: -1, actif: false,
    };
    // une fenêtre illisible ne doit pas laisser un bloc visible sur tout le film : il reste caché, avec un message
    if (Number.isNaN(x.de) || Number.isNaN(x.a)) { console.warn('film : data-de / data-a illisible', el); x.de = Infinity; }
    // une zone cliquable sans coordonnées pour cette taille reste cachée : jamais celles d'un autre cadrage
    if (el.classList.contains('film__zone') && !x.zone) { console.warn(`film : data-zone-${taille} manquant`, el); x.de = Infinity; }
    return x;
  });
  const fin = section.querySelector('.film__fin');
  // le bon : data-s est en p du film (comme data-de), pas en progression du scroll
  const bon = [...section.querySelectorAll('.film__bon li')].map((li) => ({ li, s: Number(li.dataset.s) }));
  // une variable CSS n'est écrite que si sa valeur change (une mémoire par élément)
  const memo = new WeakMap();
  const poser = (el, nom, val) => { let m = memo.get(el); if (!m) memo.set(el, (m = new Map())); if (m.get(nom) !== val) { m.set(nom, val); el.style.setProperty(nom, val); } };

  /* ---------- chargement : Blob conservés, 8 ouvriers, fenêtre chaude dans le sens du scroll ---------- */
  const co = navigator.connection;
  const economie = !!co && (co.saveData || /2g|3g/.test(co.effectiveType || ''));
  const CRAIE = Math.min(60, total);              // images 1-60 : la craie écrit (6-54) puis tient ; le lot qui décide si le film vit
  const PRIORITAIRES = 60;                        // HTTP/2 : les 60 premières demandes passent devant tout le reste
  const sources = new Array(total).fill(null);     // Blob de chaque image (l'affiche elle-même pour la 001)
  const enCours = new Set(), attente = new Set(), rates = new Set();
  const essais = new Uint8Array(total);
  // lot 1 : images 1-60 (la craie exige toutes ses images ; une sur deux en économie de données), puis les jalons
  const lot0 = [0];
  for (let k = 1; k < CRAIE; k++) if (!economie || k % 2 === 0 || indexJalons.includes(k)) lot0.push(k);
  const file = [...lot0.slice(1), ...indexJalons.filter((k) => k >= CRAIE)];
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
      const rep = await fetch(url(k), { priority: demandes++ < PRIORITAIRES ? 'high' : 'low' });
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
    if (k < CRAIE) verifierLot();
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
  // l'ardoise vide, la phrase écrite (J1), la fin : jamais fermées
  const EPINGLES = new Set([0, indexJalons[1] ?? 56, total - 1]);
  // 96 Mo au téléphone (±13 images en 720×1280), 256 Mo à l'ordinateur (±15 en 1920×1080, ±34 en 720)
  const RAYON = Math.max(4, Math.floor((souris ? 256e6 : 96e6) / (SRC_W * SRC_H * 4) / 2));
  const fermer = (b) => { if (b.close) b.close(); else if (b.src?.startsWith('blob:')) { URL.revokeObjectURL(b.src); b.src = ''; } };
  // sans createImageBitmap : une HTMLImageElement décodée fait le même travail (son URL est rendue si le décodage échoue)
  const decoderImage = (src) => {
    if (!(src instanceof Blob)) return Promise.resolve(src);
    const img = new Image();
    img.src = URL.createObjectURL(src);
    return img.decode().then(() => img, (e) => { URL.revokeObjectURL(img.src); throw e; });
  };
  // la décodée la plus proche d'une image : celle qui sera dessinée à sa place
  const plusProche = (i) => { let k = -1, dist = Infinity; for (const j of bitmaps.keys()) { const d = Math.abs(j - i); if (d < dist) { dist = d; k = j; } } return k; };
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
    const garde = plusProche(iCourant);
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
  let W = 0, H = 0, dx = 0, dy = 0, dw = 0, dh = 0, jeu = 0, echelle = 1, bande = 0, ancre = 0, ancreMax = 0.5;
  let colleHaut = 0, qualite = 1, haloActif = false, haloCoupe = false;
  let affichee = -1, dessinee = -1, vivant = false, mort = false, lent = false, observateur = null;
  // Cadrage vertical au téléphone, quand l'image est rognée en hauteur (9:16 sur un écran plus large, barres dépliées) :
  // centré pour la craie (J0-J2) et le plan large (J6-J7) ; calé vers le bas pour le téléphone et l'appareil photo (J3-J5),
  // où le haut rogné n'est que l'ardoise floue : les textes trouvent leur place sous le téléphone. Le glissement se fait
  // pendant que la caméra bouge déjà (images 100 → 124 et 208 → 222) : jamais à un arrêt, jamais pendant que la craie écrit.
  const ancrage = (p) => Math.min(borne((p - 0.376) / 0.092), borne((0.8403 - p) / 0.0533));
  const HAUT_OBJETS = 0.22;   // haut du téléphone (172) et de l'appareil (204) dans l'image : il reste visible, sous le bon
  const MARGE_HAUT = 64;      // px CSS sous le haut de la colle : la place du bon
  function cadrer() {
    dy = jeu * (0.5 + (ancreMax - 0.5) * ancre);
    bande = H - (dy + dh) > 0.5 ? H - (dy + dh) : 0;
    scene.style.setProperty('--iy', `${(dy * echelle).toFixed(1)}px`);
  }
  // La toile couvre la colle entière (100lvh − nav : aucune bande de fond quand la barre du navigateur se replie),
  // mais l'image est cadrée sur la scène (100svh − nav, la partie toujours visible) : barre dépliée ou repliée,
  // le plan ne bouge pas et les textes, posés au-dessus de la barre dépliée, ne le chevauchent pas davantage.
  // Sous l'image, s'il reste de la place, le reflet de ses dernières lignes (bois du comptoir, mur sombre).
  // La toile n'est jamais plus définie que la source (l'agrandissement final revient au compositeur) ;
  // Safari tire resize au repli de sa barre : on ne touche la taille (qui vide la toile) que si elle change
  function tailler() {
    const cw = toile.clientWidth, ch = toile.clientHeight;
    if (!cw || !ch) return;
    const sh = Math.min(scene.clientHeight || ch, ch);
    colleHaut = parseFloat(getComputedStyle(colle).top) || 0;
    const k = Math.min(devicePixelRatio || 1, SRC_W / cw, SRC_H / sh) * qualite;
    const w = Math.round(cw * k), h = Math.round(ch * k), hs = Math.min(h, Math.round(sh * k));
    // couvre la scène : 9:16 à l'ordinateur (rien de rogné), le téléphone rogne les côtés, ou le haut et le bas (voir cadrer)
    const z = Math.max(w / SRC_W, hs / SRC_H);
    dw = SRC_W * z; dh = SRC_H * z; dx = (w - dw) / 2;
    jeu = Math.min(0, hs - dh);
    W = w; H = h;
    // calé vers le bas autant que possible, sans que le haut du téléphone passe sous le bon
    ancreMax = jeu < -1 ? Math.min(1, Math.max(0.5, (HAUT_OBJETS * dh - MARGE_HAUT * k) / -jeu)) : 0.5;
    // le rectangle réellement dessiné, en px CSS : les zones cliquables le suivent
    echelle = cw / w;
    scene.style.setProperty('--ix', `${(dx * echelle).toFixed(1)}px`);
    scene.style.setProperty('--iw', `${(dw * echelle).toFixed(1)}px`);
    scene.style.setProperty('--ih', `${(dh * echelle).toFixed(1)}px`);
    cadrer();
    haloActif = !!hctx && taille === 'm' && !haloCoupe && matchMedia(LARGE).matches;
    if (w !== toile.width || h !== toile.height) {
      toile.width = w; toile.height = h;
      ctx.imageSmoothingQuality = 'high';
      affichee = -1;
      if (vivant) dessiner(iCourant);                 // la toile vient d'être vidée : on la remplit avant la peinture
    } else affichee = -1;                             // même taille, cadrage peut-être changé : on redessine
    reveiller();
  }
  // l'image voulue, sinon la décodée la plus proche ; pas de fillRect : l'image (et son reflet) couvre toute la toile
  function dessiner(i) {
    const k = plusProche(i);
    if (k < 0 || !W || !H) return false;
    const bmp = bitmaps.get(k);
    ctx.drawImage(bmp, dx, dy, dw, dh);
    if (bande) {
      // reflet : les dernières lignes de l'image, retournées sous elle (mêmes proportions)
      const bw = bmp.naturalWidth || bmp.width, bh = bmp.naturalHeight || bmp.height;
      const y0 = dy + dh, sh = Math.min(bh, (bande * bh) / dh);
      ctx.save();
      ctx.translate(0, 2 * y0);
      ctx.scale(1, -1);
      ctx.drawImage(bmp, 0, bh - sh, bw, sh, dx, y0 - (sh * dh) / bh, dw, (sh * dh) / bh);
      ctx.restore();
    }
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
    if ('ResizeObserver' in window) (observateur = new ResizeObserver(tailler)).observe(colle);
    else addEventListener('resize', tailler, { passive: true });
  }
  // échec : page statique propre, rien ne reste branché ni allumé
  function mourir(raison) {
    if (mort) return;
    mort = true; arret = true;
    console.warn('film :', raison, '→ page statique');
    observateur?.disconnect();
    removeEventListener('resize', tailler);
    section.classList.remove('vivant', 'pret', 'pique');
    aimanter(false);
    poser(section, '--eponge', '0'); poser(section, '--flash', '0'); poser(html, '--flash', '0');
    textes.forEach((t) => (t.trace ? [t.el, t.trace] : [t.el]).forEach((el) => { el.style.visibility = ''; el.classList.remove('actif'); }));
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
    // cadrage vertical (téléphone) : ne change qu'entre deux arrêts, pendant un mouvement de caméra
    const a = ancrage(p);
    if (a !== ancre && (Math.abs(a - ancre) > 0.002 || a === 0 || a === 1)) { ancre = a; cadrer(); affichee = -1; }
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
    // --fin : la sortie de la section (0 → 1), sans rapport avec le bloc .film__fin (dont l'opacité est --voile)
    poser(section, '--fin', borne(1 - r.bottom / innerHeight).toFixed(3));
    // --cache : en haut de page, le bandeau pousse la colle sous sa place (l'indice « Faites défiler » remonte d'autant).
    // Mesuré sur la colle elle-même (écart à son top collant) : la barre du navigateur n'y change rien
    poser(section, '--cache', `${Math.max(0, Math.round(c.top - colleHaut))}px`);
    if ((p >= 0.99) !== pique) { pique = p >= 0.99; section.classList.toggle('pique', pique); }
    // le bon : barré ce qui est passé, le point sur l'étape en cours
    let ici = -1;
    bon.forEach((b, j) => { if (p >= b.s) ici = j; });
    if (ici !== bonIci) { bonIci = ici; bon.forEach((b, j) => { b.li.classList.toggle('passe', j <= ici); b.li.classList.toggle('ici', j === ici); }); }

    // chaque texte, zone et cliché : fenêtre [de, a] avec fondu f, en p du film (les paliers tiennent donc aussi les textes)
    for (const x of textes) {
      // un bloc effacé par l'éponge n'a pas de fondu de sortie : la craie humide s'en charge
      const o = x.efface ? (p <= x.a ? borne((p - x.de) / x.f) : 0) : borne(Math.min((p - x.de) / x.f, (x.a - p) / x.f));
      const els = x.trace ? [x.el, x.trace] : [x.el];   // la trace suit son bloc
      if (x.o < 0 || Math.abs(o - x.o) > 0.003 || (o === 0) !== (x.o === 0) || (o === 1) !== (x.o === 1)) {
        // 24 px : vers le haut en entrant, vers le bas en sortant ; immobile pendant un effacement
        const y = x.efface && p > (x.de + x.a) / 2 ? 0 : (1 - o) * 24;
        for (const el of els) {
          el.style.setProperty('--o', o.toFixed(3));
          el.style.setProperty('--y', `${y.toFixed(1)}px`);
          // hors fenêtre, hors de l'arbre d'accessibilité (jamais de lien focusable invisible), sauf h1 et sur-titre
          if (!x.toujours) el.style.visibility = o === 0 ? 'hidden' : '';
        }
        x.o = o;
      }
      if ((o > 0.3) !== x.actif) { x.actif = o > 0.3; for (const el of els) el.classList.toggle('actif', x.actif); }
      if (x.zone && o > 0) zoneA(x.zone, p).forEach((n, j) => poser(x.el, ['--zx', '--zy', '--zw', '--zh'][j], n.toFixed(4)));
      if (x.el === fin) poser(section, '--voile', o.toFixed(3));
    }
    // veille : la boucle peut s'endormir dès que le film est arrivé et que rien ne se décode
    return Math.abs(s - courant) > 0.0003 || decodage.size > 0;
  }
  taches.push(tache);

  // retour arrière (bfcache) et retour d'onglet : resynchronisation directe, pas d'avance rapide
  const resync = () => { if (mort) return; courant = null; affichee = -1; reveiller(); };
  addEventListener('pageshow', (e) => { if (e.persisted) resync(); });
  document.addEventListener('visibilitychange', resync);

  // pour les captures et la recette : aller(p) force la progression du film (lissage coupé), aller(null) rend la main
  section.aller = (p) => {
    if (mort) return;
    if (p == null) force = null;
    else {
      const n = Number(p);
      if (!Number.isFinite(n)) { console.warn('film : aller(p) attend un nombre entre 0 et 1 (ou null pour rendre la main), reçu', p); return; }
      if (n < 0 || n > 1) console.warn('film : aller(p) prend une progression du film entre 0 et 1, valeur bornée :', n);
      force = borne(n);
    }
    courant = null; affichee = -1; reveiller();
  };
  section.etat = () => ({
    p: +pCourant.toFixed(4), image: iCourant + 1, dessinee: dessinee + 1, decodees: bitmaps.size, chargees: sources.filter(Boolean).length,
    taille, mode: souris ? 'souris' : 'tactile', vivant: vivant && !mort, pret: section.classList.contains('pret'),
    statut: mort ? 'mort' : vivant ? 'vivant' : 'chargement',
  });

  /* ---------- départ ---------- */
  async function demarrer() {
    // pré-rendu (Speculation Rules de Base.astro) : pas une image avant que la page soit vraiment affichée
    if (document.prerendering) await new Promise((ok) => document.addEventListener('prerenderingchange', ok, { once: true }));
    // l'image 1 est l'affiche, préchargée : on la décode telle quelle, relais invisible ; sinon on la demande comme les autres.
    // Elle n'est reprise que si elle vient du bon dossier (taille et version du film) : sinon 001 est demandée dans le dossier choisi
    attente.add(0);
    (affiche ? affiche.decode() : Promise.reject()).then(() => {
      if (!affiche.naturalWidth || !affiche.currentSrc.endsWith(`${dossier}/001.webp`)) throw new Error('affiche');
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
      for (const pas of economie ? [8] : [8, 4, 2, 1]) for (let k = CRAIE; k < total; k += pas) if (!vu.has(k)) { vu.add(k); file.push(k); }
      embaucher();
    };
    if (document.readyState === 'complete') lancerSuite();
    else { addEventListener('load', lancerSuite, { once: true }); setTimeout(lancerSuite, 1500); }
    reveiller();
  }
  demarrer();
}
document.querySelectorAll('[data-film]').forEach(film);
