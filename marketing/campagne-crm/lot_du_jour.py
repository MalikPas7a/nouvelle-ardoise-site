"""Choisit les restaurants du jour dans le CRM, par ordre de priorité.

    python3 lot_du_jour.py crm.xlsx deja_traites.txt [nombre]

deja_traites.txt : une adresse email par ligne (celles déjà présentes dans le journal).
Ordre : priorité Haute > Moyenne > Basse, puis score du site décroissant (le pire site
d'abord), puis Genève avant Vaud. Écrit le lot en JSON sur la sortie standard.
"""
import json
import sys

import openpyxl

ORDRE_PRIORITE = {"Haute": 0, "Moyenne": 1, "Basse": 2}
EXCLUS = {"Ne plus contacter", "Envoyé", "Répondu", "Client", "Refus"}


def lot(chemin_crm, chemin_deja, nombre=10):
    deja = {l.strip().lower() for l in open(chemin_deja, encoding="utf-8") if l.strip()}
    feuille = openpyxl.load_workbook(chemin_crm, data_only=True)["CRM"]
    lignes = list(feuille.iter_rows(values_only=True))
    entetes, donnees = lignes[0], lignes[1:]
    fiches = [dict(zip(entetes, l)) for l in donnees if l and l[0]]
    candidats = [
        f for f in fiches
        if f.get("Email")
        and str(f["Email"]).strip().lower() not in deja
        and (f.get("Statut") or "À contacter") not in EXCLUS
        and not str(f.get("Fiabilité email") or "").startswith("À vérifier")
    ]
    candidats.sort(key=lambda f: (
        ORDRE_PRIORITE.get(f.get("Priorité"), 3),
        -(f.get("Score site (0 à 10)") or 0),
        0 if f.get("Canton") == "GE" else 1,
    ))
    return candidats[:nombre]


if __name__ == "__main__":
    nombre = int(sys.argv[3]) if len(sys.argv) > 3 else 10
    print(json.dumps(lot(sys.argv[1], sys.argv[2], nombre), ensure_ascii=False, indent=1, default=str))
