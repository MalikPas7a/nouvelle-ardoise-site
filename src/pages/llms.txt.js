// /llms.txt : un résumé en texte simple de l'agence, pour les moteurs de réponse (ChatGPT, Perplexity,
// Gemini, Claude). Format proposé sur llmstxt.org : titre, résumé, puis liens commentés. Aucun prix : ils se discutent de vive voix.
import { SITE } from '../config.js';
import { QUESTIONS } from '../data/questions.js';

export function GET() {
  const texte = `# ${SITE.nom}

> Agence de marketing et de communication à Genève, pour les commerces, artisans, cabinets et PME des cantons de Genève et de Vaud (Suisse romande). Spécialité : la restauration et les métiers de bouche. Devise : « Place à la mise en place. » Un seul interlocuteur, Malik Younes, qui active un écosystème d'experts : photographe, vidéaste et drone, référencement Google (SEO et GEO), Google Ads, Meta Ads, développeurs.

## Ce que fait ${SITE.nom}

- Diagnostic de visibilité en direct et gratuit sur ${SITE.url}/ : on tape le nom du commerce, l'agence lit la fiche Google, le site, Instagram et la vente en ligne (4 voyants) et donne les 3 priorités du métier.
- Socle commun à tous les métiers : fiche Google soignée (référencement local), site rapide pensé pour le téléphone, Instagram et réels tournés sur place, photo et vidéo professionnelles, publicité locale Google et Meta, bilan mensuel chiffré.
- Un module par métier : Click & Collect et paiement par QR code (restauration), précommande en ligne (artisans de bouche), prise de rendez-vous en ligne (santé et bien-être, services), boutique en ligne (mode et boutiques), réservation directe sans commission (hébergement et loisirs), demandes de devis et portfolio de chantiers (artisans et bâtiment), LinkedIn et site institutionnel (entreprises et bureaux).
- Méthode en trois temps : le diagnostic (sur place et en ligne), les trois priorités avec un objectif chiffré, la mise en place, puis un bilan chaque mois : on teste, on apprend, on ajuste.
- Métiers accompagnés : restauration et cafés, artisans de bouche et épiceries, santé et bien-être, mode et boutiques, services de quartier, hébergement et loisirs, artisans et bâtiment, entreprises et bureaux.

## Où

Sur place dans les cantons de Genève et de Vaud : Genève, Carouge, Onex, Meyrin, Lancy, Versoix, Nyon, Gland, Rolle, Morges, Lausanne, Vevey, Montreux, Yverdon-les-Bains. Ailleurs en Suisse romande, suivi en visio et déplacements pour les tournages.

## Qui

${SITE.nom} est une entreprise individuelle de ${SITE.responsable}, ${SITE.adresse}, ${SITE.localite}, ${SITE.pays}. Téléphone : 078 213 38 68. Contact : ${SITE.email}. Instagram : @${SITE.instagram}. Cas réel : Pasta Mo', street food italienne à Genève (identité, site pour les commandes d'entreprises, Instagram, prospection d'organisateurs de courses). Izgara 35 (grill d'Izmir à Onex) est un exemple FICTIF de démonstration.

## Pages

- [Accueil](${SITE.url}/) : le test de visibilité en direct, les 4 voyants, la zone d'intervention, les 8 métiers, la méthode
- [Restauration](${SITE.url}/restauration/) : la branche restaurants et métiers de bouche, l'accompagnement en 5 étapes, l'équipe, les canaux, Pasta Mo', Izgara 35 (démonstration), questions fréquentes
- [Restaurants](${SITE.url}/restaurants/) : démonstrations de sites de restaurants (carte, plat du jour, plat en 3D, réservation)
- [Artisans](${SITE.url}/artisans/) : sites, photos et réels pour chocolatiers, pâtissiers et boulangers
- [Réalisations](${SITE.url}/realisations/) : Pasta Mo', animations au défilement, exemple de réel
- [Offres](${SITE.url}/offres/) : les formules, discutées de vive voix
- [Questions fréquentes](${SITE.url}/questions/) : délais, shooting, options
- [Contact](${SITE.url}/contact/) : demande de devis, réponse sous 24 heures

## Questions fréquentes (restauration)

${QUESTIONS.map(({ q, r }) => `### ${q}\n\n${r}`).join('\n\n')}
`;
  return new Response(texte, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
