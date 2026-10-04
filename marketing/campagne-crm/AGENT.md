# Agent « Campagne Nouvelle Ardoise »

Tâche planifiée (Routine Claude Code) qui prépare chaque jour, à 11 h 44 (Genève), 10 e-mails
personnalisés et les envoie à partir de midi, espacés de 30 à 90 secondes (demande de Malik du
04.10.2026). Elle fait aussi le suivi : envois, rebonds, réponses et « stop ».

Depuis les 2 rebonds du 04.10, seules les adresses « deliverable » chez BounceBan (onglet
« Vérifiées » du journal) sont contactées. À partir de 2 rebonds dans une journée, la routine se met
en pause jusqu'à ce que Malik dise de reprendre.

- CRM (lecture seule) : Drive « CRM Nouvelle Ardoise.xlsx », id `1ymNU7E1-fJbfgBnxTu3ACjc7R7PKxrGP`
- Journal : Google Sheet « Campagne Nouvelle Ardoise – Journal des emails »,
  id `1BOsjDfozmm59oo4Na3qG52hgsfPvzJdf6nCaopWDKVs`
- `lot_du_jour.py` : sélection par priorité (Haute → Moyenne → Basse, pire site d'abord, GE avant VD)
- `localch.py` : refuse les restaurants marqués « pas de publicité » sur local.ch (LCD art. 3 al. 1 let. u)
- `liste_a_verifier.py` : les prochains contacts à faire vérifier dans BounceBan (CSV)
- `modele-email.txt` : le texte du mail et les règles de la phrase personnalisée

Le texte complet des consignes est celui de la Routine (claude.ai/code → Routines).
