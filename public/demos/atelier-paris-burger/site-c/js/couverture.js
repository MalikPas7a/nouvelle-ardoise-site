// Couverture : au défilement, la main trempe le burger dans la saucière
// pendant que le monogramme en or 3D s'éclaire sous un spot, sur lueur lie-de-vin.
import * as THREE from './three.module.min.js';
import { SVGLoader } from './SVGLoader.js';
import { RoomEnvironment } from './RoomEnvironment.js';
import { RGBELoader } from './RGBELoader.js';

const couv = document.getElementById('couv');
const canvas = document.getElementById('or3d');
const photo = document.getElementById('photo');
const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (x) => Math.max(0, Math.min(1, x));
const lisse = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };

function avance() {
  if (rm) return 1;
  const r = couv.getBoundingClientRect();
  const pin = couv.firstElementChild;
  const off = parseFloat(getComputedStyle(pin).top) || 0;
  const run = r.height - pin.offsetHeight;
  return run > 0 ? clamp((off - r.top) / run) : 1;
}
function majCss(p) {
  couv.style.setProperty('--p', p.toFixed(4));
  couv.classList.toggle('fin', p > 0.62);
}

if (couv && canvas) {
  couv.classList.add('js');
  const scene2d = photo ? initPhoto() : () => {};
  const or = initOr();
  let last = -1;
  const tick = () => {
    const p = avance();
    if (p !== last) { majCss(p); scene2d(p); last = p; }
    if (or) or(p);
  };
  addEventListener('resize', () => { last = -1; tick(); });
  tick();
  if (!rm) {
    let visible = true;
    new IntersectionObserver((e) => { visible = e[0].isIntersecting; }, { rootMargin: '100px' }).observe(couv);
    (function loop() { if (visible) tick(); requestAnimationFrame(loop); })();
  }
}

// ---- Le trempage : vraie séquence vidéo (Kling 4.0) pilotée image par image par le défilement ----
function initPhoto() {
  const ctx = photo.getContext('2d');
  const N = 61, W = 1440, H = 804;
  const imgs = new Array(N); let pEnCours = 0, montre = -1;
  const charge = (i) => {
    if (imgs[i]) return imgs[i];
    const im = new Image(); im.decoding = 'async'; im.src = 'img/trempe/' + String(i).padStart(3, '0') + '.webp';
    im.onload = () => { if (i === 0) couv.classList.add('photo-ok'); if (i === 0 || i === montre) dessine(pEnCours, true); };
    return (imgs[i] = im);
  };
  charge(0);
  // le reste se charge quand la page a fini, du début vers la fin
  const suite = () => { for (let i = 1; i < N; i++) charge(i); };
  if (document.readyState === 'complete') setTimeout(suite, 200); else addEventListener('load', () => setTimeout(suite, 200));
  let cw = 0, ch = 0, dpr = 1;
  function taille() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    const r = photo.getBoundingClientRect();
    if (Math.round(r.width * dpr) !== cw || Math.round(r.height * dpr) !== ch) {
      cw = photo.width = Math.round(r.width * dpr); ch = photo.height = Math.round(r.height * dpr);
      return true;
    }
    return false;
  }
  function dessine(p, force) {
    pEnCours = p;
    const voulu = Math.round(lisse(p / 0.8) * (N - 1));
    // image la plus proche déjà chargée
    let i = voulu; while (i > 0 && !(imgs[i] && imgs[i].complete && imgs[i].naturalWidth)) i--;
    const im = imgs[i];
    if (!im || !im.complete || !im.naturalWidth) return;
    const re = taille();
    if (i === montre && !force && !re) return;
    montre = voulu;
    const mob = cw / dpr < 861;
    const rx = 0, ry = mob ? ch * 0.21 : 0, rw = cw, rh = mob ? ch * 0.79 - 72 * dpr : ch;
    const fx = mob ? 0.63 : 0.62, fy = mob ? 0.64 : 0.5;
    const s = Math.max(rw / W, rh / H);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cw, ch);
    ctx.save();
    ctx.beginPath(); ctx.rect(rx, ry, rw, rh); ctx.clip();
    ctx.drawImage(im, rx + (rw - W * s) * fx, ry + (rh - H * s) * fy, W * s, H * s);
    ctx.restore();
  }
  return dessine;
}

