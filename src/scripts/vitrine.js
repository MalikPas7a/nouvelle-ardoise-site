// La vitrine : une rue au crépuscule, une ardoise sur son chevalet, une fenêtre éclairée.
// Au défilement, la craie écrit sur l'ardoise, puis la caméra avance et entre dans la salle.
// La scène suit la souris (ou l'inclinaison du téléphone) pour attirer l'œil.
import * as THREE from 'three';
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
  const enseigne = toileTex(1024, 192, (g, w, h) => {
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
  [-2.25, 2.25].forEach((x) => {
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.09, 20, 14), globe);
    s.position.set(x, 3.15, 0.25);
    scene.add(s);
    boite(0.04, 0.04, 0.25, bois, x, 3.15, 0.12);
    const l = new THREE.PointLight('#FFC27A', 2.2, 5, 1.6);
    l.position.set(x, 3.1, 0.45);
    scene.add(l);
  });

  // la salle derrière la vitre : la vraie photo, comme une pièce éclairée
  const salleTex = new THREE.TextureLoader().load('/vitrine/salle.webp', () => { pret.salle = true; });
  salleTex.colorSpace = THREE.SRGBColorSpace;
  salleTex.anisotropy = 8;
  const salleM = new THREE.MeshBasicMaterial({ map: salleTex, toneMapped: false, color: new THREE.Color(0.92, 0.88, 0.8), fog: false });
  const salle = new THREE.Mesh(new THREE.PlaneGeometry(6.6, 6.6 / 1.507), salleM);
  salle.position.set(0, 1.95, -3.2);
  scene.add(salle);
  // les murs de la salle, chauds, pour donner de la profondeur vue de biais
  const chaud = new THREE.MeshBasicMaterial({ color: '#4A3626', side: THREE.BackSide, fog: false });
  const piece = new THREE.Mesh(new THREE.BoxGeometry(6.6, 4.4, 3.3), chaud);
  piece.position.set(0, 1.95, -1.65);
  scene.add(piece);
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

  /* ---------- le trajet de la caméra ---------- */
  // Ordinateur : l'ardoise à gauche, la vitrine à droite. Téléphone : l'ardoise au centre, puis la vitrine.
  const trajets = {
    large: {
      ardoise: [-1.05, 0, 3.4, 0.32],
      pos: [[0.7, 1.5, 8.2], [-0.55, 1.18, 5.35], [-0.5, 1.2, 5.1], [0.5, 1.7, 4.3], [0.05, 1.85, 1.6], [0.5, 1.95, 0.15], [0.5, 1.95, -0.6]],
      vise: [[-0.6, 1.2, 2.5], [-1.0, 1.06, 3.4], [-1.0, 1.08, 3.4], [-0.1, 1.7, 0.6], [0, 1.9, -1.2], [0.5, 1.95, -3.2], [0.5, 1.95, -3.2]],
    },
    haut: {
      ardoise: [-0.35, 0, 3.6, 0.18],
      pos: [[0.15, 1.45, 8.6], [-0.3, 1.1, 5.55], [-0.28, 1.12, 5.3], [1.0, 1.9, 4.7], [0.35, 1.9, 2.5], [0.5, 1.95, 0.4], [0.5, 1.95, -0.85]],
      vise: [[-0.3, 1.25, 2.6], [-0.33, 1.02, 3.6], [-0.33, 1.04, 3.6], [0.2, 1.7, 0.6], [0, 1.9, -1.2], [0.5, 1.95, -3.2], [0.5, 1.95, -3.2]],
    },
  };
  let trajet, courbePos, courbeVise;
  function regler() {
    const w = toile.clientWidth, h = toile.clientHeight;
    rendu.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    rendu.setSize(w, h, false);
    camera.aspect = w / h;
    const haut = w / h < 1;
    camera.fov = haut ? 58 : 40;
    camera.updateProjectionMatrix();
    trajet = trajets[haut ? 'haut' : 'large'];
    courbePos = new THREE.CatmullRomCurve3(trajet.pos.map((v) => new THREE.Vector3(...v)), false, 'centripetal');
    courbeVise = new THREE.CatmullRomCurve3(trajet.vise.map((v) => new THREE.Vector3(...v)), false, 'centripetal');
    const [ax, ay, az, ar] = trajet.ardoise;
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
  document.fonts.load('600 92px "Fraunces Variable"').then(() => {
    const c = enseigne.image; const g = c.getContext('2d');
    g.fillStyle = '#1B2322'; g.fillRect(0, 0, c.width, c.height);
    g.strokeStyle = 'rgba(232,201,140,.55)'; g.lineWidth = 3; g.strokeRect(14, 14, c.width - 28, c.height - 28);
    g.fillStyle = '#F2D7A2'; g.font = '600 92px "Fraunces Variable", Georgia, serif';
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = 'rgba(255,200,120,.8)'; g.shadowBlur = 18;
    g.fillText('Votre restaurant', c.width / 2, c.height / 2 + 4);
    enseigne.needsUpdate = true;
  });

  // pour les captures d'aperçu : section.aller(0.5) fige la scène à mi-parcours
  let force = null;
  section.aller = (p) => { force = p; };
  const v = new THREE.Vector3();
  const horloge = new THREE.Clock();
  function image() {
    requestAnimationFrame(image);
    // hors de l'écran, on ne dessine rien
    const r = section.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const t = horloge.getElapsedTime();
    const vise = force ?? borne(-r.top / (r.height - innerHeight));
    courant = force ?? courant + (vise - courant) * 0.12;
    sx += (mx - sx) * 0.05;
    sy += (my - sy) * 0.05;

    // 0 → 0,22 : la craie écrit, on s'arrête devant l'ardoise ; ensuite on avance vers la vitrine
    ecrire(borne((courant - 0.02) / 0.2));
    const u = doux(borne(courant));
    courbePos.getPoint(u, camera.position);
    courbeVise.getPoint(u, v);
    // la souris pèse moins une fois dans la salle
    const poids = 1 - borne((courant - 0.75) / 0.2);
    camera.position.x += sx * 0.35 * poids;
    camera.position.y -= sy * 0.18 * poids;
    camera.lookAt(v);
    chevalet.rotation.z = Math.sin(t * 0.8) * 0.004;
    halo.intensity = 9 + Math.sin(t * 2.3) * 0.25 + Math.sin(t * 5.1) * 0.15;
    poussiere.rotation.y = t * 0.015;
    poussiere.position.y = Math.sin(t * 0.3) * 0.05;
    // la vitre disparaît quand on la traverse
    vitreM.opacity = 0.9 * (1 - borne((courant - 0.82) / 0.08));
    rendu.render(scene, camera);

    textes.forEach((el) => {
      const de = Number(el.dataset.de), a = Number(el.dataset.a), f = 0.05;
      const o = borne(Math.min((courant - de) / f, (a - courant) / f));
      el.style.setProperty('--o', o.toFixed(3));
      el.style.setProperty('--y', `${((1 - o) * (courant < (de + a) / 2 ? 24 : -24)).toFixed(1)}px`);
    });
    section.style.setProperty('--fin', borne((courant - 0.86) / 0.1).toFixed(3));
  }
  image();
  section.classList.add('vivante');
}
