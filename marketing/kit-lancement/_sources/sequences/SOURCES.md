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

## Chocolat (public/sequences/chocolat) et page Artisans (public/artisans)
Pexels, licence Pexels (usage commercial autorisé). Séquence, en 4K sauf 4458586 et 32710206 :

    python3 fabriquer.py chocolat <dossier> "p4458593.mp4 2.0 3.0 0.45" "p4458588.mp4 4.0 3.4 0.4" \
      "p4458581.mp4 1.0 3.0 0.35" "p4458586.mp4 3.0 3.4 0.5" "p32710206.mp4 0 2.9 0.3"

Ouverture (public/artisans/ouverture.mp4) : 4458588, de 3 s à 11 s, cadre 4:5.
Réels 9:16 (540 × 960) : glaçage 5930369 (0,5 s, 7 s), truffes 7012966 (1 s, 5 s),
fraises 6666288 (7 s, 6 s), pain 30557962 (5 s, 6 s).
Photos tirées des vidéos : tarte 32710206 (1,4 s), truffes 7012966 (11,5 s),
entremets 5930369 (20 s), baguettes 7405929 (5 s).
