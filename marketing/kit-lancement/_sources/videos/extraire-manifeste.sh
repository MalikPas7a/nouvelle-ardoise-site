#!/bin/sh
# Extrait les plans du réel « manifeste » (reel-manifeste.html), recadrés en 1080 × 1920, 30 i/s, JPEG,
# et écrit videos/images-manifeste/index.js (window.VIDEOS_MANIFESTE : nombre d'images par plan).
#   sh videos/extraire-manifeste.sh <dossier des vidéos Pexels>
# Vidéos Pexels, licence Pexels (usage commercial autorisé), fichiers pNUMÉRO.mp4 téléchargés depuis
# https://www.pexels.com/download/video/NUMÉRO/ (non gardés dans le dépôt, trop lourds) :
# 12893607 (poignée de main), 37165548 (photographe culinaire), 12691874 (vidéaste en cuisine),
# 7234077 (photo d'un plat au téléphone), 6961769 (on trinque), 13433117 (sac à emporter),
# 6221689 (four à pizza), 7008582 (dressage), 34722001 (flammes du four), 28792884 (barista),
# 5834187 (comptoir à emporter).
cd "$(dirname "$0")"
SRC="$1"
rm -rf images-manifeste && mkdir -p images-manifeste
plan() { # nom fichier début durée
  mkdir -p images-manifeste/$1
  ffmpeg -v error -ss $3 -t $4 -i "$SRC/$2" -vf "crop='min(iw,ih*9/16)':'min(ih,iw*16/9)',scale=1080:1920:flags=lanczos,eq=contrast=1.05:saturation=1.1,fps=30" -q:v 3 images-manifeste/$1/%03d.jpg
}
plan main p12893607.mp4 2.0 2.5
plan photographe p37165548.mp4 0.5 1.6
plan videaste p12691874.mp4 1.0 1.6
plan telephone p7234077.mp4 1.0 1.6
plan trinque p6961769.mp4 2.0 1.6
plan sac p13433117.mp4 1.0 1.6
plan four p6221689.mp4 1.0 1.6
plan dressage p7008582.mp4 1.0 3.2
plan flammes p34722001.mp4 0.5 3.2
plan barista p28792884.mp4 2.0 3.2
plan comptoir p5834187.mp4 1.0 3.2
{ printf 'window.VIDEOS_MANIFESTE = {'; for d in images-manifeste/*/; do n=$(basename $d); printf ' %s: %s,' $n "$(ls $d | wc -l)"; done; printf ' };\n'; } > images-manifeste/index.js
cat images-manifeste/index.js
