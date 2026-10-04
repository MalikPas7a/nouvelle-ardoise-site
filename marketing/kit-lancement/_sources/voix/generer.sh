#!/bin/sh
# Synthétise la voix off de la vidéo concept, une phrase par plan (voix/texte.txt),
# avec Piper (pip install piper-tts) et la voix française « siwis » (licence libre) :
#   curl -LO https://huggingface.co/rhasspy/piper-voices/resolve/main/fr/fr_FR/siwis/medium/fr_FR-siwis-medium.onnx
#   curl -LO https://huggingface.co/rhasspy/piper-voices/resolve/main/fr/fr_FR/siwis/medium/fr_FR-siwis-medium.onnx.json
#   VOIX=chemin/fr_FR-siwis-medium.onnx sh voix/generer.sh
# Pour une voix enregistrée (la vôtre, ou un comédien), remplacez simplement voix/<plan>.wav.
cd "$(dirname "$0")"
while IFS='|' read -r id texte; do
  echo "$texte" | python3 -m piper -m "$VOIX" --length-scale 1.05 --sentence-silence 0.25 -f "$id.wav" >/dev/null 2>&1
  printf '%s %s\n' "$id" "$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$id.wav")"
done < texte.txt
