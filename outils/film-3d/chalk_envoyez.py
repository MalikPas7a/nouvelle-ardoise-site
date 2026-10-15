# Fabrique deux images pour la craie : la trace (alpha) et l'ordre d'écriture (progression 0→1)
import random, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter
out, W, H = sys.argv[1], 2048, 2048
LINES = [("Envoyez.", 1.5)]
font_path = out + "/caveat.ttf"
fs = int(W * 0.15); lh = int(fs * 1.12)
alpha = Image.new("L", (W, H), 0)
prog = Image.new("L", (W, H), 255)
y0 = H // 2 - lh * (len(LINES) - 1) // 2 - int(lh * 0.1)
n = len(LINES)
for i, (t, s) in enumerate(LINES):
    f = ImageFont.truetype(font_path, int(fs * s))
    layer = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(layer)
    bbox = d.textbbox((0, 0), t, font=f)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x0 = (W - tw) // 2 - bbox[0]; yc = y0 + i * lh
    d.text((x0, yc - th // 2 - bbox[1]), t, font=f, fill=255)
    layer = layer.rotate(1.4 - i * 0.7, resample=Image.BICUBIC, center=(W // 2, yc))
    alpha = Image.composite(layer, alpha, layer)
    # progression : de gauche à droite dans la ligne, ligne après ligne
    px = layer.load(); pp = prog.load()
    xs = [x for x in range(0, W, 4) if any(px[x, y] for y in range(max(0, yc - lh), min(H, yc + lh), 6))]
    a, b = (min(xs), max(xs)) if xs else (0, W)
    for y in range(max(0, yc - lh), min(H, yc + lh)):
        for x in range(W):
            if px[x, y] > 8:
                pp[x, y] = int(255 * (i + (x - a) / max(1, b - a)) / n)
# grain de craie : on troue la trace
rnd = random.Random(7)
g = Image.effect_noise((W, H), 90).filter(ImageFilter.GaussianBlur(0.6))
gp = g.load(); ap = alpha.load()
for y in range(H):
    for x in range(W):
        v = ap[x, y]
        if v:
            n_ = gp[x, y]
            ap[x, y] = 0 if n_ < 95 else int(v * min(1, 0.55 + (n_ - 95) / 200))
alpha.save(out + "/chalk_alpha.png"); prog.save(out + "/chalk_prog.png")
print("ok")
