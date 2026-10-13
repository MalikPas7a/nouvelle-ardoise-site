// Source commune aux prix affichés, à la FAQ et aux données structurées.
export const PROMOTION_FIN = '2026-10-31';
export function promotionActive(date = new Date()) {
  const parts = new Intl.DateTimeFormat('fr-CH', { timeZone: 'Europe/Zurich', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  const part = (type) => parts.find((p) => p.type === type).value;
  return `${part('year')}-${part('month')}-${part('day')}` <= PROMOTION_FIN;
}
export const PROMOTION_ACTIVE = promotionActive();
export const OFFRES = {
  essentiel: { nom: 'Site Essentiel', prix: 999, promotion: 799, description: 'Site sur mesure pour téléphone, carte en ligne, horaires, plan et fiche Google.' },
  signature: { nom: 'Site Signature', prix: 1999, promotion: 1599, description: 'Site Essentiel, plat signature animé, carte redessinée et deux heures de shooting offertes.' },
  maison: { nom: 'Site Maison', prix: 3490, promotion: 2792, suivi: 790, suiviPromotion: 632, description: 'Site Signature avec suivi, photographe, plats en 3D et carte en deux langues.' },
  reseauxEssentiel: { nom: 'Réseaux Essentiel', prix: 490, promotion: 392, mensuel: true, description: 'Une heure de shooting par mois, quatre Reels, menu du jour publié et entretien du site. Trois mois minimum, puis sans engagement.' },
  reseauxPremium: { nom: 'Réseaux Premium', prix: 990, promotion: 792, mensuel: true, description: 'Deux heures de tournage par mois, quatre Reels, huit publications et publicité Meta et Google gérée. Budget publicitaire séparé. Trois mois minimum, puis sans engagement.' },
  lancement: { nom: 'Pack lancement', prix: 990, promotion: 792, description: 'Deux heures de tournage, quatre Reels montés et photos des plats, sans abonnement.' },
};
export const montant = (prix) => String(prix).replace(/\B(?=(\d{3})+(?!\d))/g, '’');
export function prixActuel(id, active = PROMOTION_ACTIVE) {
  if (!Object.hasOwn(OFFRES, id)) throw new RangeError(`Offre inconnue : ${id}`);
  return active ? OFFRES[id].promotion : OFFRES[id].prix;
}
export function catalogueOffres(url, active = PROMOTION_ACTIVE) {
  return {
    '@type': 'OfferCatalog', name: 'Offres Nouvelle Ardoise', url: `${url}/offres/`,
    itemListElement: Object.entries(OFFRES).map(([id, offre]) => {
      const price = prixActuel(id, active);
      const conditions = active ? ` Offre de lancement pour les commandes jusqu’au 31 octobre 2026.${offre.mensuel ? ` Prix mensuel pendant les trois premiers mois, puis CHF ${montant(offre.prix)} par mois.` : ''}` : '';
      const suivi = offre.suivi ? ` Puis CHF ${montant(active ? offre.suiviPromotion : offre.suivi)} par mois${active ? ` pendant trois mois, puis CHF ${montant(offre.suivi)} par mois` : ''}.` : '';
      return { '@type': 'Offer', name: offre.nom, description: offre.description + suivi + conditions, url: `${url}/offres/`, priceCurrency: 'CHF', price,
        ...(active ? { priceValidUntil: PROMOTION_FIN } : {}),
        ...(offre.mensuel ? { priceSpecification: { '@type': 'UnitPriceSpecification', price, priceCurrency: 'CHF', unitText: 'par mois' } } : {}),
      };
    }),
  };
}
