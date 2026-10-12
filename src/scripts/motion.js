// Motion design de l'accueil : défilement fluide, titres révélés mot à mot, boutons aimantés, cartes éclairées par le curseur
import Lenis from 'lenis';
import { animate, inView, stagger } from 'motion';

const calme = matchMedia('(prefers-reduced-motion: reduce)').matches;
const souris = matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ---------- découpe un titre en mots masqués, en gardant les <em> ---------- */
function decouper(el) {
  const parcourir = (noeud) => [...noeud.childNodes].forEach((n) => {
    if (n.nodeType === 1) return parcourir(n);
    if (n.nodeType !== 3 || !n.textContent.trim()) return;
    const frag = document.createDocumentFragment();
    n.textContent.split(/(\s+)/).forEach((morceau) => {
      if (!morceau) return;
      if (/^\s+$/.test(morceau)) return frag.append(morceau);
      const mot = document.createElement('span');
      mot.className = 'mot';
      const dedans = document.createElement('span');
      dedans.textContent = morceau;
      mot.append(dedans);
      frag.append(mot);
    });
    n.replaceWith(frag);
  });
  parcourir(el);
  el.querySelectorAll('.mot > span').forEach((s, i) => s.style.setProperty('--k', i));
}

if (!calme) {
  document.documentElement.classList.add('mouvement');

  // Défilement fluide à l'ordinateur ; sur téléphone, le défilement natif reste le meilleur
  if (souris) {
    const lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 0.9, anchors: { offset: -80 } });
    (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(performance.now());
  }

  // Les textes du film : les mots montent un à un quand le bloc s'allume (la découpe conserve les <em>)
  document.querySelectorAll('.film__titre, .film__texte h2, .film__fin h2').forEach(decouper);

  // Les grands titres de la page : révélation mot à mot, avec un ressort
  document.querySelectorAll('.titre-2, .bloc__tete > p').forEach((el) => {
    if (el.matches('.titre-2')) decouper(el);
    inView(el, () => {
      const mots = el.querySelectorAll('.mot > span');
      if (mots.length) animate(mots, { y: ['110%', '0%'], rotate: [4, 0] }, { type: 'spring', bounce: 0.28, duration: 0.9, delay: stagger(0.06) });
      else animate(el, { opacity: [0, 1], y: [24, 0] }, { duration: 0.8, delay: 0.25, ease: [0.2, 0.8, 0.2, 1] });
    }, { margin: '0px 0px -15% 0px' });
  });

  if (souris) {
    // Boutons aimantés : ils suivent un peu le curseur, puis reviennent avec un ressort
    document.querySelectorAll('.btn--jaune').forEach((el) => {
      const pos = { x: 0, y: 0 };
      const aller = (x, y) => animate(pos, { x, y }, { type: 'spring', stiffness: 260, damping: 16, onUpdate: () => { el.style.translate = `${pos.x.toFixed(1)}px ${pos.y.toFixed(1)}px`; } });
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        aller((e.clientX - r.left - r.width / 2) * 0.3, (e.clientY - r.top - r.height / 2) * 0.4);
      });
      el.addEventListener('pointerleave', () => aller(0, 0));
    });

    // Les cartes s'éclairent là où passe le curseur
    document.querySelectorAll('.pieces li, .porte').forEach((carte) => {
      carte.classList.add('lueur');
      carte.addEventListener('pointermove', (e) => {
        const r = carte.getBoundingClientRect();
        carte.style.setProperty('--lx', `${e.clientX - r.left}px`);
        carte.style.setProperty('--ly', `${e.clientY - r.top}px`);
      });
    });
  }
}
