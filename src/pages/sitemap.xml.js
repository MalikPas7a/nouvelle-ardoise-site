// Plan du site pour Google, construit à chaque compilation : toute nouvelle page y figure d'elle-même.
// Les maquettes clients (/demos/) et la page de campagne /test/ (noindex) n'y figurent jamais.
import { SITE } from '../config.js';
import { ANIMATIONS } from '../data/animations.js';
import { VILLES_SEO } from '../data/villes-seo.js';

const MAJ = '2026-11-01';
const PAGES = [
  ['/', MAJ], ['/restauration/', '2026-10-30'], ['/entreprises-ia/', MAJ],
  ...VILLES_SEO.map((v) => [`/agence-marketing/${v.id}/`, MAJ]),
  ['/restaurants/', MAJ], ['/artisans/', '2026-10-30'], ['/realisations/', '2026-10-30'], ['/offres/', MAJ],
  ['/questions/', MAJ], ['/contact/', MAJ], ['/restaurant-tech/', MAJ],
  ...ANIMATIONS.map((a) => [`/animations/${a.id}/`, '2026-10-11']),
  ['/mentions-legales/', '2026-10-05'], ['/confidentialite/', MAJ],
];

export function GET() {
  const urls = PAGES.map(([p, d]) => `  <url><loc>${SITE.url}${p}</loc><lastmod>${d}</lastmod></url>`).join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
