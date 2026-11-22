"""Compare une capture de référence et le rendu codé.

Usage : python3 -I compare.py reference.png rendu.png sortie.png
Produit une planche « référence | rendu | écarts » et affiche un score d'écart
(0 % = identique). Les zones rouges de la 3e colonne sont à corriger en premier.
"""
import sys
from PIL import Image, ImageChops, ImageOps

if len(sys.argv) != 4:
    sys.exit(__doc__)
ref = Image.open(sys.argv[1]).convert("RGB")
out = Image.open(sys.argv[2]).convert("RGB")
w = min(ref.width, out.width, 1440)
ref = ref.resize((w, round(ref.height * w / ref.width)))
out = out.resize((w, round(out.height * w / out.width)))
h = min(ref.height, out.height)
ref, out = ref.crop((0, 0, w, h)), out.crop((0, 0, w, h))
diff = ImageChops.difference(ref, out).convert("L")
score = sum(i * n for i, n in enumerate(diff.histogram())) / (w * h * 255) * 100
mask = diff.point(lambda v: 255 if v > 40 else 0)
heat = Image.composite(Image.new("RGB", (w, h), (220, 30, 30)), ImageOps.grayscale(out).convert("RGB"), mask)
sheet = Image.new("RGB", (w * 3 + 40, h), "white")
for i, im in enumerate((ref, out, heat)):
    sheet.paste(im, (i * (w + 20), 0))
sheet.thumbnail((3000, 6000))
sheet.save(sys.argv[3])
print(f"écart moyen : {score:.2f} %  |  pixels très différents : {sum(mask.histogram()[255:]) / (w * h) * 100:.1f} %  |  planche : {sys.argv[3]}")
