"""Génère les logos Nouvelle Ardoise en SVG vectoriel (texte converti en tracés).

    python3 marketing/kit-lancement/_sources/logo.py

Le symbole est celui du site (src/components/Logo.astro) et de la charte du Drive : une ardoise arrondie
et un N tracé d'un seul geste à la craie jaune.
"""
from pathlib import Path

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ICI = Path(__file__).parent
SORTIE = ICI.parent / "logo"

ARDOISE = "#1E2A2C"
TUILE_SOMBRE = "#11191B"  # la tuile du logo officiel (Drive), sur fond ardoise
JAUNE = "#FFD23F"
NAPPE = "#F5F7F4"

police = instantiateVariableFont(
    TTFont(ICI / "fonts/bricolage-grotesque-latin-standard-normal.woff2"),
    {"wght": 720, "opsz": 96, "wdth": 100},
)
glyphes = police.getGlyphSet()
cmap = police.getBestCmap()
UPM = police["head"].unitsPerEm


def texte(chaine, taille, x, y, approche=-0.008):
    """Tracé SVG d'une ligne de texte, ligne de base en y. Renvoie (d, largeur)."""
    echelle = taille / UPM
    pen = SVGPathPen(glyphes)
    curseur = 0.0
    for car in chaine:
        nom = cmap[ord(car)]
        glyphe = glyphes[nom]
        glyphe.draw(TransformPen(pen, (echelle, 0, 0, -echelle, x + curseur, y)))
        curseur += glyphe.width * echelle + approche * taille
    return pen.getCommands(), curseur - approche * taille


def symbole(x, y, cote, fond=TUILE_SOMBRE, craie=JAUNE):
    """L'ardoise et son N à la craie, dessinés sur une grille de 28."""
    k = cote / 28
    return (
        f'<g transform="translate({x} {y}) scale({k:.4f})">'
        f'<rect width="28" height="28" rx="5.5" fill="{fond}"/>'
        f'<path d="M7.4 19.6V8.4l13.2 11.2V8.4" fill="none" stroke="{craie}" stroke-width="2.3" '
        f'stroke-linecap="round" stroke-linejoin="round"/></g>'
    )


def svg(largeur, hauteur, corps, fond=None):
    plein = f'<rect width="{largeur}" height="{hauteur}" fill="{fond}"/>' if fond else ""
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {largeur:.0f} {hauteur:.0f}" '
        f'width="{largeur:.0f}" height="{hauteur:.0f}">'
        f"<title>Nouvelle Ardoise</title>{plein}{corps}</svg>\n"
    )


def horizontal(encre, nom, fond_symbole=TUILE_SOMBRE, craie=JAUNE, fond=None):
    d, l = texte("Nouvelle Ardoise", 88, 156, 92)
    marge = 24
    corps = symbole(marge, marge, 112, fond=fond_symbole, craie=craie) + f'<path d="{d}" fill="{encre}"/>'
    (SORTIE / nom).write_text(svg(156 + l + marge, 160, corps, fond))


def empile(encre, nom, fond_symbole=TUILE_SOMBRE, craie=JAUNE, fond=None):
    d1, l1 = texte("Nouvelle", 92, 212, 104)
    d2, l2 = texte("Ardoise", 92, 212, 196)
    corps = (
        symbole(24, 24, 164, fond=fond_symbole, craie=craie)
        + f'<path d="{d1}" fill="{encre}"/><path d="{d2}" fill="{encre}"/>'
        # Le trait de craie sous « Ardoise »
        + f'<path d="M214 214 Q {212 + l2 / 2:.0f} 206 {212 + l2:.0f} 212" fill="none" '
        f'stroke="{JAUNE}" stroke-width="9" stroke-linecap="round"/>'
    )
    (SORTIE / nom).write_text(svg(212 + max(l1, l2) + 24, 240, corps, fond))


def avatar(nom):
    """Photo de profil : lisible dans un rond de 110 px."""
    corps = (
        f'<rect width="1080" height="1080" fill="{ARDOISE}"/>'
        f'<path d="M330 700V380l420 320V380" fill="none" stroke="{JAUNE}" stroke-width="78" '
        f'stroke-linecap="round" stroke-linejoin="round"/>'
    )
    (SORTIE / nom).write_text(svg(1080, 1080, corps))


SORTIE.mkdir(exist_ok=True)
horizontal(ARDOISE, "logo-horizontal.svg")
horizontal(NAPPE, "logo-horizontal-blanc.svg", fond_symbole=TUILE_SOMBRE)
empile(ARDOISE, "logo-empile.svg")
empile(NAPPE, "logo-empile-blanc.svg", fond_symbole=TUILE_SOMBRE)
avatar("avatar-instagram.svg")
(SORTIE / "symbole.svg").write_text(svg(28, 28, symbole(0, 0, 28)))
print("Logos écrits dans", SORTIE)
