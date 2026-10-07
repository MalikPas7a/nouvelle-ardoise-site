"""Musique du réel « manifeste » Nouvelle Ardoise, synthétisée (aucun droit à payer), calée sur
reel-manifeste.html : 120 BPM, un temps = 0,5 s, 24 s.

    python3 son_manifeste.py sortie.wav

Volontairement différente des autres réels (aucun instrument de son_ardoise.py) : une boucle
house lumineuse en ré mineur, avec grosse caisse, clap sur les temps 2 et 4, cloche boisée,
arpège pincé en doubles croches, basse ronde, montées de bruit blanc avant chaque volet jaune
et un « drop » sur les six services.
"""
import math
import random
import struct
import sys
import wave

TAUX = 44100
DUREE = 24.0
B = 0.5                      # un temps
n = int(TAUX * DUREE)
gauche = [0.0] * n
droite = [0.0] * n
alea = random.Random(11)


def ajoute(debut, duree, f, pan=0.0):
    i0 = int(debut * TAUX)
    gl, gd = math.cos((pan + 1) * math.pi / 4), math.sin((pan + 1) * math.pi / 4)
    for i in range(max(0, i0), min(n, i0 + int(duree * TAUX))):
        v = f((i - i0) / TAUX)
        gauche[i] += v * gl
        droite[i] += v * gd


def caisse(t0, vol=0.55):
    # grosse caisse courte et sèche : sinus de 120 à 50 Hz avec un clic d'attaque
    def f(t):
        phase = 2 * math.pi * (50 * t + (70 / 25) * (1 - math.exp(-25 * t)))
        return vol * (math.sin(phase) * math.exp(-7 * t) + 0.3 * math.exp(-400 * t))
    ajoute(t0, 0.35, f)


def clap(t0, vol=0.22):
    # trois petites rafales de bruit filtré, comme des mains
    def f(t):
        r = alea.random() * 2 - 1
        rafales = sum(math.exp(-180 * (t - d)) for d in (0, 0.011, 0.022) if t >= d)
        return vol * r * (rafales * 0.5 + math.exp(-22 * t) * 0.6)
    ajoute(t0, 0.25, f, pan=0.1)


def charleston(t0, vol=0.05, ouvert=False):
    dec = 18 if ouvert else 70
    prec = [0.0]
    def f(t):
        r = alea.random() * 2 - 1
        hp = r - prec[0]
        prec[0] = r
        return vol * hp * math.exp(-dec * t)
    ajoute(t0, 0.25 if ouvert else 0.06, f, pan=-0.3)


def cloche(t0, vol=0.08, freq=1250):
    # bloc de bois / cloche courte, syncopée
    ajoute(t0, 0.12, lambda t: vol * math.sin(2 * math.pi * freq * t) * math.exp(-45 * t), pan=0.4)


def pince(t0, f0, vol=0.06, pan=0.0):
    # note pincée (corde synthétique de Karplus-Strong simplifiée en somme d'harmoniques amorties)
    def f(t):
        return vol * sum(math.sin(2 * math.pi * f0 * k * t) * math.exp(-(6 + 5 * k) * t) / k for k in (1, 2, 3, 4))
    ajoute(t0, 0.4, f, pan)


def basse(t0, f0, duree=0.42, vol=0.24):
    def f(t):
        env = min(1, t * 150) * math.exp(-2.2 * t)
        return vol * env * (math.sin(2 * math.pi * f0 * t) + 0.25 * math.sin(4 * math.pi * f0 * t))
    ajoute(t0, duree, f)


def accord(t0, freqs, duree, vol=0.022):
    # nappe douce, légèrement désaccordée en stéréo
    for j, fr in enumerate(freqs):
        def f(t, fr=fr):
            env = min(1, t / 0.08) * math.exp(-1.2 * t) * min(1, (duree - t) / 0.1)
            return vol * env * (math.sin(2 * math.pi * fr * t) + math.sin(2 * math.pi * fr * 1.004 * t))
        ajoute(t0, duree, f, pan=(-0.5 + j * 0.5))


def montee(t0, duree, vol=0.12):
    # bruit blanc qui s'ouvre avant un volet jaune
    prec = [0.0]
    def f(t):
        k = t / duree
        r = alea.random() * 2 - 1
        prec[0] = prec[0] + (r - prec[0]) * (0.05 + 0.9 * k)
        return vol * prec[0] * k * k
    ajoute(t0, duree, f)


