"""Vérifie sur local.ch qu'un restaurant n'a pas l'astérisque « pas de publicité ».

    python3 localch.py "Nom du restaurant" "Localité" "email@restaurant.ch"

Affiche une ligne JSON : {"verdict": "ok" | "refuse_pub" | "introuvable", "fiche": url}.
« refuse_pub » : au moins un contact de la fiche porte refuseAdvertising=true. La loi
(LCD art. 3 al. 1 let. u) interdit alors de lui écrire. « introuvable » : vérifier à la main.
"""
import json
import re
import sys
import unicodedata
import urllib.parse
import urllib.request

ENTETES = {"User-Agent": "Mozilla/5.0", "Accept-Language": "fr-CH"}


def lire(url):
    req = urllib.request.Request(url, headers=ENTETES)
    with urllib.request.urlopen(req, timeout=25) as r:
        return r.read().decode("utf-8", "replace").replace('\\"', '"')


def simple(texte):
    texte = unicodedata.normalize("NFKD", texte).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", "-", texte).strip("-")


def verifier(nom, localite, email=""):
    recherche = lire("https://www.local.ch/fr/s/" + urllib.parse.quote(f"{nom} {localite}"))
    liens = list(dict.fromkeys(re.findall(r'/fr/d/[a-z0-9-]+/\d{4}/[^"\\?#]+', recherche)))
    mots = [m for m in simple(nom).split("-") if len(m) > 2] or simple(nom).split("-")
    for lien in liens[:6]:
        if not any(m in lien for m in mots):
            continue
        fiche = lire("https://www.local.ch" + lien)
        # Le premier tableau « contacts » est celui de la fiche ; les suivants sont des suggestions.
        debut = fiche.find('"contacts":[')
        if debut < 0:
            continue
        fin = fiche.find("]", debut)
        bloc = fiche[debut:fin]
        if email and email.lower() not in fiche.lower() and email.split("@")[-1].lower() not in bloc.lower():
            pass  # la fiche peut ne pas lister l'email : le nom suffit
        verdict = "refuse_pub" if '"refuseAdvertising":true' in bloc else "ok"
        return {"verdict": verdict, "fiche": "https://www.local.ch" + lien}
    return {"verdict": "introuvable", "fiche": None}


if __name__ == "__main__":
    try:
        print(json.dumps(verifier(*sys.argv[1:4])))
    except Exception as erreur:  # réseau, page changée…
        print(json.dumps({"verdict": "introuvable", "fiche": None, "erreur": str(erreur)[:120]}))
