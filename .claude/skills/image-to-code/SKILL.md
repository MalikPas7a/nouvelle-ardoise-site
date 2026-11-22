---
name: image-to-code
description: Transformer une image (capture d'écran, maquette Figma exportée, photo d'un croquis, page d'un site existant, vidéo d'écran) en vraie page codée dans le site Nouvelle Ardoise (Astro), puis la comparer à l'image dans un navigateur jusqu'à ce qu'elle colle. Utiliser pour « code-moi ça », « refais cette maquette », « reproduis cette section », « transforme cette capture en page ».
---

> **Règles Nouvelle Ardoise (passent avant tout le reste).** Méthode reprise de Screenshot to Code (github.com/abi/screenshot-to-code, MIT, Abi Raja, commit f2e5bbd). L'appli elle-même n'est pas installée : elle demande ses propres clés OpenAI ou Anthropic payantes, et Claude lit déjà les images. On garde ses consignes de reproduction et on ajoute la comparaison automatique.
> - On reproduit **nos** maquettes, celles de Malik ou de Figma, ou la mise en page d'un site **du client**. Le site d'une autre marque sert seulement de référence de composition : jamais son logo, ses textes, ses photos ni ses polices propriétaires.
> - Nourriture : uniquement les vraies photos du client ou du photographe. Ne jamais générer une image de plat pour remplacer une image de la capture ; laisser un emplacement et le dire.
> - Jamais d'alcool, jamais crédit/financement/prêt. Pas de curseur personnalisé ni d'effet magnétique sur un site de restaurant. Lenis seul, coupé sous `prefers-reduced-motion`.
> - Pas de Tailwind par CDN, pas de Font Awesome, pas de React par script : on code dans la pile du site (composants Astro, CSS scopé, `:global(.js)` pour les styles posés par script).

# Image vers code

## 1. Lire l'image

- Repérer les sections de haut en bas, la grille (nombre de colonnes, marges), les couleurs (relever les codes à la pipette : `python3 -c "from PIL import Image; print(Image.open('ref.png').convert('RGB').getpixel((x, y)))"`), les polices (famille proche disponible, graisse, taille relative), les rayons et les ombres.
- Plusieurs captures : pages différentes → pages distinctes reliées ; onglets d'une appli → navigation entre eux ; captures sans lien → une page par capture.
- Capture de téléphone : ne pas reproduire le cadre du téléphone ni la barre du navigateur, seulement l'interface.
- Si un `DESIGN.md` existe pour le client (skill `design-md`), il passe avant ce que l'image laisse deviner.

## 2. Coder

- Reprendre **le texte exact** de l'image.
- Images : découper les vrais éléments de la capture (logo, pictos, photos du client) avec PIL plutôt que de les redessiner ; une image floue ou trop petite ne s'étire pas en CSS, on demande l'original. Ne jamais coller la capture entière comme image de fond : on code la mise en page.
- Code d'un seul tenant pour une nouvelle page ; pour une page existante, modifier seulement ce qui est demandé.
- Responsive dès le départ : si l'image est en bureau, décider la version iPhone (et l'inverse).

## 3. Comparer, corriger, recommencer

```bash
astro dev --background                      # ou l'URL d'aperçu Vercel
node .claude/skills/image-to-code/scripts/capture.mjs http://localhost:4321/<page>/ <largeur de la référence> /tmp/rendu.png
python3 -I .claude/skills/image-to-code/scripts/compare.py ref.png /tmp/rendu.png /tmp/planche.png
```

- Regarder la planche (référence | rendu | écarts en rouge) et corriger d'abord les plus grandes zones rouges : décalage de mise en page, puis tailles de texte, puis couleurs, puis détails.
- Refaire la capture en iPhone (`capture.mjs <url> 393 /tmp/iphone.png mobile`) même si la référence est en bureau.
- S'arrêter quand l'écart ne vient plus que du texte de rendu ou des photos manquantes, puis passer `audit-excellence` comme pour toute page.

Voir aussi : `design-md`, `taste-skill`, `impeccable`, `web-interface-guidelines`, et les outils Figma branchés (`figma:figma-design-to-code`) quand la maquette est dans Figma : partir du fichier Figma plutôt que d'une capture.
