"""Veille des nouvelles entreprises de restauration et métiers de bouche (FOSC).

Lit les nouvelles inscriptions au registre du commerce (rubrique HR01) publiées
dans la Feuille officielle suisse du commerce, garde celles dont le but parle de
restauration, et écrit un CSV.

Usage : python3 veille_ouvertures.py JOURS SORTIE.csv [CANTONS]
  JOURS   : nombre de jours en arrière (ex. 7)
  CANTONS : liste séparée par des virgules (défaut : GE,VD)
"""

import csv
import datetime as dt
import json
import re
import sys
import time
import urllib.request
import xml.etree.ElementTree as ET

API = "https://www.amtsblattportal.ch/api/v1/publications"

# Mots du but social qui signalent un restaurant ou un métier de bouche.
INCLURE = re.compile(
    r"restaura|gastronom|cuisine|bistro|brasserie|caf[ée]-?restaurant|tea ?room|"
    r"\bbar\b|bar à|traiteur|boulang|p[âa]tiss|chocolat|glacier|épicerie fine|"
    r"tra[iî]teur|pizz|sushi|food|débit de boissons|établissement public|"
    r"h[ôo]tel|auberge|cave à vin|œnoth|oenoth",
    re.IGNORECASE,
)
# Buts qui contiennent ces mots sans être des établissements (conseil, immobilier, etc.).
EXCLURE = re.compile(
    r"ventilation|nettoyage|immobili|fiduciaire|plomberie|électricit|transport de|"
    r"cuisines? (équipées|agencées)|agencement de cuisine|installation de cuisines|"
    r"voyages|studio d'enregistrement|menuiserie|médical",
    re.IGNORECASE,
)


def lire(url):
    for essai in range(3):
        try:
            with urllib.request.urlopen(url, timeout=30) as r:
                return r.read()
        except Exception:
            time.sleep(2 * (essai + 1))
    raise RuntimeError(f"Échec de lecture : {url}")


def publications(canton, depuis):
    page = 0
    while True:
        url = (
            f"{API}?publicationStates=PUBLISHED&rubrics=HR&cantons={canton}"
            f"&publicationDate.start={depuis}&pageRequest.size=200&pageRequest.page={page}"
        )
        data = json.loads(lire(url))
        contenu = data.get("content") or []
        for p in contenu:
            if p["meta"]["subRubric"] == "HR01":
                yield p["meta"]
        if len(contenu) < 200:
            return
        page += 1


def detail(pub_id):
    racine = ET.fromstring(lire(f"{API}/{pub_id}/xml"))
    texte = racine.findtext(".//publicationText") or ""
    nom = racine.findtext(".//commonsNew/company/name") or ""
    uid = racine.findtext(".//commonsNew/company/uid") or ""
    rue = racine.findtext(".//commonsNew/company/address/street") or ""
    num = racine.findtext(".//commonsNew/company/address/houseNumber") or ""
    npa = racine.findtext(".//commonsNew/company/address/swissZipCode") or ""
    ville = racine.findtext(".//commonsNew/company/address/town") or ""
    adresse = " ".join(x for x in [rue, num] if x)
    adresse = ", ".join(x for x in [adresse, f"{npa} {ville}".strip()] if x)
    but = ""
    m = re.search(r"But\s*:\s*(.*?)(?:\.\s+[A-ZÉ][^.]*:|$)", texte, re.S)
    if m:
        but = m.group(1).strip()
    return nom, uid, adresse, but, texte


def main():
    jours = int(sys.argv[1])
    sortie = sys.argv[2]
    cantons = (sys.argv[3] if len(sys.argv) > 3 else "GE,VD").split(",")
    depuis = (dt.date.today() - dt.timedelta(days=jours)).isoformat()

    lignes = []
    for canton in cantons:
        for meta in publications(canton, depuis):
            nom, uid, adresse, but, texte = detail(meta["id"])
            cible = but or texte
            if not INCLURE.search(cible) or EXCLURE.search(cible):
                continue
            lignes.append({
                "date_fosc": meta["publicationDate"][:10],
                "canton": canton,
                "entreprise": nom,
                "uid": uid,
                "adresse": adresse,
                "but": but[:400],
                "lien": f"https://www.amtsblattportal.ch/#!/search/publications/detail/{meta['id']}",
            })
            time.sleep(0.3)

    with open(sortie, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["date_fosc", "canton", "entreprise", "uid", "adresse", "but", "lien"])
        w.writeheader()
        w.writerows(lignes)
    print(f"{len(lignes)} nouvelles entreprises de restauration depuis le {depuis} ({', '.join(cantons)})")


if __name__ == "__main__":
    main()
