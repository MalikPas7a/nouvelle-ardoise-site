"""Prépare la liste des prochains contacts à faire vérifier dans BounceBan avant tout envoi.

    python3 liste_a_verifier.py crm.xlsx deja_traites.txt 100 sortie.csv

Prend les candidats dans l'ordre de lot_du_jour.py et ne garde que ceux qui passent deux
contrôles gratuits, pour ne pas payer BounceBan sur des adresses déjà perdues :
- le domaine de l'adresse a un serveur de courrier (enregistrement MX) ;
- la fiche local.ch n'a pas l'astérisque « pas de publicité » (localch.py).
Les fiches local.ch introuvables sont écartées aussi. Écrit le CSV à importer dans BounceBan
(colonne email en premier) et affiche les écartés sur la sortie d'erreur.
"""
import csv
import json
import sys
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor

from localch import verifier
from lot_du_jour import lot


def a_un_mx(domaine):
    url = "https://dns.google/resolve?type=MX&name=" + urllib.parse.quote(domaine)
    with urllib.request.urlopen(url, timeout=15) as r:
        reponse = json.load(r)
    return reponse.get("Status") == 0 and any(a.get("type") == 15 for a in reponse.get("Answer", []))


def controler(fiche):
    email = str(fiche["Email"]).strip().lower()
    try:
        if not a_un_mx(email.split("@")[-1]):
            return "domaine sans serveur de courrier (MX)"
    except Exception as erreur:
        return f"DNS injoignable ({str(erreur)[:60]})"
    try:
        verdict = verifier(fiche["Restaurant"], str(fiche.get("Localité") or ""), email)["verdict"]
    except Exception:
        verdict = "introuvable"
    return {"ok": None, "refuse_pub": "pas de publicité (local.ch *)",
            "introuvable": "fiche local.ch introuvable"}[verdict]


def main(chemin_crm, chemin_deja, nombre, sortie):
    candidats, vus = [], set()
    for fiche in lot(chemin_crm, chemin_deja, 10_000):
        email = str(fiche["Email"]).strip().lower()
        if email not in vus:
            vus.add(email)
            candidats.append(fiche)
    retenus, ecartes = [], []
    with ThreadPoolExecutor(8) as pool:
        for debut in range(0, len(candidats), 16):
            paquet = candidats[debut:debut + 16]
            for fiche, raison in zip(paquet, pool.map(controler, paquet)):
                if raison:
                    ecartes.append((fiche, raison))
                elif len(retenus) < nombre:
                    retenus.append(fiche)
            if len(retenus) >= nombre:
                break
    with open(sortie, "w", newline="", encoding="utf-8") as f:
        ecrire = csv.writer(f)
        ecrire.writerow(["email", "restaurant", "localite", "canton", "priorite", "site", "defaut"])
        for fiche in retenus:
            ecrire.writerow([str(fiche["Email"]).strip().lower(), fiche["Restaurant"], fiche.get("Localité"),
                             fiche.get("Canton"), fiche.get("Priorité"), fiche.get("Site actuel"),
                             fiche.get("Ce qui cloche sur le site")])
    for fiche, raison in ecartes:
        print(f"{fiche['Restaurant']}\t{fiche['Email']}\t{fiche.get('Priorité')}\t{raison}", file=sys.stderr)
    print(f"{len(retenus)} retenus, {len(ecartes)} écartés", file=sys.stderr)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2], int(sys.argv[3]), sys.argv[4])
