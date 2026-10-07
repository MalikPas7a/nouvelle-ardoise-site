"""Habillage sonore du réel « manifeste » Nouvelle Ardoise, synthétisé (aucun droit à payer),
calé sur reel-manifeste.html : 120 BPM, un temps = 0,5 s, 24 s.

    python3 son_manifeste.py sortie.wav

Reprend les instruments de son_ardoise.py et ajoute une basse et une nappe d'accords
(la mineur, fa, do, sol) pour porter le rythme.
"""
import math
from pathlib import Path

source = (Path(__file__).parent / "son_ardoise.py").read_text(encoding="utf-8")
espace = {"__name__": "son_manifeste"}
exec(source.split("B = 60 / 110")[0].replace("DUREE = 23.0", "DUREE = 24.0"), espace)
g = espace.get
ajoute, souffle, kick, hat, impact, pop, clic, tinte, carillon, frotte = (
    g("ajoute"), g("souffle"), g("kick"), g("hat"), g("impact"), g("pop"), g("clic"), g("tinte"), g("carillon"), g("frotte"))

B = 0.5
NOTES = {"la": 55.0, "fa": 43.65, "do": 65.41, "sol": 49.0}
ACCORDS = {"la": (220.0, 261.63, 329.63), "fa": (174.61, 220.0, 261.63), "do": (196.0, 261.63, 329.63), "sol": (196.0, 246.94, 293.66)}
GRILLE = ["la", "fa", "do", "sol"]


def basse(t0, f, duree=0.45, vol=0.22):
    ajoute(t0, duree, lambda t: vol * math.tanh(2.2 * math.sin(2 * math.pi * f * t)) * math.exp(-3.5 * t) * min(1, t * 200))


def nappe(t0, freqs, duree, vol=0.035):
    def s(t):
        env = min(1, t / 0.25) * min(1, (duree - t) / 0.3)
        return vol * env * sum(math.sin(2 * math.pi * f * t) + 0.3 * math.sin(2 * math.pi * f * 2.005 * t) for f in freqs)
    ajoute(t0, duree, s)


# 1. Genève : montée, puis impact sur « Genève. »
souffle(0.0, 0.6, 0.2, montee=True)
impact(0.5)
nappe(0.5, ACCORDS["la"], 2.0, 0.03)
for i in range(4):
    clic(1.2 + i * 0.12, 0.12)
souffle(2.2, 0.35, 0.22, montee=True)

# 2 à 6. le tempo, de 2,5 s à 19 s ; une mesure (4 temps) par accord
for b in range(33):
    t = 2.5 + b * B
    if t >= 19.0:
        break
    accord = GRILLE[(b // 4) % 4]
    kick(t, 0.24 if 7.0 <= t < 13.0 else 0.2)
    hat(t + B / 2, 0.05)
    if b % 2 == 1:
        hat(t, 0.08)
    basse(t, NOTES[accord])
    basse(t + B * 0.75, NOTES[accord] * 2, 0.2, 0.1)
    if b % 4 == 0:
        nappe(t, ACCORDS[accord], 4 * B, 0.03)

impact(2.5)
pop(2.9, 0.12, 900)                    # « visibilité » sur son pavé jaune
impact(5.0)                            # la confiance
frotte(5.8, 0.6, 0.12)                 # la craie entoure le mot
for i in range(6):                     # les six services
    t = 7.0 + i * 2 * B
    impact(t)
    pop(t + 0.05, 0.13, 700 + 90 * i)
souffle(12.8, 0.3, 0.2)
impact(13.0)
for i, t in enumerate([13.6, 13.85, 14.9]):   # les bulles du schéma
    pop(t, 0.14, 800 + 150 * i)
frotte(14.1, 0.4, 0.1)
for i in range(4):                     # la mosaïque
    pop(16.0 + i * B / 2, 0.12, 1000 + 120 * i)
tinte(17.3, 0.05)
souffle(18.8, 0.3, 0.2, montee=True)

# 7. l'appel : le N s'allume, carillon sur le bouton
impact(19.0)
nappe(19.0, ACCORDS["la"], 5.0, 0.035)
souffle(19.1, 0.6, 0.12, montee=True)
carillon(20.95)

exec("# normalisation" + source.split("# normalisation")[1], espace)
