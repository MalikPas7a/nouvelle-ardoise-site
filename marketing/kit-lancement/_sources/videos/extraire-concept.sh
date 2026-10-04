#!/bin/sh
# Extrait les images des vidéos utilisées par concept.html (30 i/s, JPEG, 1080 px de large)
# et écrit videos/concept/index.js (window.VIDEOS : nombre d'images par plan).
#   sh videos/extraire-concept.sh
# Mêmes vidéos et licences que extraire.sh (Mixkit 51239 et 51257, Pexels 4224218).
cd "$(dirname "$0")"
rm -rf concept && mkdir -p concept/salle concept/nouilles concept/cliente
ffmpeg -v error -ss 0.5 -t 3.8 -i mixkit-51239.mp4 -vf fps=30,scale=1280:-2 -q:v 3 concept/salle/%03d.jpg
ffmpeg -v error -ss 0.8 -t 3.8 -i pexels-4224218.mp4 -vf fps=30,scale=1280:-2 -q:v 3 concept/nouilles/%03d.jpg
ffmpeg -v error -ss 1.0 -t 3.4 -i mixkit-51257.mp4 -vf fps=30,scale=1080:-2 -q:v 3 concept/cliente/%03d.jpg
printf 'window.VIDEOS = { salle: %s, nouilles: %s, cliente: %s };\n' \
  "$(ls concept/salle | wc -l)" "$(ls concept/nouilles | wc -l)" "$(ls concept/cliente | wc -l)" > concept/index.js
cat concept/index.js
