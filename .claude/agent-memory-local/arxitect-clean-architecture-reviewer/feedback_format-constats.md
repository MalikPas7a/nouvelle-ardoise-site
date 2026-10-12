---
name: feedback-format-constats
description: Contrat de revue sur ce dépôt — constats en français (fichier, ligne, description, correction), gravité bloquant/majeur/mineur définie par Malik, aucune modification de fichier, aucun git
metadata:
  type: feedback
---

Rendre uniquement des constats précis `{gravite, fichier, ligne, description, correction}` en français, sans modifier aucun fichier ni lancer de commande git / npm install / outil mcp__hearthbot.

**Pourquoi :** le workflow est piloté par un script qui ne lit que l'appel StructuredOutput ; d'autres devs écrivent en parallèle dans le dépôt ; Malik veut une gravité honnête, pas défensive.

**Comment appliquer :** bloquant = casse le site ou viole une règle de Malik ; majeur = visible par Malik ou risque réel sur téléphone ; mineur = qualité de code. Un défaut latent qui deviendra visible à une étape planifiée (phase 2) → majeur en le disant clairement. Code, identifiants et commentaires en français comme le dépôt. Pas de fichiers de rapport .md.

Lié : [[project-film-mise-en-place]].
