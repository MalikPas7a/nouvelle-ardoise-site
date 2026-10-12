---
name: reference-cahier-et-apercus
description: Où trouver le cahier des charges de l'accueil, les captures Playwright par jalon, le bilan.json et l'installation Playwright hors dépôt
metadata:
  type: reference
---

- Cahier des charges (fait foi) : `/mnt/project-files/site/cahier-mise-en-place.md` (≈584 l. ; §3 timeline/jalons, §4 balisage, §5 textes, §6 film.js, §7 defilement/motion, §8 CSS, §12 replis, §16 checklist).
- Captures par jalon (téléphone 390×844, ordinateur 1440×900) : `/mnt/project-files/site/apercu-mise-en-place/tel-*.png`, `ordi-*.png` ; états `etat()`, variables CSS, géométrie et erreurs : `bilan.json` dans le même dossier.
- Playwright installé hors dépôt : `/tmp/claude-0/-home-user-nouvelle-ardoise-site/c7fbff1a-a634-51a0-9ee4-d456b0169212/scratchpad/pw` (`chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })`) ; site construit servi par `npx astro preview --port 4329` ; tuer avec `pkill -f "astro previe[w]"`.
- Scripts Blender et images-test : `/mnt/project-files/site/ardoise-3d/`.

Lié : [[project-film-accueil]].
