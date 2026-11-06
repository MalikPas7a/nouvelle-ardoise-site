# Grille d'excellence (10 axes, 100 points)

Chaque axe se note sur 10, puis se multiplie par son poids / 10. Un critère **[B]** est bloquant : s'il échoue, l'axe est plafonné à 4/10 et la page ne peut pas être « Excellence ». Noter honnêtement : 10 = rien à redire face aux meilleurs sites du secteur, 7 = propre mais banal, 5 = défauts visibles.

Source de chaque critère : **(M)** mesuré par `scripts/audit.mjs`, **(Œ)** à juger à l'œil sur les captures et en faisant défiler.

---

## 1. Direction et design (poids 15)

- [B] (Œ) La direction artistique est celle choisie avec Malik (guide `/mnt/project-files/styles/guide-styles.md`) et la charte du client (couleurs, polices du brand book) est respectée.
- (Œ) Hiérarchie lisible en 3 secondes au premier écran : une idée, un visuel fort, une action.
- (Œ) Grille et alignements : bords gauches alignés, marges régulières, rythme vertical constant (une échelle d'espacement, pas des valeurs au hasard).
- (M+Œ) Typo : 2 familles (3 maximum avec une mono utilitaire), échelle resserrée (≤ 10 tailles), interlignage confortable, longueur de ligne 45-75 caractères sur bureau, césures et veuves soignées sur les titres.
- (Œ) Couleur : une couleur dominante, un accent, contrastes voulus ; pas de dégradés décoratifs sans raison.
- (Œ) Il y a au moins un moment mémorable que seul ce client pourrait avoir (un geste, une matière, une photo, une histoire).
- (Œ) Cohérence entre sections : mêmes rayons, mêmes boutons, mêmes ombres partout.

## 2. Anti-IA slop et photos (poids 10)

- [B] (Œ) Nourriture : uniquement des vraies photos du client ou du photographe, nettes en taille réelle, appétissantes, bien cadrées. Aucune photo générée, aucune banque d'images de plats.
- [B] (Œ) Aucun visuel flou, pixelisé, déformé, mal détouré ou plaqué sur de la 3D.
- (M) Pas de texte en dégradé, pas d'emoji dans les titres et boutons, pas de pastilles « Nouveau ✨ », pas de halos et lueurs, pas de blobs.
- (M+Œ) Pas de petits libellés en majuscules espacées au-dessus de chaque titre, pas d'icônes génériques dans des carrés arrondis en série, pas de 3 cartes identiques « icône + titre + 2 lignes ».
- (Œ) Textes sans tics d'IA : pas de « Découvrez », « Plongez », « Bien plus qu'un… », « Laissez-vous tenter », triplets d'adjectifs, tirets cadratins en série. Phrases concrètes avec des faits du client.
- (Œ) Passer `unslop` mentalement : chrome calme, la richesse est dans le contenu.

## 3. iPhone (poids 12)

- [B] (M) Aucun débordement horizontal à 393 px.
- [B] (M) Champs de saisie ≥ 16 px (sinon zoom forcé sur iOS).
- (M) Cibles tactiles ≥ 44 × 44 px (liens dans un paragraphe tolérés).
- (Œ) Premier écran iPhone : le nom, la promesse, la photo et l'action principale sont visibles sans défiler.
- (Œ) Action principale accessible au pouce en permanence (barre fixe en bas ou bouton persistant) sans masquer le contenu.
- (Œ) Zones sûres respectées (encoche, barre d'accueil : `env(safe-area-inset-*)`), `100dvh` plutôt que `100vh` pour les plein écran.
- (Œ) Menu mobile : ouvre et ferme proprement, fond bloqué, focus géré.
- (M) Aucun texte courant sous 12 px.

## 4. Mouvement (poids 8)

- [B] (M) Lenis coupé sous `prefers-reduced-motion` ; pas de curseur personnalisé sur un site de restaurant.
- (Œ) Chaque animation a une raison (orienter, relier, récompenser) ; rien qui bouge en boucle sans raison.
- (Œ) Durées 150-400 ms pour l'interface, courbes « ease-out » à l'entrée, pas de rebond gratuit ; les révélations au défilement ne retardent pas la lecture.
- (Œ) Fluide sur iPhone : seulement `transform` et `opacity` animés, pas de saccade au défilement (enregistrer une vidéo du défilement et la relire).
- (Œ) Lancer `review-animations` sur le code du mouvement ; aucun point « bloquant » restant.

## 5. Performance et Core Web Vitals (poids 12)

- [B] (M) LCP mobile ≤ 2,5 s, CLS ≤ 0,1 (Lighthouse labo ; en ligne, vérifier aussi PageSpeed Insights).
- (M) TBT < 200 ms (indicateur de réactivité, proxy de l'INP ≤ 200 ms).
- (M) Poids iPhone < 2,5 Mo au premier chargement ; aucune image > 300 Ko sans raison ; AVIF/WebP via `astro:assets`, `srcset` et `sizes` corrects.
- (M) Images hors écran en `loading="lazy"`, image du premier écran en `fetchpriority="high"` et jamais en lazy ; largeur et hauteur fixées.
- (M) Polices : ≤ 4 fichiers, en `woff2`, sous-ensemble latin, `font-display: swap`, préchargement de la police du titre.
- (M) Aucune erreur console, aucune ressource en 404.
- (Œ) Vidéos : `muted playsinline`, poster, poids < 3 Mo pour une boucle d'ambiance, jamais en lecture auto avec son.

## 6. Accessibilité (poids 8)

- [B] (M) Aucun problème axe « critical » ou « serious » (WCAG 2.2 AA).
- (M) Contraste texte ≥ 4,5:1 (≥ 3:1 pour les gros titres), y compris texte posé sur photo.
- (M) Toutes les images ont un `alt` (décoratives : `alt=""`) ; tous les liens et boutons ont un nom.
- (Œ) Clavier : Tab parcourt toute la page dans l'ordre, focus toujours visible, pas de piège ; le pop-up se ferme avec Échap et rend le focus.
- (Œ) Zoom texte 200 % sans perte de contenu ; langue de page correcte (`lang`), langues alternatives marquées.

## 7. SEO local et visibilité IA (poids 10)

- [B] (M) Un seul H1, `title` 30-60 caractères avec le nom + la ville + le métier, meta description 120-160 caractères, `lang` présent.
- (M) JSON-LD `Restaurant` (ou `Bakery`, `CafeOrCoffeeShop`, `FoodEstablishment`) avec adresse, horaires, téléphone, `servesCuisine`, `menu`, `acceptsReservations`, `geo` ; une entrée par adresse pour un groupe multi-villes (skill `schema`).
- (M) `canonical`, `og:image` 1200×630 (aperçu WhatsApp et Instagram), sitemap et robots.txt ; `hreflang` si plusieurs langues.
- (Œ) Nom, adresse et téléphone identiques au caractère près à la fiche Google ; lien vers la fiche Google et vers les avis.
- (Œ) La carte est en texte HTML (pas seulement un PDF ou une image), avec noms des plats et allergènes ; une page par ville pour un groupe.
- (Œ) Réponses claires aux questions que posent les gens à ChatGPT et Google (horaires, livraison, végétarien, halal si vrai, parking, réservation) : skill `ai-seo`.

## 8. Conversion (poids 12)

- [B] (M+Œ) Une action principale claire au premier écran iPhone (commander, réserver, appeler) et elle fonctionne de bout en bout.
- (Œ) Une seule action principale par écran, les autres en secondaire ; libellés concrets (« Commander à Genève », pas « En savoir plus »).
- (M) Lien `tel:` en un geste, lien itinéraire Google/Apple Maps, horaires visibles sans chercher (« Ouvert jusqu'à 23 h » en direct si possible).
- (Œ) Preuves près de l'action : note Google et nombre d'avis, presse, photos réelles de la salle et de l'équipe.
- (Œ) Commande et réservation : le minimum de champs, TWINT visible si accepté, confirmation claire ; tester le parcours complet sur iPhone.
- (Œ) Pop-up (ex. burgers offerts) : une seule fois par visite, après un geste ou un délai, fermable en un geste, n'empêche pas l'action principale (skill `cro`, référence formulaires).
- (Œ) Suivi : événements Umami sur les actions principales (commander, réserver, appeler, itinéraire).

## 9. Contenu et marque (poids 6)

- [B] (M) Aucun mot interdit (alcool, crédit, financement, prêt) ; aucun prix Nouvelle Ardoise sur une démo.
- (Œ) Ton de la marque tenu partout ; orthographe et typographie française (espaces insécables avant « : ; ! ? », guillemets « », apostrophes ’).
- (Œ) Contenus vrais et vérifiés avec le client : aucune adresse, horaire, prix ou histoire inventés.
- (Œ) Traductions relues (FR/EN/ES si demandées), pas de traduction automatique brute.
- (Œ) Mentions légales, confidentialité, crédits photo.

## 10. Comparaison aux meilleurs du secteur (poids 7)

Choisir 3 sites dans `references-secteur.md` (le même positionnement que le client). Captures iPhone premier écran des 3 + la nôtre, côte à côte. Pour chaque critère, une phrase honnête :

- Premier écran : qui donne le plus envie en 3 secondes ?
- Photo produit : qui montre le mieux le plat ?
- Action principale : qui permet de commander ou réserver le plus vite ?
- Identité : lequel serait reconnaissable sans le logo ?
- Vitesse ressentie.

10/10 = nous sommes au moins égaux sur les 5 critères et meilleurs sur 2. 7/10 = égaux sur 3. 5/10 = en dessous sur la majorité.

---

## Calcul

Points d'un axe = note × poids / 10. Total = somme des 10 axes, sur 100.
Statut : ≥ 90 sans bloquant = Excellence ; 80-89 = Pro ; 65-79 = Correct ; < 65 ou bloquant = À reprendre.
