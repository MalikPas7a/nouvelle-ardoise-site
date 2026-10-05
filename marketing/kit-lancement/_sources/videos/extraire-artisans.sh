#!/bin/sh
# Télécharge les vidéos originales (Pexels, licence Pexels : usage commercial autorisé, sans mention)
# et en extrait les plans du réel artisans (reel-artisans.html), à 30 i/s, en JPEG haute qualité,
# déjà recadrés en 1080×1920 pour les plans plein écran. Écrit artisans/index.js.
#   sh videos/extraire-artisans.sh
# 4458593 tempérage · 4458588 moules rouges · 4458586 raclage · 4458581 coulage · 5930369 glaçage
# 6666288 fraises · 7964600 croissants façonnés · 6664275 croissant feuilleté · 6664409 menthe sur la tarte
# 39895881 croissant nappé de chocolat · 6663649 tarte aux fraises (toutes en 4K sauf coulage)
cd "$(dirname "$0")"
mkdir -p originaux
for id in 4458593 4458588 4458581 5930369 6666288 7964600 6664275 6664409 39895881 6663649; do
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
plan coulage 4458581 1.0 1.0 "$V"
plan glacage 5930369 0.5 4.5 "scale=1080:-2:flags=lanczos,crop=1080:1920"
plan fraises 6666288 7.0 1.5 "$V"
plan croissants 7964600 1.0 3.5 "$V"
plan feuillete 6664275 8.0 1.0 "$V"
plan menthe 6664409 0.5 2.2 "$V"
plan nappage 39895881 1.5 3.5 "$V"
plan tarte 6663649 2.0 4.5 "scale=1080:-2:flags=lanczos"
printf 'window.VIDEOS = {' > artisans/index.js
for d in artisans/*/; do n=$(basename "$d"); printf ' %s: %s,' "$n" "$(ls "$d" | wc -l)" >> artisans/index.js; done
printf ' };\n' >> artisans/index.js
cat artisans/index.js
