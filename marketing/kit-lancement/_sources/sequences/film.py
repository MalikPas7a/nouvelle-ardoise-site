"""Convertit le rendu Blender du film « La mise en place » en séquence WebP pour l'accueil (cahier, §2.2).

    python3 film.py <dossier OUT de Blender> <public/sequences/mise-en-place-v1/m> [qualite=78]

f0012.png → 012.webp (3 chiffres, base 1). Qualité 78 pour m (720 × 1280), 74 pour g (1920 × 1080).
Affiche le nombre d'images, le poids total et les images suspectes (< 3 Ko : rendu vide ou coupé).
Sur le Mac, cwebp fait le même travail : cwebp -q 78 -m 6 -sharp_yuv f0012.png -o 012.webp
"""
import sys, pathlib
from PIL import Image
src, dst = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2]); q = int(sys.argv[3]) if len(sys.argv) > 3 else 78
dst.mkdir(parents=True, exist_ok=True)
n = 0
for png in sorted(src.glob('f*.png')):
    i = int(png.stem[1:])                                   # f0012 → 12
    Image.open(png).convert('RGB').save(dst / f'{i:03d}.webp', 'WEBP', quality=q, method=6); n += 1
fichiers = sorted(dst.glob('*.webp')); petits = [f.name for f in fichiers if f.stat().st_size < 3000]
print(n, 'images,', sum(f.stat().st_size for f in fichiers) // 1024, 'Ko ; images suspectes (< 3 Ko) :', petits or 'aucune')
