// L'ardoise cosmique : une ardoise seule dans la nuit, la craie écrit (caméra immobile), puis la craie
// s'envole en poussière, l'ardoise s'ouvre et on plonge dans une nuit couleur ardoise où cinq panneaux
// de verre flottent, un par service. Chacun s'allume quand on arrive devant. À la fin, ils s'alignent
// et forment une salle de lumière. La scène suit la souris (ou l'inclinaison du téléphone).
import * as THREE from 'three';
import '@fontsource/caveat/600.css';

const borne = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const doux = (t) => t * t * (3 - 2 * t);

export function vitrine(section) {
  const toile = section.querySelector('canvas');
  const textes = [...section.querySelectorAll('[data-de]')];

  // sur les écrans très denses (téléphones), l'anticrénelage ne se voit plus et coûte cher : on s'en passe
  const rendu = new THREE.WebGLRenderer({ canvas: toile, antialias: (devicePixelRatio || 1) < 2.5, powerPreference: 'high-performance' });
  rendu.outputColorSpace = THREE.SRGBColorSpace;
  rendu.toneMapping = THREE.ACESFilmicToneMapping;
  rendu.toneMappingExposure = 1.0;

  const scene = new THREE.Scene();
  const nuit = new THREE.Color('#0E181B');
  scene.background = nuit;
  scene.fog = new THREE.Fog(nuit, 8, 34);
  const camera = new THREE.PerspectiveCamera(40, 1, 0.05, 90);

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
  const halo = (teinte) => toileTex(128, 128, (g) => { const d = g.createRadialGradient(64, 64, 0, 64, 64, 64); d.addColorStop(0, teinte(0.9)); d.addColorStop(0.3, teinte(0.35)); d.addColorStop(1, teinte(0)); g.fillStyle = d; g.fillRect(0, 0, 128, 128); });
  const haloJaune = halo((a) => `rgba(255,214,110,${a})`);
  const haloBleu = halo((a) => `rgba(70,120,140,${a})`);
  const sprite = (parent, map, x, y, z, taille, opacity = 1, additif = true) => {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map, transparent: true, depthWrite: false, blending: additif ? THREE.AdditiveBlending : THREE.NormalBlending, toneMapped: false, opacity, fog: false }));
    sp.position.set(x, y, z); sp.scale.setScalar(taille);
    parent.add(sp);
    return sp;
  };

  /* ---------- l'ardoise : le texte s'écrit à la craie au fil du défilement ---------- */
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
    g.strokeStyle = '#FFD23F'; g.lineWidth = 9; g.lineCap = 'round';
    g.beginPath(); g.moveTo(W * 0.16, H * 0.8); g.quadraticCurveTo(W * 0.5, H * 0.83, W * 0.84, H * 0.795); g.stroke();
    g.globalCompositeOperation = 'destination-out';
    bruit(g, W, H, 26000, 'rgba(0,0,0,.55)', 2.5);
    g.globalCompositeOperation = 'source-over';
  }
  let ecrit = '';
  // p : avancement de l'écriture ; a : opacité de la craie (elle s'efface quand elle s'envole)
  function ecrire(p, a) {
    const q = Math.round(p * 240) / 240, qa = Math.round(a * 40) / 40;
    const cle = q + '/' + qa;
    if (cle === ecrit) return;
    ecrit = cle;
    const g = ardoiseC.getContext('2d');
    g.globalAlpha = 1;
    g.drawImage(fond, 0, 0);
    g.globalAlpha = qa;
    const n = lignes.length + 1;
    for (let i = 0; i < n; i++) {
      const av = borne(q * n - i);
      if (av <= 0) break;
      const y = i < lignes.length ? H * lignes[i].y : H * 0.8;
      const h = i < lignes.length ? 200 : 60;
      g.save();
      g.beginPath(); g.rect(0, y - h / 2, W * (0.08 + av * 0.86), h); g.clip();
      g.drawImage(craie, 0, 0);
      g.restore();
    }
    g.globalAlpha = 1;
    ardoiseTex.needsUpdate = true;
  }

  /* ---------- le sol de nuit et le chevalet ---------- */
  const solM = new THREE.MeshStandardMaterial({ color: '#111C1F', roughness: 1, transparent: true });
  const sol = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), solM);
  sol.rotation.x = -Math.PI / 2;
  scene.add(sol);

  const chevalet = new THREE.Group();
  const boisClair = new THREE.MeshStandardMaterial({ color: '#8A5A33', roughness: 0.7, transparent: true });
  const ardoiseM = new THREE.MeshStandardMaterial({ map: ardoiseTex, roughness: 0.92, color: '#FFFFFF', transparent: true });
  const planche = new THREE.Mesh(new THREE.BoxGeometry(0.92, 1.26, 0.035), [boisClair, boisClair, boisClair, boisClair, ardoiseM, boisClair]);
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
  const ombreM = new THREE.MeshBasicMaterial({ map: toileTex(128, 128, (g) => { const d = g.createRadialGradient(64, 64, 4, 64, 64, 64); d.addColorStop(0, 'rgba(0,0,0,.65)'); d.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = d; g.fillRect(0, 0, 128, 128); }), transparent: true, depthWrite: false });
  const ombre = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.2), ombreM);
  ombre.rotation.x = -Math.PI / 2;
  ombre.position.set(0, 0.012, -0.12);
  chevalet.add(ombre);
  scene.add(chevalet);
  // une lampe chaude penchée sur l'ardoise, et la nuit tout autour
  const spot = new THREE.SpotLight('#FFE2B0', 16, 7, 0.6, 0.6, 1.4);
  scene.add(spot); scene.add(spot.target);
  const lueurSol = sprite(scene, haloJaune, 0, 0.3, 0.6, 3.2, 0.35);
  scene.add(new THREE.HemisphereLight('#3E5A68', '#07090A', 0.5));

  /* ---------- la craie qui s'envole : des grains qui quittent l'ardoise ---------- */
  const Np = 900;
  const grainsPos = new Float32Array(Np * 3), base = new Float32Array(Np * 2), elan = new Float32Array(Np * 3);
  for (let i = 0; i < Np; i++) {
    base[i * 2] = (Math.random() - 0.5) * 0.86; base[i * 2 + 1] = (Math.random() - 0.5) * 1.2;
    elan[i * 3] = (Math.random() - 0.5) * 1.6; elan[i * 3 + 1] = 0.6 + Math.random() * 2.2; elan[i * 3 + 2] = 0.4 + Math.random() * 1.8;
  }
  const grainsGeo = new THREE.BufferGeometry();
  grainsGeo.setAttribute('position', new THREE.BufferAttribute(grainsPos, 3));
  const pointTex = toileTex(64, 64, (g) => { const d = g.createRadialGradient(32, 32, 0, 32, 32, 32); d.addColorStop(0, 'rgba(255,245,225,1)'); d.addColorStop(1, 'rgba(255,245,225,0)'); g.fillStyle = d; g.fillRect(0, 0, 64, 64); });
  const grainsM = new THREE.PointsMaterial({ size: 0.028, map: pointTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 });
  const grains = new THREE.Points(grainsGeo, grainsM);
  grains.position.set(0, 0.92, 0.04);
  grains.visible = false;
  chevalet.add(grains);
  function envoler(p, t) {
    const e = doux(p);
    for (let i = 0; i < Np; i++) {
      const s = i * 0.37;
      grainsPos[i * 3] = base[i * 2] + elan[i * 3] * e + Math.sin(t * 1.3 + s) * 0.05 * e;
      grainsPos[i * 3 + 1] = base[i * 2 + 1] + elan[i * 3 + 1] * e + Math.cos(t * 0.9 + s) * 0.04 * e;
      grainsPos[i * 3 + 2] = elan[i * 3 + 2] * e;
    }
    grainsGeo.attributes.position.needsUpdate = true;
    grainsM.opacity = Math.sin(p * Math.PI) * 0.9;
  }

  /* ---------- la nuit d'ardoise : poussière de craie en étoiles, brume bleue ---------- */
  const Ne = 1800;
  const ePos = new Float32Array(Ne * 3);
  for (let i = 0; i < Ne; i++) { ePos[i * 3] = (Math.random() - 0.5) * 26; ePos[i * 3 + 1] = Math.random() * 10 - 2; ePos[i * 3 + 2] = 6 - Math.random() * 46; }
  const eGeo = new THREE.BufferGeometry();
  eGeo.setAttribute('position', new THREE.BufferAttribute(ePos, 3));
  const etoiles = new THREE.Points(eGeo, new THREE.PointsMaterial({ size: 0.05, map: pointTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.55, sizeAttenuation: true }));
  scene.add(etoiles);
  const brumes = [];
  for (let i = 0; i < 9; i++) {
    const z = -2 - i * 4.2;
    const sp = sprite(scene, haloBleu, (i % 2 ? 1 : -1) * (3 + Math.random() * 3), 1 + Math.random() * 3, z, 9 + Math.random() * 6, 0.16);
    sp.userData = { z, phase: i };
    brumes.push(sp);
  }

  /* ---------- cinq panneaux de verre, un par service ---------- */
  const chargeur = new THREE.TextureLoader();
  const charger = (src, apres) => { const t = chargeur.load(src, () => apres && apres(t)); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
  const reflet = toileTex(512, 512, (g, w, h) => {
    const d = g.createLinearGradient(0, 0, w, h);
    d.addColorStop(0, 'rgba(255,255,255,.05)'); d.addColorStop(0.38, 'rgba(255,255,255,.02)');
    d.addColorStop(0.47, 'rgba(255,255,255,.26)'); d.addColorStop(0.55, 'rgba(255,255,255,.04)');
    d.addColorStop(0.72, 'rgba(255,255,255,.12)'); d.addColorStop(1, 'rgba(255,255,255,.03)');
    g.fillStyle = d; g.fillRect(0, 0, w, h);
  });
  const services = [
    { nom: 'Site web', img: 'ragu' },
    { nom: 'Design', img: 'tarte' },
    { nom: 'Réseaux sociaux', img: 'ramen' },
    { nom: 'Shootings', img: 'cuisine' },
    { nom: 'Stratégie', img: 'salle' },
  ];
  const Z0 = -5, PAS = -5, ZF = -34;
  const panneaux = services.map((s, i) => {
    const g = new THREE.Group();
    const geo = new THREE.PlaneGeometry(1, 1);
    const nettes = [], floues = [];
    const texNette = charger(`/vitrine/${s.img}.webp`, () => recadrer()), texFloue = charger(`/vitrine/${s.img}-flou.webp`, () => recadrer());
    const floueM = new THREE.MeshBasicMaterial({ map: texFloue, toneMapped: false, color: new THREE.Color(0.5, 0.5, 0.5) });
    const netteM = new THREE.MeshBasicMaterial({ map: texNette, toneMapped: false, transparent: true, opacity: 0 });
    const floue = new THREE.Mesh(geo, floueM), nette = new THREE.Mesh(geo, netteM);
    nette.position.z = 0.004;
    const verreM = new THREE.MeshBasicMaterial({ map: reflet, transparent: true, depthWrite: false, opacity: 0.4, blending: THREE.AdditiveBlending, toneMapped: false });
    const verre = new THREE.Mesh(geo, verreM);
    verre.position.z = 0.008;
    const bordM = new THREE.LineBasicMaterial({ color: '#FFD23F', transparent: true, opacity: 0.2, toneMapped: false });
    const bord = new THREE.LineSegments(new THREE.EdgesGeometry(geo), bordM);
    bord.position.z = 0.01;
    const lueur = sprite(g, haloJaune, 0, 0, -0.05, 1, 0);
    g.add(floue, nette, verre, bord);
    let largeur = 2.4, hauteur = 1.6;
    // la photo garde ses proportions : on la recadre au centre, pour la version nette et la version floue
    const recadrer = () => {
      [texNette, texFloue].forEach((tex) => {
        if (!tex.image || !tex.image.width) return;
        const r = tex.image.width / tex.image.height, cible = largeur / hauteur;
        if (r > cible) { tex.repeat.set(cible / r, 1); tex.offset.set((1 - cible / r) / 2, 0); }
        else { tex.repeat.set(1, r / cible); tex.offset.set(0, (1 - r / cible) / 2); }
      });
    };
    const dimensionner = (w, h) => {
      largeur = w; hauteur = h;
      [floue, nette, verre].forEach((m) => m.scale.set(w, h, 1));
      bord.scale.set(w, h, 1);
      lueur.scale.set(w * 1.9, h * 2.2, 1);
      recadrer();
    };
    scene.add(g);
    return { ...s, i, g, netteM, floueM, bordM, lueur, dimensionner, chemin: new THREE.Vector3(), fin: new THREE.Vector3(), ry: 0 };
  });
  // le soleil jaune qui se lève derrière la salle de lumière
  const soleil = sprite(scene, haloJaune, 0, 2.2, ZF - 7, 0.001, 0.75);

  /* ---------- le trajet de la caméra : une courbe lissée, des arrêts nets ---------- */
  // Chaque clé : quand la caméra y arrive (de), quand elle en repart (a), où elle est (p), où elle regarde (v).
  // Entre deux clés, la caméra glisse sur une courbe qui passe par toutes les clés (Catmull-Rom).
  const arrets = [[0.34, 0.4], [0.46, 0.52], [0.58, 0.64], [0.7, 0.76], [0.82, 0.88]];
  function etapes(haut) {
    const cles = [];
    if (haut) {
      cles.push([0, 0.14, [0, 1.32, 3.5], [0, 0.98, 0]]);
      cles.push([0.27, 0.27, [0, 1.3, -0.4], [0, 1.6, -5]]);
    } else {
      cles.push([0, 0.14, [0.25, 1.36, 3.0], [0, 1.0, 0]]);
      cles.push([0.27, 0.27, [0.1, 1.3, -0.4], [0, 1.6, -5]]);
    }
    panneaux.forEach((p, i) => {
      const z = Z0 + i * PAS;
      const x = haut ? 0 : (i % 2 ? -0.9 : 0.9);
      p.chemin.set(x, 1.7, z);
      p.ry = haut ? 0 : (i % 2 ? 0.22 : -0.22);
      cles.push([arrets[i][0], arrets[i][1], haut ? [0, 1.7, z + 3.4] : [-x * 0.25, 1.7, z + 3.3], haut ? [0, 1.28, z] : [x * 0.55, 1.7, z]]);
    });
    cles.push([0.95, 1, [0, haut ? 1.9 : 1.85, ZF + 7], [0, haut ? 1.9 : 1.85, ZF]]);
    // la salle de lumière : les panneaux s'alignent face à la caméra
    const grille = haut
      ? [[-0.85, 3.95], [0.85, 3.95], [-0.85, 1.9], [0.85, 1.9], [0, -0.15]]
      : [[-2.7, 2.75], [0, 2.75], [2.7, 2.75], [-1.35, 0.95], [1.35, 0.95]];
    panneaux.forEach((p, i) => { p.fin.set(grille[i][0], grille[i][1], ZF); p.dimensionner(haut ? 1.5 : 2.4, haut ? 1.9 : 1.6); });
    const liste = cles.map(([de, a, p, v]) => ({ de, a, p: new THREE.Vector3(...p), v: new THREE.Vector3(...v) }));
    return {
      cles: liste,
      chemin: new THREE.CatmullRomCurve3(liste.map((c) => c.p), false, 'centripetal'),
      regard: new THREE.CatmullRomCurve3(liste.map((c) => c.v), false, 'centripetal'),
    };
  }
  let trajet;
  const tangente = new THREE.Vector3(), avant = new THREE.Vector3();
  let roulis = 0;
  function placer(c, pos, cible) {
    const { cles, chemin, regard } = trajet;
    let i = 0;
    while (i < cles.length - 2 && c > cles[i + 1].de) i++;
    const a = cles[i], b = cles[i + 1];
    const g = borne((c - a.a) / Math.max(b.de - a.a, 1e-4)), f = doux(g);
    const u = (i + f) / (cles.length - 1);
    chemin.getPoint(u, pos);
    regard.getPoint(u, cible);
    chemin.getTangent(u, tangente);
    // en chemin, on regarde devant soi ; en arrivant, on se tourne vers le panneau
    const devantSoi = doux(borne(g / 0.3)) * (1 - doux(borne((g - 0.35) / 0.65)));
    avant.set(pos.x + tangente.x * 1.4, pos.y + tangente.y * 0.6, pos.z + tangente.z * 4);
    cible.lerp(avant, devantSoi);
    roulis = -tangente.x * Math.sin(f * Math.PI) * 0.035;
  }

  // qualité adaptative : si l'appareil peine à tenir la cadence, on baisse la finesse du rendu par paliers, sans jamais remonter
  const paliers = [2, 1.5, 1.25, 1];
  let palier = 0, lenteur = 0;
  const finesse = () => Math.min(devicePixelRatio || 1, paliers[palier]);
  function adapter(dt) {
    if (dt > 0.25) return;
    lenteur = dt > 0.028 ? lenteur + dt : Math.max(0, lenteur - dt * 0.5);
    if (lenteur < 1.2) return;
    lenteur = 0;
    if (palier < paliers.length - 1 && finesse() > paliers[palier + 1]) { palier++; rendu.setPixelRatio(finesse()); }
  }
  let haut = false;
  // la section prend sa hauteur de scène avant la première mesure : la toile a alors la taille de l'écran
  section.classList.add('vivante');
  function regler() {
    const w = toile.clientWidth || innerWidth, h = toile.clientHeight || innerHeight;
    rendu.setPixelRatio(finesse());
    rendu.setSize(w, h, false);
    camera.aspect = w / h;
    haut = w / h < 1;
    camera.fov = haut ? 58 : 40;
    camera.updateProjectionMatrix();
    trajet = etapes(haut);
    const [ax, az, ar] = haut ? [0, 0, 0.1] : [-0.05, 0, 0.26];
    chevalet.position.set(ax, 0, az);
    chevalet.rotation.y = ar;
    spot.position.set(ax + 0.9, 3.2, az + 1.6);
    spot.target.position.set(ax, 1, az);
    lueurSol.position.set(ax, 0.25, az + 0.5);
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

  let courant = 0;
  preparerCraie();
  document.fonts.load('600 150px Caveat').then(() => { preparerCraie(); ecrit = ''; });

  // pour les captures d'aperçu : section.aller(0.5) fige la scène à mi-parcours
  let force = null;
  section.aller = (p) => { force = p; };
  section.etat = () => ({ haut, cam: camera.position.toArray().map((n) => +n.toFixed(2)), pan: panneaux.map((p) => p.g.position.toArray().map((n) => +n.toFixed(2))) });
  const lissage = document.documentElement.classList.contains('lenis') ? 0.3 : 0.12;
  const jalons = section.querySelectorAll('.vitrine__trajet li');
  const bornesTrajet = [0, 0.31, 0.43, 0.55, 0.67, 0.79, 0.93];
  let etape = -1;
  const v = new THREE.Vector3(), tmp = new THREE.Vector3();
  const horloge = new THREE.Clock();
  function image() {
    requestAnimationFrame(image);
    const r = section.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const dt = horloge.getDelta(), t = horloge.elapsedTime;
    if (force == null) adapter(dt);
    const vise = force ?? borne(-r.top / (r.height - innerHeight));
    courant = force ?? courant + (vise - courant) * lissage;
    sx += (mx - sx) * 0.05;
    sy += (my - sy) * 0.05;

    // 1. la craie écrit, caméra immobile ; 2. la craie s'envole ; 3. l'ardoise et la lampe s'effacent, on plonge
    const envol = borne((courant - 0.14) / 0.11);
    const ouvre = doux(borne((courant - 0.19) / 0.08));
    ecrire(borne((courant - 0.01) / 0.12), 1 - doux(envol));
    grains.visible = envol > 0 && envol < 1;
    if (grains.visible) envoler(envol, t);
    boisClair.opacity = ardoiseM.opacity = ombreM.opacity = solM.opacity = 1 - ouvre;
    chevalet.visible = sol.visible = ouvre < 1;
    spot.intensity = 16 * (1 - ouvre) + Math.sin(t * 2.3) * 0.3;
    lueurSol.material.opacity = 0.35 * (1 - ouvre);

    placer(courant, camera.position, v);
    camera.position.x += sx * 0.18;
    camera.position.y -= sy * 0.08;
    camera.lookAt(v);
    camera.rotateZ(roulis);

    // la nuit vit : les étoiles dérivent, la brume respire
    etoiles.rotation.y = Math.sin(t * 0.05) * 0.03;
    etoiles.position.y = Math.sin(t * 0.25) * 0.08;
    brumes.forEach((b) => { b.position.y += Math.sin(t * 0.3 + b.userData.phase) * 0.0015; b.material.opacity = 0.14 + Math.sin(t * 0.4 + b.userData.phase * 2) * 0.03; });

    // les panneaux : flottent, s'allument quand on arrive devant, puis s'alignent en salle de lumière
    const fin = doux(borne((courant - 0.89) / 0.07));
    panneaux.forEach((p, i) => {
      const [de, a] = arrets[i];
      const centre = (de + a) / 2;
      const allume = Math.max(doux(borne(1 - Math.abs(courant - centre) / 0.075)), fin);
      // en repartant, le panneau s'écarte du chemin (sur le côté à l'ordinateur, vers le haut sur téléphone) pour laisser passer la caméra
      const suivant = i < arrets.length - 1 ? arrets[i + 1][0] : 0.95;
      const sortie = doux(borne((courant - a) / (suivant - a)));
      const cote = Math.sign(p.chemin.x) || 1;
      tmp.copy(p.chemin);
      if (haut) { tmp.y += 2.6 * sortie; tmp.z += 0.6 * sortie; } else { tmp.x += cote * 1.9 * sortie; tmp.y += 0.5 * sortie; }
      p.g.position.lerpVectors(tmp, p.fin, fin);
      p.g.position.y += Math.sin(t * 0.7 + i * 1.3) * 0.06 * (1 - fin);
      p.g.rotation.y = (p.ry + sx * 0.12 + (haut ? 0 : cote * 0.6 * sortie)) * (1 - fin);
      p.g.rotation.z = Math.sin(t * 0.5 + i) * 0.02 * (1 - fin);
      p.netteM.opacity = allume;
      const gris = 0.45 + 0.4 * allume;
      p.floueM.color.setRGB(gris, gris * 0.98, gris * 0.95);
      p.bordM.opacity = 0.2 + 0.8 * allume;
      p.lueur.material.opacity = 0.55 * allume + 0.25 * fin;
      p.g.visible = courant > 0.2;
    });
    soleil.scale.setScalar(0.001 + 22 * fin);
    soleil.material.opacity = 0.75 * fin;
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
    section.style.setProperty('--fin', borne((courant - 0.2) / 0.05) * (1 - borne((courant - 0.27) / 0.05)));
  }
  image();
}
