// Ardoise, craie et coup d'éponge : l'univers visuel partagé par le réel, la publication
// et la photo de profil (même rendu que la carte de visite).
// Script classique (pas un module) pour fonctionner en file:// sans serveur.

const ARD = {
  ardoise: '#1E2A2C',
  jaune: '#FFD23F',
  nappe: '#F5F7F4',
};

// Hasard déterministe : la même ardoise à chaque rendu
function hasard(graine) {
  let a = graine >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Peint l'ardoise de la charte (carte de visite, visuels du Drive) : vert-gris éclairé au
// centre, fin quadrillage de 90 px pour 1080 px de large, léger grain
function peindreArdoise(l, h, graine = 3) {
  const c = Object.assign(document.createElement('canvas'), { width: l, height: h });
  const x = c.getContext('2d');
  const r = hasard(graine);
  const lum = x.createRadialGradient(l / 2, h * 0.45, 0, l / 2, h * 0.45, Math.hypot(l, h) * 0.55);
  lum.addColorStop(0, '#2B3B3D'); lum.addColorStop(0.55, '#1F2B2D'); lum.addColorStop(1, '#172022');
  x.fillStyle = lum; x.fillRect(0, 0, l, h);
  // le quadrillage, aligné comme sur les visuels du Drive (traits à 45, 135, 225…)
  const pas = l / 12, trait = Math.max(1, l / 540);
  x.fillStyle = 'rgba(255,255,255,0.035)';
  for (let gx = pas / 2; gx < l; gx += pas) x.fillRect(Math.round(gx - trait / 2), 0, trait, h);
  for (let gy = pas / 2; gy < h; gy += pas) x.fillRect(0, Math.round(gy - trait / 2), l, trait);
  // grain très léger, pour éviter les aplats en bandes
  const img = x.getImageData(0, 0, l, h), d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const g = (r() - 0.5) * 4;
    d[i] += g; d[i + 1] += g; d[i + 2] += g;
  }
  x.putImageData(img, 0, 0);
  return c;
}

// Motif de grain qui « mange » le texte pour lui donner l'aspect de la craie
let _grain;
function motifGrain(ctx) {
  if (!_grain) {
    _grain = Object.assign(document.createElement('canvas'), { width: 256, height: 256 });
    const x = _grain.getContext('2d'), r = hasard(11);
    for (let i = 0; i < 5200; i++) {
      x.fillStyle = `rgba(0,0,0,${0.25 + r() * 0.75})`;
      x.fillRect(r() * 256, r() * 256, 1 + r() * 2.2, 1 + r() * 1.6);
    }
  }
  return ctx.createPattern(_grain, 'repeat');
}

// Calque de travail réutilisé pour la craie
let _calque;
function calque(l, h) {
  if (!_calque || _calque.width !== l || _calque.height !== h) _calque = Object.assign(document.createElement('canvas'), { width: l, height: h });
  const x = _calque.getContext('2d');
  x.setTransform(1, 0, 0, 1, 0, 0);
  x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1; x.filter = 'none';
  x.clearRect(0, 0, l, h);
  return x;
}

// Dessine quelque chose « à la craie » : dessin(x) trace sur un calque, puis le grain le ronge
function craie(ctx, dessin, { alpha = 1 } = {}) {
  const { width: l, height: h } = ctx.canvas;
  const x = calque(l, h);
  dessin(x);
  x.globalCompositeOperation = 'destination-out';
  x.fillStyle = motifGrain(x);
  x.fillRect(0, 0, l, h);
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha *= alpha;
  ctx.drawImage(_calque, 0, 0);
  ctx.restore();
}

// Texte effacé d'un coup d'éponge, comme sur la carte : à gauche de xEponge il n'en reste
// qu'une traînée floue, à droite il est encore net
function texteEfface(ctx, texte, x, y, xEponge, { police, couleur = '#fff', aligne = 'left' } = {}) {
  ctx.save();
  ctx.font = police; ctx.textAlign = aligne; ctx.textBaseline = 'alphabetic';
  const m = ctx.measureText(texte);
  const gauche = aligne === 'center' ? x - m.width / 2 : x;
  const haut = y - m.actualBoundingBoxAscent - 30, bas = y + m.actualBoundingBoxDescent + 30;
  // partie encore nette
  ctx.save();
  ctx.beginPath(); ctx.rect(xEponge, haut, 1e4, bas - haut); ctx.clip();
  craie(ctx, (c) => { c.font = police; c.textAlign = aligne; c.fillStyle = couleur; c.fillText(texte, x, y); });
  ctx.restore();
  // partie essuyée
  if (xEponge > gauche) {
    ctx.save();
    ctx.beginPath(); ctx.rect(gauche - 80, haut, xEponge - gauche + 80, bas - haut); ctx.clip();
    ctx.fillStyle = couleur;
    ctx.filter = 'blur(9px)'; ctx.globalAlpha = 0.34; ctx.fillText(texte, x + 10, y);
    ctx.filter = 'blur(18px)'; ctx.globalAlpha = 0.22;
    ctx.setTransform(1.06, 0, 0, 1, -gauche * 0.06 + 24, 0); ctx.fillText(texte, x, y + 4);
    ctx.restore();
  }
  ctx.restore();
  return { gauche, largeur: m.width };
}

