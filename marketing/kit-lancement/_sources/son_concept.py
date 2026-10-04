"""Bande son de la vidéo concept (video-concept.html) : la voix off (voix/<plan>.wav, voir
voix/generer.sh), une musique douce synthétisée (aucun droit à payer) qui s'efface sous la voix,
et quelques bruitages calés sur l'image (éponge, déclencheur, doigt, notifications, carillon).

    python3 son_concept.py sortie.wav [court]
"""
import json
import re
import sys
import wave
from pathlib import Path

import numpy as np

ICI = Path(__file__).parent
TAUX = 44100
FICHIER = 'plan-court.js' if sys.argv[2:] == ['court'] else 'plan.js'
PLAN = json.loads(re.search(r'\[.*\]', (ICI / 'voix' / FICHIER).read_text(), re.S).group(0))
debut = 0.0
for p in PLAN:
    p['debut'] = debut
    debut += p['duree']
DUREE = debut
N = int(TAUX * DUREE)
A = {p['id']: p for p in PLAN}
alea = np.random.default_rng(7)
t_all = np.arange(N) / TAUX


def piste():
    return np.zeros(N)


def poser(dest, t0, son, vol=1.0):
    i0 = int(t0 * TAUX)
    if i0 >= N:
        return
    son = son[: N - i0]
    dest[i0:i0 + len(son)] += vol * son


def bruit(duree):
    return alea.uniform(-1, 1, int(duree * TAUX))


def passe_bas(x, coupe):
    # filtre passe-bas d'ordre 1, coupe en Hz (scalaire ou tableau)
    a = np.exp(-2 * np.pi * np.broadcast_to(coupe, x.shape) / TAUX)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc = (1 - a[i]) * x[i] + a[i] * acc
        y[i] = acc
    return y


def note(f, duree, attaque=0.01, chute=3.0, harmo=(1, 0.3, 0.12)):
    t = np.arange(int(duree * TAUX)) / TAUX
    s = sum(a * np.sin(2 * np.pi * f * (k + 1) * t) for k, a in enumerate(harmo))
    env = np.minimum(1, t / attaque) * np.exp(-chute * t)
    return s * env


# ---------- la voix ----------
voix = piste()
for p in PLAN:
    with wave.open(str(ICI / 'voix' / f"{p['id']}.wav")) as w:
        taux = w.getframerate()
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(float) / 32768
    x = np.interp(np.arange(int(len(x) * TAUX / taux)) * taux / TAUX, np.arange(len(x)), x)
    x /= np.max(np.abs(x)) + 1e-9
    fin = p['voix'] + len(x) / TAUX
    if fin > p['duree'] + 0.2:
        print(f"attention : la voix de « {p['id']} » dépasse son plan de {fin - p['duree']:.2f} s")
    poser(voix, p['debut'] + p['voix'], x, 0.9)

# ---------- la musique : 92 BPM, Ré majeur, nappe + arpège + basse ----------
BPM = 92
temps = 60 / BPM
mesure = 4 * temps
ACCORDS = [  # (basse, notes de la nappe)
    (73.42, [293.66, 369.99, 440.00, 554.37]),   # Ré maj7
    (61.74, [246.94, 293.66, 369.99, 440.00]),   # Si m7
    (49.00, [196.00, 246.94, 293.66, 369.99]),   # Sol maj7
    (55.00, [220.00, 277.18, 329.63, 369.99]),   # La 6
]
nappe, arpege, basse, batterie = piste(), piste(), piste(), piste()
t_res = A['tournage']['debut']
t_site = A['site']['debut'] if 'site' in A else A['photographe']['debut']          # les réseaux : le rythme s'installe
t_calme = A['cuisinez']['debut'] if 'cuisinez' in A else A['contact']['debut']  # respiration avant la fin
t_fin = A['fin']['debut']
m = 0
while m * mesure < DUREE:
    t0 = m * mesure
    b, notes = ACCORDS[m % 4]
    # nappe : sinus légèrement désaccordés, attaque lente
    t = np.arange(int(mesure * 1.3 * TAUX)) / TAUX
    env = np.minimum(1, t / 0.6) * np.minimum(1, np.maximum(0, (mesure * 1.3 - t) / 0.6))
    s = sum(np.sin(2 * np.pi * f * t) + 0.6 * np.sin(2 * np.pi * f * 1.004 * t) + 0.15 * np.sin(4 * np.pi * f * t) for f in notes)
    poser(nappe, t0, s * env / 8)
    # arpège en croches, à partir du site
    if t0 >= t_site - mesure:
        for k in range(8):
            f = notes[[0, 2, 1, 3, 2, 1, 3, 2][k]] * 2
            poser(arpege, t0 + k * temps / 2, note(f, 0.6, 0.004, 6, (1, 0.25, 0.05)), 0.12)
    # basse sur les temps 1 et 3
    for k in (0, 2):
        poser(basse, t0 + k * temps, note(b, temps * 1.8, 0.01, 1.6, (1, 0.35, 0.1)), 0.32)
    # batterie : grosse caisse douce et charleston léger pendant les réseaux
    for k in range(4):
        tb = t0 + k * temps
        if t_site <= tb < t_calme:
            tt = np.arange(int(0.35 * TAUX)) / TAUX
            kick = np.sin(2 * np.pi * (48 * tt + (80 / 25) * (1 - np.exp(-25 * tt)))) * np.exp(-10 * tt)
            poser(batterie, tb, kick, 0.38 if k % 2 == 0 else 0.22)
        if t_res <= tb < t_calme:
            for h in (0.5,):
                poser(batterie, tb + h * temps, bruit(0.05) * np.exp(-np.arange(int(0.05 * TAUX)) / TAUX * 80), 0.05)
    m += 1

