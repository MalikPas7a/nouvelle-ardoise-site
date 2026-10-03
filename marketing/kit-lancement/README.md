# Kit de lancement Instagram : Nouvelle Ardoise

Ce dossier n'est pas publié sur le site : il sert uniquement aux réseaux sociaux.
Aucun prix n'apparaît dans les visuels ni dans les légendes.

## Contenu

| Fichier | Usage |
| --- | --- |
| `reel/reel-sushi-15s.mp4` | Réel 15 s, 1080×1920, 30 i/s, habillage sonore inclus |
| `reel/reel-sushi-15s-sans-son.mp4` | Le même sans son, à utiliser si vous posez un son tendance |
| `reel/couverture-reel.jpg` | Image de couverture du réel (le maki éclaté avec ses étiquettes) |
| `publication/publication-lancement.png` | Publication 4:5, 1080×1350 : « Passez l'éponge sur votre ancien menu. » |
| `logo/avatar-instagram-ardoise.png` | Photo de profil conseillée : le N lumineux sur l'ardoise, comme la carte de visite |
| `logo/avatar-instagram.png` | Photo de profil en aplat (version simple, sans texture) |
| `logo/logo-horizontal(-blanc).svg/.png` | Logo en ligne, pour fond clair ou fond sombre |
| `logo/logo-empile(-blanc).svg/.png` | Logo sur deux lignes, avec le trait de craie |
| `logo/symbole.svg/.png` | Le symbole seul (favicon, filigrane) |

Les SVG sont entièrement vectoriels (le texte est converti en tracés) : ils s'ouvrent
dans Illustrator, Figma ou Canva sans la police.

**L'univers** : comme sur la carte de visite, une ardoise usée, le N à la craie jaune qui
brille, un petit trait jaune en haut à gauche, et des mots effacés d'un coup d'éponge
(« Passez l'éponge sur votre ancien site. »). Ces effets sont dans `_sources/ardoise.js`.

**Couleurs** : ardoise `#1E2A2C`, jaune craie `#FFD23F`, nappe `#F5F7F4`.
**Polices** : Bricolage Grotesque (titres), Instrument Sans (texte).

## Le réel, seconde par seconde

| Temps | Ce qui se passe | Code du motion viral |
| --- | --- | --- |
| 0 à 1,1 s | Sur l'ardoise : « Passez **l'éponge** sur votre menu PDF. » ; une brosse efface « menu PDF. » | Accroche dès la première image, mots qui sautent, effet satisfaisant d'effacement |
| 1,1 à 2,2 s | La brosse essuie toute l'ardoise en trois passages et révèle le maki | Révélation, aller-retour rythmé sur le son |
| 2,2 s | Flash, secousse, le maki éclate | Temps fort sur le son, rampe de vitesse (accélération puis ralenti) |
| 2,2 à 5,4 s | Les ingrédients s'écartent au ralenti | Ralenti, zoom arrière |
| 4,3 à 6 s | Saumon, Avocat, Concombre, Riz vinaigré, Nori grillée | Étiquettes qui se dessinent avec un « pop » chacune |
| 8,7 à 11,8 s | L'image se range dans un téléphone, un doigt fait défiler : le maki se referme puis se rouvre | Zoom arrière révélateur, démonstration du produit |
| 11,8 à 15 s | Rideau jaune, puis la carte de visite en mouvement : le N s'allume, « Passez l'éponge sur votre ancien site. », « ancien site. » s'efface, bouton « Demandez votre démo » | Appel à l'action clair, bouton qui pulse |
| 15 s | Il ne reste que l'ardoise, et l'accroche revient | Boucle sans couture : la fin raccorde avec le début, les gens revoient le réel |

## Légendes prêtes à copier

**Réel**

```
Passez l'éponge sur votre menu PDF. 🧽🍣

Sur votre site, il s'ouvre au doigt : saumon, avocat, concombre, riz, nori. Vos clients ne lisent plus une liste, ils voient votre savoir-faire.

Nouvelle Ardoise crée des sites, des cartes et des menus 3D pour les restaurants de Genève et de Vaud.

👉 Demandez votre démo : lien en bio
💬 Ou écrivez-nous « DÉMO » en message privé

#restaurantgeneve #genève #lausanne #vaud #sushigeneve #menu3d #motiondesign #siteweb #restaurateur #foodstagram #geneva #suisseromande
```

**Publication**

```
Passez l'éponge sur votre ancien menu. 🧽

Nouvelle Ardoise est lancée ! On transforme la carte de votre restaurant en une expérience : vos plats s'assemblent et se décomposent au fil du défilement.

Sites, cartes et menus 3D pour les restaurants de Genève et Vaud.
👉 nouvelleardoise.ch (lien en bio)

#restaurantgeneve #genève #vaud #lausanne #restaurateur #menudigital #siteweb #nouvelleardoise
```

**Bio du profil** (150 caractères max)

```
Sites, cartes et menus 3D pour restaurants 🍣🍝
📍 Genève · Vaud
👇 Demandez votre démo
```
Lien : `https://nouvelleardoise.ch`

## Conseils de mise en ligne

- **Ordre** : la photo de profil et la bio d'abord, puis la publication, puis le réel 1 à 2 jours plus tard (ou le même jour, le réel en premier).
- **Son** : le réel a son propre habillage sonore. Pour plus de portée, utilisez la version sans son et ajoutez un son tendance dans Instagram, volume à 20-30 %.
- **Photo de profil** : `avatar-instagram-ardoise.png` ; elle rappelle la carte de visite, ce qui aide à vous reconnaître d'un support à l'autre.
- **Couverture** : choisissez `couverture-reel.jpg` comme couverture pour garder une grille propre.
- **Créneau** : en semaine, 11 h 30 ou 18 h, quand les restaurateurs regardent leur téléphone entre deux services. Évitez le coup de feu de midi.
- **Zone sûre** : les textes restent hors des 320 px du bas et des bords, où Instagram place ses boutons.

## Modifier et régénérer

Les sources sont dans `_sources/` (dépendances : Playwright avec Chromium, ffmpeg, Python 3 avec `fonttools`).

```sh
cd marketing/kit-lancement/_sources
python3 logo.py && node png.mjs   # logos SVG puis PNG
node render.mjs                   # réel (environ 3 minutes)
node render.mjs --apercu 1,5,14   # captures de quelques instants, pour vérifier
node publication.mjs              # publication et photo de profil sur l'ardoise
```

Ouvrir `_sources/reel.html` dans un navigateur joue le réel en boucle. Le texte et le
minutage se règlent directement dans ce fichier ; les sons dans `son.py`.
Le réel utilise les 96 images de `public/sequences/sushi/x/`, celles du site.
