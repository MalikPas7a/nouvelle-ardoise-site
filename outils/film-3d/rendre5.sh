#!/bin/bash
# Film v2 en 1080×1920 : plans d'ancrage, plans fixes composés, puis le reste (jalons d'abord). Reprise possible à tout moment.
cd "$(dirname "$0")"; . scene/look.env
S=$PWD/scene; O=$PWD/final5; export RW=1080 RH=1920 SPP=${SPP:-48} ATH=${ATH:-0.02}
manque() { for i in "$@"; do [ -s "$(printf "$O/f%04d.png" $i)" ] || echo $i; done; }
r() { local m=$(manque "$@"); [ -n "$m" ] && bvenv/bin/python scene/build5.py $S $O $m >> final5.log 2>&1; }
r 1 57 232 264
[ -s $O/coins.json ] || COINS=$O/coins.json bvenv/bin/python scene/build5.py $S $O >> final5.log 2>&1
m=$(manque $(seq 2 60) $(seq 233 263)); [ -n "$m" ] && bvenv/bin/python scene/plans_fixes.py $S $O/coins.json $O $m >> final5.log 2>&1
ordre=$( (echo 96 128 172 204 230; for s in 8 4 2 1; do seq 61 $s 231; done) | tr ' ' '\n' | awk '!v[$0]++')
r $ordre
[ -z "$(manque $(seq 1 264))" ] && echo complet >> final5.log
