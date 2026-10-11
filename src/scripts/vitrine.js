// La vitrine : une rue au crépuscule, une ardoise sur son chevalet, une fenêtre éclairée.
// Au défilement, la craie écrit sur l'ardoise, puis la caméra avance et entre dans la salle.
// La scène suit la souris (ou l'inclinaison du téléphone) pour attirer l'œil.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import '@fontsource/caveat/600.css';
import '@fontsource-variable/fraunces/opsz.css';

const borne = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const doux = (t) => t * t * (3 - 2 * t);

export function vitrine(section) {
  const toile = section.querySelector('canvas');
  const textes = [...section.querySelectorAll('[data-de]')];

  const rendu = new THREE.WebGLRenderer({ canvas: toile, antialias: true, powerPreference: 'high-performance' });
  rendu.outputColorSpace = THREE.SRGBColorSpace;
  rendu.toneMapping = THREE.ACESFilmicToneMapping;
  rendu.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const nuit = new THREE.Color('#0E181B');
  scene.background = nuit;
  scene.fog = new THREE.Fog(nuit, 9, 26);
  const camera = new THREE.PerspectiveCamera(40, 1, 0.05, 60);

  // Un studio lumineux virtuel, reflété seulement par les métaux (laiton, inox, cuivre)
  const pmrem = new THREE.PMREMGenerator(rendu);
  const reflets = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  /* ---------- textures dessinées à la main sur des toiles ---------- */
  const toileTex = (w, h, dessin) => {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    dessin(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  };
  // Les textures écrites (enseigne, plaques, ardoise du chef) sont redessinées une fois les polices chargées
  const aRedessiner = [];
  const toileEcrite = (w, h, dessin) => {
    const t = toileTex(w, h, dessin);
    aRedessiner.push(() => { const g = t.image.getContext('2d'); g.clearRect(0, 0, w, h); dessin(g, w, h); t.needsUpdate = true; });
    return t;
  };
  const bruit = (g, w, h, n, couleur, taille = 2) => {
    g.fillStyle = couleur;
    for (let i = 0; i < n; i++) g.fillRect(Math.random() * w, Math.random() * h, taille * Math.random() + 0.5, taille * Math.random() + 0.5);
  };

  // Pavés de la rue
  const paves = toileTex(1024, 1024, (g, w, h) => {
    g.fillStyle = '#15191A'; g.fillRect(0, 0, w, h);
    const n = 16, s = w / n;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const dx = (y % 2) * s * 0.5;
      const l = 20 + Math.random() * 14;
      g.fillStyle = `hsl(190 6% ${l}%)`;
      g.beginPath(); g.roundRect(x * s + dx + 3, y * s + 3, s - 6, s - 6, 10); g.fill();
    }
    bruit(g, w, h, 9000, 'rgba(0,0,0,.25)', 3);
  });
  paves.wrapS = paves.wrapT = THREE.RepeatWrapping;
  paves.repeat.set(5, 5);

  // Crépi de la façade
  const crepi = toileTex(512, 512, (g, w, h) => {
    g.fillStyle = '#2E3A39'; g.fillRect(0, 0, w, h);
    bruit(g, w, h, 14000, 'rgba(255,255,255,.035)', 2);
    bruit(g, w, h, 14000, 'rgba(0,0,0,.08)', 2);
  });
  crepi.wrapS = crepi.wrapT = THREE.RepeatWrapping;
  crepi.repeat.set(4, 2);

  // L'enseigne
  const enseigne = toileEcrite(1024, 192, (g, w, h) => {
    g.fillStyle = '#1B2322'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(232,201,140,.55)'; g.lineWidth = 3; g.strokeRect(14, 14, w - 28, h - 28);
    g.fillStyle = '#F2D7A2';
    g.font = '600 92px "Fraunces Variable", Georgia, serif';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.shadowColor = 'rgba(255,200,120,.8)'; g.shadowBlur = 18;
    g.fillText('Votre restaurant', w / 2, h / 2 + 4);
  });

  // L'ardoise : le texte s'écrit à la craie au fil du défilement
  const lignes = [
    { t: 'Vos clients', y: 0.2 },
    { t: 'mangent', y: 0.36 },
    { t: 'd’abord', y: 0.52 },
    { t: 'avec les yeux.', y: 0.7, jaune: true },
  ];
  const W = 900, H = 1240;
  const fond = document.createElement('canvas');
  fond.width = W; fond.height = H;
  {
    const g = fond.getContext('2d');
    const d = g.createRadialGradient(W * 0.45, H * 0.4, 50, W / 2, H / 2, W);
    d.addColorStop(0, '#2A3331'); d.addColorStop(1, '#161C1B');
    g.fillStyle = d; g.fillRect(0, 0, W, H);
    // traces de craie effacée
    g.globalAlpha = 0.07; g.strokeStyle = '#fff'; g.lineCap = 'round';
    for (let i = 0; i < 60; i++) {
      g.lineWidth = 20 + Math.random() * 50;
      g.beginPath();
      const x = Math.random() * W, y = Math.random() * H;
      g.moveTo(x, y); g.quadraticCurveTo(x + 120, y - 40, x + 260 * Math.random(), y + 60 * Math.random());
      g.stroke();
    }
    g.globalAlpha = 1;
    bruit(g, W, H, 12000, 'rgba(255,255,255,.04)', 2);
  }
  const craie = document.createElement('canvas');
  craie.width = W; craie.height = H;
  const ardoiseC = document.createElement('canvas');
  ardoiseC.width = W; ardoiseC.height = H;
  const ardoiseTex = new THREE.CanvasTexture(ardoiseC);
  ardoiseTex.colorSpace = THREE.SRGBColorSpace;
  ardoiseTex.anisotropy = 8;

  function preparerCraie() {
    const g = craie.getContext('2d');
    g.clearRect(0, 0, W, H);
    g.textAlign = 'center'; g.textBaseline = 'middle';
    lignes.forEach((l) => {
      g.font = `600 ${l.jaune ? 142 : 150}px Caveat, "Comic Sans MS", cursive`;
      g.fillStyle = l.jaune ? '#FFD23F' : '#F4F1E8';
      g.shadowColor = l.jaune ? 'rgba(255,210,63,.55)' : 'rgba(255,255,255,.35)';
      g.shadowBlur = 10;
      g.fillText(l.t, W / 2, H * l.y);
    });
    // un trait souligné sous « avec les yeux »
    g.strokeStyle = '#FFD23F'; g.lineWidth = 9; g.lineCap = 'round';
    g.beginPath(); g.moveTo(W * 0.16, H * 0.8); g.quadraticCurveTo(W * 0.5, H * 0.83, W * 0.84, H * 0.795); g.stroke();
    // grain de craie : on gratte la matière
    g.globalCompositeOperation = 'destination-out';
    bruit(g, W, H, 26000, 'rgba(0,0,0,.55)', 2.5);
    g.globalCompositeOperation = 'source-over';
  }
  let ecrit = -1;
  function ecrire(p) {
    const q = Math.round(p * 400) / 400;
    if (q === ecrit) return;
    ecrit = q;
    const g = ardoiseC.getContext('2d');
    g.drawImage(fond, 0, 0);
    // Chaque ligne se dévoile de gauche à droite, l'une après l'autre
    const n = lignes.length + 1;
    for (let i = 0; i < n; i++) {
      const a = borne(q * n - i);
      if (a <= 0) break;
      const y = i < lignes.length ? H * lignes[i].y : H * 0.8;
      const h = i < lignes.length ? 200 : 60;
      g.save();
      g.beginPath(); g.rect(0, y - h / 2, W * (0.08 + a * 0.86), h); g.clip();
      g.drawImage(craie, 0, 0);
      g.restore();
    }
    ardoiseTex.needsUpdate = true;
  }

  /* ---------- la rue, la façade, la fenêtre ---------- */
  const mat = (o) => new THREE.MeshStandardMaterial(o);
  const boite = (w, h, d, m, x, y, z) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    b.position.set(x, y, z);
    scene.add(b);
    return b;
  };

  const sol = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), mat({ map: paves, roughness: 0.55, metalness: 0.1, color: '#9AA6A6' }));
  sol.rotation.x = -Math.PI / 2;
  scene.add(sol);
  // le trottoir devant la façade
  boite(30, 0.14, 2.2, mat({ color: '#3A4443', roughness: 0.9 }), 0, 0.07, 1.1);

  const murM = mat({ map: crepi, roughness: 0.95, color: '#B9C4C2' });
  const fx0 = -1.7, fx1 = 1.7, fy0 = 0.75, fy1 = 3.05;
  boite(30, 9, 0.4, murM, 0, fy1 + 4.5, -0.2); // au-dessus
  boite(30, fy0, 0.4, murM, 0, fy0 / 2, -0.2); // allège
  boite(15, fy1 - fy0, 0.4, murM, fx0 - 7.5, (fy0 + fy1) / 2, -0.2);
  boite(15, fy1 - fy0, 0.4, murM, fx1 + 7.5, (fy0 + fy1) / 2, -0.2);

  // menuiserie
  const bois = mat({ color: '#141C1B', roughness: 0.5, metalness: 0.2 });
  const e = 0.11;
  boite(fx1 - fx0 + e * 2, e, 0.2, bois, 0, fy0, 0.02);
  boite(fx1 - fx0 + e * 2, e, 0.2, bois, 0, fy1, 0.02);
  boite(e, fy1 - fy0, 0.2, bois, fx0, (fy0 + fy1) / 2, 0.02);
  boite(e, fy1 - fy0, 0.2, bois, fx1, (fy0 + fy1) / 2, 0.02);
  boite(0.06, fy1 - fy0, 0.12, bois, 0, (fy0 + fy1) / 2, 0.02);
  boite(fx1 - fx0, 0.06, 0.12, bois, 0, 2.55, 0.02);
  // appui de fenêtre
  boite(fx1 - fx0 + 0.5, 0.08, 0.36, mat({ color: '#4A5452', roughness: 0.7 }), 0, fy0 - 0.06, 0.12);

  // l'enseigne et deux appliques
  const panneau = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.6), new THREE.MeshBasicMaterial({ map: enseigne, toneMapped: false }));
  panneau.position.set(0, 3.65, 0.03);
  scene.add(panneau);
  const globe = new THREE.MeshBasicMaterial({ color: '#FFD9A0', toneMapped: false });
  // le halo d'une ampoule : un disque doux qui s'additionne à la lumière
  const haloTex = toileTex(128, 128, (g) => { const d = g.createRadialGradient(64, 64, 0, 64, 64, 64); d.addColorStop(0, 'rgba(255,214,150,.9)'); d.addColorStop(0.25, 'rgba(255,190,110,.35)'); d.addColorStop(1, 'rgba(255,170,80,0)'); g.fillStyle = d; g.fillRect(0, 0, 128, 128); });
  const aura = (parent, x, y, z, taille) => {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
    sp.position.set(x, y, z); sp.scale.setScalar(taille);
    parent.add(sp);
    return sp;
  };
  [-2.25, 2.25].forEach((x) => {
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.09, 20, 14), globe);
    s.position.set(x, 3.15, 0.25);
    scene.add(s);
    aura(scene, x, 3.15, 0.27, 0.9);
    boite(0.04, 0.04, 0.25, bois, x, 3.15, 0.12);
    const l = new THREE.PointLight('#FFC27A', 2.2, 5, 1.6);
    l.position.set(x, 3.1, 0.45);
    scene.add(l);
  });

  // la salle derrière la vitre : la vraie photo, comme une pièce éclairée
  const salleTex = new THREE.TextureLoader().load('/vitrine/salle.webp', () => { pret.salle = true; });
  salleTex.colorSpace = THREE.SRGBColorSpace;
  salleTex.anisotropy = 8;
  const salleM = new THREE.MeshBasicMaterial({ map: salleTex, toneMapped: false, transparent: true, color: new THREE.Color(0.92, 0.88, 0.8), fog: false });
  const salle = new THREE.Mesh(new THREE.PlaneGeometry(6.6, 6.6 / 1.507), salleM);
  salle.position.set(0, 1.95, -3.2);
  scene.add(salle);
  // la vitre : un reflet léger
  const reflet = toileTex(512, 512, (g, w, h) => {
    const d = g.createLinearGradient(0, 0, w, h);
    d.addColorStop(0, 'rgba(255,255,255,0)'); d.addColorStop(0.42, 'rgba(255,255,255,0)');
    d.addColorStop(0.5, 'rgba(255,255,255,.22)'); d.addColorStop(0.56, 'rgba(255,255,255,0)');
    d.addColorStop(0.66, 'rgba(255,255,255,.1)'); d.addColorStop(0.7, 'rgba(255,255,255,0)');
    g.fillStyle = d; g.fillRect(0, 0, w, h);
  });
  const vitreM = new THREE.MeshBasicMaterial({ map: reflet, transparent: true, depthWrite: false, opacity: 0.9 });
  const vitre = new THREE.Mesh(new THREE.PlaneGeometry(fx1 - fx0, fy1 - fy0), vitreM);
  vitre.position.set(0, (fy0 + fy1) / 2, 0.0);
  scene.add(vitre);

  // la lumière de la salle déborde sur le trottoir et sur l'ardoise
  const halo = new THREE.PointLight('#FFB866', 9, 12, 1.4);
  halo.position.set(0, 1.9, 0.9);
  scene.add(halo);
  scene.add(new THREE.HemisphereLight('#5C7A8A', '#0B0F10', 0.55));
  const lune = new THREE.DirectionalLight('#8FB0C4', 0.45);
  lune.position.set(-6, 9, 8);
  scene.add(lune);

  /* ---------- le chevalet ---------- */
  const chevalet = new THREE.Group();
  const boisClair = mat({ color: '#8A5A33', roughness: 0.7 });
  const planche = new THREE.Mesh(new THREE.BoxGeometry(0.92, 1.26, 0.035), [
    boisClair, boisClair, boisClair, boisClair,
    new THREE.MeshStandardMaterial({ map: ardoiseTex, roughness: 0.92, color: '#FFFFFF' }),
    boisClair,
  ]);
  planche.position.y = 0.92;
  chevalet.add(planche);
  const cadre = (w, h, x, y) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.06), boisClair); m.position.set(x, y, 0.005); chevalet.add(m); };
  cadre(1.02, 0.06, 0, 0.92 + 0.66);
  cadre(1.02, 0.06, 0, 0.92 - 0.66);
  cadre(0.06, 1.38, -0.49, 0.92);
  cadre(0.06, 1.38, 0.49, 0.92);
  [-0.45, 0.45].forEach((x) => {
    const pied = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.36, 0.05), boisClair);
    pied.position.set(x, 0.14, 0.02);
    chevalet.add(pied);
    const dos = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.7, 0.05), boisClair);
    dos.position.set(x, 0.8, -0.35); dos.rotation.x = -0.24;
    chevalet.add(dos);
  });
  chevalet.rotation.x = -0.12;
  // ombre douce au sol
  const ombre = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.2), new THREE.MeshBasicMaterial({
    map: toileTex(128, 128, (g) => { const d = g.createRadialGradient(64, 64, 4, 64, 64, 64); d.addColorStop(0, 'rgba(0,0,0,.65)'); d.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = d; g.fillRect(0, 0, 128, 128); }),
    transparent: true, depthWrite: false,
  }));
  ombre.rotation.x = -Math.PI / 2;
  ombre.position.set(0, 0.012, -0.12);
  chevalet.add(ombre);
  scene.add(chevalet);
  // une lampe chaude penchée sur l'ardoise
  const spot = new THREE.SpotLight('#FFE2B0', 14, 6, 0.55, 0.6, 1.4);
  scene.add(spot); scene.add(spot.target);

  /* ---------- poussière de craie dans la lumière ---------- */
  const N = 420;
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - 0.5) * 7; pos[i * 3 + 1] = Math.random() * 3.6; pos[i * 3 + 2] = Math.random() * 6 - 0.6; }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const point = toileTex(64, 64, (g) => { const d = g.createRadialGradient(32, 32, 0, 32, 32, 32); d.addColorStop(0, 'rgba(255,230,180,1)'); d.addColorStop(1, 'rgba(255,230,180,0)'); g.fillStyle = d; g.fillRect(0, 0, 64, 64); });
  const poussiere = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.035, map: point, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.7 }));
  scene.add(poussiere);

  /* ---------- dans le restaurant : la salle, trois fenêtres, la cuisine au fond ---------- */
  // Un couloir chaud de 4,4 m de large, de la vitrine (z = 0) jusqu'au passe-plat de la cuisine (z = -18)
  const L = 4.4, Hc = 3.6, Z0 = -0.05, Z1 = -18;
  const murSalle = toileTex(512, 512, (g, w, h) => {
    g.fillStyle = '#D8C7A6'; g.fillRect(0, 0, w, h);
    bruit(g, w, h, 9000, 'rgba(120,90,50,.06)', 3);
    // boiserie basse
    g.fillStyle = '#4A2F1E'; g.fillRect(0, h * 0.7, w, h * 0.3);
    g.fillStyle = '#5B3A25';
    for (let x = 8; x < w; x += 64) g.fillRect(x, h * 0.73, 52, h * 0.24);
    g.fillStyle = '#2E1C12'; g.fillRect(0, h * 0.69, w, 8);
  });
  murSalle.wrapS = THREE.RepeatWrapping;
  murSalle.repeat.set(5, 1);
  const carreaux = toileTex(512, 512, (g, w, h) => {
    const n = 24, s = w / n;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const r = Math.random();
      g.fillStyle = r < 0.12 ? '#7E2F2A' : r < 0.2 ? '#B9AE98' : '#D9CFBC';
      g.fillRect(x * s + 1, y * s + 1, s - 2, s - 2);
    }
  });
  carreaux.wrapS = carreaux.wrapT = THREE.RepeatWrapping;
  carreaux.repeat.set(3, 12);
  const interieur = new THREE.Group();
  const murG = new THREE.Mesh(new THREE.PlaneGeometry(Z0 - Z1, Hc), mat({ map: murSalle, roughness: 0.9 }));
  murG.rotation.y = Math.PI / 2; murG.position.set(-L / 2, Hc / 2, (Z0 + Z1) / 2);
  const murD = murG.clone(); murD.rotation.y = -Math.PI / 2; murD.position.x = L / 2;
  const solIn = new THREE.Mesh(new THREE.PlaneGeometry(L, Z0 - Z1), mat({ map: carreaux, roughness: 0.6 }));
  solIn.rotation.x = -Math.PI / 2; solIn.position.set(0, 0.002, (Z0 + Z1) / 2);
  const plafond = new THREE.Mesh(new THREE.PlaneGeometry(L, Z0 - Z1), mat({ color: '#2A1A11', roughness: 0.8 }));
  plafond.rotation.x = Math.PI / 2; plafond.position.set(0, Hc, (Z0 + Z1) / 2);
  interieur.add(murG, murD, solIn, plafond);
  // poutres et plinthes : le rythme de la salle
  const poutreM = mat({ color: '#3A2416', roughness: 0.75 });
  for (let z = -1.2; z > Z1 + 0.5; z -= 1.6) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(L, 0.16, 0.18), poutreM);
    p.position.set(0, Hc - 0.08, z);
    interieur.add(p);
  }
  // suspensions le long de la salle
  const laiton = mat({ color: '#B08A4E', metalness: 0.8, roughness: 0.35, envMap: reflets, envMapIntensity: 0.8 });
  [-4.2, -7.8, -11.4, -15].forEach((z) => {
    const abat = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.2, 24, 1, true), laiton);
    abat.position.set(0, Hc - 0.75, z);
    const fil = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.65), laiton);
    fil.position.set(0, Hc - 0.33, z);
    const ampoule = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 12), globe);
    ampoule.position.set(0, Hc - 0.86, z);
    aura(interieur, 0, Hc - 0.88, z, 0.8);
    const l = new THREE.PointLight('#FFC27A', 4, 6, 1.6);
    l.position.set(0, Hc - 1, z);
    interieur.add(abat, fil, ampoule, l);
  });

  // Les trois fenêtres : elles s'allument quand on s'en approche
  const chargeur = new THREE.TextureLoader();
  const fenetres = [
    { img: '/vitrine/ragu.webp', titre: 'Restaurants', x: -L / 2 + 0.02, z: -5.6, ry: Math.PI / 2 },
    { img: '/vitrine/tarte.webp', titre: 'Artisans', x: L / 2 - 0.02, z: -9.2, ry: -Math.PI / 2 },
    { img: '/vitrine/ramen.webp', titre: 'Offres et prix', x: -L / 2 + 0.02, z: -12.8, ry: Math.PI / 2 },
  ].map((f) => {
    const tex = chargeur.load(f.img, () => recadrer());
    tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    const g = new THREE.Group();
    const largeur = 1.9, hauteur = 1.25;
    const photoM = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, color: new THREE.Color(0.18, 0.16, 0.14) });
    const photo = new THREE.Mesh(new THREE.PlaneGeometry(largeur, hauteur), photoM);
    photo.position.z = 0.03;
    g.add(photo);
    // la photo garde ses proportions : on la recadre au centre
    const recadrer = () => {
      const r = tex.image.width / tex.image.height, cible = largeur / hauteur;
      if (r > cible) { tex.repeat.set(cible / r, 1); tex.offset.set((1 - cible / r) / 2, 0); }
      else { tex.repeat.set(1, r / cible); tex.offset.set(0, (1 - r / cible) / 2); }
    };
    const e = 0.07;
    [[largeur + e * 2, e, 0, hauteur / 2 + e / 2], [largeur + e * 2, e, 0, -hauteur / 2 - e / 2], [e, hauteur, -largeur / 2 - e / 2, 0], [e, hauteur, largeur / 2 + e / 2, 0]]
      .forEach(([w, h, x, y]) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.08), bois); b.position.set(x, y, 0.03); g.add(b); });
    const plaque = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.2), new THREE.MeshBasicMaterial({ map: toileEcrite(512, 102, (c, w, h) => {
      c.fillStyle = '#1B2322'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#F2D7A2'; c.font = '600 54px "Fraunces Variable", Georgia, serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillText(f.titre, w / 2, h / 2 + 3);
    }), toneMapped: false }));
    plaque.position.set(0, -hauteur / 2 - 0.22, 0.03);
    g.add(plaque);
    g.position.set(f.x, 1.85, f.z);
    g.rotation.y = f.ry;
    const lampe = new THREE.PointLight('#FFD9A0', 0, 3.5, 1.5);
    lampe.position.set(f.x + Math.sign(-f.x) * 0.9, 2.9, f.z);
    interieur.add(g, lampe);
    return { ...f, photoM, lampe };
  });

  // La cuisine au fond : le passe-plat éclairé, les casseroles en cuivre, une petite ardoise
  const cuisine = new THREE.Group();
  const murFond = mat({ map: murSalle, roughness: 0.9 });
  const ox = 1.5, oy0 = 1.05, oy1 = 2.45;
  const bloc = (w, h, x, y) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), murFond); m.position.set(x, y, Z1); cuisine.add(m); };
  bloc(L, oy0, 0, oy0 / 2);
  bloc(L, Hc - oy1, 0, (Hc + oy1) / 2);
  bloc(L / 2 - ox, oy1 - oy0, -(L / 2 + ox) / 2, (oy0 + oy1) / 2);
  bloc(L / 2 - ox, oy1 - oy0, (L / 2 + ox) / 2, (oy0 + oy1) / 2);
  const inox = mat({ color: '#C9CED1', metalness: 0.9, roughness: 0.28, envMap: reflets, envMapIntensity: 0.7 });
  const comptoir = new THREE.Mesh(new THREE.BoxGeometry(ox * 2 + 0.3, 0.06, 0.5), inox);
  comptoir.position.set(0, oy0, Z1 + 0.1);
  cuisine.add(comptoir);
  // la cuisine derrière : un fond chaud et des casseroles suspendues
  // crédence en carreaux blancs, comme dans une vraie cuisine
  const credence = toileTex(512, 512, (g, w, h) => {
    g.fillStyle = '#8F8578'; g.fillRect(0, 0, w, h);
    const cw = 64, ch = 32;
    for (let y = 0; y < h; y += ch) for (let x = -((y / ch) % 2) * cw / 2; x < w; x += cw) {
      const l = 88 + Math.random() * 6;
      g.fillStyle = `hsl(40 18% ${l}%)`;
      g.fillRect(x + 2, y + 2, cw - 4, ch - 4);
    }
  });
  credence.wrapS = credence.wrapT = THREE.RepeatWrapping;
  credence.repeat.set(3, 2);
  const cuisineFond = new THREE.Mesh(new THREE.PlaneGeometry(4, 2.6), mat({ map: credence, roughness: 0.35, color: '#E8D9C2' }));
  cuisineFond.position.set(0, 1.8, Z1 - 1.6);
  cuisine.add(cuisineFond);
  const plan = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.9, 0.7), inox);
  plan.position.set(0, 0.45, Z1 - 1.1);
  cuisine.add(plan);
  const barre = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 2.8), inox);
  barre.rotation.z = Math.PI / 2; barre.position.set(0, 2.55, Z1 - 0.9);
  cuisine.add(barre);
  const cuivre = mat({ color: '#C2703D', metalness: 0.95, roughness: 0.3, envMap: reflets, envMapIntensity: 1 });
  [-1.15, -0.65, -0.15, 0.35, 0.85, 1.25].forEach((x, i) => {
    const r = 0.14 + (i % 3) * 0.04;
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.92, r * 0.9, 32), cuivre);
    pot.position.set(x, 2.2 - r * 0.5, Z1 - 0.9);
    const anse = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.35), cuivre);
    anse.position.set(x, 2.42, Z1 - 0.9);
    cuisine.add(pot, anse);
  });
  // lampes chauffantes au-dessus du passe
  [-0.9, 0, 0.9].forEach((x) => {
    const lampe = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.18, 24, 1, true), inox);
    lampe.position.set(x, oy1 - 0.12, Z1 + 0.15);
    cuisine.add(lampe);
    aura(cuisine, x, oy1 - 0.22, Z1 + 0.2, 0.55);
  });
  // la vapeur qui monte de la cuisine
  const vapeurTex = toileTex(128, 128, (g) => { const d = g.createRadialGradient(64, 64, 0, 64, 64, 64); d.addColorStop(0, 'rgba(255,245,230,.22)'); d.addColorStop(1, 'rgba(255,245,230,0)'); g.fillStyle = d; g.fillRect(0, 0, 128, 128); });
  const vapeur = Array.from({ length: 18 }, (_, i) => {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: vapeurTex, transparent: true, depthWrite: false, opacity: 0 }));
    sp.userData = { x: (Math.random() - 0.5) * 2.4, phase: i / 18, vitesse: 0.08 + Math.random() * 0.06 };
    cuisine.add(sp);
    return sp;
  });
  const feu = new THREE.PointLight('#FFB45E', 10, 6, 1.4);
  feu.position.set(0, 2.1, Z1 - 0.6);
  cuisine.add(feu);
  // l'ardoise du chef, au-dessus du passe
  const ardoiseChef = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.62), new THREE.MeshStandardMaterial({ roughness: 0.9, map: toileEcrite(768, 318, (c, w, h) => {
    c.fillStyle = '#1D2422'; c.fillRect(0, 0, w, h);
    c.strokeStyle = '#8A5A33'; c.lineWidth = 18; c.strokeRect(9, 9, w - 18, h - 18);
    c.fillStyle = '#F4F1E8'; c.font = '600 92px Caveat, cursive'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText('On s’y met ?', w / 2, h / 2);
  }) }));
  ardoiseChef.position.set(0, 3.0, Z1 + 0.02);
  cuisine.add(ardoiseChef);
  interieur.add(cuisine);
  interieur.visible = false;
  scene.add(interieur);

  /* ---------- le trajet de la caméra : une suite de stations, la caméra s'arrête à chacune ---------- */
  // Chaque étape : à quel moment du défilement (t), où est la caméra, où elle regarde.
  // Entre deux étapes, le mouvement part doucement et arrive doucement : pas de secousse.
  // devant une fenêtre ; sur ordinateur on vise un peu à sa droite pour laisser la place au texte
  const devant = (f, d, decale) => {
    const n = [Math.sin(f.ry), Math.cos(f.ry)], tg = [Math.cos(f.ry), -Math.sin(f.ry)];
    return [[f.x + n[0] * d, 1.75, f.z + n[1] * d], [f.x + tg[0] * decale, 1.8, f.z + tg[1] * decale]];
  };
  function etapes(haut) {
    const d = haut ? 3.0 : 2.9, dec = haut ? 0 : 0.6;
    const [p1, v1] = devant(fenetres[0], d, dec), [p2, v2] = devant(fenetres[1], d, dec), [p3, v3] = devant(fenetres[2], d, dec);
    const rue = haut
      ? [[0, [-0.1, 1.55, 8.6], [-0.25, 1.45, 3.0]], [0.14, [-0.1, 1.55, 8.6], [-0.25, 1.45, 3.0]], [0.22, [1.0, 1.9, 4.7], [0.2, 1.7, 0.6]]]
      : [[0, [0.2, 1.38, 6.7], [-0.6, 1.12, 2.9]], [0.14, [0.2, 1.38, 6.7], [-0.6, 1.12, 2.9]], [0.22, [0.6, 1.7, 4.4], [-0.1, 1.7, 0.6]]];
    return [
      ...rue,
      [0.3, [0.5, 1.9, 0.6], [0.5, 1.9, -3.2]],
      [0.36, [0.5, 1.9, 0.6], [0.5, 1.9, -3.2]],
      [0.44, [0, 1.75, -1.6], [0, 1.75, -6]],
      [0.52, p1, v1], [0.58, p1, v1],
      [0.66, p2, v2], [0.72, p2, v2],
      [0.8, p3, v3], [0.86, p3, v3],
      [0.95, [0, 1.75, Z1 + 4.2], [0, 1.85, Z1]], [1, [0, 1.75, Z1 + 4.2], [0, 1.85, Z1]],
    ].map(([t, p, v]) => ({ t, p: new THREE.Vector3(...p), v: new THREE.Vector3(...v) }));
  }
  let trajet;
  function placer(c, pos, cible) {
    let i = 0;
    while (i < trajet.length - 2 && c > trajet[i + 1].t) i++;
    const a = trajet[i], b = trajet[i + 1];
    const u = doux(borne((c - a.t) / (b.t - a.t)));
    pos.lerpVectors(a.p, b.p, u);
    cible.lerpVectors(a.v, b.v, u);
  }
  function regler() {
    const w = toile.clientWidth, h = toile.clientHeight;
    rendu.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    rendu.setSize(w, h, false);
    camera.aspect = w / h;
    const haut = w / h < 1;
    camera.fov = haut ? 58 : 40;
    camera.updateProjectionMatrix();
    trajet = etapes(haut);
    const [ax, ay, az, ar] = haut ? [-0.35, 0, 3.6, 0.18] : [-1.05, 0, 3.4, 0.32];
    chevalet.position.set(ax, ay, az);
    chevalet.rotation.y = ar;
    spot.position.set(ax + 0.9, 3.2, az + 1.6);
    spot.target.position.set(ax, 1, az);
  }
  regler();
  addEventListener('resize', regler);

  /* ---------- souris et inclinaison : la scène respire avec le visiteur ---------- */
  let mx = 0, my = 0, sx = 0, sy = 0;
  addEventListener('pointermove', (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; }, { passive: true });
  addEventListener('deviceorientation', (e) => {
    if (e.gamma == null) return;
    mx = borne(e.gamma / 50, -0.5, 0.5);
    my = borne((e.beta - 45) / 60, -0.5, 0.5);
  }, { passive: true });

  const pret = { salle: false };
  let courant = 0;
  preparerCraie();
  document.fonts.load('600 150px Caveat').then(() => { preparerCraie(); ecrit = -1; });
  Promise.all([document.fonts.load('600 92px "Fraunces Variable"'), document.fonts.load('600 92px Caveat')]).then(() => aRedessiner.forEach((f) => f()));

  // pour les captures d'aperçu : section.aller(0.5) fige la scène à mi-parcours
  let force = null;
  section.aller = (p) => { force = p; };
  // avec le défilement fluide de l'ordinateur, la scène n'a pas besoin d'être lissée deux fois
  const lissage = document.documentElement.classList.contains('lenis') ? 0.3 : 0.12;
  const jalons = section.querySelectorAll('.vitrine__trajet li');
  const bornesTrajet = [0, 0.3, 0.47, 0.62, 0.76, 0.9];
  let etape = -1;
  const v = new THREE.Vector3();
  const horloge = new THREE.Clock();
  function image() {
    requestAnimationFrame(image);
    // hors de l'écran, on ne dessine rien
    const r = section.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const t = horloge.getElapsedTime();
    const vise = force ?? borne(-r.top / (r.height - innerHeight));
    courant = force ?? courant + (vise - courant) * lissage;
    sx += (mx - sx) * 0.05;
    sy += (my - sy) * 0.05;

    // La caméra reste immobile devant l'ardoise pendant que la craie écrit, puis elle avance de station en station
    ecrire(borne((courant - 0.01) / 0.12));
    placer(courant, camera.position, v);
    // la souris ne pèse que dans la rue
    const poids = 1 - borne((courant - 0.2) / 0.1);
    camera.position.x += sx * 0.12 * poids;
    camera.position.y -= sy * 0.06 * poids;
    camera.lookAt(v);
    halo.intensity = 9 + Math.sin(t * 2.3) * 0.25 + Math.sin(t * 5.1) * 0.15;
    poussiere.rotation.y = t * 0.015;
    poussiere.position.y = Math.sin(t * 0.3) * 0.05;
    // la vitre disparaît quand on la traverse, la photo de la salle s'efface et la salle s'ouvre
    vitreM.opacity = 0.9 * (1 - borne((courant - 0.37) / 0.03));
    const ouvre = borne((courant - 0.38) / 0.05);
    salleM.opacity = 1 - ouvre;
    salle.visible = ouvre < 1;
    interieur.visible = courant > 0.34;
    // chaque fenêtre s'allume quand on arrive devant elle
    fenetres.forEach((f, i) => {
      const centre = [0.55, 0.69, 0.83][i];
      const k = borne(1 - Math.abs(courant - centre) / 0.09);
      const l = 0.18 + 0.82 * doux(k);
      f.photoM.color.setRGB(l, l * 0.97, l * 0.93);
      f.lampe.intensity = 6 * doux(k);
    });
    feu.intensity = 3 + 9 * borne((courant - 0.86) / 0.08) + Math.sin(t * 3.1) * 0.3;
    if (courant > 0.8) vapeur.forEach((sp) => {
      const u = (t * sp.userData.vitesse + sp.userData.phase) % 1;
      sp.position.set(sp.userData.x + Math.sin(t + sp.userData.phase * 9) * 0.1, 1.15 + u * 1.6, Z1 - 0.6);
      sp.scale.setScalar(0.4 + u * 0.9);
      sp.material.opacity = Math.sin(u * Math.PI) * 0.8;
    });
    rendu.render(scene, camera);

    textes.forEach((el) => {
      const de = Number(el.dataset.de), a = Number(el.dataset.a), f = 0.05;
      const o = borne(Math.min((courant - de) / f, (a - courant) / f));
      el.style.setProperty('--o', o.toFixed(3));
      el.style.setProperty('--y', `${((1 - o) * (courant < (de + a) / 2 ? 24 : -24)).toFixed(1)}px`);
      el.style.visibility = o > 0.01 ? 'visible' : 'hidden';
      el.classList.toggle('actif', o > 0.3);
    });
    section.style.setProperty('--trajet', courant.toFixed(4));
    const e = bornesTrajet.findLastIndex((b) => courant >= b);
    if (e !== etape) { etape = e; jalons.forEach((li, i) => { li.classList.toggle('ici', i === e); li.classList.toggle('passe', i < e); }); }
    section.style.setProperty('--fin', borne((courant - 0.36) / 0.04) * (1 - borne((courant - 0.42) / 0.04)));
  }
  image();
  section.classList.add('vivante');
}
