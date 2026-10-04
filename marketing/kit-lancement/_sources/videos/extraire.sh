#!/bin/sh
# Extrait les images des vidéos Mixkit utilisées par reel-ardoise.html (30 i/s, JPEG),
# et écrit videos/images/index.js (window.VIDEOS : nombre d'images par plan).
#   sh videos/extraire.sh
# Vidéos : Mixkit (mixkit.co), licence gratuite Mixkit, usage commercial autorisé sans mention.
cd "$(dirname "$0")"
rm -rf images && mkdir -p images/salle images/beurre
ffmpeg -v error -ss 0 -t 2.9 -i mixkit-29050.mp4 -vf fps=30 -q:v 3 images/salle/%03d.jpg
ffmpeg -v error -ss 0.4 -t 2.6 -i mixkit-45724.mp4 -vf fps=30 -q:v 3 images/beurre/%03d.jpg
printf 'window.VIDEOS = { salle: %s, beurre: %s };\n' "$(ls images/salle | wc -l)" "$(ls images/beurre | wc -l)" > images/index.js
cat images/index.js
