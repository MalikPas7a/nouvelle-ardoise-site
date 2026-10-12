---
name: project-film-mise-en-place
description: Contexte du chantier « accueil = film La mise en place » (Astro, séquence WebP au scroll) — cahier faisant foi, phase 2 (dossier g 16:9), état du rendu, règles non négociables de Malik
metadata:
  type: project
---

Le cahier des charges `/mnt/project-files/site/cahier-mise-en-place.md` (≈ 600 l.) fait foi sur le code ; quand il est muet, solution la plus simple + note dans « doutes ».

**Pourquoi :** Malik (propriétaire) a tranché chaque point contesté dans ce cahier ; les devs travaillent en parallèle sur d'autres fichiers du même dépôt (ne toucher qu'aux fichiers attribués, jamais de git).

**État au 2026-10-12 :** seules les images 001-214 de `public/sequences/mise-en-place-v1/m/` existent (rendu dev 540×960) ; le rendu final 720×1280 remplacera les fichiers sans changer les noms ; les images ne sont pas suivies par git (voulu). Phase 2 = dossier `g/` 1920×1080 activé par `data-tailles="m,g"` (promesse du cahier : « sans toucher au HTML » — en réalité il faut aussi `<source media>` pour l'affiche, preload g et `data-zone-g`).

**Règles de Malik (violation = bloquant) :** jamais d'alcool dans un visuel ; rien ne bouge en HTML pendant que la craie écrit (images 6-54 et 234-258) ; au doigt chaque arrêt tombe sur une image stable, aucun sauté ; chargement rapide ; pas d'effet vidéo automatique (tout au scroll) ; texte du haut lisible sur téléphone ; pas de « cinq métiers ».

**Comment appliquer :** lire le cahier EN ENTIER avant tout constat ; vérifier chaque constat contre ces règles pour la gravité ; les constats déjà connus de l'intégrateur sont fournis dans la tâche, ne pas les répéter. Voir [[reference-outils-verification-film]] et [[feedback-format-constats]].
