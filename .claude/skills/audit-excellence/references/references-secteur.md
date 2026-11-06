# Sites de référence par secteur (axe 10)

Point de départ pour la comparaison. Choisir 3 sites au **même positionnement** que le client (prix, ambiance, service), en prendre les captures iPhone premier écran avec le même script, et les ranger dans le dossier du client. Les sites changent : revérifier chaque fois et compléter la liste quand on trouve mieux (Awwwards, catégorie « Food & Drink » ; `styles.refero.design`).

Ne copier ni leurs textes, ni leurs photos, ni leur identité : on compare, on ne reproduit pas. Si un site montre de l'alcool, on le compare sans jamais reprendre cet élément.

URL vérifiées le 06.11.2026 (réponse 200 ; Black Tap et Shake Shack bloquent les robots, les ouvrir dans le Chrome de Malik).

## Burger, fast casual premium

| Site | Ce qu'il fait le mieux |
|---|---|
| pnyburger.com (PNY, Paris) | Identité forte, photo produit plein cadre, commande rapide |
| bigfernand.com (Big Fernand) | Ton de marque, récit français, carte claire |
| blendhamburger.com (Blend, Paris) | Simplicité, photo, adresses |
| holycow.ch (Holy Cow!, Suisse romande) | Concurrent direct en Suisse : commande, adresses, langues |
| burgerfuel.com (BurgerFuel) | Personnalité graphique, parcours de commande |
| blacktap.com (Black Tap) | Plusieurs villes dans le monde, pages par ville |
| shakeshack.com (Shake Shack) | Référence de l'appli et de la commande mobile |

Audit APB déjà fait (9 sites, planches) : `/mnt/project-files/clients/atelier-burger/site-final/audit-sites-burger/`.

## Restaurant, brasserie, bistronomie

| Site | Ce qu'il fait le mieux |
|---|---|
| dishoom.com (Dishoom) | Récit et histoire du lieu, pages par adresse, réservation |
| bigmammagroup.com (Big Mamma) | Groupe multi-adresses, énergie, photos réelles |
| septime-charonne.fr (Septime) | Sobriété extrême, réservation en un geste |
| noma.dk (Noma) | Direction artistique, rythme éditorial |
| ottolenghi.co.uk (Ottolenghi) | Lien restaurant, livres, boutique |

## Pâtisserie, boulangerie, chocolat

| Site | Ce qu'il fait le mieux |
|---|---|
| cedric-grolet.com (Cédric Grolet) | Produit en héros, fond neutre, luxe |
| pierreherme.com (Pierre Hermé) | Coffrets, e-commerce, codes du luxe |
| laduree.fr (Ladurée) | Coffrets cadeaux, univers de marque |
| poilane.com (Poilâne) | Héritage, artisanat, livraison |
| tartinebakery.com (Tartine) | Simplicité, photos de fournil |

## Comment comparer (15 minutes)

1. Lancer `scripts/audit.mjs --no-lighthouse` sur chacun des 3 sites (ou captures à la main si bloqué) pour avoir le premier écran iPhone dans les mêmes conditions.
2. Planche 4 colonnes (les 3 + nous) : `ffmpeg -i a.jpg -i b.jpg -i c.jpg -i nous.jpg -filter_complex hstack=4 planche.jpg` (redimensionner à la même hauteur avant).
3. Répondre aux 5 questions de l'axe 10 de la grille, une phrase chacune, honnêtement.
4. Noter une idée concrète à reprendre (un principe, jamais un élément copié).
