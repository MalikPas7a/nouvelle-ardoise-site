---
name: project-conventions
description: Conventions de nommage et d'API du dépôt nouvelle-ardoise-site — tout en français, attributs data-* en progression du film, API de recette en expando, choix défendus par le cahier
metadata:
  type: project
---

Tout est en français : identifiants, commentaires, classes CSS, variables CSS, clés d'objets (`decodees`, `chargees`, `souris`/`tactile`). Noms courts et imagés (`ouvrier`, `embaucher`, `mourir`, `vivifier`, `aimanter`, `poser`).

**Conventions d'API observées**
- Fenêtres de texte : `data-de` / `data-a` / `data-f` exprimées en **p du film** (p = (image − 1)/263), pas en scroll ; sentinelles `-1` et `9` pour « depuis le début » / « jusqu'à la fin » (prescrites par le cahier §4-5).
- `s` = progression de scroll (avant `montage()`), `p` = progression du film (après). Le bon utilise `data-s` mais est comparé à `p` (cahier §5).
- API de recette : `section.aller(p)` (null = rendre la main), `section.etat()` → `{ p, image, dessinee, decodees, chargees, taille, mode }` ; même forme que l'ancien `vitrine.js`. Absente si `calme` ou sans canvas.
- Variables CSS posées par film.js : section `--p --flash --eponge --fin --cache --voile`, html `--flash`, scène `--ix --iy --iw --ih`, textes `--o --y --zx --zy --zw --zh` ; classes `vivant pret pique` (section), `tactile aimante` (html), `actif` (textes), `passe ici` (bon).
- `taches.push(fn)` ; une tâche renvoie `true` tant qu'elle veut rester éveillée.

**Why:** le cahier (§6.1, §6.5, §6.6, §7.1) écrit ces formes mot pour mot ; les écarts de nommage (`data-s`, `--fin`, sentinelles) sont donc des choix du cahier, pas de l'intégrateur.

**How to apply:** ne pas re-signaler comme défaut ce que le cahier prescrit explicitement ; le marquer « à valider » si c'est un vrai problème de lisibilité. Signaler sans réserve ce que le cahier ne couvre pas (robustesse aux entrées invalides, replis silencieux, état de vie dans `etat()`). Voir [[project-film-accueil]].
