// L'entité « Nouvelle Ardoise » pour les données structurées : la même sur toutes les pages (même @id), reprise dans llms.txt.
// Les moteurs de réponse recoupent nom, adresse, téléphone, prestations et zone : une seule source, pas de divergence.
import { SITE } from '../config.js';
import { EXPERTS } from './savoir-faire.js';

export const VILLES = ['Genève', 'Carouge', 'Onex', 'Meyrin', 'Lancy', 'Versoix', 'Nyon', 'Gland', 'Rolle', 'Morges', 'Lausanne', 'Vevey', 'Montreux', 'Yverdon-les-Bains'];
export const DESCRIPTION_AGENCE = 'Agence de marketing et de communication à Genève pour les commerces, restaurants, artisans, cabinets et PME de Genève et Vaud\u202F: fiche Google, site, Instagram, publicité, vente en ligne, un seul interlocuteur.';

export const AGENCE = {
  '@type': ['ProfessionalService', 'LocalBusiness'], '@id': SITE.url + '/#agence', name: SITE.nom, url: SITE.url + '/', description: DESCRIPTION_AGENCE,
  slogan: 'Qu’on vous trouve. Qu’on vous choisisse.',
  email: SITE.email, telephone: '+41782133868', image: SITE.url + '/partage-commerces.jpg', logo: SITE.url + '/apple-touch-icon.png',
  founder: { '@type': 'Person', name: SITE.responsable, jobTitle: 'Fondateur', sameAs: ['https://www.instagram.com/' + SITE.instagram + '/'] },
  address: { '@type': 'PostalAddress', streetAddress: SITE.adresse, postalCode: SITE.localite.split(' ')[0], addressLocality: 'Genève', addressRegion: 'GE', addressCountry: 'CH' },
  areaServed: [...VILLES, 'Canton de Vaud', 'Suisse romande'].map((n) => ({ '@type': 'Place', name: n })),
  knowsAbout: ['Marketing local', 'Référencement local Google', 'Fiche Google', 'Référencement dans les assistants IA (GEO)', 'Site web', 'Instagram et réels', 'Publicité Google Ads', 'Publicité Meta Ads', 'Vente en ligne', 'Prise de rendez-vous en ligne', 'Identité visuelle', 'Photo et vidéo', 'Marketing de restaurant'],
  knowsLanguage: ['fr'],
  contactPoint: { '@type': 'ContactPoint', telephone: '+41782133868', email: SITE.email, contactType: 'customer service', availableLanguage: ['fr'], areaServed: 'CH' },
  makesOffer: EXPERTS.map((e) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: e.service, serviceType: e.service, description: e.texte, areaServed: 'Genève et Vaud', provider: { '@id': SITE.url + '/#agence' } } })),
  sameAs: ['https://www.instagram.com/' + SITE.instagram + '/'], inLanguage: 'fr-CH',
};

export const SITE_WEB = { '@type': 'WebSite', '@id': SITE.url + '/#site', url: SITE.url + '/', name: SITE.nom, inLanguage: 'fr-CH', publisher: { '@id': SITE.url + '/#agence' } };
