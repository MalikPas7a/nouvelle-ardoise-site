# Compose les images des deux plans fixes (caméra immobile, seule la craie avance) à partir de deux rendus :
# le plan « avant » (craie absente) et le plan « après » (craie entière). La part déjà écrite de la craie
# est projetée à l'écran par homographie, ce qui évite de recalculer 90 images identiques à la craie près.
#   python plans_fixes.py <scene> <coins.json> <dossier des rendus fNNNN.png> [images...]
import json, sys
import numpy as np
from PIL import Image

D, COINS, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
QUE = {int(x) for x in sys.argv[4:]}
C = json.load(open(COINS))

PLANS = [  # (craie, coins, avant, après, images, progression K(f))
    ('', 'craie1@1', 1, 57, range(2, 61), lambda f: max(0.0, min(1.0001, (f - 6) / 48))),
    ('envoyez/', 'craie2@264', 232, 264, range(233, 264), lambda f: max(0.0, min(1.0001, (f - 234) / 24))),
]


def coeffs(dst, src):
    # coefficients PIL (sortie → entrée) qui envoient les points dst (écran) sur src (texture)
    A, b = [], []
    for (x, y), (u, v) in zip(dst, src):
        A.append([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.append(u)
        A.append([0, 0, 0, x, y, 1, -v * x, -v * y]); b.append(v)
    return np.linalg.solve(np.array(A, float), np.array(b, float)).tolist()


def projette(tex, co, W, H):
    # texture (2048², float 0-1) → écran, calculée au double puis réduite (anticrénelage)
    n = tex.shape[0]
    src = [(0, n), (n, n), (n, 0), (0, 0)]  # coins (u,v) = (0,0) (1,0) (1,1) (0,1) ; la ligne 0 de l'image est v = 1
    dst = [(x * 2, y * 2) for x, y in co]
    im = Image.fromarray(tex.astype(np.float32), 'F').transform((W * 2, H * 2), Image.PERSPECTIVE, coeffs(dst, src), Image.BILINEAR)
    a = np.asarray(im, np.float32)
    return a.reshape(H, 2, W, 2).mean(axis=(1, 3))


for dossier, cle, f0, f1, images, K in PLANS:
    images = [f for f in images if not QUE or f in QUE]
    if not images: continue
    P0 = np.asarray(Image.open(f'{OUT}/f{f0:04d}.png').convert('RGB'), np.float32)
    P1 = np.asarray(Image.open(f'{OUT}/f{f1:04d}.png').convert('RGB'), np.float32)
    H, W = P0.shape[:2]
    co = C[cle]
    alpha = np.asarray(Image.open(f'{D}/{dossier}chalk_alpha.png'), np.float32) / 255
    prog = np.asarray(Image.open(f'{D}/{dossier}chalk_prog.png'), np.float32) / 255
    plein = projette(alpha, co, W, H)
    zone = plein > 0.003
    for f in images:
        if f == f1: continue
        k = K(f)
        ecrit = projette(alpha * (prog < k), co, W, H)
        r = np.where(zone, ecrit / np.maximum(plein, 1e-4), 0.0).clip(0, 1)[..., None]
        out = P0 + (P1 - P0) * r
        Image.fromarray(out.round().clip(0, 255).astype(np.uint8)).save(f'{OUT}/f{f:04d}.png')
        print('composée', f, round(k, 3), flush=True)
