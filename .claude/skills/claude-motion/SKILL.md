---
name: claude-motion
description: Boîte à outils motion de whaleyxbt (Remotion + moteur de bruitages en Python + boucle de relecture image par image + simulations web capturées en 60 i/s). Utiliser pour monter une vidéo motion en Remotion, la relire planche par planche avant de la livrer, ou faire une simulation 3D/particules rendue en mp4.
---

> **Règles Nouvelle Ardoise (priorité absolue sur tout ce qui suit)**
> - AUCUNE MUSIQUE, jamais : ni piste fournie, ni musique synthétisée en code, ni « bed », pad, groove ou boucle rythmique. Le `pad` de l'exemple `sfx/cues/effort.py` et l'option `--music` des sims ne s'utilisent pas.
> - Son autorisé : voix off, quelques vrais bruitages sobres et rares, des silences. JAMAIS `whoosh()`, `riser()` ni `impact()` du moteur `sfx/`.
> - Jamais d'alcool, dans aucun texte ni visuel. Nourriture : uniquement les vraies photos du client ou du photographe.

# claude-motion

Ce dossier est le projet complet (MIT, github.com/whaleyxbt/claude-motion). Travailler depuis ce dossier : `cd .claude/skills/claude-motion && npm install`. Playwright et Chromium sont déjà dans le conteneur cloud (ne pas réinstaller Chromium).

Lire selon la tâche :

- `guides/motion-design.md` : les règles de goût chiffrées (courbes, ressorts, décalages, temps de lecture, typo, une seule couleur d'accent).
- `guides/review-loop.md` : rendre un brouillon, sortir une planche d'images par repère, se relire avant de livrer. À faire sur toute vidéo.
- `guides/sound-design.md` : le moteur `sfx/` (sons synthétisés, calés sur `timeline.json`). Seulement clics, pops et tics discrets, voir règles ci-dessus.
- `guides/web-sims.md` et `sims/README.md` : une page web dont `render(t)` dépend du temps, capturée en mp4 60 i/s.
- `AGENTS.md` et `README.md` : vue d'ensemble et commandes.
