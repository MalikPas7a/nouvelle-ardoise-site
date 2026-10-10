#!/bin/sh
# Extrait les plans du réel « nouvelles ouvertures » (reel-ouverture.html), recadrés en 1080 × 1920, 30 i/s, JPEG,
# et écrit videos/images-ouverture/index.js (window.VIDEOS : nombre d'images par plan).
#   sh videos/extraire-ouverture.sh <dossier des vidéos Mixkit>
# Vidéos Mixkit en 4K (3840 × 2160), « Mixkit Stock Video Free License » (usage commercial autorisé, sans mention),
# licence vérifiée sur chaque page le 10.10.2026 : 52407 (vin), 44076 (caméra), 51553 (champagne),
# 51529 et 51528 (toasts), 51644 (dîner), 51655 (bougies).
# Fichiers mNUMÉRO.mp4, téléchargés depuis https://assets.mixkit.co/videos/NUMÉRO/NUMÉRO-2160.mp4 (non gardés dans le dépôt).
cd "$(dirname "$0")"
SRC="$1"
rm -rf images-ouverture && mkdir -p images-ouverture
plan() { # nom fichier début durée centre-x
  mkdir -p images-ouverture/$1
  ffmpeg -v error -ss $3 -t $4 -i "$SRC/$2" -vf "crop='min(iw,ih*9/16)':ih:'min(max(iw*$5-ih*9/32,0),iw-min(iw,ih*9/16))':0,scale=1080:1920:flags=lanczos,eq=contrast=1.05:saturation=1.08,fps=30" -q:v 3 images-ouverture/$1/%03d.jpg
}
plan vin m52407.mp4 7.0 3.0 0.5
plan camera m44076.mp4 3.0 2.4 0.52
plan toast m51529.mp4 2.9 1.4 0.55
plan champagne m51553.mp4 8.0 1.6 0.53
plan diner m51644.mp4 6.0 2.4 0.53
# vignettes du profil Instagram (une image chacune, carrées 540 × 540)
vignette() { # nom fichier instant centre-x
  ffmpeg -v error -ss $3 -i "$SRC/$2" -frames:v 1 -vf "crop=ih:ih:'min(max(iw*$4-ih/2,0),iw-ih)':0,scale=540:540:flags=lanczos,eq=contrast=1.05:saturation=1.08" -q:v 3 images-ouverture/v-$1.jpg
}
vignette vin m52407.mp4 9.0 0.5
vignette bougies m51655.mp4 8.0 0.5
vignette toast m51529.mp4 3.0 0.4
vignette champagne m51553.mp4 12.0 0.53
vignette diner m51644.mp4 8.0 0.55
vignette camera m44076.mp4 6.0 0.4
vignette fete m51528.mp4 4.0 0.55
{ printf 'window.VIDEOS = {'; for d in images-ouverture/*/; do n=$(basename $d); printf ' %s: %s,' $n "$(ls $d | wc -l)"; done; printf ' };\n'; } > images-ouverture/index.js
cat images-ouverture/index.js
