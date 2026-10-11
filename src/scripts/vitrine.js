// L'ardoise cosmique, scénario « la mise en place » : une ardoise seule dans la nuit, la craie écrit
// (caméra immobile), puis la craie s'envole en poussière, l'ardoise s'ouvre et on plonge dans une nuit
// couleur ardoise où cinq panneaux de verre flottent, un par service. Chacun s'allume quand on arrive
// devant, puis file devant jusqu'au passe, au bout du chemin : la mise en place se garnit panneau après
// panneau. Quand le mur est complet, « Envoyez. », et le passe s'ouvre comme une fente sur la salle,
// qui s'allume. La scène suit la souris à l'ordinateur ; tout est piloté par le défilement, dans les deux sens.
import * as THREE from 'three';
import '@fontsource/caveat/600.css';

const borne = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const doux = (t) => t * t * (3 - 2 * t);

export function vitrine(section) {
  const toile = section.querySelector('canvas');
  const colle = section.querySelector('.vitrine__colle');
  const textes = [...section.querySelectorAll('[data-de]')];
  const portrait = innerWidth < innerHeight;
  // photos en haute définition (3000 px) dès que l'écran les mérite : un ordinateur dense, pas un téléphone
  const hd = !portrait && innerWidth * Math.min(devicePixelRatio || 1, 2) >= 1600;
  const suffixe = hd ? '-hd' : '';
  // au doigt (pas de Lenis), le défilement s'aimante aux étapes de la scène : un panneau à la fois, impossible d'en sauter un.
  // L'aimant (classe « aimante » sur la page) n'est posé que pendant la scène, jamais à ses bords, pour pouvoir en sortir librement.
  const lenis = document.documentElement.classList.contains('lenis');
  // au doigt, la scène prend plus de hauteur : chaque étape a plus d'un écran de défilement pour elle, condition pour qu'aucune ne soit sautée
  document.documentElement.classList.toggle('tactile', !lenis);
  let aimante = false;
  const aimanter = (oui) => { if (oui !== aimante) { aimante = oui; document.documentElement.classList.toggle('aimante', oui); } };

  // sur les écrans très denses (téléphones), l'anticrénelage ne se voit plus et coûte cher : on s'en passe
  const rendu = new THREE.WebGLRenderer({ canvas: toile, antialias: (devicePixelRatio || 1) < 2.5, powerPreference: 'high-performance' });
  rendu.outputColorSpace = THREE.SRGBColorSpace;
  rendu.toneMapping = THREE.ACESFilmicToneMapping;
  rendu.toneMappingExposure = 1.0;

  const scene = new THREE.Scene();
  const nuit = new THREE.Color('#0E181B');
  scene.background = nuit;
  scene.fog = new THREE.Fog(nuit, 8, 34);
  // plan proche à 0.1 : plus de précision de profondeur au loin, là où le mur allumé se voit à 30 unités
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 90);
  let haut = false;

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
  const chargeur = new THREE.TextureLoader();
  // la texture est envoyée au GPU dès son arrivée (pendant l'écriture, caméra immobile) plutôt qu'au premier rendu où elle apparaît
  const charger = (src, apres) => { const t = chargeur.load(src, () => { rendu.initTexture(t); if (apres) apres(t); }); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };

  /* ---------- l'ardoise : le texte s'écrit à la craie au fil du défilement ---------- */
  const lignes = [
    { t: 'Vos clients', y: 0.2 },
    { t: 'mangent', y: 0.36 },
    { t: 'd’abord', y: 0.52 },
    { t: 'avec les yeux.', y: 0.7, jaune: true },
  ];
  // l'ardoise elle-même est une vraie photo de pierre ; la craie vit sur une toile transparente posée devant.
  // Plus fine à l'ordinateur ; au téléphone, 900 px suffisent (3 points par pixel) et chaque pas d'écriture renvoie la toile au GPU.
  const W = portrait ? 900 : 1100, H = Math.round(W * 1.37), K = W / 900;
  // traces d'éponge et grain de craie, sur fond transparent : elles s'effacent avec le reste
  const fond = document.createElement('canvas');
  fond.width = W; fond.height = H;
  {
    const g = fond.getContext('2d');
    g.globalAlpha = 0.055; g.strokeStyle = '#fff'; g.lineCap = 'round';
    for (let i = 0; i < 60; i++) {
      g.lineWidth = (20 + Math.random() * 50) * K;
      g.beginPath();
      const x = Math.random() * W, y = Math.random() * H;
      g.moveTo(x, y); g.quadraticCurveTo(x + 120 * K, y - 40 * K, x + 260 * K * Math.random(), y + 60 * K * Math.random());
      g.stroke();
    }
    g.globalAlpha = 1;
    bruit(g, W, H, 12000 * K * K, 'rgba(255,255,255,.035)', 2 * K);
  }
  const craie = document.createElement('canvas');
  craie.width = W; craie.height = H;
  const ardoiseC = document.createElement('canvas');
  ardoiseC.width = W; ardoiseC.height = H;
  const craieTex = new THREE.CanvasTexture(ardoiseC);
  craieTex.colorSpace = THREE.SRGBColorSpace;
  craieTex.anisotropy = 8;

  function preparerCraie() {
    const g = craie.getContext('2d');
    g.clearRect(0, 0, W, H);
    g.textAlign = 'center'; g.textBaseline = 'middle';
    lignes.forEach((l) => {
      g.font = `600 ${Math.round((l.jaune ? 142 : 150) * K)}px Caveat, "Comic Sans MS", cursive`;
      g.fillStyle = l.jaune ? '#FFD23F' : '#F4F1E8';
      g.shadowColor = l.jaune ? 'rgba(255,210,63,.55)' : 'rgba(255,255,255,.35)';
      g.shadowBlur = 10 * K;
      g.fillText(l.t, W / 2, H * l.y);
    });
    g.strokeStyle = '#FFD23F'; g.lineWidth = 9 * K; g.lineCap = 'round';
    g.beginPath(); g.moveTo(W * 0.16, H * 0.8); g.quadraticCurveTo(W * 0.5, H * 0.83, W * 0.84, H * 0.795); g.stroke();
    g.globalCompositeOperation = 'destination-out';
    bruit(g, W, H, 26000 * K * K, 'rgba(0,0,0,.55)', 2.5 * K);
    g.globalCompositeOperation = 'source-over';
  }
  // chaque ligne part en poussière à son tour, de haut en bas (la ligne jaune soulignée en dernier)
  const depart = (i) => (i / lignes.length) * 0.5;
  let ecrit = '';
  // p : avancement de l'écriture ; e : avancement de l'envol (chaque ligne s'efface quand sa poussière la quitte)
  // 160 pas : assez fin pour que la craie semble couler, assez rare pour épargner le téléphone (chaque pas renvoie la texture au GPU)
  function ecrire(p, e) {
    const q = Math.round(p * 160) / 160, qe = Math.round(e * 48) / 48;
    const cle = q + '/' + qe;
    if (cle === ecrit) return;
    ecrit = cle;
    const g = ardoiseC.getContext('2d');
    g.clearRect(0, 0, W, H);
    g.globalAlpha = 1 - qe;
    g.drawImage(fond, 0, 0);
    const n = lignes.length + 1;
    for (let i = 0; i < n; i++) {
      const av = borne(q * n - i);
      if (av <= 0) break;
      const a = 1 - doux(borne((qe - depart(i)) / 0.4));
      if (a <= 0) continue;
      g.globalAlpha = a;
      const y = i < lignes.length ? H * lignes[i].y : H * 0.8;
      const h = (i < lignes.length ? 200 : 60) * K;
      g.save();
      g.beginPath(); g.rect(0, y - h / 2, W * (0.08 + av * 0.86), h); g.clip();
      g.drawImage(craie, 0, 0);
      g.restore();
    }
    g.globalAlpha = 1;
    craieTex.needsUpdate = true;
  }

  /* ---------- le sol de nuit et le chevalet ---------- */
  // le sol : la même pierre d'ardoise, polie, qui court de l'ardoise jusqu'au passe ; les panneaux s'y reflètent.
  // Il ne s'inscrit pas dans la profondeur (depthWrite) : les reflets, dessinés juste après lui, passent au travers.
  const solTex = charger('/vitrine/sol.webp');
  solTex.wrapS = solTex.wrapT = THREE.MirroredRepeatWrapping;
  solTex.repeat.set(10, 17.5);
  const solM = new THREE.MeshStandardMaterial({ map: solTex, color: '#B8C2C4', roughness: 0.55, metalness: 0.1, emissive: '#93A9AF', emissiveMap: solTex, transparent: true, depthWrite: false });
  // il court de l'ardoise jusque derrière le passe (z de 8 à -62) : son bord lointain reste noyé dans le brouillard
  const sol = new THREE.Mesh(new THREE.PlaneGeometry(40, 70), solM);
  sol.rotation.x = -Math.PI / 2;
  sol.position.z = -27;
  sol.renderOrder = -2;
  scene.add(sol);

  const chevalet = new THREE.Group();
  // vraies matières : noyer pour le chevalet, pierre d'ardoise pour la planche (photos Adobe Stock)
  const bois = charger('/vitrine/bois.webp');
  bois.wrapS = bois.wrapT = THREE.RepeatWrapping;
  const boisClair = new THREE.MeshStandardMaterial({ map: bois, color: '#C9A47A', roughness: 0.62, transparent: true });
  const ardoiseM = new THREE.MeshStandardMaterial({ map: charger('/vitrine/ardoise.webp'), roughness: 0.74, metalness: 0.06, color: '#FFFFFF', transparent: true });
  const planche = new THREE.Mesh(new THREE.BoxGeometry(0.92, 1.26, 0.035), [boisClair, boisClair, boisClair, boisClair, ardoiseM, boisClair]);
  planche.position.y = 0.92;
  chevalet.add(planche);
  // la craie, posée juste devant la pierre
  const craieM = new THREE.MeshBasicMaterial({ map: craieTex, transparent: true, depthWrite: false, toneMapped: false });
  const craieMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.92, 1.26), craieM);
  craieMesh.position.set(0, 0.92, 0.035 / 2 + 0.002);
  chevalet.add(craieMesh);
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
  // l'ombre reste à plat sur le sol (pas inclinée avec le chevalet, sinon la moitié passe sous le plancher) et se dessine après lui
  const ombre = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.2), ombreM);
  ombre.rotation.x = -Math.PI / 2;
  ombre.position.set(0, 0.012, -0.12);
  ombre.renderOrder = 1;
  scene.add(ombre);
  scene.add(chevalet);
  // une lampe chaude penchée sur l'ardoise, et la nuit tout autour
  const spot = new THREE.SpotLight('#FFE2B0', 16, 7, 0.6, 0.6, 1.4);
  scene.add(spot); scene.add(spot.target);
  const lueurSol = sprite(scene, haloJaune, 0, 0.3, 0.6, 3.2, 0.35);
  scene.add(new THREE.HemisphereLight('#3E5A68', '#07090A', 0.5));

  /* ---------- la craie s'envole : les lettres elles-mêmes se défont en poussière dans la lumière de la lampe ---------- */
  // Pas de neige : les grains naissent dans le tracé des lettres (échantillonné sur la toile de craie), ligne après ligne,
  // de tailles très inégales (beaucoup de poudre fine, quelques gros grains), et dérivent lentement vers la caméra.
  const Np = portrait ? 1100 : 1600;
  const pPos = new Float32Array(Np * 3), pBase = new Float32Array(Np * 2), pElan = new Float32Array(Np * 3), pAttr = new Float32Array(Np * 3), pDepart = new Float32Array(Np);
  function echantillonner() {
    const d = craie.getContext('2d').getImageData(0, 0, W, H).data, pas = Math.max(3, Math.round(4 * K)), pts = [];
    for (let y = 0; y < H; y += pas) for (let x = 0; x < W; x += pas) if (d[(y * W + x) * 4 + 3] > 90) pts.push(x, y);
    if (pts.length < 2) return;
    for (let i = 0; i < Np; i++) {
      const k = (Math.random() * (pts.length / 2)) | 0, x = pts[k * 2], y = pts[k * 2 + 1];
      pBase[i * 2] = (x / W - 0.5) * 0.92; pBase[i * 2 + 1] = (0.5 - y / H) * 1.26;
      let li = lignes.length, dm = Math.abs(y - H * 0.8);
      lignes.forEach((l, j) => { const dd = Math.abs(y - H * l.y); if (dd < dm) { dm = dd; li = j; } });
      pDepart[i] = depart(li) + Math.random() * 0.12;
      // dérive lente : un peu de côté, à peine vers le haut, surtout vers la caméra (qui vient à sa rencontre)
      pElan[i * 3] = (Math.random() - 0.5) * 0.7; pElan[i * 3 + 1] = 0.08 + Math.random() * 0.45; pElan[i * 3 + 2] = 0.3 + Math.random() * 1.7;
      const r = Math.random();
      pAttr[i * 3] = 0.007 + r * r * r * 0.03;
      pAttr[i * 3 + 1] = 0.22 + 0.5 * Math.random();
      pAttr[i * 3 + 2] = 0;
    }
    pGeo.attributes.position.needsUpdate = true; pGeo.attributes.attr.needsUpdate = true;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('attr', new THREE.BufferAttribute(pAttr, 3));
  const pointTex = toileTex(64, 64, (g) => { const d = g.createRadialGradient(32, 32, 0, 32, 32, 32); d.addColorStop(0, 'rgba(255,245,225,1)'); d.addColorStop(0.35, 'rgba(255,245,225,.55)'); d.addColorStop(1, 'rgba(255,245,225,0)'); g.fillStyle = d; g.fillRect(0, 0, 64, 64); });
  // un grain = un point de taille propre (attr.x) et d'intensité propre (attr.z), teinte chaude de la lampe
  const poussiereM = new THREE.ShaderMaterial({
    uniforms: { carte: { value: pointTex }, echelle: { value: 400 } },
    vertexShader: 'attribute vec3 attr; uniform float echelle; varying float va; void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); va = attr.z; gl_PointSize = attr.x * echelle / -mv.z; gl_Position = projectionMatrix * mv; }',
    fragmentShader: 'uniform sampler2D carte; varying float va; void main() { vec4 c = texture2D(carte, gl_PointCoord); gl_FragColor = vec4(1.0, 0.92, 0.78, 1.0) * c * va; }',
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const poussiere = new THREE.Points(pGeo, poussiereM);
  poussiere.position.set(0, 0.92, 0.04);
  poussiere.visible = false;
  poussiere.frustumCulled = false;
  chevalet.add(poussiere);
  function envoler(e, t) {
    for (let i = 0; i < Np; i++) {
      const u = borne((e - pDepart[i]) / 0.38), w = doux(u), s = i * 0.37;
      pPos[i * 3] = pBase[i * 2] + pElan[i * 3] * w + Math.sin(t * 0.9 + s) * 0.06 * w;
      pPos[i * 3 + 1] = pBase[i * 2 + 1] + pElan[i * 3 + 1] * w * w + Math.cos(t * 0.7 + s) * 0.04 * w;
      pPos[i * 3 + 2] = pElan[i * 3 + 2] * w;
      pAttr[i * 3 + 2] = Math.sin(u * Math.PI) * pAttr[i * 3 + 1];
    }
    pGeo.attributes.position.needsUpdate = true; pGeo.attributes.attr.needsUpdate = true;
  }

  /* ---------- la nuit d'ardoise : poussière de craie en étoiles, brume bleue ---------- */
  // peu d'étoiles, fines et discrètes, et seulement une fois l'ardoise passée : pas de neige sur la scène d'ouverture
  const Ne = 700;
  const ePos = new Float32Array(Ne * 3);
  // toutes au-dessus du sol : il ne s'inscrit pas dans la profondeur, une étoile dessous se verrait au travers
  for (let i = 0; i < Ne; i++) { ePos[i * 3] = (Math.random() - 0.5) * 26; ePos[i * 3 + 1] = 0.4 + Math.random() * 9.6; ePos[i * 3 + 2] = -3 - Math.random() * 37; }
  const eGeo = new THREE.BufferGeometry();
  eGeo.setAttribute('position', new THREE.BufferAttribute(ePos, 3));
  const etoilesM = new THREE.PointsMaterial({ size: 0.035, map: pointTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0, sizeAttenuation: true });
  const etoiles = new THREE.Points(eGeo, etoilesM);
  scene.add(etoiles);
  // tout au fond, l'horizon de la nuit : un dégradé qui s'éclaircit à hauteur d'yeux (bleu d'ardoise), noir au sol
  const horizonTex = toileTex(4, 256, (g, w, h) => {
    const d = g.createLinearGradient(0, 0, 0, h);
    d.addColorStop(0, '#07100F'); d.addColorStop(0.42, '#102528'); d.addColorStop(0.56, '#1A4149'); d.addColorStop(0.62, '#153238'); d.addColorStop(0.72, '#0A1416'); d.addColorStop(1, '#050808');
    g.fillStyle = d; g.fillRect(0, 0, w, h);
  });
  const horizon = new THREE.Mesh(new THREE.PlaneGeometry(220, 110), new THREE.MeshBasicMaterial({ map: horizonTex, fog: false, depthWrite: false }));
  horizon.position.set(0, 1.6, -75);
  horizon.renderOrder = -3;
  scene.add(horizon);
  // des nuées de couleur, pas des disques : trois halos décalés dans la même toile, en bleu d'ardoise puis en ambre près du passe
  const nuee = (teinte) => toileTex(256, 256, (g) => {
    [[128, 128, 120, 0.55], [78, 150, 80, 0.4], [176, 96, 70, 0.35]].forEach(([x, y, r, a]) => {
      const d = g.createRadialGradient(x, y, 0, x, y, r); d.addColorStop(0, teinte(a)); d.addColorStop(0.5, teinte(a * 0.35)); d.addColorStop(1, teinte(0));
      g.fillStyle = d; g.fillRect(0, 0, 256, 256);
    });
  });
  const nueeBleue = nuee((a) => `rgba(60,135,155,${a})`), nueeAmbre = nuee((a) => `rgba(205,130,60,${a})`);
  // moins de brumes sur téléphone, et plus petites : chacune coûte un disque additif qui peut couvrir l'écran
  const brumes = [];
  const nbBrumes = portrait ? 6 : 10;
  for (let i = 0; i < nbBrumes; i++) {
    const z = -2 - i * (portrait ? 6.2 : 3.7);
    const ambre = z < -24;
    const sp = sprite(scene, ambre ? nueeAmbre : nueeBleue, (i % 2 ? 1 : -1) * (2.5 + Math.random() * 3), 1 + Math.random() * 3.5, z, portrait ? 9 + Math.random() * 5 : 12 + Math.random() * 7, 0.2);
    sp.material.rotation = Math.random() * Math.PI * 2;
    sp.userData = { z, phase: i, force: ambre ? 0.22 : 0.16 };
    brumes.push(sp);
  }

  /* ---------- cinq panneaux de verre, un par service ---------- */
  const reflet = toileTex(512, 512, (g, w, h) => {
    const d = g.createLinearGradient(0, 0, w, h);
    d.addColorStop(0, 'rgba(255,255,255,.05)'); d.addColorStop(0.38, 'rgba(255,255,255,.02)');
    d.addColorStop(0.47, 'rgba(255,255,255,.26)'); d.addColorStop(0.55, 'rgba(255,255,255,.04)');
    d.addColorStop(0.72, 'rgba(255,255,255,.12)'); d.addColorStop(1, 'rgba(255,255,255,.03)');
    g.fillStyle = d; g.fillRect(0, 0, w, h);
  });
  // le reflet d'un panneau dans la pierre : la même photo, retournée, qui s'estompe en s'éloignant du sol (alphaMap)
  const degrade = toileTex(4, 128, (g, w, h) => { const d = g.createLinearGradient(0, 0, 0, h); d.addColorStop(0, '#000'); d.addColorStop(0.5, '#000'); d.addColorStop(1, '#fff'); g.fillStyle = d; g.fillRect(0, 0, w, h); });
  // un faisceau de lumière tombé du plafond sur chaque panneau : large et doux, net en haut, fondu en bas
  const faisceauTex = toileTex(128, 512, (g, w, h) => {
    const d = g.createLinearGradient(0, 0, 0, h); d.addColorStop(0, 'rgba(255,236,200,.9)'); d.addColorStop(0.55, 'rgba(255,236,200,.35)'); d.addColorStop(1, 'rgba(255,236,200,0)');
    g.fillStyle = d; g.fillRect(0, 0, w, h);
    const m = g.createLinearGradient(0, 0, w, 0); m.addColorStop(0, 'rgba(0,0,0,1)'); m.addColorStop(0.5, 'rgba(0,0,0,0)'); m.addColorStop(1, 'rgba(0,0,0,1)');
    g.globalCompositeOperation = 'destination-out'; g.fillStyle = m; g.fillRect(0, 0, w, h);
  });
  const services = [
    { nom: 'Site web', img: 'ragu' },
    { nom: 'Design', img: 'tarte' },
    { nom: 'Réseaux sociaux', img: 'ramen' },
    { nom: 'Shootings', img: 'cuisine' },
    { nom: 'Faire venir, faire revenir', img: 'lampes' },
  ];
  const Z0 = -5, PAS = -5, ZF = -34;
  const panneaux = services.map((s, i) => {
    const g = new THREE.Group();
    const geo = new THREE.PlaneGeometry(1, 1);
    const texNette = charger(`/vitrine/${s.img}${suffixe}.webp`, () => recadrer()), texFloue = charger(`/vitrine/${s.img}-flou.webp`, () => recadrer());
    const floueM = new THREE.MeshBasicMaterial({ map: texFloue, toneMapped: false, transparent: true, color: new THREE.Color(0.5, 0.5, 0.5) });
    // la version nette ignore le brouillard : une fois posé sur le passe, le panneau allumé se voit de loin
    const netteM = new THREE.MeshBasicMaterial({ map: texNette, toneMapped: false, transparent: true, opacity: 0, fog: false, depthWrite: false });
    const floue = new THREE.Mesh(geo, floueM), nette = new THREE.Mesh(geo, netteM);
    nette.position.z = 0.004; nette.renderOrder = 1;
    const verreM = new THREE.MeshBasicMaterial({ map: reflet, transparent: true, depthWrite: false, opacity: 0.4, blending: THREE.AdditiveBlending, toneMapped: false });
    const verre = new THREE.Mesh(geo, verreM);
    verre.position.z = 0.008; verre.renderOrder = 2;
    const bordM = new THREE.LineBasicMaterial({ color: '#FFD23F', transparent: true, opacity: 0.2, toneMapped: false });
    const bord = new THREE.LineSegments(new THREE.EdgesGeometry(geo), bordM);
    bord.position.z = 0.01; bord.renderOrder = 3;
    const lueur = sprite(g, haloJaune, 0, 0, -0.05, 1, 0);
    g.add(floue, nette, verre, bord);
    // son reflet dans la pierre : un double retourné sous le sol, dessiné juste après lui, qui s'estompe vers le bas
    const refl = new THREE.Group();
    const floueRM = new THREE.MeshBasicMaterial({ map: texFloue, alphaMap: degrade, toneMapped: false, transparent: true, depthWrite: false, opacity: 0, color: new THREE.Color(0.5, 0.5, 0.5) });
    const netteRM = new THREE.MeshBasicMaterial({ map: texNette, alphaMap: degrade, toneMapped: false, transparent: true, depthWrite: false, opacity: 0, fog: false });
    const floueR = new THREE.Mesh(geo, floueRM), netteR = new THREE.Mesh(geo, netteRM);
    netteR.position.z = 0.004;
    floueR.renderOrder = netteR.renderOrder = -1;
    refl.add(floueR, netteR);
    scene.add(refl);
    // la flaque de lumière au sol et le faisceau tombé du plafond, à l'arrêt du panneau
    const flaque = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: haloJaune, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, opacity: 0, fog: false }));
    flaque.rotation.x = -Math.PI / 2;
    flaque.renderOrder = -1;
    scene.add(flaque);
    const faisceau = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: faisceauTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, opacity: 0, fog: false, side: THREE.DoubleSide }));
    scene.add(faisceau);
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
      [floue, nette, verre, floueR, netteR].forEach((m) => m.scale.set(w, h, 1));
      bord.scale.set(w, h, 1);
      lueur.scale.set(w * 1.9, h * 2.2, 1);
      flaque.scale.set(w * 1.5, w * 1.1, 1);
      faisceau.scale.set(w * 1.35, 3.4, 1);
      recadrer();
    };
    scene.add(g);
    return { ...s, i, g, netteM, floueM, verreM, bordM, lueur, refl, floueRM, netteRM, flaque, faisceau, dimensionner, chemin: new THREE.Vector3(), fin: new THREE.Vector3(), ecart: new THREE.Vector3(), ry: 0, cote: 1, arcX: 1.6, arcY: 2.2 };
  });

  /* ---------- le passe, au bout du chemin : un comptoir de lumière, trois lampes chauffantes, et la salle derrière ---------- */
  const passe = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: '#FFE4A0', toneMapped: false, fog: false, transparent: true, opacity: 0 }));
  scene.add(passe);
  const passeLueur = sprite(scene, haloJaune, 0, 0, ZF + 0.3, 1, 0);
  const lampes = [0, 1, 2].map(() => sprite(scene, haloJaune, 0, 0, ZF + 0.2, 1, 0));
  // la nappe de lumière chaude qui s'échappe par la fente quand le passe s'ouvre
  const nappe = sprite(scene, haloJaune, 0, 0, ZF + 0.4, 0.001, 0);
  // la vraie salle, derrière : sombre d'abord, puis elle s'allume. Photo chargée selon l'orientation, à l'approche de la fin.
  const salleM = new THREE.MeshBasicMaterial({ toneMapped: false, fog: false, transparent: true, opacity: 0, color: new THREE.Color(0.1, 0.085, 0.075) });
  const salle = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), salleM);
  salle.visible = false;
  salle.userData.base = [10, 6, 1.85];
  scene.add(salle);
  let salleSrc = '';
  // la photo couvre tout le champ vu depuis la caméra avancée (ZF + 5.4) jusqu'au plan (ZF − 1.5), avec 20 % de marge pour la parallaxe
  function couvrir() {
    const oeil = haut ? 1.9 : 1.85;
    const hv = 2 * 6.9 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 1.2, wv = hv * camera.aspect;
    salle.userData.base = [wv, hv, oeil];
    salle.position.set(0, oeil, ZF - 1.5);
    const tex = salleM.map;
    if (!tex || !tex.image || !tex.image.width) return;
    const r = tex.image.width / tex.image.height, cible = wv / hv;
    if (r > cible) { tex.repeat.set(cible / r, 1); tex.offset.set((1 - cible / r) / 2, 0); }
    else { tex.repeat.set(1, r / cible); tex.offset.set(0, (1 - r / cible) / 2); }
  }
  function chargerSalle() {
    const src = haut ? '/vitrine/salle-tel.webp' : (hd ? '/vitrine/salle-hd.webp' : '/vitrine/salle.webp');
    if (src === salleSrc) return;
    salleSrc = src;
    charger(src, (tex) => { if (salleSrc !== src) return; salleM.map = tex; salleM.needsUpdate = true; couvrir(); });
  }

  /* ---------- le trajet de la caméra : une courbe lissée, des arrêts nets ---------- */
  // Chaque clé : quand la caméra y arrive (de), quand elle en repart (a), où elle est (p), où elle regarde (v).
  // Entre deux clés, la caméra glisse sur une courbe qui passe par toutes les clés (Catmull-Rom).
  const arrets = [[0.33, 0.39], [0.445, 0.505], [0.56, 0.62], [0.675, 0.735], [0.79, 0.85]];
  const VOL = 0.06; // durée (en défilement) du vol d'un panneau jusqu'au passe : le dernier se pose à 0.91, où la caméra se pose aussi
  const OUVERTURE = 0.945; // le passe s'ouvre, après une pause mur complet (0.9-0.945) et « Envoyez. »
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
      p.flaque.position.set(x, 0.02, z - 0.1);
      // le faisceau descend du plafond, un peu en arrière du panneau, légèrement penché
      p.faisceau.position.set(x + (i % 2 ? -0.25 : 0.25), 2.3, z - 0.7);
      p.faisceau.rotation.z = i % 2 ? 0.1 : -0.1;
      cles.push([arrets[i][0], arrets[i][1], haut ? [0, 1.7, z + 3.4] : [-x * 0.25, 1.7, z + 3.3], haut ? [0, 1.28, z] : [x * 0.55, 1.7, z]]);
    });
    const oeil = haut ? 1.9 : 1.85;
    cles.push([0.91, 1, [0, oeil, ZF + 7], [0, oeil, ZF]]);
    // le passe : la place de chaque panneau sur le mur final, et comment il s'écarte quand la fente s'ouvre
    // (rangée du haut vers le haut, rangée du bas vers le bas, rangée du milieu sur les côtés au téléphone)
    const grille = haut
      ? [[0, 3.9], [-0.85, 1.85], [0.85, 1.85], [-0.85, -0.2], [0.85, -0.2]]
      : [[-2.7, 2.75], [0, 2.75], [2.7, 2.75], [-1.35, 0.95], [1.35, 0.95]];
    const ecarts = haut
      ? [[0, 3.3], [-3, 0], [3, 0], [0, -3.3], [0, -3.3]]
      : [[0, 3.3], [0, 3.3], [0, 3.3], [0, -3.3], [0, -3.3]];
    panneaux.forEach((p, i) => {
      p.fin.set(grille[i][0], grille[i][1], ZF);
      p.ecart.set(ecarts[i][0], ecarts[i][1], 0);
      // en vol, le panneau monte vite (par l'extérieur à l'ordinateur) pour passer au-dessus du suivant, puis redescend à sa place
      p.cote = Math.sign(p.chemin.x) || 1;
      p.arcX = 1.6;
      p.arcY = haut ? 3.0 : 2.2;
      p.dimensionner(haut ? 1.5 : 2.4, haut ? 1.9 : 1.6);
    });
    passe.position.set(0, haut ? -1.3 : 0.02, ZF + 0.25);
    passe.scale.set(haut ? 2.9 : 9.4, haut ? 0.04 : 0.05, 0.5);
    passeLueur.position.set(0, haut ? -1.45 : -0.12, ZF + 0.3);
    passeLueur.scale.set(haut ? 4 : 12, haut ? 1.1 : 1.6, 1);
    lampes.forEach((l, k) => { l.position.set((k - 1) * (haut ? 0.95 : 2.7), haut ? 5.2 : 3.95, ZF + 0.2); l.scale.set(haut ? 1.7 : 2.8, haut ? 1.3 : 2.0, 1); });
    nappe.position.set(0, oeil, ZF + 0.4);
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
    roulis = -tangente.x * Math.sin(f * Math.PI) * 0.02;
  }

  // qualité adaptative : si l'appareil peine à tenir la cadence, on baisse la finesse du rendu par paliers, sans jamais remonter.
  // Un téléphone très dense part déjà à 1,5 : à 3 pixels par point, personne ne voit la différence, et ça divise le travail par 4.
  const paliers = ((devicePixelRatio || 1) >= 3 && portrait) ? [1.5, 1.25, 1] : [2, 1.5, 1.25, 1];
  let palier = 0, lenteur = 0;
  const finesse = () => Math.min(devicePixelRatio || 1, paliers[palier]);
  function adapter(dt) {
    if (dt > 0.25) return;
    lenteur = dt > 0.028 ? lenteur + dt : Math.max(0, lenteur - dt * 0.5);
    if (lenteur < 1.2) return;
    lenteur = 0;
    if (palier < paliers.length - 1 && finesse() > paliers[palier + 1]) { palier++; rendu.setPixelRatio(finesse()); }
  }
  let courant = null;
  // la section prend sa hauteur de scène avant la première mesure : la toile a alors la taille de l'écran
  section.classList.add('vivante');
  function regler() {
    const w = toile.clientWidth || innerWidth, h = toile.clientHeight || innerHeight;
    rendu.setPixelRatio(finesse());
    rendu.setSize(w, h, false);
    poussiereM.uniforms.echelle.value = h * finesse() * 0.5;
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
    couvrir();
    if (courant !== null && courant > 0.3) chargerSalle();
  }
  regler();
  addEventListener('resize', regler);

  /* ---------- souris : la scène respire avec le visiteur (pas au doigt : un balayage n'est pas une intention) ---------- */
  let mx = 0, my = 0, sx = 0, sy = 0;
  addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5;
  }, { passive: true });

  preparerCraie(); echantillonner();
  document.fonts.load('600 150px Caveat').then(() => { preparerCraie(); echantillonner(); ecrit = ''; });

  // pour les captures d'aperçu : section.aller(0.5, 2) fige la scène à mi-parcours, à la deuxième seconde
  let force = null, tForce = null;
  section.aller = (p, tf) => { force = p; if (tf != null) tForce = tf; };
  section.etat = () => ({ haut, cam: camera.position.toArray().map((n) => +n.toFixed(2)), pan: panneaux.map((p) => p.g.position.toArray().map((n) => +n.toFixed(2))) });
  // lissage du défilement en constante de temps (secondes) : même sensation à 60 et à 120 images par seconde.
  // Au doigt, le défilement saute d'une étape à l'autre : la scène glisse plus longuement pour y arriver, sans à-coup.
  const tau = lenis ? 0.05 : 0.16;
  const jalons = section.querySelectorAll('.vitrine__trajet li');
  const bornesTrajet = [0, 0.3, 0.42, 0.535, 0.65, 0.765, 0.945];
  let etape = -1;
  const v = new THREE.Vector3(), tmp = new THREE.Vector3();
  const t0 = performance.now() / 1000;
  let derniere = t0;
  function image() {
    requestAnimationFrame(image);
    const r = section.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) { aimanter(false); return; }
    const maintenant = performance.now() / 1000, dt = maintenant - derniere, t = tForce ?? maintenant - t0;
    derniere = maintenant;
    if (force == null) adapter(dt);
    // la progression se mesure sur l'élément collant lui-même : insensible à la barre de Safari qui se replie
    const c = colle.getBoundingClientRect();
    const vise = force ?? borne((c.top - r.top) / Math.max(r.height - c.height, 1));
    aimanter(!lenis && force == null && vise > 0.005 && vise < 0.992);
    // au premier passage, on se cale directement : pas d'avance rapide à l'arrivée ni au retour arrière du navigateur
    courant = force ?? (courant === null ? vise : courant + (vise - courant) * (1 - Math.exp(-dt / tau)));
    sx += (mx - sx) * 0.05;
    sy += (my - sy) * 0.05;

    // 1. la craie écrit, caméra immobile ; 2. la craie s'envole ; 3. l'ardoise et la lampe s'effacent, on plonge
    const envol = borne((courant - 0.14) / 0.11);
    const ouvre = doux(borne((courant - 0.19) / 0.08));
    ecrire(borne((courant - 0.01) / 0.12), envol);
    poussiere.visible = envol > 0 && envol < 1;
    if (poussiere.visible) envoler(envol, t);
    boisClair.opacity = ardoiseM.opacity = craieM.opacity = ombreM.opacity = 1 - ouvre;
    chevalet.visible = ombre.visible = ouvre < 1;
    spot.intensity = 16 * (1 - ouvre) + Math.sin(t * 2.3) * 0.3;
    lueurSol.material.opacity = 0.35 * (1 - ouvre);

    // 4. le mur est complet (pret), puis le passe s'ouvre (ouv) : les panneaux s'écartent, la salle s'allume (chaud), la caméra avance d'un pas
    const pret = Math.sin(Math.PI * borne((courant - 0.885) / 0.04));
    const ouv = doux(borne((courant - OUVERTURE) / 0.045));
    const chaud = doux(borne((courant - OUVERTURE - 0.015) / 0.04));
    placer(courant, camera.position, v);
    camera.position.z -= 1.6 * ouv;
    camera.position.x += sx * 0.18;
    camera.position.y -= sy * 0.08;
    camera.lookAt(v);
    camera.rotateZ(roulis);

    // la nuit vit : les étoiles dérivent, la brume respire ; les deux s'éteignent quand la salle s'allume,
    // et une brume fond quand la caméra la traverse (sinon un disque bleu couvre l'écran)
    etoiles.rotation.y = Math.sin(t * 0.05) * 0.03;
    etoiles.position.y = Math.sin(t * 0.25) * 0.08;
    etoilesM.opacity = 0.4 * (1 - ouv) * doux(borne((courant - 0.19) / 0.08));
    // le sol de pierre reste sous les pieds jusqu'au passe, puis s'efface quand on entre dans la salle ;
    // au téléphone, le mur descend sous le niveau du sol : celui-ci s'efface dès que le dernier panneau s'envole
    solM.opacity = haut ? 1 - doux(borne((courant - 0.84) / 0.06)) : 1 - ouv;
    sol.visible = solM.opacity > 0;
    brumes.forEach((b) => {
      b.position.y += Math.sin(t * 0.3 + b.userData.phase) * 0.0015;
      b.material.rotation += 0.0004;
      const d = Math.abs(b.userData.z - camera.position.z);
      const o = (b.userData.force + Math.sin(t * 0.4 + b.userData.phase * 2) * 0.03) * doux(borne((d - 1.5) / 3)) * (b.userData.z < -30 ? 1 - ouv : 1);
      b.material.opacity = o;
      b.visible = o > 0.01;
    });

    // les panneaux : naissent en fondu derrière l'ardoise qui s'efface (pas d'un coup), flottent, s'allument quand on arrive devant,
    // puis filent se poser sur le passe (la mise en place se garnit)
    const nait = doux(borne((courant - 0.2) / 0.06));
    panneaux.forEach((p, i) => {
      const [de, a] = arrets[i];
      const centre = (de + a) / 2;
      const s = doux(borne((courant - a) / VOL));
      const monte = doux(borne(s / 0.3)) * (1 - doux(borne((s - 0.65) / 0.35))); // monte vite, redescend en arrivant
      const file = doux(borne((s - 0.1) / 0.9)); // et file devant
      const pose = doux(borne((s - 0.8) / 0.2)); // se pose : c'est là qu'il se rallume
      const allume = Math.max(doux(borne(1 - Math.abs(courant - centre) / 0.075)), pose);
      // le panneau flotte à peine (une lente respiration de quelques centimètres), sans tanguer : il reste lisible et cliquable
      tmp.lerpVectors(p.chemin, p.fin, file);
      tmp.y += p.arcY * monte + Math.sin(t * 0.45 + i * 1.3) * 0.025 * (1 - pose);
      if (!haut) tmp.x += p.cote * p.arcX * monte;
      tmp.addScaledVector(p.ecart, ouv);
      p.g.position.copy(tmp);
      p.g.rotation.y = (p.ry + sx * 0.12) * (1 - file) + p.cote * 0.35 * monte * (1 - file);
      p.g.rotation.z = Math.sin(t * 0.35 + i) * 0.006 * (1 - pose);
      p.netteM.opacity = allume * nait;
      p.floueM.opacity = nait;
      p.verreM.opacity = 0.4 * nait;
      const gris = 0.45 + 0.4 * allume;
      p.floueM.color.setRGB(gris, gris * 0.98, gris * 0.95);
      p.bordM.opacity = Math.min(1, 0.2 + 0.8 * allume + 0.4 * pret) * nait;
      // halo éteint en vol, petit éclat à la pose (le « ding » de l'assiette sur le passe), puis il cède la place à la salle
      p.lueur.material.opacity = Math.max(0.55 * allume * (1 - monte), 0.45 * pose + 0.35 * Math.sin(pose * Math.PI)) * (1 - 0.7 * ouv) * nait;
      p.g.visible = nait > 0;
      // son reflet dans la pierre, seulement quand il est allumé : symétrique par rapport au sol, il disparaît quand le panneau file
      const miroir = nait * (1 - file) * (1 - ouv);
      p.refl.position.set(tmp.x, -tmp.y, tmp.z);
      p.refl.rotation.set(0, p.g.rotation.y, -p.g.rotation.z);
      p.refl.scale.y = -1;
      p.floueRM.opacity = 0.3 * allume * miroir;
      p.floueRM.color.setRGB(gris * 0.9, gris * 0.88, gris * 0.86);
      p.netteRM.opacity = 0.34 * allume * miroir;
      p.refl.visible = miroir > 0.01;
      // la flaque de lumière au sol et le faisceau du plafond s'allument avec le panneau, et restent en veilleuse après son départ
      const lampe = (0.25 + 0.75 * allume) * nait * (1 - ouv);
      p.flaque.material.opacity = 0.3 * lampe;
      p.flaque.visible = lampe > 0.01;
      p.faisceau.material.opacity = (0.16 + Math.sin(t * 0.6 + i * 2.1) * 0.02) * lampe;
      p.faisceau.visible = lampe > 0.01;
      // le faisceau, une simple lame de lumière, se tourne toujours vers la caméra
      p.faisceau.rotation.y = Math.atan2(camera.position.x - p.faisceau.position.x, camera.position.z - p.faisceau.position.z);
    });
    // le passe s'allume dès que le premier panneau part s'y poser ; le comptoir fond quand la fente s'ouvre
    const garni = doux(borne((courant - arrets[0][1]) / 0.06));
    passe.material.opacity = 0.85 * garni * (1 - ouv);
    passeLueur.material.opacity = 0.3 * garni * (1 - ouv);
    lampes.forEach((l, k) => { l.material.opacity = garni * (0.6 + Math.sin(t * 6 + k * 2) * 0.04) * (1 - 0.7 * ouv); });
    if (courant > 0.3) chargerSalle();
    const [bw, bh, oeil] = salle.userData.base, zoom = 1 + 0.06 * ouv;
    salle.visible = ouv > 0;
    salleM.opacity = 0.92 * borne(ouv * 2.5);
    salleM.color.setRGB(0.1 + 0.9 * chaud, 0.085 + 0.915 * chaud, 0.075 + 0.925 * chaud);
    salle.scale.set(bw * zoom, bh * zoom, 1);
    salle.position.x = sx * 0.5;
    salle.position.y = oeil - sy * 0.3;
    nappe.scale.set(0.001 + 14 * ouv, 0.001 + 4 * ouv, 1);
    nappe.material.opacity = 0.55 * Math.sin(ouv * Math.PI) + 0.12 * ouv;
    rendu.render(scene, camera);

    textes.forEach((el) => {
      const de = Number(el.dataset.de), a = Number(el.dataset.a), f = Number(el.dataset.f) || 0.05;
      const o = borne(Math.min((courant - de) / f, (a - courant) / f));
      el.style.setProperty('--o', o.toFixed(3));
      el.style.setProperty('--y', `${((1 - o) * (courant < (de + a) / 2 ? 24 : -24)).toFixed(1)}px`);
      el.style.visibility = o > 0.01 ? 'visible' : 'hidden';
      el.classList.toggle('actif', o > 0.3);
    });
    section.style.setProperty('--salle', ouv.toFixed(3));
    const e = bornesTrajet.findLastIndex((b) => courant >= b);
    // la barre avance de jalon en jalon au rythme des étapes : elle atteint chaque étiquette au moment où celle-ci s'allume
    const debut = bornesTrajet[e], suiv = bornesTrajet[e + 1] ?? 1;
    section.style.setProperty('--trajet', Math.min(1, (e + borne((courant - debut) / Math.max(suiv - debut, 1e-6))) / (bornesTrajet.length - 1)).toFixed(4));
    if (e !== etape) { etape = e; jalons.forEach((li, i) => { li.classList.toggle('ici', i === e); li.classList.toggle('passe', i < e); }); }
    section.style.setProperty('--fin', borne((courant - 0.2) / 0.05) * (1 - borne((courant - 0.27) / 0.05)));
  }
  // les programmes de rendu sont compilés avant la première image, pour ne pas geler au premier défilement
  if (rendu.compileAsync) rendu.compileAsync(scene, camera).then(image, image);
  else image();
}
