#!/bin/sh
# Extrait les plans du réel « artisan » (reel-artisan.html), recadrés en 1080 × 1920, 30 i/s, JPEG,
# et écrit videos/images-artisan/index.js (window.VIDEOS : nombre d'images par plan).
#   sh videos/extraire-artisan.sh <dossier des vidéos Pexels>
# Vidéos Pexels, licence Pexels (usage commercial autorisé) : 4458588, 4458593, 4458586 (chocolat),
# 32710206 (tarte), 7012966 (truffes) ; pour le réel « coulisses » : 5930369 (glaçage), 6666288 (fraises),
# 30557962 (pain). Fichiers pNUMÉRO.mp4, téléchargés depuis
# https://www.pexels.com/download/video/NUMÉRO/ (non gardés dans le dépôt, trop lourds).
cd "$(dirname "$0")"
SRC="$1"
rm -rf images-artisan && mkdir -p images-artisan
plan() { # nom fichier début durée centre-x
  mkdir -p images-artisan/$1
  ffmpeg -v error -ss $3 -t $4 -i "$SRC/$2" -vf "crop='min(iw,ih*9/16)':ih:'min(max(iw*$5-ih*9/32,0),iw-min(iw,ih*9/16))':0,scale=1080:1920:flags=lanczos,eq=contrast=1.06:saturation=1.12,fps=30" -q:v 3 images-artisan/$1/%03d.jpg
}
plan coulee p4458588.mp4 3.5 3.4 0.4
plan tempere p4458593.mp4 2.0 2.7 0.45
plan racle p4458586.mp4 3.0 2.7 0.5
plan tarte p32710206.mp4 0 2.9 0.3
plan truffes p7012966.mp4 1.0 3.6 0.5
plan glacage p5930369.mp4 0.5 4.0 0.5
plan fraises p6666288.mp4 7.5 2.4 0.5
plan pain p30557962.mp4 5.0 2.4 0.5
{ printf 'window.VIDEOS = {'; for d in images-artisan/*/; do n=$(basename $d); printf ' %s: %s,' $n "$(ls $d | wc -l)"; done; printf ' };\n'; } > images-artisan/index.js
cat images-artisan/index.js