musique = nappe + arpege + basse + batterie
# respiration sur « Vous, vous cuisinez », puis la fin plus pleine
musique *= np.where((t_all >= t_calme) & (t_all < t_fin), 0.6, 1.0)
# la musique s'efface sous la voix (enveloppe lissée)
activite = np.convolve(np.abs(voix) > 0.02, np.ones(int(0.25 * TAUX)) / int(0.25 * TAUX), mode='same')
activite = np.convolve(np.minimum(1, activite * 4), np.ones(int(0.15 * TAUX)) / int(0.15 * TAUX), mode='same')
musique *= 1 - 0.55 * activite
# entrée et sortie en fondu
musique *= np.minimum(1, t_all / 0.8) * np.minimum(1, (DUREE - t_all) / 1.5)

# ---------- les bruitages ----------
sfx = piste()
# un souffle à chaque changement de plan
for p in PLAN[1:]:
    d = 0.5
    tt = np.arange(int(d * TAUX)) / TAUX
    s = passe_bas(bruit(d), 400 + 3000 * np.sin(np.pi * tt / d)) * np.sin(np.pi * tt / d) ** 2
    poser(sfx, p['debut'] - d / 2, s, 0.12)
# l'éponge : cinq passages de feutre
pb = A['probleme']
a, b = pb['debut'] + pb['duree'] - 1.45, pb['debut'] + pb['duree'] - 0.2
d = b - a
tt = np.arange(int(d * TAUX)) / TAUX
s = passe_bas(bruit(d), 1800) * (0.5 + 0.5 * np.abs(np.sin(np.pi * 5 * tt / d))) * np.minimum(1, np.minimum(tt, d - tt) / 0.08)
poser(sfx, a, s, 0.45)
# le déclencheur de l'appareil photo, à chaque plat
ph = A['photographe']
pas = ph['duree'] / 5
for i in range(5):
    tc = ph['debut'] + i * pas + (0.35 if i == 0 else 0)
    clic = bruit(0.06) * np.exp(-np.arange(int(0.06 * TAUX)) / TAUX * 120)
    poser(sfx, tc, clic, 0.5)
    poser(sfx, tc + 0.07, clic, 0.3)
# le doigt sur l'écran
for tt0 in ((4.55, 5.25) if 'site' in A else ()):
    poser(sfx, A['site']['debut'] + tt0, note(1800, 0.05, 0.001, 90, (1,)), 0.25)
# les cartes des plateformes, et le plat du jour qui s'y pose
for i in range(3 if 'plateformes' in A else 0):
    t0 = A['plateformes']['debut'] + 0.5 + i * 0.75
    poser(sfx, t0 + 0.8, note(880 * (1.25 ** i), 0.25, 0.003, 18, (1, 0.2)), 0.18)
# le calendrier qui se remplit
for n in range(31):
    poser(sfx, A['calendrier']['debut'] + 0.45 + n * 0.085, note(1400 + (n % 7) * 60, 0.04, 0.001, 70, (1,)), 0.05)
# les notifications
for i in range(4 if 'notifs' in A else 0):
    tn = A['notifs']['debut'] + 0.3 + i * 0.55
    poser(sfx, tn, note(1318.5, 0.25, 0.002, 14, (1, 0.1)), 0.14)
    poser(sfx, tn + 0.08, note(1760, 0.3, 0.002, 12, (1, 0.1)), 0.12)
# les messages du matin
for tm in (0.2, 1.2, 1.9):
    poser(sfx, A['contact']['debut'] + 2.6 + 0.3 + tm, note(988, 0.12, 0.002, 30, (1, 0.3)), 0.14)
# le carillon quand le N s'allume
for k, f in enumerate((587.33, 880, 1174.66)):
    poser(sfx, t_fin + 0.8 + k * 0.09, note(f, 2.5, 0.003, 1.6, (1, 0.4, 0.2, 0.05)), 0.14)

# ---------- le mixage ----------
gauche = voix + 0.55 * musique + sfx
droite = voix + 0.55 * np.concatenate([np.zeros(300), musique[:-300]]) + sfx
st = np.stack([gauche, droite], axis=1)
st = np.tanh(st * 1.1) / np.tanh(1.1)
st *= 0.89 / np.max(np.abs(st))
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(TAUX)
    w.writeframes((st * 32767).astype(np.int16).tobytes())
print(f'son écrit : {DUREE:.1f} s')
