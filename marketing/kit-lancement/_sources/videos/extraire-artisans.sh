#!/bin/sh
# Télécharge les vidéos originales (Pexels, licence Pexels : usage commercial autorisé, sans mention)
# et en extrait les plans du réel artisans (reel-artisans.html), à 30 i/s, en JPEG haute qualité,
# déjà recadrés en 1080×1920 pour les plans plein écran. Écrit artisans/index.js.
#   sh videos/extraire-artisans.sh
# 4458593 tempérage · 4458588 moules rouges · 4458586 raclage · 4458581 coulage · 5930369 glaçage
# 30557962 boulanger · 6666288 fraises · 7012966 truffes · 32710206 tarte framboise
cd "$(dirname "$0")"
mkdir -p originaux
for id in 4458593 4458588 4458586 4458581 5930369 30557962 6666288 7012966 32710206; do
  [ -s "originaux/p$id.mp4" ] || curl -sSL -o "originaux/p$id.mp4" "https://www.pexels.com/download/video/$id/"
done
rm -rf artisans && mkdir -p artisans
plan() { # nom, vidéo, début, durée, filtre de recadrage
  mkdir -p "artisans/$1"
  ffmpeg -v error -ss "$3" -t "$4" -i "originaux/p$2.mp4" -vf "fps=30,$5" -q:v 2 "artisans/$1/%03d.jpg"
}
V='scale=-2:1920:flags=lanczos,crop=1080:1920'
plan chocolat 4458593 2.0 3.0 "$V"
plan moules 4458588 4.0 1.2 "$V"
plan raclage 4458586 3.5 1.0 "$V"
plan coulage 4458581 1.0 1.0 "$V"
plan glacage 5930369 0.5 4.5 "scale=1080:-2:flags=lanczos,crop=1080:1920"
plan boulanger 30557962 5.0 3.5 "scale=1080:1920:flags=lanczos"
plan fraises 6666288 7.0 1.5 "$V"
plan truffes 7012966 9.0 3.2 "scale=-2:1920:flags=lanczos,crop=1080:1920"
plan poche 7012966 1.0 1.2 "scale=-2:1920:flags=lanczos,crop=1080:1920"
plan tarte 32710206 0 2.9 "scale=1920:1080:flags=lanczos"
printf 'window.VIDEOS = {' > artisans/index.js
for d in artisans/*/; do n=$(basename "$d"); printf ' %s: %s,' "$n" "$(ls "$d" | wc -l)" >> artisans/index.js; done
printf ' };\n' >> artisans/index.js
cat artisans/index.js
