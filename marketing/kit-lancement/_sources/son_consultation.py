"""Bande son du réel « 15 minutes offertes » : une vraie musique, sans bruitage.

    python3 son_consultation.py sortie.wav

Musique : « Hip Hop 02 » (Mixkit n° 738, hip-hop motivant, 97 BPM), « Mixkit Stock Music Free License » :
usage commercial autorisé dans une vidéo, sans mention. Fichier téléchargé depuis
https://assets.mixkit.co/music/738/738.mp3 dans videos/mixkit-musique-738.mp3 (non gardé dans le dépôt).
Pris dès le début, sans changer le tempo : ses coups (0,03 · 1,14 · 3,95 · 6,08 · 11,03 · 12,71 s) donnent
les entrées de scène du réel, et la pause du morceau à 14,6 s tombe sur la fin. Fondu sur la dernière demi-seconde.
"""
import subprocess
import sys
from pathlib import Path

SOURCE = Path(__file__).parent / "videos" / "mixkit-musique-738.mp3"
DUREE = 15.0

filtre = (f"atrim=0:{DUREE},asetpts=PTS-STARTPTS,afade=t=out:st={DUREE - 0.6}:d=0.6,"
          f"loudnorm=I=-14:TP=-1.0:LRA=11")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(SOURCE), "-af", filtre, "-ar", "44100", "-ac", "2", sys.argv[1]], check=True)
