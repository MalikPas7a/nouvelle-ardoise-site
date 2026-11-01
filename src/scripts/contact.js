// Page Contact : la demande arrive directement dans l'appli de prospection (onglet prospects de Malik),
// par la même route que le test de visibilité. Si l'envoi échoue, la messagerie du visiteur s'ouvre, message prêt.
import { SITE } from '../config.js';
import { mesurer } from './mesure.js';

const API = 'https://nouvelle-ardoise-app.vercel.app/api/public/demande';
const $ = (sel, racine = document) => racine.querySelector(sel);
const form = $('[data-contact]');
const msg = $('[data-contact-msg]');
const bouton = form.querySelector('button[type="submit"]');

// Un lien « ?offre=… » (pages Offres, Restaurant Tech) se présélectionne s'il correspond à un choix
const offre = new URLSearchParams(location.search).get('offre');
const choix = $('[data-offre-choix]');
if (offre) {
  if (![...choix.options].some((o) => o.text === offre)) choix.add(new Option(offre), 0);
  choix.value = offre;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const d = new FormData(form);
  const val = (k) => String(d.get(k) || '').trim();
  const tel = val('tel'); const email = val('email');
  const telOk = tel.replace(/\D/g, '').length >= 9;
  const mailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!val('contact') || !val('nom')) { msg.textContent = 'Indiquez votre nom et celui de votre établissement.'; return; }
  if (tel && !telOk) { msg.textContent = 'Ce numéro semble incomplet (9 chiffres au moins).'; return; }
  if (email && !mailOk) { msg.textContent = 'Cette adresse e-mail semble incomplète.'; return; }
  if (!telOk && !mailOk) { msg.textContent = 'Laissez un numéro de téléphone ou une adresse e-mail.'; return; }
  const resume = `Formulaire contact du site · Intérêt : ${val('besoin')}${val('msg') ? ' · ' + val('msg') : ''}`;
  bouton.disabled = true; msg.textContent = 'Envoi…';
  try {
    const r = await fetch(API, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(15000),
      body: JSON.stringify({ nom: val('nom'), contact: val('contact'), email: mailOk ? email : null, telephone: telOk ? tel : null, categorie: null, resume, site_web_confirmation: val('site_web_confirmation') }),
    });
    if (!r.ok) throw new Error(String(r.status));
    mesurer('Demande envoyée', { interet: val('besoin') });
    form.querySelectorAll('input, select, textarea').forEach((c) => { c.disabled = true; });
    bouton.hidden = true;
    msg.textContent = `Merci ${val('contact')}, c’est reçu. Malik vous ${telOk ? 'rappelle' : 'écrit'} le jour ouvré suivant.`;
  } catch {
    // Plan B : la messagerie du visiteur, message prérempli
    mesurer('Demande par e-mail (secours)');
    const corps = `${resume}\nNom : ${val('contact')}\nÉtablissement : ${val('nom')}\nTéléphone : ${tel}\nE-mail : ${email}`;
    location.href = `mailto:${SITE.email}?subject=${encodeURIComponent('Demande de devis – ' + val('nom'))}&body=${encodeURIComponent(corps)}`;
    msg.textContent = 'L’envoi direct n’a pas abouti : votre messagerie s’ouvre avec le message prêt. Ou appelez le 078 213 38 68.';
    bouton.disabled = false;
  }
});
