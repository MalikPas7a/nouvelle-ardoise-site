"""Habillage sonore du réel « menu du jour », synthétisé (aucun droit à payer), calé sur reel-menu.html.

    python3 son_menu.py sortie.wav

Le vent de la plongée aérienne, l'impact de l'épingle, la brosse sur l'ardoise, des « pops »
pour chaque plat, une pulsation à 110 BPM et un carillon sur le bouton.
Sur Instagram, on peut ajouter un son tendance par-dessus, volume bas.
"""
import math
import random
import struct
import sys
import wave

TAUX = 44100
DUREE = 16.0
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


def clic(t0, vol=0.22):
    # un clic de bouton : court, sec, doux
    ajoute(t0, 0.03, lambda t: vol * (alea.random() * 2 - 1) * math.exp(-260 * t))
    ajoute(t0, 0.06, lambda t: vol * 0.8 * math.sin(2 * math.pi * 1800 * t) * math.exp(-90 * t))


# la plongée : un long souffle qui monte, deux passages de nuages
souffle(0.0, 4.3, 0.32, montee=True)
souffle(0.25, 1.1, 0.2)
souffle(0.7, 1.2, 0.16)
for t in (0.1, 0.16, 0.22, 0.34, 0.4):  # « Il est 11 h 45 à Genève. »
    pop(t, 0.07, 650)
for t in (2.1, 2.16, 2.22, 2.34, 2.4):
    pop(t, 0.07, 700)
# pulsation à partir de l'arrivée sur la ville
for b in range(26):
    t = 2.2 + b * 60 / 110
    if t < 15.6:
        kick(t, 0.24)
        hat(t + 30 / 110, 0.05)
impact(4.02)  # l'épingle se plante
pop(3.95, 0.16, 520)
clic(4.25, 0.15)  # l'étiquette de l'adresse
souffle(4.3, 0.6, 0.22)  # la photo s'ouvre
for t in (5.0, 5.06, 5.12, 5.18, 5.3, 5.36):
    pop(t, 0.07, 800)
frotte(7.0, 1.45, 0.5, allers=7)  # le coup d'éponge
for t in (8.55, 8.95, 9.95, 10.95):  # titre et rubriques
    pop(t, 0.15, 620)
for t in (9.1, 9.55, 10.1, 10.55):  # les plats s'écrivent
    pop(t, 0.11, 1000)
    pop(t + 0.12, 0.08, 1150)
for t in (9.45, 10.45):  # « ou » à la craie
    clic(t, 0.14)
for i in range(3):  # site, Google, Instagram
    clic(11.5 + i * 0.16, 0.16)
    pop(11.55 + i * 0.16, 0.1, 1300 + i * 120)
souffle(12.85, 0.5, 0.16)
souffle(13.2, 0.5, 0.12, montee=True)  # le N s'allume
carillon(14.2)

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
