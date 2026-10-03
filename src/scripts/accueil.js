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
