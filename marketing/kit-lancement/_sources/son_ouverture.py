"""Bande son du réel « nouvelles ouvertures » : une vraie musique, plus aucun bruitage.

    python3 son_ouverture.py sortie.wav

Musique : « Sparta » (Mixkit n° 452, trap épique), « Mixkit Stock Music Free License » : usage commercial
autorisé dans une vidéo, sans mention. Fichier téléchargé depuis https://assets.mixkit.co/music/452/452.mp3
dans videos/mixkit-musique-452.mp3 (non gardé dans le dépôt).
Le morceau est accéléré de 107,7 à 120 BPM (atempo, sans changer la hauteur) pour tomber sur la grille du
réel (un temps toutes les 0,5 s), et calé pour que son drop (12,01 s dans l'original) frappe à 6,6 s,
quand le 360° apparaît. Montée de tension pendant l'accroche et la liste, fondu sur la fin.
"""
import subprocess
import sys
from pathlib import Path

SOURCE = Path(__file__).parent / "videos" / "mixkit-musique-452.mp3"
DUREE = 30.0
TEMPO = 120 / 107.666
DROP, ICI = 12.01, 6.6
debut = DROP - ICI * TEMPO  # instant de l'original qui tombe à 0 s dans le réel

filtre = (f"atrim=start={debut:.3f},asetpts=PTS-STARTPTS,atempo={TEMPO:.5f},atrim=0:{DUREE},"
          f"afade=t=in:d=0.15,afade=t=out:st={DUREE - 1.6}:d=1.6,loudnorm=I=-14:TP=-1.0:LRA=11")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(SOURCE), "-af", filtre, "-ar", "44100", "-ac", "2", sys.argv[1]], check=True)
