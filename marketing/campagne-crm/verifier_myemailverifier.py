"""Vérifie dans MyEmailVerifier les adresses d'un CSV produit par liste_a_verifier.py.

    python3 verifier_myemailverifier.py liste.csv resultats.csv

Même sortie que verifier_bounceban.py (email, restaurant, résultat, score), avec les résultats
traduits dans les mêmes mots : deliverable, risky, undeliverable ou unknown. Seules les adresses
« deliverable » peuvent recevoir un email. 100 vérifications gratuites par jour (compte vérifié
par téléphone), 1 crédit par adresse.

La clé est lue dans la variable MYEMAILVERIFIER_API_KEY (réglages de l'environnement cloud).
L'API la veut dans l'adresse de la requête (?apikey=), pas dans un en-tête.
"""
import csv
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

API = "https://api.myemailverifier.com/api/validate_single.php"
# Status de MyEmailVerifier → mots du journal (onglet « Vérifiées »)
RESULTATS = {"valid": "deliverable", "invalid": "undeliverable", "catch all": "risky",
             "catch_all": "risky", "unknown": "unknown"}


def verifier(email, cle):
    url = API + "?" + urllib.parse.urlencode({"apikey": cle, "email": email})
    for essai in range(4):
        try:
            with urllib.request.urlopen(url, timeout=60) as r:
                reponse = json.load(r)
        except urllib.error.HTTPError as erreur:
            if erreur.code in (401, 402, 403):
                sys.exit(f"MyEmailVerifier refuse la clé ou n'a plus de crédits (HTTP {erreur.code}).")
            if erreur.code == 429:  # 30 requêtes par minute par défaut
                time.sleep(10)
                continue
            return f"erreur HTTP {erreur.code}", ""
        except Exception as erreur:
            return f"erreur ({str(erreur)[:60]})", ""
        statut = str(reponse.get("Status", "")).strip().lower()
        if not statut:
            # réponse sans Status : clé invalide ou crédits épuisés, le message le dit
            sys.exit(f"MyEmailVerifier : {str(reponse)[:160]}")
        resultat = RESULTATS.get(statut, "unknown")
        # adresse jetable ou boîte « grise » : on ne prend pas le risque
        if resultat == "deliverable" and str(reponse.get("Disposable_Domain")).lower() == "true":
            resultat = "risky"
        return resultat, reponse.get("Diagnosis", "")
    return "unknown", ""


def main(entree, sortie):
    cle = os.environ.get("MYEMAILVERIFIER_API_KEY")
    if not cle:
        sys.exit("Variable MYEMAILVERIFIER_API_KEY absente : ajoutez-la dans les réglages de l'environnement.")
    lignes = list(csv.DictReader(open(entree, encoding="utf-8")))
    with open(sortie, "w", newline="", encoding="utf-8") as f:
        ecrire = csv.writer(f)
        ecrire.writerow(["email", "restaurant", "resultat", "score"])
        for ligne in lignes:
            resultat, score = verifier(ligne["email"], cle)
            ecrire.writerow([ligne["email"], ligne["restaurant"], resultat, score])
            f.flush()
            print(f"{ligne['email']}\t{resultat}", file=sys.stderr)
            time.sleep(2)  # reste sous les 30 requêtes par minute


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
