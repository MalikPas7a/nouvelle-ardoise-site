---
name: reference-outils-verification-film
description: Où trouver les captures, le bilan.json et Playwright pour vérifier l'accueil (film) ; comment servir le site construit sans tuer son shell
metadata:
  type: reference
---

- Captures par jalon (téléphone `tel-NNNN.png`, ordinateur `ordi-NNNN.png`, `tel-calme`, `*-tab-passer`) : `/mnt/project-files/site/apercu-mise-en-place/`
- `bilan.json` (même dossier) : `section.etat()` par jalon, variables CSS, géométrie, erreurs, n404.
- Playwright : `/tmp/claude-0/-home-user-nouvelle-ardoise-site/c7fbff1a-a634-51a0-9ee4-d456b0169212/scratchpad/pw` (`require('playwright')` depuis ce dossier, `chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })`).
- Servir le build : `npm run build` puis `nohup npx astro preview --port 4329 > /tmp/preview.log 2>&1 &` dans une commande à part ; arrêter avec `pkill -f "astro previe[w]"` (sans le crochet, pkill tue aussi le shell). Pas de build pendant une capture ; machine lente (Blender en parallèle), timeouts généreux.
- API de recette exposée par film.js : `document.querySelector('.film').aller(p)` / `.etat()`.

Lié : [[project-film-mise-en-place]].
