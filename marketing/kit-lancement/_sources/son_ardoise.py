"""Habillage sonore du réel « sur mesure » (votre restaurant, votre vidéo, votre site), synthétisé
(aucun droit à payer), calé sur reel-ardoise.html.

    python3 son_ardoise.py sortie.wav

La brosse sur l'ardoise, une pulsation à 110 BPM sur le motion design, l'ambiance feutrée du
bistrot (un verre qui tinte), le grésillement de l'assiette chaude et un carillon sur le bouton.
"""
import math
import random
import struct
import sys
import wave

TAUX = 44100
DUREE = 23.0
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


def tinte(t0, vol=0.08):
    # un verre qu'on effleure : quelques partiels aigus qui s'éteignent lentement
    for f0, a in ((2637.0, 1.0), (3951.0, 0.5), (5274.0, 0.3)):
        ajoute(t0, 2.0, lambda t, f0=f0, a=a: vol * a * math.sin(2 * math.pi * f0 * t) * math.exp(-2.2 * t))


def gresille(t0, duree, vol=0.05):
    # le grésillement d'un plat chaud : petits craquements aléatoires
    def f(t):
        env = min(1.0, t / 0.4) * min(1.0, (duree - t) / 0.6)
        return vol * env * ((alea.random() * 2 - 1) if alea.random() < 0.08 else 0.0)
    ajoute(t0, duree, f)


def salle(t0, duree, vol=0.05):
    # le brouhaha étouffé d'une salle : bruit très grave, filtré
    etat = [0.0]

    def f(t):
        env = min(1.0, t / 0.5) * min(1.0, (duree - t) / 0.5)
        etat[0] += 0.02 * ((alea.random() * 2 - 1) - etat[0])
        return vol * 6 * env * etat[0]
    ajoute(t0, duree, f)


for t in (0.1, 0.16, 0.22, 0.28, 0.34, 0.42, 0.48):  # « Votre menu du jour mérite mieux qu'une ardoise. »
    pop(t, 0.06, 700)
souffle(2.0, 0.45, 0.18)  # la brosse arrive
frotte(2.4, 1.25, 0.5, allers=7)  # le coup d'éponge
souffle(3.5, 3.1, 0.3, montee=True)  # la plongée sur Genève
souffle(3.6, 1.0, 0.18)
for t in (3.65, 3.77, 5.3, 5.42):
    pop(t, 0.1, 680)
B = 60 / 110
for b in range(34):  # pulsation, de la ville jusqu'à l'appel
    t = 5.3 + b * B
    if t < 21.2:
        kick(t, 0.2 if 7.0 <= t < 12.3 else 0.27)
        hat(t + B / 2, 0.05)
impact(6.25)  # l'épingle de Sora se plante
pop(6.3, 0.12, 900)
souffle(6.8, 0.6, 0.26, montee=True)  # on plonge vers la porte
# le tournage
souffle(7.0, 0.5, 0.2)
salle(7.0, 2.8, 0.05)
for t in (7.5, 9.9):
    clic(t, 0.2)  # « REC »
tinte(8.3, 0.05)
gresille(9.6, 2.7, 0.06)  # les nouilles
pop(10.5, 0.12, 900)  # étiquette « ramen du jour »
# le site
souffle(12.25, 0.45, 0.2)
souffle(12.4, 0.5, 0.15)
frotte(13.9, 0.7, 0.3, allers=2)  # l'éponge sur le site
pop(14.6, 0.14, 1200)  # « À l'instant »
clic(14.65, 0.14)
# le réel
souffle(16.3, 0.45, 0.2)
for i in range(8):  # les cœurs
    pop(16.95 + i * 0.2, 0.07, 1300 + 60 * i)
souffle(18.6, 0.45, 0.16)  # les deux téléphones côte à côte
souffle(19.6, 0.5, 0.12, montee=True)  # le N s'allume
for i in range(3):  # vidéo sur place, site, réseaux
    pop(20.45 + i * B / 2, 0.14, 1000 + i * 150)
carillon(21.25)

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
