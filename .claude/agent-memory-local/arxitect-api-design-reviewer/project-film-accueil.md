---
name: project-film-accueil
description: Disposition du site Nouvelle Ardoise (Astro 7 statique, GitHub Pages) et du film « La mise en place » de l'accueil — modules, frontières, où est le cahier des charges et les scripts de recette
metadata:
  type: project
---

Site vitrine de Nouvelle Ardoise (agence marketing restauration, Genève), Astro 7 statique sur GitHub Pages. L'accueil (`src/pages/index.astro`) s'ouvre sur un film de 264 images WebP lu au scroll.

**Modules et frontières (octobre 2026)**
- `src/scripts/defilement.js` : boucle rAF unique pour toute la page, exporte `taches` (tableau mutable), `calme`, `borne`, `reveiller()` ; contient aussi `sequence()` pour les autres pages (`[data-sequence]`), carte horizontale, plat 3D, portes.
- `src/scripts/film.js` : lecteur du film (`[data-film]`), aucune boucle propre, pousse une tâche dans `taches`. Expose `section.aller(p)` / `section.etat()` (API de recette, expando sur l'élément).
- `src/scripts/motion.js` : Lenis (souris seulement) + révélation des titres ; redéfinit `calme`/`souris` localement.
- CSS du film : bloc « Accueil : le film » dans `src/styles/global.css` (≈ l.702-806).
- Images : `public/sequences/mise-en-place-v1/m/001-264.webp`, **non suivies par git** (voulu) ; rendu de dev 540×960 partiel (001-214), rendu final 720×1280 à venir, `g/` (1920×1080) en phase 2.

**Why:** le film remplace une vitrine Three.js ; `three` reste en dépendance transitive de model-viewer (/restaurants/), connu.

**How to apply:** le cahier des charges `/mnt/project-files/site/cahier-mise-en-place.md` (≈ 584 l.) fait foi sur le code ; §6 (film.js), §7 (defilement), §8 (CSS), §12 (replis), §16 (checklist). Les scripts Playwright de recette vivent dans le scratchpad de session (`banc/test.cjs`, `pw/capture.mjs`, `pw/verif-accueil.cjs`) et appellent `aller(p)` puis dorment ~1,2 s. Captures et `bilan.json` dans `/mnt/project-files/site/apercu-mise-en-place/`. Voir [[project-conventions]] et [[user-malik-regles]].
