---
name: audit-excellence
description: Audit d'excellence Nouvelle Ardoise, à lancer à CHAQUE itération d'un site ou d'une maquette client avant de la montrer à Malik ou au client. Mesures automatiques (iPhone + bureau, Lighthouse, Core Web Vitals, WCAG 2.2, SEO, signes « IA slop », règles NA) puis grille notée sur 100 en 10 axes (design, anti-IA, iPhone, mouvement, performance, accessibilité, SEO local, conversion, contenu, comparaison aux meilleurs sites du secteur). Utiliser quand on dit « audit », « audite », « est-ce au niveau », « avant de publier », « contrôle qualité », ou après chaque série de corrections.
---

# Audit d'excellence

> **Règles Nouvelle Ardoise (passent avant tout le reste).**
> - Jamais de plat, de burger ou de nourriture générés par IA : uniquement les vraies photos du client ou du photographe.
> - Jamais d'alcool ; jamais crédit, financement ou prêt, dans aucun texte ni visuel.
> - Pas de curseur personnalisé ni d'effet magnétique sur un site de restaurant, sauf demande ; un seul moteur de défilement (Lenis), coupé sous `prefers-reduced-motion`.
> - Aucun prix Nouvelle Ardoise sur un site ou une démo, sauf demande de Malik.
> - Un visuel flou, bricolé ou qui « fait IA » est un bloquant : on ne livre pas, on le dit et on propose mieux.

Le but n'est pas « pas d'erreur » mais **une page qu'une agence haut de gamme signerait**. Un audit se rejoue à l'identique à chaque itération : mêmes mesures, même grille, même format, pour voir la note monter.

## Quand le lancer

- Avant chaque aperçu envoyé à Malik ou au client (maquette, démo `/demos/<client>/`, site final).
- Après chaque série de corrections, pour vérifier que la note monte et qu'aucun bloquant n'est revenu.
- Avant de demander « publie ».

## Procédure (toujours dans cet ordre)

### 1. Mesurer (5 minutes, automatique)

Sur l'aperçu Vercel de la PR, sur `astro preview`, ou sur le site en ligne :

```bash
node .claude/skills/audit-excellence/scripts/audit.mjs <url> --out /tmp/audit-<client>-v<N>
```

Le script (lecture seule) produit dans le dossier : `mesures.md` (bloquants, améliorations, chiffres), `rapport.json`, `lighthouse.json` et 4 captures (iPhone 15 et bureau 1440, premier écran et page entière). Il installe une seule fois axe-core et Lighthouse dans `~/.cache/na-audit`. Ajouter `--no-lighthouse` si le réseau bloque npm.

Il mesure : débordement horizontal iPhone, cibles tactiles < 44 px, champs < 16 px (zoom iOS), familles et tailles de police, texte < 12 px, WCAG 2.2 AA (axe-core), Lighthouse mobile (LCP, CLS, TBT, scores), poids par type, images lourdes, erreurs console et ressources en 404, Lenis sous mouvement réduit, curseur masqué, texte en dégradé, emojis dans titres et boutons, majuscules espacées, animations infinies, title, description, canonical, hreflang, og:image, JSON-LD, H1 unique, actions visibles au premier écran, liens `tel:` et itinéraire, et les mots interdits (alcool, crédit).

Pour chaque page importante (accueil, carte, commande, réservation, une page ville), lancer le script séparément.

### 2. Regarder (10 minutes, à l'œil)

Ouvrir les 4 captures **en taille réelle** et parcourir la page sur iPhone (Playwright `devices['iPhone 15']`) en faisant défiler. Le script ne voit pas le goût : c'est cette étape qui juge le design, les photos, la typo et le mouvement. Pour le mouvement, enregistrer une courte vidéo du défilement (Playwright `recordVideo`) et la relire.

### 3. Noter avec la grille

Remplir les 10 axes de `references/grille.md` (note sur 10 chacun, pondérée, total sur 100). Chaque axe a des critères vérifiables et des **bloquants** : un seul bloquant plafonne la note de l'axe à 4/10 et empêche le statut « Excellence ».

Pour l'axe 10, comparer la page à 3 sites de référence du secteur pris dans `references/references-secteur.md` : mêmes captures iPhone premier écran côte à côte, et une phrase honnête par critère (« eux mieux / nous mieux / égal »).

### 4. Rendre le verdict

Statuts :

| Note | Statut | Ce qu'on fait |
|---|---|---|
| ≥ 90 et aucun bloquant | **Excellence** | On peut montrer et demander « publie » |
| 80-89 | **Pro** | Montrable à Malik avec la liste des 3 corrections prioritaires |
| 65-79 | **Correct** | Corriger avant de montrer au client |
| < 65 ou un bloquant | **À reprendre** | Ne pas montrer, corriger d'abord |

Format du rapport (fichier `audit-v<N>.md` à côté des captures, jamais dans le message) :

```
# Audit d'excellence : <client>, <page>, v<N> (<date>)
Note : <total>/100 (v<N-1> : <ancienne note>) · Statut : <statut> · Bloquants : <n>

| Axe | Note | Poids | Points | Constat en une ligne |
|---|---|---|---|---|
...

## Bloquants
## Les 5 corrections qui rapportent le plus (ordre d'impact, avec le skill à utiliser)
## Comparaison secteur (3 sites, captures côte à côte)
## Ce qui est déjà au niveau (à ne pas casser)
```

Au message pour Malik : la note, le statut, l'évolution depuis la version précédente, les 3 corrections prioritaires. Rien de plus.

## Quel skill pour corriger quoi

| Axe faible | Skill à charger |
|---|---|
| Design, hiérarchie, typo, couleurs | `impeccable` (critique, polish, typeset, layout, colorize), `hallmark`, `taste-skill` |
| Signes « IA slop » | `unslop` (9 passes), `hallmark` |
| Finition et micro-détails UI | `emil-design-eng`, `web-interface-guidelines`, `break-ui` |
| Mouvement | `review-animations`, `improve-animations`, `animation-performance`, `cinematic-gsap-lenis-motion-system`, `motion-design` |
| Performance, Core Web Vitals | `core-web-vitals`, `performance` |
| Accessibilité | `accessibility` |
| SEO technique et local | `seo`, `seo-audit` (fiche Google, SEO local), `schema` (JSON-LD Restaurant, Menu) |
| Visibilité dans ChatGPT, Perplexity, Google IA | `ai-seo` |
| Conversion (commander, réserver, appeler) | `cro`, `copywriting` |
| Sécurité, bonnes pratiques | `best-practices` |
| Vue d'ensemble qualité web | `web-quality-audit` |

## Pièges connus

- Lighthouse en conteneur mesure en labo (CPU simulé lent) : comparer les versions entre elles, pas au chiffre de PageSpeed Insights. Pour le vrai terrain, PageSpeed Insights sur l'URL en ligne.
- Un score axe à zéro n'est pas une page accessible : tester aussi le clavier (Tab dans toute la page, focus visible) et le zoom texte 200 %.
- Les mots interdits sont cherchés tels quels : vérifier le contexte (« vin » dans « ravin » n'est pas compté, mais « gin » peut apparaître dans un nom propre).
- Les captures pleine page d'un site avec Lenis ou des animations au défilement peuvent montrer des blocs vides : le script fait défiler toute la page avant, mais relire à l'œil.
- Astro : penser au piège `:global(.js)` en style scopé si des blocs restent invisibles sans JavaScript.
