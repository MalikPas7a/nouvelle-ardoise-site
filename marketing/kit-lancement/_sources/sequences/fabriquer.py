"""Fabrique les images d'une animation au défilement à partir de plans vidéo réels.

    python3 fabriquer.py <nom> <dossier des vidéos> "<fichier> <début> <durée> <centre x>" ...

Les plans s'enchaînent en fondu (0,4 s). « centre x » (0 à 1) place le sujet dans le cadrage
vertical du téléphone. Écrit public/sequences/<nom>/m (720 × 1280, téléphone) et g (1600 × 900,
ordinateur), 15 images par seconde, en WebP, et affiche le nombre d'images et le début de
chaque plan (en part de la séquence) pour régler les textes de la page.
"""
import shutil
import subprocess
import sys
from pathlib import Path

nom, src, *plans = sys.argv[1:]
plans = [p.split() for p in plans]
racine = Path(__file__).resolve().parents[4] / 'public' / 'sequences' / nom
FONDU = 0.4
GRADE = 'eq=contrast=1.08:saturation=1.15:gamma=0.98'

def lancer(dossier, cadre):
    sortie = racine / dossier
    shutil.rmtree(sortie, ignore_errors=True)
    sortie.mkdir(parents=True)
    entrees, filtres = [], []
    for i, (f, debut, duree, cx) in enumerate(plans):
        entrees += ['-ss', debut, '-t', duree, '-i', str(Path(src) / f)]
        filtres.append(f'[{i}:v]{cadre(float(cx))},{GRADE},fps=30,setsar=1,format=yuv420p,setpts=PTS-STARTPTS[p{i}]')
    chaine, offset, debuts = '[p0]', 0.0, [0.0]
    for i in range(1, len(plans)):
        offset += float(plans[i - 1][2]) - FONDU
        debuts.append(offset)
        filtres.append(f'{chaine}[p{i}]xfade=transition=fade:duration={FONDU}:offset={offset:.3f}[x{i}]')
        chaine = f'[x{i}]'
    total = offset + float(plans[-1][2])
    filtres.append(f'{chaine}fps=15,unsharp=5:5:0.4[v]')
    subprocess.run(['ffmpeg', '-v', 'error', *entrees, '-filter_complex', ';'.join(filtres), '-map', '[v]',
                    '-c:v', 'libwebp', '-quality', '80', '-compression_level', '6', str(sortie / '%03d.webp')], check=True)
    return len(list(sortie.iterdir())), [round(d / total, 3) for d in debuts]

# téléphone : bande verticale 9:16 prise dans le plan, centrée sur le sujet
m = lambda cx: f"crop='ih*9/16':ih:'min(max(iw*{cx}-ih*9/32,0),iw-ih*9/16)':0,scale=720:1280:flags=lanczos"
g = lambda cx: 'scale=1600:900:flags=lanczos'
for dossier, cadre in (('m', m), ('g', g)):
    n, debuts = lancer(dossier, cadre)
    print(dossier, n, 'images, débuts des plans :', debuts)