// La brosse à ardoise (bois + feutre), centrée en (x, y), largeur w
function brosse(ctx, x, y, w, angle = -0.12) {
  const h = w * 0.36;
  ctx.save();
  ctx.translate(x, y); ctx.rotate(angle);
  ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = w * 0.12; ctx.shadowOffsetY = w * 0.05;
  ctx.fillStyle = '#3C4245'; ctx.beginPath(); ctx.roundRect(-w / 2, -h * 0.05, w, h * 0.55, h * 0.12); ctx.fill();
  ctx.shadowColor = 'transparent';
  // poussière de craie sur le feutre
  ctx.fillStyle = 'rgba(235,240,240,0.28)'; ctx.fillRect(-w / 2 + 6, h * 0.36, w - 12, h * 0.1);
  const bois = ctx.createLinearGradient(0, -h / 2, 0, 0);
  bois.addColorStop(0, '#E2B57A'); bois.addColorStop(1, '#B98A52');
  ctx.fillStyle = bois; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h * 0.5, h * 0.18); ctx.fill();
  ctx.strokeStyle = 'rgba(120,80,40,0.35)'; ctx.lineWidth = 2;
  for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-w / 2 + 12, -h / 2 + i * h * 0.12); ctx.lineTo(w / 2 - 12, -h / 2 + i * h * 0.12 + 3); ctx.stroke(); }
  ctx.restore();
}

// Le N à la craie jaune, lumineux comme sur la carte. trace : 0→1 pour l'animer.
function nLumineux(ctx, x, y, taille, { trace = 1, eclat = 1 } = {}) {
  const k = taille / 14; // dessin sur une grille de 14 × 12
  const pts = [[0, 12], [0, 0], [14, 12], [14, 0]];
  const seg = [12, Math.hypot(14, 12), 12], total = seg.reduce((a, b) => a + b, 0);
  const chemin = (c) => {
    c.beginPath(); c.moveTo(x + pts[0][0] * k, y + pts[0][1] * k);
    let reste = trace * total;
    for (let i = 0; i < 3 && reste > 0; i++) {
      const f = Math.min(1, reste / seg[i]);
      c.lineTo(x + (pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f) * k, y + (pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f) * k);
      reste -= seg[i];
    }
  };
  ctx.save();
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = ARD.jaune; ctx.lineWidth = 2.3 * k;
  ctx.shadowColor = `rgba(255,210,63,${0.75 * eclat})`; ctx.shadowBlur = 5 * k;
  chemin(ctx); ctx.stroke();
  ctx.shadowBlur = 2 * k; chemin(ctx); ctx.stroke();
  ctx.restore();
}

// Le petit trait de craie jaune de la carte de visite
function traitJaune(ctx, x, y, w, k = 1) {
  craie(ctx, (c) => {
    c.strokeStyle = ARD.jaune; c.lineWidth = 10; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + w * k / 2, y - 3, x + w * k, y + 1); c.stroke();
  });
}

// Coup d'éponge sur tout l'écran : efface (destination-out) le calque c le long d'un
// chemin en zigzag, jusqu'à la fraction p. Renvoie la position de la brosse.
function essuyage(c, p, { l, h, bande, passes }) {
  const pts = [];
  for (let i = 0; i < passes; i++) {
    const y = bande * 0.45 + i * (h - bande * 0.9) / (passes - 1);
    const [a, b] = i % 2 ? [l + bande * 0.6, -bande * 0.6] : [-bande * 0.6, l + bande * 0.6];
    pts.push([a, y], [b, y]);
  }
  const longueurs = pts.slice(1).map((q, i) => Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1]));
  let reste = p * longueurs.reduce((a, b) => a + b, 0);
  const trace = [pts[0]];
  let tete = pts[0];
  for (let i = 0; i < longueurs.length && reste > 0; i++) {
    const f = Math.min(1, reste / longueurs[i]);
    tete = [mixA(pts[i][0], pts[i + 1][0], f), mixA(pts[i][1], pts[i + 1][1], f)];
    trace.push(tete);
    reste -= longueurs[i];
  }
  c.save();
  c.globalCompositeOperation = 'destination-out';
  c.lineCap = 'round'; c.lineJoin = 'round';
  // le cœur du passage, puis des stries de feutre qui laissent un voile irrégulier
  const r = hasard(5);
  const tracer = (dy) => { c.beginPath(); trace.forEach(([x, y], i) => (i ? c.lineTo(x, y + dy) : c.moveTo(x, y + dy))); c.stroke(); };
  c.lineWidth = bande * 0.7; c.strokeStyle = '#000'; tracer(0);
  for (let s = -6; s <= 6; s++) {
    c.lineWidth = bande * 0.09; c.strokeStyle = `rgba(0,0,0,${0.55 + r() * 0.45})`;
    tracer(s * bande * 0.075);
  }
  c.restore();
  return tete;
}
const mixA = (a, b, k) => a + (b - a) * k;
