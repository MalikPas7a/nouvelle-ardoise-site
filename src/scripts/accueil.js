// Page d'accueil : tout ce qui réagit aux gestes du visiteur.
// Aucune bibliothèque d'animation : le navigateur fait le travail (CSS), ce fichier
// ne gère que la logique des démonstrations. C'est ce qui garde la page rapide.
import { SITE } from '../config.js';
import './defilement.js';
import './boutons.js';

const calme = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (sel, racine = document) => racine.querySelector(sel);
const $$ = (sel, racine = document) => [...racine.querySelectorAll(sel)];

// Un groupe de boutons où un seul est actif à la fois
function choixUnique(boutons, auChoix) {
  boutons.forEach((b) => b.addEventListener('click', () => {
    boutons.forEach((x) => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
    auChoix?.(b);
  }));
}

/* ---------- le téléphone : changer de restaurant ---------- */
const ecran = $('[data-ecran]');
function montrer(id) {
  document.documentElement.dataset.resto = id;
  $$('[data-mini]').forEach((m) => {
    const actif = m.dataset.mini === id;
    m.hidden = !actif;
    m.classList.toggle('arrive', actif);
  });
  ecran.scrollTop = 0;
}
// Les navigateurs récents animent eux-mêmes le passage d'un site à l'autre (View Transitions)
choixUnique($$('[data-choix]'), (b) => {
  if (document.startViewTransition && !calme) document.startViewTransition(() => montrer(b.dataset.choix));
  else montrer(b.dataset.choix);
});

/* ---------- la carte : filtres et langue ---------- */
const carte = $('[data-carte]');
let filtre = 'tout';
function filtrer() {
  let n = 0;
  $$('[data-plat]', carte).forEach((li) => {
    const visible = filtre === 'tout' || li.dataset[filtre] === '1';
    if (visible && li.hidden) { li.classList.remove('entre'); void li.offsetWidth; li.classList.add('entre'); }
    li.hidden = !visible;
    if (visible) n++;
  });
  $$('.carte__section', carte).forEach((s) => { s.hidden = !$('[data-plat]:not([hidden])', s); });
  $('[data-compte]', carte).textContent = n;
}
choixUnique($$('[data-filtre]', carte), (b) => { filtre = b.dataset.filtre; filtrer(); });
choixUnique($$('[data-langue]', carte), (b) => {
  const langue = b.dataset.langue;
  carte.lang = langue;
  $$('[data-fr]', carte).forEach((el) => { el.textContent = el.dataset[langue] || el.dataset.fr; });
});

/* ---------- l'ardoise du jour ---------- */
const formArdoise = $('[data-ardoise-form]');
const tableau = $('[data-ardoise-tableau]');
function ecrire() {
  const plat = formArdoise.plat.value.trim() || 'Plat du jour';
  const prix = formArdoise.prix.value.replace(/\D/g, '') || '–';
  // Chaque lettre arrive l'une après l'autre, comme tracée à la craie
  tableau.replaceChildren(...[...plat].map((lettre, i) => {
    const s = document.createElement('span');
    s.textContent = lettre;
    s.style.setProperty('--i', i);
    return s;
  }));
  tableau.setAttribute('aria-label', plat);
  // Le même plat est repris dans le téléphone et dans l'avant / après
  $$('[data-ardoise-nom]').forEach((el) => { el.textContent = plat; });
  $$('[data-ardoise-prix]').forEach((el) => { el.textContent = prix; });
}
formArdoise.addEventListener('input', ecrire);
formArdoise.addEventListener('submit', (e) => e.preventDefault());

/* ---------- le plat en 3D : chargé seulement quand on s'en approche ---------- */
const zone3d = $('[data-plat3d]');
new IntersectionObserver((entrees, obs) => {
  if (!entrees[0].isIntersecting) return;
  obs.disconnect();
  // Le décodeur 3D est servi par notre site, pas par un service tiers
  self.ModelViewerElement = self.ModelViewerElement || {};
  self.ModelViewerElement.dracoDecoderLocation = '/vendor/draco/';
  import('@google/model-viewer').then(() => {
    const mv = zone3d.querySelector('model-viewer');
    mv.src = mv.dataset.src;
  });
}, { rootMargin: '600px' }).observe(zone3d);

/* ---------- la réservation ---------- */
const resa = $('[data-resa]');
choixUnique($$('[data-jour]', resa));
choixUnique($$('[data-heure]', resa));
const couverts = $('[data-couverts]', resa);
const changer = (d) => { couverts.textContent = Math.max(1, Math.min(12, Number(couverts.textContent) + d)); };
$('[data-moins]', resa).addEventListener('click', () => changer(-1));
$('[data-plus]', resa).addEventListener('click', () => changer(1));
$('[data-reserver]', resa).addEventListener('click', () => {
  const jour = $('[data-jour][aria-pressed="true"]', resa).textContent;
  const heure = $('[data-heure][aria-pressed="true"]', resa).textContent;
  const n = Number(couverts.textContent);
  const ok = $('[data-reserver]', resa);
  ok.classList.add('fait');
  ok.firstChild.textContent = 'Table réservée';
  $('[data-resa-msg]', resa).textContent = `Table pour ${n} ${n > 1 ? 'personnes' : 'personne'}, ${jour} à ${heure}. C’est une démonstration : rien n’est réservé.`;
});

/* ---------- avant / après ---------- */
const compare = $('[data-compare]');
$('input', compare).addEventListener('input', (e) => compare.style.setProperty('--p', e.target.value + '%'));

/* ---------- offres : onglets « site internet » et « vidéo et réseaux sociaux » ---------- */
// Sans JavaScript, les deux panneaux restent visibles l'un sous l'autre.
const onglets = $$('[data-onglets] [role="tab"]');
const montrerOnglet = (onglet, focus = false) => {
  onglets.forEach((o) => {
    const actif = o === onglet;
    o.setAttribute('aria-selected', String(actif));
    o.tabIndex = actif ? 0 : -1;
    document.getElementById(o.getAttribute('aria-controls')).hidden = !actif;
  });
  if (focus) onglet.focus();
};
onglets.forEach((o, i) => {
  o.addEventListener('click', () => montrerOnglet(o));
  o.addEventListener('keydown', (e) => {
    const pas = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (pas) { e.preventDefault(); montrerOnglet(onglets[(i + pas + onglets.length) % onglets.length], true); }
  });
});
// la vidéo d'exemple ne se charge et ne joue que lorsqu'elle est à l'écran
const exemple = $('[data-video-exemple]');
if (exemple && calme) exemple.controls = true;
if (exemple && !calme) {
  new IntersectionObserver(([e]) => { if (e.isIntersecting) exemple.play().catch(() => {}); else exemple.pause(); }, { threshold: 0.4 }).observe(exemple);
}
if (onglets.length) montrerOnglet(location.hash === '#reseaux' ? onglets[1] : onglets[0]);

/* ---------- choisir une offre la présélectionne dans le formulaire ---------- */
$$('[data-offre]').forEach((b) => b.addEventListener('click', () => { $('[data-offre-choix]').value = b.dataset.offre; }));

/* ---------- contact : sans serveur, on ouvre la messagerie du visiteur ---------- */
$('[data-contact]').addEventListener('submit', (e) => {
  e.preventDefault();
  const d = new FormData(e.target);
  const corps = `Offre : ${d.get('offre') || 'à définir'}\nNom : ${d.get('nom')}\nRestaurant : ${d.get('resto')}\nTéléphone : ${d.get('tel') || ''}\nEmail : ${d.get('email')}\n\n${d.get('msg') || ''}`;
  location.href = `mailto:${SITE.email}?subject=${encodeURIComponent('Demande de devis – ' + d.get('resto'))}&body=${encodeURIComponent(corps)}`;
  $('[data-contact-msg]').textContent = `Merci ${d.get('nom')}. Votre messagerie s’ouvre : il reste à envoyer le message.`;
});

/* ---------- Voir plus : les plats en mouvement ---------- */
// Les deux séquences (pizza, maki) ne se chargent qu'une fois ouvertes : la page
// d'accueil reste légère sur téléphone.
const voirPlus = $('[data-voir-plus]');
const sequencesPlus = $('#plus-sequences');
voirPlus?.addEventListener('click', () => {
  const ouvert = voirPlus.getAttribute('aria-expanded') === 'true';
  voirPlus.setAttribute('aria-expanded', String(!ouvert));
  sequencesPlus.hidden = ouvert;
  const libelle = ouvert ? 'Voir plus' : 'Masquer';
  voirPlus.querySelectorAll('.btn__roule > span').forEach((s) => { s.textContent = libelle; });
  if (!voirPlus.querySelector('.btn__roule')) voirPlus.textContent = libelle;
  // les toiles étaient cachées : on leur redonne leur taille
  if (!ouvert) {
    dispatchEvent(new Event('resize'));
    sequencesPlus.scrollIntoView({ behavior: calme ? 'auto' : 'smooth' });
  }
});
