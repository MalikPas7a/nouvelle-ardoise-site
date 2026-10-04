"""Musique du réel rythmé (voix/plan-rythme.js), sans voix : 120 BPM, synthétisée (aucun droit à
payer). Grosse caisse sur chaque temps, claquement sur 2 et 4, charleston en doubles croches,
basse décalée, accords en notes piquées, un impact à chaque coupe et une montée avant la fin.

    python3 son_rythme.py sortie.wav
"""
import json
import re
import sys
import wave
from pathlib import Path

import numpy as np

ICI = Path(__file__).parent
TAUX = 44100
PLAN = json.loads(re.search(r'\[.*\]', (ICI / 'voix' / 'plan-rythme.js').read_text(), re.S).group(0))
debut = 0.0
for p in PLAN:
    p['debut'] = debut
    debut += p['duree']
DUREE = debut
N = int(TAUX * DUREE)
A = {p['id']: p for p in PLAN}
alea = np.random.default_rng(3)
T = np.arange(N) / TAUX
TEMPS = 0.5


def piste():
    return np.zeros(N)


def poser(dest, t0, son, vol=1.0):
    i0 = int(round(t0 * TAUX))
    if 0 <= i0 < N:
        son = son[: N - i0]
        dest[i0:i0 + len(son)] += vol * son


def tps(d):
    return np.arange(int(d * TAUX)) / TAUX


def bruit(d):
    return alea.uniform(-1, 1, int(d * TAUX))


def passe_haut(x):
    return np.concatenate([[0], np.diff(x)])


def lisse(x, n):
    return np.convolve(x, np.ones(n) / n, mode='same')


def kick():
    t = tps(0.4)
    return np.tanh(2.2 * np.sin(2 * np.pi * (45 * t + (110 / 28) * (1 - np.exp(-28 * t)))) * np.exp(-7 * t))


def clap():
    t = tps(0.25)
    env = np.exp(-25 * t) + 0.6 * np.exp(-60 * np.maximum(0, t - 0.012)) * (t > 0.012)
    return passe_haut(lisse(bruit(0.25), 3)) * env * 1.5


def hat(ouvert=False):
    t = tps(0.2 if ouvert else 0.05)
    return passe_haut(passe_haut(bruit(len(t) / TAUX))) * np.exp(-(12 if ouvert else 70) * t)


def pique(f, d=0.22):
    t = tps(d)
    s = np.sign(np.sin(2 * np.pi * f * t)) * 0.3 + np.sin(2 * np.pi * f * t) + 0.5 * np.sin(4 * np.pi * f * t)
    return lisse(s, 6) * np.exp(-14 * t)


def basse(f, d=0.24):
    t = tps(d)
    return np.tanh(1.8 * np.sin(2 * np.pi * f * t)) * np.minimum(1, t / 0.005) * np.exp(-6 * t)


ACCORDS = [(73.42, [293.66, 369.99, 440.0]), (61.74, [246.94, 293.66, 369.99]),
           (49.0, [196.0, 246.94, 293.66]), (55.0, [220.0, 277.18, 329.63])]
batt, harmo, sfx = piste(), piste(), piste()
t_fin = A['fin']['debut']
n_temps = int(DUREE / TEMPS)
K, C, HO = kick(), clap(), hat(True)
for b in range(n_temps):
    t0 = b * TEMPS
    mesure = b // 4
    racine, notes = ACCORDS[(mesure // 1) % 4]
    coupe = t_fin - TEMPS <= t0 < t_fin          # un temps de silence avant la fin
    if coupe or t0 >= DUREE - 1.0:
        continue
    intro = t0 < A['probleme']['debut']
    poser(batt, t0, K, 0.9)
    if b % 2 == 1 and not intro:
        poser(batt, t0, C, 0.45)
    for s in range(4):
        if not intro or s == 2:
            poser(batt, t0 + s * TEMPS / 4, hat(), 0.12 if s % 2 else 0.07)
    if not intro:
        poser(batt, t0 + TEMPS / 2, HO, 0.06)
        # basse décalée, sur le contretemps
        poser(harmo, t0 + TEMPS / 2, basse(racine * 2), 0.35)
    # accords piqués : deux par temps, motif syncopé
    for k, dt in enumerate((0, 0.375) if b % 2 == 0 else (0.25,)):
        for f in notes:
            poser(harmo, t0 + dt * TEMPS * 2 / 1.5, pique(f * 2), 0.07)

# un impact grave et un souffle à chaque coupe
for p in PLAN[1:]:
    t = tps(0.6)
    poser(sfx, p['debut'], np.sin(2 * np.pi * 50 * t) * np.exp(-6 * t), 0.35)
    d = 0.4
    tt = tps(d)
    souffle = lisse(bruit(d), 4) * (tt / d) ** 2
    poser(sfx, p['debut'] - d, souffle, 0.12)
# la montée avant la fin, puis l'impact et le carillon du N
d = 2.0
tt = tps(d)
poser(sfx, t_fin - d, lisse(bruit(d), 3) * (tt / d) ** 3, 0.3)
t = tps(1.5)
poser(sfx, t_fin, np.sin(2 * np.pi * 42 * t) * np.exp(-3 * t), 0.7)
for k, f in enumerate((587.33, 880, 1174.66)):
    t = tps(2.0)
    poser(sfx, t_fin + 0.3 + k * 0.08, (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t)) * np.exp(-2 * t), 0.12)
# les petits bruitages de l'image
ph = A['photographe']
for i in range(5):
    poser(sfx, ph['debut'] + i * ph['duree'] / 5 + (0.16 if i == 0 else 0), hat() * 3, 0.25)
for i in range(4):
    poser(sfx, A['notifs']['debut'] + (0.3 + i * 0.55) / (3.4 / A['notifs']['duree']), pique(1760, 0.2), 0.1)

fondu = np.minimum(1, (DUREE - T) / 0.6)
batt, harmo, sfx = batt * fondu, harmo * fondu, sfx * fondu
d = np.concatenate([np.zeros(220), harmo[:-220]])
st = np.stack([batt + harmo + sfx, batt + d + sfx], axis=1)
st = np.tanh(st * 1.0) / np.tanh(1.0)
st *= 0.6 / np.max(np.abs(st))
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(TAUX)
    w.writeframes((st * 32767).astype(np.int16).tobytes())
print(f'son écrit : {DUREE:.1f} s')
