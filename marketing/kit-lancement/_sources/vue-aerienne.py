"""Télécharge la vue aérienne du réel « menu du jour » : SWISSIMAGE de swisstopo, du lac Léman
jusqu'à la place du Bourg-de-Four, à Genève.

    python3 vue-aerienne.py                              # Bourg-de-Four → carte/
    python3 vue-aerienne.py 46.1978524 6.1428830 carte-plainpalais   # autre adresse, autre dossier

Écrit dans carte/ une mosaïque par niveau de zoom (9 à 19), centrée sur l'adresse, et
carte/index.js (window.CARTE) pour que reel-menu.html la lise en file://. Les images
SWISSIMAGE sont libres d'usage, y compris commercial, avec la mention « © swisstopo ».
"""
import json
import sys
import math
import subprocess
import urllib.request
from pathlib import Path

LAT, LON = 46.2003229, 6.1491365     # Place du Bourg-de-Four, Genève (OpenStreetMap)
if len(sys.argv) > 3:
    LAT, LON = float(sys.argv[1]), float(sys.argv[2])
ZOOMS = range(9, 20)
COLS, LIGNES = 5, 9                  # 1280 × 2304 px : couvre 1080 × 1920 à tout facteur ≥ 1
URL = "https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.swissimage/default/current/3857/{z}/{x}/{y}.jpeg"
ICI = Path(__file__).parent
SORTIE = ICI / (sys.argv[3] if len(sys.argv) > 3 else "carte")


def tuile(z):
    n = 2 ** z
    x = (LON + 180) / 360 * n
    y = (1 - math.asinh(math.tan(math.radians(LAT))) / math.pi) / 2 * n
    return x, y


def telecharger(z, x, y):
    req = urllib.request.Request(URL.format(z=z, x=x, y=y), headers={"User-Agent": "NouvelleArdoise/1.0"})
    for _ in range(3):
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                return r.read()
        except Exception:
            continue
    return None  # hors de la couverture swisstopo : tuile sombre


SORTIE.mkdir(exist_ok=True)
index = {}
for z in ZOOMS:
    fx, fy = tuile(z)
    x0, y0 = int(fx) - COLS // 2, int(fy) - LIGNES // 2
    dossier = SORTIE / f"z{z}"
    dossier.mkdir(exist_ok=True)
    for j in range(LIGNES):
        for i in range(COLS):
            f = dossier / f"{j}_{i}.jpg"
            if not f.exists():
                donnees = telecharger(z, x0 + i, y0 + j)
                if donnees:
                    f.write_bytes(donnees)
                else:
                    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "lavfi", "-i", "color=c=0x1B2426:s=256x256",
                                    "-frames:v", "1", str(f)], check=True)
    # assemble la mosaïque avec ffmpeg (tuiles 256 px)
    entrees = sum((["-i", str(dossier / f"{j}_{i}.jpg")] for j in range(LIGNES) for i in range(COLS)), [])
    disposition = "|".join(f"{i * 256}_{j * 256}" for j in range(LIGNES) for i in range(COLS))
    subprocess.run(["ffmpeg", "-v", "error", "-y", *entrees, "-filter_complex",
                    f"xstack=inputs={COLS * LIGNES}:layout={disposition}", "-q:v", "3",
                    str(SORTIE / f"z{z}.jpg")], check=True)
    # position de l'adresse dans la mosaïque, en pixels
    index[z] = {"x": (fx - x0) * 256, "y": (fy - y0) * 256}
    print("zoom", z, "ok")

(SORTIE / "index.js").write_text("window.CARTE = " + json.dumps(index) + ";\n")
