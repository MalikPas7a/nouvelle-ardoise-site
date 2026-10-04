# Animations au défilement : sources des images

Vidéos téléchargées puis découpées par `fabriquer.py` (les vidéos elles-mêmes ne sont pas gardées
dans le dépôt). Avant d'utiliser une nouvelle vidéo, vérifier sa licence sur sa page : sur Mixkit,
certaines vidéos sont sous « Mixkit Restricted License », pour un usage personnel seulement.

## Kebab (public/sequences/kebab)
ZACK, « Kebab Traditionnel vs Kebab Berliner », Wikimedia Commons, CC BY 3.0 (crédit obligatoire,
affiché sur la page). Plans à 1:51, 16:06, 0:10 et 0:03, tirés de l'original 4K.

## Pizza (public/sequences/pizza)
Mixkit, licence gratuite Mixkit (usage commercial autorisé), en 4K :
42469, 42474, 42475, 42481, 42484.

    python3 fabriquer.py pizza <dossier> "42469.mp4 1.0 3.0 0.64" "42474.mp4 0.2 3.6 0.45" \
      "42475.mp4 1.0 2.9 0.5" "42481.mp4 0.4 3.0 0.5" "42484.mp4 1.0 3.8 0.5"

## Sushi (public/sequences/sushi)
Pexels, licence Pexels (usage commercial autorisé), en 1080p : 8901946, 8901978, 8902004, 8901999.

    python3 fabriquer.py sushi <dossier> "p8901946.mp4 1.0 3.2 0.5" "p8901978.mp4 1.5 3.4 0.45" \
      "p8902004.mp4 5.5 3.4 0.55" "p8901999.mp4 2.0 4.0 0.5"
