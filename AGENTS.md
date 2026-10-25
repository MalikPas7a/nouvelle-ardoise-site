## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Sites clients : compétences de mouvement

Compétences de design dans `.claude/skills/`, à utiliser pour toutes les créations Nouvelle Ardoise (sites, maquettes clients, box, visuels) :

- Meng To (MIT) : `build-awwwards-quality-sites`, `cinematic-gsap-lenis-motion-system`, `masked-reveal`.
- Emil Kowalski (MIT, github.com/emilkowalski/skills) : `emil-design-eng` (finition UI, détails, mouvement), `animate`, `review-animations`, `improve-animations`, `find-animation-opportunities`, `animation-vocabulary`, `animation-performance`, `break-ui` (pousser l'interface dans ses cas limites).
- Impeccable (Apache 2.0, github.com/pbakaus/impeccable) : `impeccable` (critique, audit, polish, typographie, mise en page, couleurs, adaptation mobile).
- Taste (MIT, github.com/Leonxlnx/taste-skill) : `taste-skill` (direction artistique moins générique, références, contrôle dans un vrai navigateur).

Boucle de travail : direction choisie avec Malik, puis code, puis contrôle dans un navigateur (Playwright, déjà installé dans le conteneur) avec captures bureau et iPhone, puis `impeccable` critique/audit et `review-animations`, puis corrections. Nos règles passent avant les leurs :

- Jamais de plat, de burger ou de nourriture générés par IA : uniquement les vraies photos du client ou du photographe. L'IA sert seulement à animer ou agrandir une vraie photo.
- Jamais d'alcool, dans aucun texte ni visuel.
- Un seul moteur de défilement (Lenis), toujours coupé sous `prefers-reduced-motion`.
- Pas de curseur personnalisé ni d'effet magnétique sur un site de restaurant, sauf demande explicite.
- Choisir la direction artistique avec Malik avant de coder (guide `/mnt/project-files/styles/guide-styles.md`).
- Les images d'archives ou de musées proposées par `taste-skill` ne remplacent jamais une photo de plat : la nourriture vient toujours du client ou du photographe.
