"""Habillage sonore du réel « artisan » (Maison Fève, chocolatier inventé), synthétisé
(aucun droit à payer), calé sur reel-artisan.html.

    python3 son_artisan.py sortie.wav

Reprend les sons de son_ardoise.py (même boîte à outils) sur un tempo plus lent, 96 BPM, plus feutré :
le chocolat qui coule, la plongée sur Carouge, l'atelier, les pastilles de la gamme, les médailles,
et le carillon sur le bouton.
"""
import importlib.util
import sys
from pathlib import Path

# on réutilise les instruments de son_ardoise.py sans exécuter sa partition
source = (Path(__file__).parent / "son_ardoise.py").read_text(encoding="utf-8")
outils = source.split("B = 60 / 110")[0].replace("DUREE = 23.0", "DUREE = 24.0")
espace = {"__name__": "son_artisan"}
exec(outils, espace)
g = espace.get

souffle, kick, hat, impact, pop, clic, tinte, gresille, salle, carillon, frotte = (
    g("souffle"), g("kick"), g("hat"), g("impact"), g("pop"), g("clic"), g("tinte"), g("gresille"), g("salle"), g("carillon"), g("frotte"))

gresille(0.0, 3.3, 0.05)            # le chocolat qui coule
souffle(0.1, 0.8, 0.14)
souffle(3.1, 0.5, 0.2)              # l'ouverture en cercle sur le ciel
souffle(3.3, 3.0, 0.28, montee=True)  # la plongée sur Carouge
B = 60 / 96
for b in range(34):                 # pulsation feutrée jusqu'à l'appel
    t = 3.3 + b * B
    if t < 22.6:
        kick(t, 0.16 if 7.5 <= t < 12.5 else 0.22)
        hat(t + B / 2, 0.04)
impact(6.15)                        # l'épingle se plante
pop(6.2, 0.12, 820)
souffle(7.5, 0.4, 0.18)             # l'atelier
salle(7.5, 5.0, 0.04)
clic(7.9, 0.18)                     # « REC »
gresille(7.6, 2.5, 0.05)
souffle(10.0, 0.3, 0.16)            # le flash entre les deux plans
frotte(10.4, 1.2, 0.18, allers=3)   # le raclage
souffle(12.4, 0.5, 0.16)            # la création finie
for i in range(4):                  # pralinés, truffes, tablettes, coffrets
    pop(13.5 + i * 0.22, 0.12, 900 + i * 120)
souffle(15.4, 0.5, 0.18)            # le fond crème s'ouvre
for i in range(3):                  # les trois distinctions
    pop(16.4 + i * 0.3, 0.14, 1000 + i * 160)
    tinte(16.5 + i * 0.3, 0.05)
souffle(18.6, 0.45, 0.16)           # où nous trouver
impact(19.15)
for i in range(3):
    pop(19.4 + i * 0.22, 0.08, 1200)
souffle(21.2, 0.5, 0.12, montee=True)  # le N s'allume
for i in range(3):                  # shooting, réels, site
    pop(21.95 + i * 0.22, 0.14, 1000 + i * 150)
carillon(22.65)

espace_fin = source.split("# normalisation")[1]
exec("# normalisation" + espace_fin, espace)
