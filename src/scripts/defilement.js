// Tout ce qui est piloté par le défilement de la page.
// Principe commun : on mesure où en est une section (0 = elle arrive, 1 = elle repart)
// et on s'en sert pour choisir une image, déplacer une piste ou tourner un plat.

const calme = matchMedia('(prefers-reduced-motion: reduce)').matches;
const borne = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));

// Avancement d'une section « collante » : 0 quand son haut touche le haut de l'écran,
// 1 quand son bas touche le bas de l'écran.
function avancement(section) {
  const r = section.getBoundingClientRect();
  return borne(-r.top / (r.height - innerHeight));
}

const taches = [];

/* ---------- séquences d'images sur une toile ---------- */
function sequence(section) {
  const nom = section.dataset.sequence;
  const total = Number(section.dataset.images);
  const toile = section.querySelector('canvas');
  const ctx = toile.getContext('2d');
  const textes = [...section.querySelectorAll('[data-de]')];
  const sujet = section.dataset.sujet?.split(',').map(Number);
  // Tailles d'images : téléphone recadré (m) ou complet mais plus léger (p), ordinateur (g),
  // grand écran très défini (x), selon celles qui existent pour la séquence
  const tailles = (section.dataset.tailles || 'm,g').split(',');
  const pixels = innerWidth * Math.min(devicePixelRatio || 1, 2);
  const telephone = innerWidth < 760;
  const taille = telephone && tailles.includes('m') ? 'm' : telephone && tailles.includes('p') ? 'p' : pixels >= 2300 && tailles.includes('x') ? 'x' : 'g';
  const dossier = `/sequences/${nom}/${taille}`;
  const images = new Array(total);
  let affichee = -1;
  let vise = 0;
  let courant = 0;

  const charger = (i) => new Promise((ok) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => { images[i] = img; ok(); };
    img.onerror = ok;
    img.src = `${dossier}/${String(i + 1).padStart(3, '0')}.webp`;
  });

  function tailler() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    toile.width = Math.round(toile.clientWidth * dpr);
    toile.height = Math.round(toile.clientHeight * dpr);
    affichee = -1;
  }

  function dessiner(i) {
    // Si l'image voulue n'est pas encore arrivée, on prend la plus proche déjà chargée
    let img = images[i];
    for (let d = 1; !img && d < total; d++) img = images[i - d] || images[i + d];
    if (!img) return;
    const { width: W, height: H } = toile;
    // Écran large : l'image couvre tout. Écran en hauteur : on garde le plat entier, bien centré.
    const couvre = Math.max(W / img.width, H / img.height);
    // Les images pour téléphone sont déjà recadrées sur le plat
    const portrait = (W * (img.width / img.height > 1.5 ? 1.75 : 1.08)) / img.width;
    // data-couvre : images téléphone déjà cadrées en hauteur, elles couvrent tout l'écran
    const k = W / H < 1 && !('couvre' in section.dataset) ? Math.min(couvre, portrait) : couvre;
    const w = img.width * k;
    const h = img.height * k;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
    // data-sujet="centre,largeur" (en part de l'image) : le sujet (un pot, une assiette) reste entier.
    // Écran en hauteur : il occupe toute la largeur, dans le haut de l'écran.
    // Écran large : il passe au tiers gauche, pour laisser la droite au texte.
    if (sujet) {
      const [cx, larg] = sujet;
      if (W / H < 1) {
        const ks = (W * 0.92) / (larg * img.width);
        ctx.drawImage(img, W / 2 - cx * img.width * ks, H * 0.1, img.width * ks, img.height * ks);
      } else {
        const cible = 0.32;
        const ws = Math.max(w, (W * (1 - cible)) / (1 - cx));
        const hs = ws * (img.height / img.width);
        ctx.drawImage(img, cible * W - cx * ws, (H - hs) / 2, ws, hs);
      }
      return;
    }
    ctx.drawImage(img, (W - w) / 2, (H - h) * (W / H < 1 && !('couvre' in section.dataset) ? 0.38 : 0.5), w, h);
  }

  tailler();
  addEventListener('resize', tailler);
  // La première image tout de suite, les autres ensuite, dans l'ordre
  charger(0).then(() => { dessiner(0); affichee = 0; });
  // D'abord une image sur huit, puis une sur quatre, etc. : le défilement répond très tôt,
  // la fluidité arrive ensuite. Six images se chargent en même temps.
  // Sur téléphone, une image sur deux suffit : la page pèse deux fois moins lourd
  const finesse = innerWidth < 760 ? 2 : 1;
  const ordre = [];
  for (let pas = 8; pas >= finesse; pas /= 2) for (let i = 0; i < total; i += pas) if (!ordre.includes(i)) ordre.push(i);
  if (!ordre.includes(total - 1)) ordre.push(total - 1);
  const suite = async () => {
    let n = 0;
    const ouvrier = async () => {
      while (n < ordre.length) {
        const i = ordre[n++];
        if (images[i]) continue;
        await charger(i);
        if (Math.abs(i - affichee) < 8) affichee = -1;
      }
    };
    await Promise.all(Array.from({ length: 6 }, ouvrier));
  };
  const lancer = () => {
    // Les séquences plus bas dans la page attendent qu'on s'en approche avant de charger
    if (!('paresse' in section.dataset)) return suite();
    new IntersectionObserver((e, obs) => { if (e[0].isIntersecting) { obs.disconnect(); suite(); } }, { rootMargin: '150% 0px' }).observe(section);
  };
  if (calme) charger(total - 1).then(() => dessiner(total - 1));
  else if (document.readyState === 'complete') lancer();
  else addEventListener('load', lancer);

  taches.push(() => {
    const r = section.getBoundingClientRect();
    if (r.bottom < -200 || r.top > innerHeight + 200) return;
    vise = avancement(section);
    // Petit amorti : l'image suit le doigt sans à-coups
    courant += (vise - courant) * 0.18;
    const i = calme ? total - 1 : Math.round(courant * (total - 1));
    if (i !== affichee) { dessiner(i); affichee = i; }
    section.style.setProperty('--p', courant.toFixed(4));
    textes.forEach((t) => {
      const de = Number(t.dataset.de);
      const a = Number(t.dataset.a);
      const fondu = 0.07;
      const o = borne(Math.min((courant - de) / fondu, (a - courant) / fondu));
      t.style.setProperty('--o', o.toFixed(3));
      t.style.setProperty('--y', `${((1 - o) * (courant < (de + a) / 2 ? 28 : -28)).toFixed(1)}px`);
      t.style.setProperty('--p', borne((courant - de) / (a - de)).toFixed(3));
      t.classList.toggle('actif', o > 0.5);
    });
  });
}
document.querySelectorAll('[data-sequence]').forEach(sequence);

/* ---------- le plat en 3D tourne quand on fait défiler ---------- */
const zone3d = document.querySelector('[data-plat3d]');
if (zone3d && !calme) {
  const mv = zone3d.querySelector('model-viewer');
  let touche = false;
  // Dès que le visiteur prend le plat en main, on lui laisse les commandes
  mv.addEventListener('camera-change', (e) => { if (e.detail?.source === 'user-interaction') touche = true; });
  let dernier = '';
  taches.push(() => {
    if (touche || !mv.loaded) return;
    const r = zone3d.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const p = borne((innerHeight - r.top) / (innerHeight + r.height));
    const orbite = `${(-110 + p * 250).toFixed(1)}deg 60deg 0.78m`;
    if (orbite !== dernier) { mv.cameraOrbit = orbite; dernier = orbite; }
  });
}

// Une seule boucle pour tout, calée sur le rafraîchissement de l'écran
(function boucle() {
  taches.forEach((t) => t());
  requestAnimationFrame(boucle);
})();
