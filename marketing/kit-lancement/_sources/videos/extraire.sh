#!/bin/sh
# Extrait les images des vidéos utilisées par reel-ardoise.html (30 i/s, JPEG),
# et écrit videos/images/index.js (window.VIDEOS : nombre d'images par plan).
#   sh videos/extraire.sh
# Vidéos : salle = service en salle, Coverr (coverr.co, « Serving appetizers » n° 5268, extrait de 4 s),
# licence Coverr, usage commercial autorisé sans mention ; nouilles et réel du téléphone : Pexels
# (n° 4224218, extrait de 6 s), licence Pexels, usage commercial autorisé.
# Les plans Mixkit 51239 et 51257 (clientes attablées) ont été retirés à la demande de Malik (10.10.2026).
cd "$(dirname "$0")"
rm -rf images && mkdir -p images/salle images/nouilles images/cliente
ffmpeg -v error -ss 0.6 -t 2.8 -i coverr-service-5268.mp4 -vf fps=30 -q:v 3 images/salle/%03d.jpg
ffmpeg -v error -ss 1.2 -t 3.2 -i pexels-4224218.mp4 -vf fps=30 -q:v 3 images/nouilles/%03d.jpg
ffmpeg -v error -ss 2.6 -t 3.4 -i pexels-4224218.mp4 -vf fps=30 -q:v 3 images/cliente/%03d.jpg
printf 'window.VIDEOS = { salle: %s, nouilles: %s, cliente: %s };\n' \
  "$(ls images/salle | wc -l)" "$(ls images/nouilles | wc -l)" "$(ls images/cliente | wc -l)" > images/index.js
cat images/index.js
