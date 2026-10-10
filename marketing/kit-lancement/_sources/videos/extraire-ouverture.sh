#!/bin/sh
# Extrait les plans du réel « nouvelles ouvertures » (reel-ouverture.html), recadrés en 1080 × 1920, 30 i/s, JPEG,
# et écrit videos/images-ouverture/index.js (window.VIDEOS : nombre d'images par plan).
#   sh videos/extraire-ouverture.sh <dossier des vidéos Mixkit>
# Vidéos Mixkit en 4K (3840 × 2160), « Mixkit Stock Video Free License » (usage commercial autorisé, sans mention),
# licence vérifiée sur chaque page le 10.10.2026 : 2433 (pâtes), 44076 (caméra), 4919 (téléphone), 4678 (chef),
# 51655 (bougies), 43941 (café), 50017 (gâteau), 50033 (pâtisserie). Aucun alcool à l'image (consigne de Malik).
# Fichiers mNUMÉRO.mp4, téléchargés depuis https://assets.mixkit.co/videos/NUMÉRO/NUMÉRO-2160.mp4 (non gardés dans le dépôt).
cd "$(dirname "$0")"
SRC="$1"
rm -rf images-ouverture && mkdir -p images-ouverture
plan() { # nom fichier début durée centre-x
  mkdir -p images-ouverture/$1
  ffmpeg -v error -ss $3 -t $4 -i "$SRC/$2" -vf "crop='min(iw,ih*9/16)':ih:'min(max(iw*$5-ih*9/32,0),iw-min(iw,ih*9/16))':0,scale=1080:1920:flags=lanczos,eq=contrast=1.05:saturation=1.08,fps=30" -q:v 3 images-ouverture/$1/%03d.jpg
}
plan pates m2433.mp4 0.3 3.0 0.42
plan camera m44076.mp4 3.0 2.4 0.52
plan chef m4678.mp4 5.0 2.4 0.56
plan influence m4919.mp4 2.0 1.8 0.5
# vignettes du profil Instagram (une image chacune, carrées 540 × 540)
vignette() { # nom fichier instant centre-x
  ffmpeg -v error -ss $3 -i "$SRC/$2" -frames:v 1 -vf "crop=ih:ih:'min(max(iw*$4-ih/2,0),iw-ih)':0,scale=540:540:flags=lanczos,eq=contrast=1.05:saturation=1.08" -q:v 3 images-ouverture/v-$1.jpg
}
vignette pates m2433.mp4 5.0 0.42
vignette bougies m51655.mp4 8.0 0.5
vignette cafe m43941.mp4 7.0 0.45
vignette gateau m50017.mp4 9.0 0.45
vignette patisserie m50033.mp4 5.0 0.5
vignette chef m4678.mp4 7.0 0.5
{ printf 'window.VIDEOS = {'; for d in images-ouverture/*/; do n=$(basename $d); printf ' %s: %s,' $n "$(ls $d | wc -l)"; done; printf ' };\n'; } > images-ouverture/index.js
cat images-ouverture/index.js