def choc(t0, vol=0.3):
    # impact grave + souffle, sur les transitions
    ajoute(t0, 0.8, lambda t: vol * math.sin(2 * math.pi * 40 * t) * math.exp(-4 * t))
    ajoute(t0, 0.4, lambda t: vol * 0.4 * (alea.random() * 2 - 1) * math.exp(-10 * t))


def scintille(t0, vol=0.05):
    for i, fr in enumerate((1760, 2217, 2637, 3520)):
        ajoute(t0 + i * 0.05, 0.5, lambda t, fr=fr: vol * math.sin(2 * math.pi * fr * t) * math.exp(-6 * t), pan=-0.6 + 0.4 * i)


# ré mineur : Rém – Si♭ – Fa – Do, une mesure (4 temps) chacun
D, BB, F, C = 73.42, 58.27, 87.31, 65.41
GRILLE = [D, BB, F, C]
ACCORDS = {D: (293.66, 349.23, 440.0), BB: (233.08, 293.66, 349.23), F: (261.63, 349.23, 440.0), C: (261.63, 329.63, 392.0)}
ARPEGE = {D: (587.33, 698.46, 880.0, 698.46), BB: (466.16, 587.33, 698.46, 587.33),
          F: (523.25, 698.46, 880.0, 698.46), C: (523.25, 659.25, 783.99, 659.25)}

# 0 → 2,5 s : l'écran jaune, arpège seul puis montée
for i in range(20):
    t = i * B / 4
    pince(t, ARPEGE[D][i % 4], 0.05, pan=0.3 if i % 2 else -0.3)
accord(0.05, ACCORDS[D], 2.0, 0.018)
caisse(0.05, 0.4)                       # « Nouvelle »
caisse(0.3, 0.4)                        # « Ardoise. »
choc(0.95, 0.15)                        # la bande ardoise
montee(1.6, 0.9)

# 2,5 → 19 s : la boucle complète (plus dense pendant les services, 7 → 13 s)
for b in range(33):
    t = 2.5 + b * B
    if t >= 19.0:
        break
    accordant = GRILLE[(b // 4) % 4]
    dense = 7.0 <= t < 13.0
    caisse(t, 0.55 if dense else 0.45)
    if b % 2 == 1:
        clap(t)
    charleston(t + B / 2, 0.06, ouvert=True)
    if dense:
        charleston(t + B / 4, 0.035)
        charleston(t + 3 * B / 4, 0.035)
    if b % 4 in (1, 3):
        cloche(t + 3 * B / 4, 0.06, 1250 if b % 8 < 4 else 1100)
    basse(t + B / 2, accordant)          # basse sur le contretemps, à la house
    if b % 4 == 0:
        accord(t, ACCORDS[accordant], 4 * B, 0.02 if not dense else 0.026)
    for k in range(4):                   # arpège en doubles croches
        pince(t + k * B / 4, ARPEGE[accordant][k], 0.035 if not dense else 0.045, pan=0.35 if k % 2 else -0.35)

# transitions : montée de bruit puis choc sur chaque volet jaune
for t0 in (2.5, 5.0, 13.0, 19.0):
    if t0 != 2.5:
        montee(t0 - 0.9, 0.9)
    choc(t0)
choc(7.0, 0.35)                          # le drop des services
for i in range(6):                       # un accent par service
    scintille(7.0 + i * 2 * B, 0.03)
scintille(17.3, 0.05)                    # « vivant »

# 19 → 24 s : l'appel, la boucle s'allège puis s'éteint
for b in range(10):
    t = 19.0 + b * B
    accordant = D if b < 4 else (BB if b < 8 else D)
    if b < 8:
        caisse(t, 0.3)
        charleston(t + B / 2, 0.04, ouvert=True)
    for k in range(4):
        pince(t + k * B / 4, ARPEGE[accordant][k], 0.03 * (1 - b / 12), pan=0.35 if k % 2 else -0.35)
accord(19.0, ACCORDS[D], 2.0, 0.025)
accord(21.0, ACCORDS[BB], 2.0, 0.022)
accord(23.0, ACCORDS[D], 1.0, 0.02)
scintille(20.95, 0.07)                   # le bouton « Parlons-en »

# normalisation, fondu final, écriture en stéréo
crete = max(max(abs(v) for v in gauche), max(abs(v) for v in droite)) or 1.0
fondu = int(0.6 * TAUX)
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(TAUX)
    trames = bytearray()
    for i in range(n):
        k = min(1.0, (n - i) / fondu) * 0.89 / crete
        trames += struct.pack("<hh", int(max(-1, min(1, gauche[i] * k)) * 32767), int(max(-1, min(1, droite[i] * k)) * 32767))
    w.writeframes(bytes(trames))
