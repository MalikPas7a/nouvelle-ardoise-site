// Plan du site pour Google, construit à chaque compilation : toute nouvelle page y figure d'elle-même.
import { SITE } from '../config.js';
import { ANIMATIONS } from '../data/animations.js';

const PAGES = ['/', '/restaurants/', '/artisans/', '/realisations/', '/offres/', '/questions/', '/contact/',
  ...ANIMATIONS.map((a) => `/animations/${a.id}/`), '/mentions-legales/', '/confidentialite/'];

export function GET() {
  const jour = new Date().toISOString().slice(0, 10);
  const urls = PAGES.map((p) => `  <url><loc>${SITE.url}${p}</loc><lastmod>${jour}</lastmod></url>`).join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
