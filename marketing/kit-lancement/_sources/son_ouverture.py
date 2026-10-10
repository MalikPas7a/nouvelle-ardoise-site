"""Habillage sonore du réel « nouvelles ouvertures » (Maison Lune, restaurant inventé), synthétisé
(aucun droit à payer), calé sur reel-ouverture.html.

    python3 son_ouverture.py sortie.wav

Reprend les instruments de son_ardoise.py sur 120 BPM, coupes sur le temps : le vin versé, les coches
de la liste, le coup d'éponge, le 360°, la marque, le « REC », la grille Instagram, le toast,
le quartier, la stratégie, la salle pleine, puis le carillon sur « Prenons un café ».
"""
import sys
from pathlib import Path

# on réutilise les instruments de son_ardoise.py sans exécuter sa partition
source = (Path(__file__).parent / "son_ardoise.py").read_text(encoding="utf-8")
outils = source.split("B = 60 / 110")[0].replace("DUREE = 23.0", "DUREE = 27.0")
espace = {"__name__": "son_ouverture"}
exec(outils, espace)
g = espace.get

souffle, kick, hat, impact, pop, clic, tinte, gresille, salle, carillon, frotte = (
    g("souffle"), g("kick"), g("hat"), g("impact"), g("pop"), g("clic"), g("tinte"), g("gresille"), g("salle"), g("carillon"), g("frotte"))

B = 0.5                              # 120 BPM
gresille(0.0, 2.6, 0.06)             # le vin versé
souffle(0.0, 1.0, 0.12)
souffle(2.2, 0.4, 0.2, montee=True)
for b in range(int((25.4 - 2.6) / B)):   # la pulsation, du premier plan sur l'ardoise jusqu'au bouton
    t = 2.6 + b * B
    if 6.0 <= t < 6.6:               # silence pendant le coup d'éponge
        continue
    kick(t, 0.42 if b % 2 == 0 else 0.3)
    hat(t + B / 2, 0.05)
for i in range(4):                   # les quatre coches
    pop(3.2 + i * 0.5, 0.14, 900 + i * 110)
tinte(5.0, 0.08)                     # « La communication ? »
frotte(5.9, 0.6, 0.3, allers=1)      # le coup d'éponge
impact(6.95)                         # 360°
for coupe in (2.6, 6.6, 8.2, 10.2, 12.2, 15.6, 17.1, 19.6, 23.8):   # un coup sur chaque coupe
    impact(coupe)
    souffle(coupe - 0.15, 0.2, 0.22, montee=True)
souffle(7.1, 0.6, 0.14)
souffle(8.15, 0.35, 0.18)            # la marque
for i in range(4):                   # la palette
    pop(9.25 + i * 0.1, 0.12, 1000 + i * 140)
souffle(10.15, 0.35, 0.2)            # le shooting
clic(10.4, 0.22)
clic(11.4, 0.18)
souffle(12.15, 0.35, 0.18)           # les réseaux
for i in range(9):                   # la grille qui se remplit
    pop(12.6 + i * 0.125, 0.08, 1100 + i * 40)
tinte(13.8, 0.08)                    # la notification
impact(14.6)                         # la soirée
salle(14.6, 2.5, 0.05)
tinte(14.9, 0.1)
souffle(15.55, 0.3, 0.2)
gresille(15.6, 1.4, 0.05)            # les bulles
souffle(17.1, 0.35, 0.16)            # le quartier
for i in range(3):
    pop(17.75 + i * 0.3, 0.14, 950 + i * 150)
souffle(19.6, 0.35, 0.16)            # la stratégie
for i in range(5):
    pop(19.8 + i * 0.25, 0.12, 800 + i * 120)
impact(21.6)                         # la salle pleine
salle(21.6, 2.2, 0.06)
souffle(23.75, 0.5, 0.14, montee=True)   # le N s'allume
pop(25.0, 0.16, 1300)                # l'offre
carillon(25.45)

espace_fin = source.split("# normalisation")[1]
exec("# normalisation" + espace_fin, espace)
