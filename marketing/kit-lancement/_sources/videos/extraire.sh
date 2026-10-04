#!/bin/sh
# Extrait les images des vidéos utilisées par reel-ardoise.html (30 i/s, JPEG),
# et écrit videos/images/index.js (window.VIDEOS : nombre d'images par plan).
#   sh videos/extraire.sh
# Vidéos : Mixkit (mixkit.co, n° 51239 et 51257), licence gratuite Mixkit, usage commercial autorisé
# sans mention ; nouilles : Pexels (n° 4224218, extrait de 6 s), licence Pexels, usage commercial autorisé.
cd "$(dirname "$0")"
rm -rf images && mkdir -p images/salle images/nouilles images/cliente
ffmpeg -v error -ss 1.0 -t 2.8 -i mixkit-51239.mp4 -vf fps=30 -q:v 3 images/salle/%03d.jpg
ffmpeg -v error -ss 1.2 -t 3.2 -i pexels-4224218.mp4 -vf fps=30 -q:v 3 images/nouilles/%03d.jpg
ffmpeg -v error -ss 2.0 -t 3.4 -i mixkit-51257.mp4 -vf fps=30 -q:v 3 images/cliente/%03d.jpg
printf 'window.VIDEOS = { salle: %s, nouilles: %s, cliente: %s };\n' \
  "$(ls images/salle | wc -l)" "$(ls images/nouilles | wc -l)" "$(ls images/cliente | wc -l)" > images/index.js
cat images/index.js
