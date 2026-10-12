---
name: project-film-accueil
description: Contexte de la refonte de l'accueil « La mise en place » (film au scroll, film.js) — règles de Malik, place du cahier, échelle de gravité attendue par le workflow, état du rendu (2026-10-12)
metadata:
  type: project
---

L'accueil est refait autour d'un film de 264 images WebP lu au scroll (src/scripts/film.js + defilement.js), d'après un cahier des charges externe au dépôt (voir [[reference-cahier-et-apercus]]). Le cahier fait foi sur le code ; quand il est muet, solution la plus simple + note dans « doutes ».

**Règles de Malik (propriétaire)** : jamais d'alcool (verre, bouteille) dans un visuel ; rien ne bouge en HTML pendant que la craie écrit (images 6-54 et 234-258) ; au doigt chaque arrêt tombe sur une image stable, aucun sauté ; chargement rapide ; aucun effet « vidéo » automatique, tout est au scroll ; texte du haut lisible sur téléphone ; pas de « cinq métiers ».

**Échelle de gravité du workflow de revue** : bloquant = casse le site ou viole une règle de Malik ; majeur = visible par Malik ou risque réel sur téléphone ; mineur = qualité de code. Les constats sont rendus en français via StructuredOutput `{constats:[{gravite, fichier, ligne, description, correction}]}`, sans modifier de fichier, sans git.

**Décisions de conception qui ne sont pas des défauts** : le cahier §6 prescrit film.js comme UNE fonction `film(section)` (≈300 l.) sans boucle rAF propre, branchée sur `taches`/`reveiller()` de defilement.js ; `sequence()` de defilement.js est déclarée « inchangée » ; la mise en veille de la boucle (§7.1) est nouvelle. Un constat « fermeture géante » est donc mineur (qualité), pas majeur.

**État au 2026-10-12** : seules les images 001-214 (rendu dev 540×960) existent, non suivies par git (voulu) ; le rendu final 720×1280 remplacera les fichiers sans changer les noms. Les 404 sur 215-264 sont attendus.

**Why:** Malik a rejeté le flou du 540×960 agrandi et tient à l'absence de mouvement HTML pendant l'écriture ; le workflow classe les constats par cette échelle précise.
**How to apply:** vérifier d'abord les règles de Malik (bloquant), puis ce qui est visible au téléphone (majeur) ; ne pas surévaluer la structure imposée par le cahier.
