// /llms.txt : un résumé en texte simple de l'agence, pour les moteurs de réponse (ChatGPT, Perplexity,
// Gemini, Claude). Format proposé sur llmstxt.org : titre, résumé, puis liens commentés. Aucun prix : ils se discutent de vive voix.
import { SITE } from '../config.js';
import { QUESTIONS } from '../data/questions.js';
import { FAQ_GENERALE } from '../data/questions-generales.js';
import { EXPERTS } from '../data/savoir-faire.js';
import { VILLES } from '../data/agence.js';
import { VILLES_SEO } from '../data/villes-seo.js';

export function GET() {
  const texte = `# ${SITE.nom}

> Agence de marketing et de communication à Genève, pour les commerces, artisans, cabinets et PME de toute la Suisse romande (Genève, Vaud, Valais, Fribourg, Neuchâtel, Jura). Spécialité : la restauration et les métiers de bouche. Devise : « Qu’on vous trouve. Qu’on vous choisisse. » (signature : Place à la mise en place.). Un seul interlocuteur, Malik Younes, qui active un écosystème d’experts : photographe, vidéaste et drone, référencement Google (SEO et GEO), Google Ads, Meta Ads, développeurs.

## Ce que fait ${SITE.nom}

- Diagnostic de visibilité en direct et gratuit sur ${SITE.url}/ : on tape le nom du commerce, l’agence lit la fiche Google, le site, Instagram et la vente en ligne (4 voyants) et donne les 3 priorités du métier.
- Plusieurs savoir-faire, un seul interlocuteur (Malik Younes, entouré d’indépendants spécialisés) : ${EXPERTS.map((e) => e.service).join(' ; ')}. En détail : référencement local et fiche Google (être mieux placé quand on cherche le métier à côté de chez soi), GEO (être cité par ChatGPT, Gemini, Perplexity et Google quand on leur demande conseil : pages claires, données structurées, horaires et avis à jour), Google Ads (annonces sur les recherches exactes, dans le rayon, aux heures d’ouverture, appels et itinéraires mesurés), Meta Ads (réels tournés sur place diffusés au quartier sur Instagram et Facebook), développeur (commande à retirer sans commission, prise de rendez-vous, devis en ligne, paiement par QR code, tableau de bord), photographe, vidéaste et drone (jamais d’images générées par IA pour les produits), stratégie et bilan mensuel avec un seul interlocuteur.
- Socle commun à tous les métiers : fiche Google soignée (référencement local), site rapide pensé pour le téléphone, Instagram et réels tournés sur place, photo et vidéo professionnelles, publicité locale Google et Meta, bilan mensuel chiffré.
- Un outil par métier : commande à retirer et paiement par QR code (restauration), précommande en ligne (artisans de bouche), prise de rendez-vous en ligne (santé et bien-être, services), boutique en ligne (mode et boutiques), réservation directe sans commission (hébergement et loisirs), demandes de devis et portfolio de chantiers (artisans et bâtiment), LinkedIn et site institutionnel (entreprises et bureaux).
- Méthode en trois temps : le diagnostic (sur place et en ligne), les trois priorités avec un objectif chiffré, la mise en place, puis un bilan chaque mois : on teste, on apprend, on ajuste.
- Métiers accompagnés : restauration et cafés, artisans de bouche et épiceries, santé et bien-être, mode et boutiques, services de quartier, hébergement et loisirs, artisans et bâtiment, entreprises et bureaux.

## Où

Sur place dans toute la Suisse romande, depuis Genève : ${VILLES.join(', ')}. Entre deux visites, suivi en visio.

## Qui

${SITE.nom} est une entreprise individuelle de ${SITE.responsable}, ${SITE.adresse}, ${SITE.localite}, ${SITE.pays}. Téléphone : 078 213 38 68. Contact : ${SITE.email}. Instagram : @${SITE.instagram}. Cas réel : Pasta Mo’, marque familiale de pâtes fraîches et street food italienne à Genève (identité, site pour les commandes d’entreprises, Instagram, prospection d’organisateurs de courses). Izgara 35 (grill d’Izmir à Onex) est un exemple FICTIF de démonstration.

## Pages

- [Accueil](${SITE.url}/) : le test de visibilité en direct, le savoir-faire montré (fiche Google, assistants IA, Google Ads, Meta Ads, développeur, photographe, bilan), Pasta Mo', les 8 métiers, la zone d’intervention, la méthode, l’interlocuteur unique, questions fréquentes
- [Restauration](${SITE.url}/restauration/) : la branche restaurants et métiers de bouche, l’accompagnement en 5 étapes, l’équipe, les canaux, Pasta Mo', Izgara 35 (démonstration), questions fréquentes
- [Entreprises et IA](${SITE.url}/entreprises-ia/) : agents IA et outils internes pour les PME et ETI de Suisse romande, diagnostic de 30 minutes offert
- [Restaurants](${SITE.url}/restaurants/) : démonstrations de sites de restaurants (carte, plat du jour, plat en 3D, réservation)
- [Artisans](${SITE.url}/artisans/) : sites, photos et réels pour chocolatiers, pâtissiers et boulangers
- [Réalisations](${SITE.url}/realisations/) : Pasta Mo', animations au défilement, exemple de réel
- [Offres](${SITE.url}/offres/) : les formules, discutées de vive voix
- [Questions fréquentes](${SITE.url}/questions/) : délais, shooting, options
- [Contact](${SITE.url}/contact/) : demande de devis, réponse le jour ouvré suivant (sous 24 heures en semaine)
${VILLES_SEO.map((v) => `- [Agence marketing ${v.ville}](${SITE.url}/agence-marketing/${v.id}/) : ${v.description}`).join('\n')}

## Questions fréquentes

${FAQ_GENERALE.map(({ q, r }) => `### ${q}\n\n${r}`).join('\n\n')}

## Questions fréquentes (restauration)

${QUESTIONS.map(({ q, r }) => `### ${q}\n\n${r}`).join('\n\n')}
`;
  return new Response(texte, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
