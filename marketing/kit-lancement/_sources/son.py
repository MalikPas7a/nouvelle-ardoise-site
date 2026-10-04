"""Habillage sonore du réel, synthétisé (aucun droit à payer) et calé sur reel.html.

    python3 son.py sortie.wav

Une pulsation à 120 BPM, la brosse sur l'ardoise, un impact, des « pops » pour
les étiquettes et les mots, des souffles pour les transitions, un carillon sur le bouton.
Sur Instagram, on peut ajouter un son tendance par-dessus, volume bas.
"""
import math
import random
import struct
import sys
import wave

TAUX = 44100
DUREE = 15.0
n = int(TAUX * DUREE)
piste = [0.0] * n
alea = random.Random(7)


def ajoute(debut, duree, f):
    i0 = int(debut * TAUX)
    for i in range(max(0, i0), min(n, i0 + int(duree * TAUX))):
        piste[i] += f((i - i0) / TAUX)


def kick(t0, vol=0.5):
    # sinus qui chute de 140 à 45 Hz
    def f(t):
        phase = 2 * math.pi * (45 * t + (95 / 30) * (1 - math.exp(-30 * t)))
        return vol * math.sin(phase) * math.exp(-9 * t)
    ajoute(t0, 0.45, f)


def hat(t0, vol=0.06):
    ajoute(t0, 0.05, lambda t: vol * (alea.random() * 2 - 1) * math.exp(-90 * t))


def souffle(t0, duree, vol=0.25, montee=False):
    # bruit filtré avec une enveloppe en cloche (ou en montée)
    etat = [0.0]

    def f(t):
        k = t / duree
        env = k ** 2 if montee else math.sin(math.pi * k) ** 2
        coupe = 0.04 + 0.5 * (k if montee else math.sin(math.pi * k))
        etat[0] += coupe * ((alea.random() * 2 - 1) - etat[0])
        return vol * env * etat[0]
    ajoute(t0, duree, f)


def impact(t0):
    kick(t0, 0.95)
    souffle(t0, 0.9, 0.35)
    ajoute(t0, 1.6, lambda t: 0.35 * math.sin(2 * math.pi * 38 * t) * math.exp(-2.5 * t))


def pop(t0, vol=0.22, f0=900):
    ajoute(t0, 0.09, lambda t: vol * math.sin(2 * math.pi * (f0 + 2500 * t) * t) * math.exp(-45 * t))


def carillon(t0):
    for j, (f0, d) in enumerate([(1046.5, 0), (1318.5, 0.07), (1568.0, 0.14)]):
        ajoute(t0 + d, 1.2, lambda t, f0=f0: 0.12 * math.sin(2 * math.pi * f0 * t) * math.exp(-4 * t))


def frotte(t0, duree, vol=0.3, allers=1):
    # la brosse sur l'ardoise : bruit grave et granuleux, modulé à chaque aller-retour
    etat = [0.0]

    def f(t):
        k = t / duree
        mod = 0.55 + 0.45 * abs(math.sin(math.pi * allers * k))
        etat[0] += 0.18 * ((alea.random() * 2 - 1) - etat[0])
        grain = 1.0 + (2.5 if alea.random() < 0.01 else 0.0)
        return vol * math.sin(math.pi * k) ** 0.6 * mod * etat[0] * grain
    ajoute(t0, duree, f)


# pulsation 120 BPM, coupée pendant le ralenti puis relancée
for b in range(30):
    t = b * 0.5
    if 2.2 <= t < 4.5:
        continue
    kick(t, 0.32 if t < 11.75 else 0.42)
    hat(t + 0.25)

# accroche sur l'ardoise : un pop par mot, deux coups de brosse
for t in (0.0, 0.0, 0.12, 0.21, 0.3):
    pop(t, 0.12, 700)
frotte(0.62, 0.45, 0.5)  # « menu PDF. »
frotte(1.1, 1.08, 0.55, allers=3)  # toute l'ardoise
impact(2.2)
for t in (4.3, 4.6, 4.9, 5.2, 5.5):  # étiquettes
    pop(t + 0.18, 0.2, 1100)
for t in (6.0, 6.09, 6.25):  # « Chaque ingrédient, montré. »
    pop(t, 0.12, 700)
souffle(8.6, 0.8, 0.28)  # zoom arrière vers le téléphone
for t in (9.35, 9.44, 9.53, 9.6, 9.69, 9.78, 9.87):
    pop(t, 0.1, 700)
souffle(9.55, 0.9, 0.12)  # glissements du doigt
souffle(10.65, 0.95, 0.12)
souffle(11.65, 0.6, 0.35)  # rideau jaune
souffle(12.15, 0.45, 0.18, montee=True)  # le N s'allume
for t in (12.35, 12.44, 12.5, 12.59):
    pop(t, 0.1, 700)
frotte(12.95, 0.45, 0.45)  # « ancien site. »
carillon(13.45)  # bouton

# normalisation et petit fondu final pour une boucle propre
crete = max(abs(x) for x in piste) or 1
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(TAUX)
    donnees = bytearray()
    for i, x in enumerate(piste):
        fondu = min(1.0, (n - i) / (0.15 * TAUX))
        donnees += struct.pack("<h", int(32767 * 0.89 * fondu * math.tanh(1.2 * x / crete)))
    w.writeframes(bytes(donnees))
