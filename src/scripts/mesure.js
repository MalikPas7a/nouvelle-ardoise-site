// Mesure d'audience (Umami, sans cookie) : les clics qui comptent pour l'agence.
// Rien n'est envoyé si Umami n'est pas chargé (identifiant vide dans config.js, bloqueur, développement local).
export function mesurer(nom, donnees) {
  try { window.umami?.track(nom, donnees); } catch { /* jamais bloquant */ }
}

function nomDuClic(a) {
  if (a.dataset.mesure) return a.dataset.mesure;
  const href = a.getAttribute('href') || '';
  if (href.startsWith('tel:')) return 'Appel';
  if (href.startsWith('mailto:')) return 'E-mail';
  if (/wa\.me|whatsapp/.test(href)) return 'WhatsApp';
  if (/instagram\.com/.test(href)) return 'Instagram';
  if (/^\/contact\/?(\?|$)/.test(href)) return 'Vers contact';
  if (/(^|\/)#test$|^\/test\/?$/.test(href)) return 'Vers test';
  return null;
}

if (!window.__mesure) {
  window.__mesure = true;
  document.addEventListener('click', (e) => {
    const a = e.target.closest?.('a[href]');
    if (!a) return;
    const nom = nomDuClic(a);
    if (nom) mesurer(nom, { page: location.pathname });
  }, { capture: true, passive: true });
}
