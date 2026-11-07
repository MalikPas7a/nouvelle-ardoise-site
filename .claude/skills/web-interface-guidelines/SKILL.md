---
name: web-interface-guidelines
description: Relire le code d'une interface (Astro, HTML, CSS, JS) contre les Web Interface Guidelines de Vercel : accessibilité, focus, formulaires, cibles tactiles, animations, typo, images, performance, navigation, mode sombre, i18n. Sortie en lignes fichier:ligne. Utiliser pour « relis mon UI », « vérifie les détails », « check best practices », ou comme passe de finition après impeccable.
---

> **Règles Nouvelle Ardoise (passent avant tout le reste).** Copie locale des Web Interface Guidelines (github.com/vercel-labs/web-interface-guidelines, MIT, Vercel Labs, commit 434b7f9). Le skill officiel va chercher les règles en ligne à chaque fois ; ici elles sont figées dans `guidelines.md` pour marcher hors réseau et ne pas changer sans relecture.
> - Jamais de nourriture générée par IA, jamais d'alcool, jamais crédit/financement/prêt.
> - Pas de curseur personnalisé ni d'effet magnétique sur un site de restaurant ; Lenis coupé sous `prefers-reduced-motion`.
> - Les exemples React (`onClick`, `<Link>`) s'appliquent aussi à Astro et au HTML : même règle, autre syntaxe.

# Web Interface Guidelines

1. Lire `guidelines.md` (les règles et le format de sortie). Pour le détail et les raisons de chaque règle, `regles-detaillees.md`.
2. Lire les fichiers indiqués (ou demander lesquels : en général `src/pages/demos/<client>/` et ses composants).
3. Vérifier chaque règle et sortir les écarts au format `fichier:ligne règle`, groupés par fichier, les plus graves d'abord.
4. Corriger seulement si on le demande ; sinon, rendre la liste.
