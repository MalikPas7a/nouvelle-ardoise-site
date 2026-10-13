import { PROMOTION_ACTIVE, OFFRES, montant, prixActuel } from './offres.js';
// Questions fréquentes : affichées sur /questions/, balisées pour Google (FAQPage)
// et reprises dans /llms.txt pour les moteurs de réponse (ChatGPT, Perplexity, Gemini, Claude).
// Chaque réponse commence par la réponse directe, en une ou deux phrases, puis précise.
// Les prix doivent rester identiques à ceux de la page Offres.
export const QUESTIONS = [
  { q: 'Une carte en ligne peut-elle aussi rester disponible en PDF ?', r: 'Oui. La carte en HTML permet de consulter les plats directement dans le site sur téléphone. Un PDF peut compléter cette version pour l’impression ; Google peut aussi indexer les PDF textuels.' },
  { q: 'Les plats en réalité augmentée fonctionnent-ils sur tous les téléphones ?', r: 'La compatibilité dépend du téléphone et du navigateur. La présentation classique des plats reste disponible quand un appareil ne prend pas en charge la réalité augmentée. Les fonctionnalités prévues sont définies dans le devis.' },
  { q: 'Garantissez-vous une position Google ou un nombre de réservations ?', r: 'Non. Nous travaillons la qualité du site, son contenu, la visibilité et le suivi des actions. Le classement dans les moteurs et les décisions des visiteurs ne permettent pas de garantir une position ou un volume de réservations.' },
  { q: 'Les restaurants de démonstration sont-ils de vrais clients ?', r: 'Osteria del Lago, Chez Léonie, Sora et Maison Fève sont des établissements fictifs créés pour les démonstrations. La page Réalisations distingue les exemples des projets réels et précise l’origine des médias.' },
  {
    q: 'Qu’est-ce que Nouvelle Ardoise ?',
    r: 'Nouvelle Ardoise est une agence de marketing digital pour les restaurants et les boutiques gourmandes de Genève et Vaud : restaurants, cafés, boulangeries, pâtisseries, chocolateries. Elle crée des sites web, tourne des photos et des réels chez ses clients, et gère leurs réseaux sociaux. L’agence est dirigée par Malik Younes, qui exploite aussi Pasta Mo’, une enseigne de street food italienne à Genève.',
  },
  {
    q: 'Combien coûte un site web pour un restaurant à Genève ?',
    r: `Les sites Nouvelle Ardoise coûtent CHF ${montant(prixActuel('essentiel'))} (Essentiel), CHF ${montant(prixActuel('signature'))} (Signature, avec deux heures de shooting) ou CHF ${montant(prixActuel('maison'))} puis CHF ${montant(PROMOTION_ACTIVE ? OFFRES.maison.suiviPromotion : OFFRES.maison.suivi)} par mois (Maison). ${PROMOTION_ACTIVE ? `Ces prix de lancement sont valables pour les commandes jusqu’au 31 octobre 2026. La mensualité Maison de CHF ${montant(OFFRES.maison.suiviPromotion)} vaut les trois premiers mois, puis CHF ${montant(OFFRES.maison.suivi)} par mois. Les tarifs standards sont indiqués sur la page Offres.` : 'Prix fixes, affichés sur la page Offres.'}`,
  },
  {
    q: 'Combien coûte la gestion des réseaux sociaux d’un restaurant ?',
    r: `Réseaux Essentiel coûte CHF ${montant(prixActuel('reseauxEssentiel'))} par mois : une heure de shooting, quatre Reels, menu du jour et entretien du site. Premium coûte CHF ${montant(prixActuel('reseauxPremium'))} par mois et ajoute huit publications, toute la carte en photo et la gestion des publicités Meta et Google. Le budget publicitaire est séparé. ${PROMOTION_ACTIVE ? `Pour les commandes jusqu’au 31 octobre 2026, les prix réduits s’appliquent aux trois premiers mois, puis CHF ${montant(OFFRES.reseauxEssentiel.prix)} et CHF ${montant(OFFRES.reseauxPremium.prix)} par mois respectivement.` : ''} Trois mois minimum, puis sans engagement.`,
  },
  {
    q: 'Que contiennent les 4 réels par mois ?',
    r: 'Un réel par semaine, tourné chez vous et monté en motion design : les coulisses (le geste en gros plan), la création du mois, l’équipe, puis la saison ou un événement. Les réels sont publiés sur Instagram et sur votre site. Un exemple complet est visible sur la page Artisans.',
  },
  {
    q: 'Le shooting photo est-il inclus ?',
    r: 'Oui. L’offre Signature inclut deux heures de shooting à la création du site, l’abonnement Réseaux Essentiel une heure par mois, l’offre Maison et l’abonnement Premium deux heures par mois. Les photos et les vidéos appartiennent au client.',
  },
  {
    q: 'Peut-on ajouter la réservation, le click and collect ou le paiement TWINT ?',
    r: 'Oui, en option, avec toutes les offres. Nouvelle Ardoise branche sur le site la réservation de table (TheFork, Zenchef, foratable ou un nouvel outil), le click and collect ou le paiement en ligne par carte et TWINT. Ces options ne sont pas comprises dans les prix affichés ; leur coût dépend de la solution et figure dans le devis.',
  },
  {
    q: 'En combien de temps le site est-il en ligne ?',
    r: 'En deux semaines environ. Un premier rendez-vous de vingt minutes chez vous, une première version visible sur votre téléphone en cinq jours, deux allers-retours de corrections, puis la mise en ligne avec le nom de domaine et la fiche Google à jour.',
  },
  {
    q: 'Travaillez-vous aussi pour les boulangeries, pâtisseries et chocolateries ?',
    r: 'Oui. Pour les artisans du goût, le site met le produit au centre, une création par écran, et les réels montrent le savoir-faire : tempérage, glaçage, façonnage. Le click and collect permet de vendre les coffrets et les commandes des fêtes en ligne.',
  },
  {
    q: 'Dans quelles régions intervenez-vous ?',
    r: 'À Genève et dans le canton de Vaud. Le shooting et les tournages ont lieu chez le client, et le premier rendez-vous est offert.',
  },
  {
    q: 'Comment demander un devis ?',
    r: 'Par le formulaire de la page Contact ou par email à contact@nouvelleardoise.ch. La réponse arrive sous 24 heures, avec un devis clair.',
  },
];
