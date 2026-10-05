// Page Contact : sans serveur, on ouvre la messagerie du visiteur.
import { SITE } from '../config.js';

const $ = (sel, racine = document) => racine.querySelector(sel);

// Une offre choisie sur la page Offres arrive ici dans l'adresse (?offre=Signature) et se présélectionne
const offre = new URLSearchParams(location.search).get('offre');
const choix = $('[data-offre-choix]');
if (offre && [...choix.options].some((o) => o.value === offre || o.text === offre)) choix.value = offre;

$('[data-contact]').addEventListener('submit', (e) => {
  e.preventDefault();
  const d = new FormData(e.target);
  const corps = `Offre : ${d.get('offre') || 'à définir'}\nNom : ${d.get('nom')}\nRestaurant : ${d.get('resto')}\nTéléphone : ${d.get('tel') || ''}\nEmail : ${d.get('email')}\n\n${d.get('msg') || ''}`;
  location.href = `mailto:${SITE.email}?subject=${encodeURIComponent('Demande de devis – ' + d.get('resto'))}&body=${encodeURIComponent(corps)}`;
  $('[data-contact-msg]').textContent = `Merci ${d.get('nom')}. Votre messagerie s’ouvre : il reste à envoyer le message.`;
});
