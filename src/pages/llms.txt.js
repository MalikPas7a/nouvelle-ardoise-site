// /llms.txt : un résumé en texte simple de l'agence, pour les moteurs de réponse (ChatGPT, Perplexity,
// Gemini, Claude). Format proposé sur llmstxt.org : titre, résumé, puis liens commentés.
import { SITE } from '../config.js';
import { QUESTIONS } from '../data/questions.js';

export function GET() {
  const texte = `# ${SITE.nom}

> Agence de marketing et de communication pour la restauration et les métiers de bouche (restaurants, cafés, traiteurs, street food, boulangeries, pâtisseries, chocolateries) à Genève, Lausanne et dans le canton de Vaud, en Suisse romande. Devise : « Place à la mise en place. »

${SITE.nom} accompagne les restaurateurs en 5 étapes : 1. étudier le marché (visite sur place, quartier, concurrence, fiche Google) ; 2. construire la stratégie (deux ou trois leviers pour le chiffre d’affaires, objectifs chiffrés) ; 3. créer l’identité (logo, carte, emballages, site ou application, Instagram) ; 4. mettre en place les outils (Click & Collect sans commission, paiement par QR code, fidélité) ; 5. suivre et ajuster (shootings, réels, publications, tableau de bord des ventes, point mensuel).

Canaux travaillés : référencement local Google (fiche Google, SEO), Instagram et réels, publicité Meta et Google, optimisation Uber Eats avec photos professionnelles des plats, prospection d’entreprises et d’événements. Équipe : Malik Younes avec un réseau de photographes, vidéastes (dont drone) et développeurs.

Cas réel : Pasta Mo’, street food italienne à Genève (identité, site pour les commandes d’entreprises, Instagram, prospection d’organisateurs de courses). Izgara 35, grill d’Izmir à Onex, est un exemple FICTIF de démonstration.

${SITE.nom} est une entreprise individuelle de ${SITE.responsable}, ${SITE.adresse}, ${SITE.localite}, ${SITE.pays}. Téléphone : 078 213 38 68. Contact : ${SITE.email}. Instagram : @${SITE.instagram}. Zones : Genève, Carouge, Onex, Meyrin, Lancy, Nyon, Morges, Lausanne, La Côte.

## Pages

- [Accueil](${SITE.url}/) : l’accompagnement en 5 étapes, l’équipe, les canaux, Pasta Mo’, Izgara 35 (démonstration), questions fréquentes, contact
- [Restaurants](${SITE.url}/restaurants/) : démonstrations de sites de restaurants (carte, plat du jour, plat en 3D, réservation)
- [Artisans](${SITE.url}/artisans/) : sites, photos et réels pour chocolatiers, pâtissiers et boulangers
- [Offres](${SITE.url}/offres/) : sites web, vidéo et réseaux sociaux, design ; toutes les formules sont sur devis
- [Réalisations](${SITE.url}/realisations/) : Pasta Mo', animations au défilement, exemple de réel
- [Questions fréquentes](${SITE.url}/questions/) : délais, shooting, options
- [Contact](${SITE.url}/contact/) : demande de devis, réponse sous 24 heures

## Questions fréquentes

${QUESTIONS.map(({ q, r }) => `### ${q}\n\n${r}`).join('\n\n')}
`;
  return new Response(texte, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