// ---- Le monogramme en or, éclairé par le spot au fil du défilement ----
function initOr() {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'high-performance' });
  } catch (e) { couv.classList.add('sans3d'); return null; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  // Vrai studio photo (HDRI Poly Haven, CC0) : ce sont ses reflets qui font l'or
  new RGBELoader().load('img/or/studio.hdr', (hdr) => {
    hdr.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = pmrem.fromEquirectangular(hdr).texture; hdr.dispose();
    const q = new URLSearchParams(location.search); scene.environmentRotation.set(parseFloat(q.get('rx')) || 0, parseFloat(q.get('ry')) || (innerWidth < 861 ? 2.0 : 1.6), 0);
  });

  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  camera.position.set(0, 0, 10);

  // Spot de scène venu d'en haut, contre-jour lie-de-vin, reflet qui passe une fois
  const spot = new THREE.SpotLight(0xffe4b8, 0, 30, 0.34, 0.6, 1.2); scene.add(spot); scene.add(spot.target);
  const rim = new THREE.PointLight(0x9b1a3a, 0, 20, 1.6); scene.add(rim);
  const sweep = new THREE.PointLight(0xffd79a, 0, 12, 1.8); scene.add(sweep);

  // Matière : or brossé, micro-martelage, légères variations de brillant
  const tex = (() => {
    const N = 512, c = document.createElement('canvas'); c.width = c.height = N;
    const g = c.getContext('2d'), d = g.createImageData(N, N);
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const row = new Float32Array(N); for (let y = 0; y < N; y++) row[y] = rnd();
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const v = 0.78 + 0.12 * row[y] + 0.06 * row[(y + 1) % N] + 0.04 * rnd(); // brossage + grain fin
      const i = (y * N + x) * 4, b = Math.round(v * 255);
      d.data[i] = d.data[i + 1] = d.data[i + 2] = b; d.data[i + 3] = 255;
    }
    g.putImageData(d, 0, 0);
    for (let k = 0; k < 420; k++) { // facettes martelées
      const x = rnd() * N, y = rnd() * N, r = 6 + rnd() * 16, gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, 'rgba(255,255,255,.10)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r);
    }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / 140, 1 / 140);
    return t;
  })();
  // Matière : or poli réel (cartes ambientCG CC0) + léger brossage
  const tl = new THREE.TextureLoader();
  const carte = (u, srgb) => { const t = tl.load(u); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / 420, 1 / 420); if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t; };
  const gold = new THREE.MeshPhysicalMaterial({
    color: 0xeba640, metalness: 1, roughness: 2.4, roughnessMap: carte('img/or/rugosite.jpg'),
    normalMap: carte('img/or/normale.jpg'), normalScale: new THREE.Vector2(0.6, 0.6),
    bumpMap: tex, bumpScale: 0.12, clearcoat: 0.6, clearcoatRoughness: 0.08,
    specularIntensity: 1, envMapIntensity: 1
  });

  const group = new THREE.Group(); scene.add(group);
  const inner = new THREE.Group(); group.add(inner);
  let FX = 0.25, FY = 0.3, FH = 0.36, pret = false;

  new SVGLoader().load('../lignes/img/monogramme-or.svg', (data) => {
    const shapes = [];
    data.paths.forEach((p) => SVGLoader.createShapes(p).forEach((s) => shapes.push(s)));
    const geo = new THREE.ExtrudeGeometry(shapes, {
      depth: 34, bevelEnabled: true, bevelThickness: 9, bevelSize: 5, bevelSegments: 6, curveSegments: 12
    });
    geo.computeBoundingBox();
    const b = geo.boundingBox, c = new THREE.Vector3(); b.getCenter(c);
    geo.translate(-c.x, -c.y, -c.z);
    const size = Math.max(b.max.x - b.min.x, b.max.y - b.min.y);
    const mesh = new THREE.Mesh(geo, gold);
    mesh.scale.set(2.2 / size, -2.2 / size, 2.2 / size); // SVG : y vers le bas
    inner.add(mesh);
    pret = true; couv.classList.add('pret');
    resize(); rendu(avance());
  }, undefined, () => couv.classList.add('sans3d'));

  function resize() {
    const r = canvas.getBoundingClientRect();
    const W = Math.max(1, r.width), H = Math.max(1, r.height);
    const cs = getComputedStyle(couv);
    FX = parseFloat(cs.getPropertyValue('--fx')) / 100 || 0.25;
    FY = parseFloat(cs.getPropertyValue('--fy')) / 100 || 0.3;
    FH = W < 861 ? 0.17 : 0.36;
    renderer.setSize(W, H, false);
    camera.aspect = W / H; camera.updateProjectionMatrix();
  }
  addEventListener('resize', () => { if (pret) { resize(); rendu(avance()); } });

  let mx = 0, my = 0, tx = 0, ty = 0;
  addEventListener('pointermove', (e) => { tx = e.clientX / innerWidth - 0.5; ty = e.clientY / innerHeight - 0.5; }, { passive: true });
  const t0 = performance.now();

  function rendu(p) {
    if (!pret) return;
    const now = (performance.now() - t0) / 1000;
    // Logo fixe, face au public : seuls un léger souffle et la souris le font vivre
    const vh = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z, vw = vh * camera.aspect;
    group.position.set((FX - 0.5) * vw, (0.5 - FY) * vh, 0);
    group.scale.setScalar(FH * vh / 2.2);
    mx += (tx - mx) * 0.05; my += (ty - my) * 0.05;
    const v = rm ? 0 : 1;
    inner.rotation.y = 0;
    inner.rotation.x = 0;

    // Le spot s'allume avec le défilement : l'or sort de l'ombre
    const L = lisse(p / 0.7);
    gold.envMapIntensity = 1;
    scene.environmentIntensity = 0.75 * L * L;
    spot.intensity = 260 * L * (FH < 0.3 ? 0.45 : 1);
    spot.position.set(group.position.x + 0.5, group.position.y + 6.5, 3.2);
    spot.target.position.copy(group.position);
    rim.position.set(group.position.x, group.position.y + 0.3, -2.5);
    rim.intensity = 50 * lisse((p - 0.05) / 0.8);
    // un seul reflet qui traverse la face quand la lumière est pleine
    const sw = clamp((p - 0.5) / 0.4);
    sweep.intensity = Math.sin(sw * Math.PI) * 10 + (rm ? 4 : 0);
    sweep.position.set(group.position.x + THREE.MathUtils.lerp(-2.4, 2.4, sw), group.position.y + 0.8, 2.4);

    renderer.render(scene, camera);
  }
  return rendu;
}
