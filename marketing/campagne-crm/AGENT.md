# Agent « Campagne Nouvelle Ardoise »

Tâche planifiée (Routine Claude Code) qui prépare chaque jour, à 11 h 44 (Genève), 10 brouillons
d'e-mails personnalisés dans Gmail. Malik relit et envoie lui-même à midi, en espaçant les envois
de 30 à 90 secondes. Rien n'est envoyé automatiquement : c'est la règle du « Mode d'emploi » du CRM
(LCD art. 3 al. 1 let. o).

- CRM (lecture seule) : Drive « CRM Nouvelle Ardoise.xlsx », id `1ymNU7E1-fJbfgBnxTu3ACjc7R7PKxrGP`
- Journal : Google Sheet « Campagne Nouvelle Ardoise – Journal des emails »,
  id `1BOsjDfozmm59oo4Na3qG52hgsfPvzJdf6nCaopWDKVs`
- `lot_du_jour.py` : sélection par priorité (Haute → Moyenne → Basse, pire site d'abord, GE avant VD)
- `localch.py` : refuse les restaurants marqués « pas de publicité » sur local.ch (LCD art. 3 al. 1 let. u)
- `modele-email.txt` : le texte du mail et les règles de la phrase personnalisée

Le texte complet des consignes est celui de la Routine (claude.ai/code → Routines).
