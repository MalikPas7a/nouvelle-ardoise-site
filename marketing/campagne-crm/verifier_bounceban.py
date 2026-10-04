"""Vérifie dans BounceBan les adresses d'un CSV produit par liste_a_verifier.py.

    python3 verifier_bounceban.py liste.csv resultats.csv

La clé est rangée dans l'environnement cloud comme « identifiant API » (en-tête Authorization,
sans préfixe, site api-waterfall.bounceban.com) : le proxy de la session l'ajoute lui-même aux
requêtes, le programme ne la voit jamais. À défaut, il prend la variable BOUNCEBAN_API_KEY.

Une requête par adresse sur l'API « waterfall », qui attend le résultat (1 crédit par adresse).
Si elle répond 408 (vérification encore en cours), on renvoie la même demande : c'est gratuit
dans les 30 minutes. Écrit email, restaurant, résultat (deliverable, risky, undeliverable,
unknown ou erreur) et le score. Seules les adresses « deliverable » peuvent recevoir un email.
"""
import csv
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

API = "https://api-waterfall.bounceban.com/v1/verify/single?email="


def verifier(email, cle):
    entetes = {"Authorization": cle} if cle else {}
    req = urllib.request.Request(API + urllib.parse.quote(email), headers=entetes)
    for essai in range(4):
        try:
            with urllib.request.urlopen(req, timeout=100) as r:
                reponse = json.load(r)
            return reponse.get("result") or "unknown", reponse.get("score", "")
        except urllib.error.HTTPError as erreur:
            if erreur.code == 408:
                continue
            if erreur.code in (401, 402, 403):
                sys.exit(f"BounceBan refuse la clé ou n'a plus de crédits (HTTP {erreur.code}) : vérifier "
                         "l'identifiant API de l'environnement (ou la variable BOUNCEBAN_API_KEY).")
            if erreur.code == 429:
                time.sleep(5)
                continue
            return f"erreur HTTP {erreur.code}", ""
        except Exception as erreur:
            return f"erreur ({str(erreur)[:60]})", ""
    return "unknown", ""


def main(entree, sortie):
    cle = os.environ.get("BOUNCEBAN_API_KEY")  # sinon, ajoutée par le proxy (identifiant API)
    lignes = list(csv.DictReader(open(entree, encoding="utf-8")))
    with open(sortie, "w", newline="", encoding="utf-8") as f:
        ecrire = csv.writer(f)
        ecrire.writerow(["email", "restaurant", "resultat", "score"])
        for ligne in lignes:
            resultat, score = verifier(ligne["email"], cle)
            ecrire.writerow([ligne["email"], ligne["restaurant"], resultat, score])
            f.flush()
            print(f"{ligne['email']}\t{resultat}", file=sys.stderr)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
