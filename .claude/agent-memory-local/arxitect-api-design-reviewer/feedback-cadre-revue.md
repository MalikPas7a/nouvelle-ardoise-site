---
name: feedback-cadre-revue
description: Cadre imposé aux revues sur nouvelle-ardoise-site — constats en français (fichier, ligne, description, correction), aucune modification, aucun git, le cahier des charges gagne sur le code
metadata:
  type: feedback
---

Rendre uniquement des constats précis (fichier, ligne, description, correction proposée) en français, via la sortie structurée ; ne modifier aucun fichier, ne lancer aucune commande git, n'installer aucun paquet, n'appeler aucun outil mcp__hearthbot.

**Why:** d'autres développeurs travaillent en même temps sur le dépôt ; le lanceur fusionne les constats de plusieurs revues (une liste de « constats déjà connus » est fournie pour éviter les doublons).

**How to apply:** lire le cahier en entier avant de juger ; quand cahier et code divergent, le cahier gagne ; quand le cahier est muet, la solution la plus simple est attendue. Ne pas répéter les constats déjà connus ; les compléter seulement s'il y a un angle nouveau. Mémoire : la trame `agents/reviewer-memory-guide.md` n'est pas dans le dépôt mais dans le dossier du plugin (`…/skills/api-design-review/../../agents/`). Voir [[user-malik-regles]].
