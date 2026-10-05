"""Habillage sonore du réel « coulisses » (Maison Fève, chocolatier inventé), synthétisé
(aucun droit à payer), calé sur reel-coulisses.html : 120 BPM, un temps = 0,5 s.

    python3 son_coulisses.py sortie.wav

Reprend les instruments de son_ardoise.py : tic-tac de l'horodatage, coups sur chaque bande,
montée de la jauge, frappes au rythme des mots, reflet de lumière, pops des quatre téléphones,
carillon sur le bouton.
"""
from pathlib import Path

source = (Path(__file__).parent / "son_ardoise.py").read_text(encoding="utf-8")
espace = {"__name__": "son_coulisses"}
exec(source.split("B = 60 / 110")[0].replace("DUREE = 23.0", "DUREE = 20.0"), espace)
g = espace.get
souffle, kick, hat, impact, pop, clic, tinte, gresille, carillon, frotte = (
    g("souffle"), g("kick"), g("hat"), g("impact"), g("pop"), g("clic"), g("tinte"), g("gresille"), g("carillon"), g("frotte"))

B = 0.5
for i in range(9):                     # l'horodatage qui défile, 05:52 → 06:00
    clic(0.1 + i * 0.1, 0.12)
gresille(0.0, 2.0, 0.04)               # le chocolat qui coule
souffle(1.6, 0.4, 0.22, montee=True)
impact(2.0)                            # le flash, puis le tempo démarre
for b in range(30):
    t = 2.0 + b * B
    if t < 17.0:
        kick(t, 0.26 if 7.0 <= t < 10.0 else 0.2)
        hat(t + B / 2, 0.05)
for i in range(3):                     # les trois bandes
    souffle(2.0 + i * B / 2, 0.35, 0.16)
    pop(2.6 + i * B / 2, 0.12, 900 + i * 140)
souffle(4.3, 0.35, 0.2)                # les bandes repartent
souffle(4.45, 0.5, 0.2)                # ouverture en cercle sur le glaçage
souffle(5.2, 1.0, 0.12, montee=True)   # la jauge monte
tinte(6.2, 0.06)
for i in range(4):                     # un mot frappé par plan
    t = 7.0 + i * B * 1.5
    impact(t)
    pop(t + 0.04, 0.12, 700 + 80 * i)
souffle(10.0, 0.6, 0.22, montee=True)  # la traversée vers la pièce finie
souffle(10.3, 1.0, 0.1)                # le reflet de lumière
tinte(11.3, 0.05)
souffle(13.0, 0.4, 0.18)               # le fond crème
for i in range(4):                     # les quatre téléphones
    pop(13.7 + i * B / 2, 0.14, 1000 + i * 150)
souffle(16.95, 0.35, 0.18)
souffle(17.0, 0.5, 0.12, montee=True)  # le N s'allume
carillon(18.05)

exec("# normalisation" + source.split("# normalisation")[1], espace)
