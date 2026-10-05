// /llms.txt : un résumé en texte simple de l'agence, pour les moteurs de réponse (ChatGPT, Perplexity,
// Gemini, Claude). Format proposé sur llmstxt.org : titre, résumé, puis liens commentés.
import { SITE } from '../config.js';
import { QUESTIONS } from '../data/questions.js';

export function GET() {
  const texte = `# ${SITE.nom}

> Agence de marketing digital pour les restaurants et les boutiques gourmandes (cafés, boulangeries, pâtisseries, chocolateries) de Genève et Vaud, en Suisse. Création de sites web, shooting photo et réels tournés chez le client, gestion des réseaux sociaux et de la publicité. Prix fixes et affichés.

${SITE.nom} est une entreprise individuelle de ${SITE.responsable}, ${SITE.adresse}, ${SITE.localite}, ${SITE.pays}. Contact : ${SITE.email}.

## Pages

- [Accueil](${SITE.url}/) : présentation de l'agence
- [Restaurants](${SITE.url}/restaurants/) : démonstrations de sites de restaurants (carte, plat du jour, plat en 3D, réservation)
- [Artisans](${SITE.url}/artisans/) : sites, photos et réels pour chocolatiers, pâtissiers et boulangers
- [Offres et prix](${SITE.url}/offres/) : sites dès CHF 999, réseaux sociaux dès CHF 490 par mois
- [Réalisations](${SITE.url}/realisations/) : Pasta Mo', animations au défilement, exemple de réel
- [Questions fréquentes](${SITE.url}/questions/) : prix, délais, shooting, options
- [Contact](${SITE.url}/contact/) : demande de devis, réponse sous 24 heures

## Questions fréquentes

${QUESTIONS.map(({ q, r }) => `### ${q}\n\n${r}`).join('\n\n')}
`;
  return new Response(texte, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
