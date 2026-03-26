# Architecture Fonctionnelle — Bible d'Ecrivain MCP

**Date de creation** : 2026-03-25
**Derniere mise a jour** : 2026-03-26
**Chantiers integres** : mvp, ui-web

## Vision produit
Un serveur MCP standalone qui sert de memoire externe structuree et cherchable pour les ecrivains. Il centralise toutes les donnees d'un univers narratif (personnages, lieux, evenements, interactions, regles, recherches) et les expose via deux interfaces : des outils MCP pour les agents IA, et une interface web visuelle pour l'humain. La bible est la seule source de verite de l'univers.

## Personas

### L'Ecrivain
- **Qui** : Auteur de fiction (fantasy, SF, polar, historique) travaillant sur un projet long (roman, serie)
- **Objectif** : Maintenir la coherence de son univers narratif sans surcharge mentale
- **Frustration actuelle** : Notes dispersees, pas de recherche efficace, oublis frequents ("Bob portait-il des lunettes a ce moment-la ?")
- **Frequence d'usage** : Quotidienne pendant les sessions d'ecriture

### L'Agent IA (via Cruchot)
- **Qui** : LLM utilise comme co-auteur/assistant d'ecriture
- **Objectif** : Acceder instantanement aux donnees de l'univers pour produire du contenu coherent
- **Frustration actuelle** : Pas de memoire persistante entre sessions, l'auteur doit re-contextualiser a chaque fois
- **Frequence d'usage** : A chaque session d'ecriture, potentiellement des dizaines de requetes par session

### L'Ecrivain (via l'UI web) [AJOUT ui-web]
- **Qui** : Le meme auteur, mais interagissant directement avec la bible sans LLM
- **Objectif** : Visualiser son univers (graph de relations, timeline), editer les fiches, chercher, gerer les backups — le tout visuellement
- **Frustration actuelle** : Passer par un chat LLM pour gerer des fiches est lent et indirect quand on sait exactement ce qu'on veut faire
- **Frequence d'usage** : Sessions de "maintenance" de la bible, planification de l'intrigue, review des personnages

## Parcours utilisateurs

### Parcours 1 — Consultation rapide pendant l'ecriture
```
Ecrivain --> Pose une question a l'agent ("Bob a les yeux de quelle couleur ?")
    --> Agent appelle search_character("Bob", "yeux")
        --> Bible retourne la fiche Bob avec traits physiques
            --> Agent repond : "Bob a les yeux verts, mentionne chapitre 3"
```

### Parcours 2 — Verification de coherence temporelle
```
Ecrivain --> "Est-ce que Marie connaissait deja Pierre au chapitre 5 ?"
    --> Agent appelle search_interactions("Marie", "Pierre")
    --> Agent appelle search_events(chapter_max: 5)
        --> Bible retourne les interactions et evenements pertinents
            --> Agent synthetise la timeline relationnelle
```

### Parcours 3 — Enrichissement apres ecriture
```
Ecrivain --> "Met ce nouveau paragraphe dans la bible"
    --> Agent (LLM) analyse le texte, identifie les changements
    --> Agent appelle update_character("Bob", nouvelle_description)
    --> Agent appelle create_event("Operation des yeux de Bob", chapitre: 9)
        --> Bible stocke et re-indexe les embeddings
            --> Confirmation a l'ecrivain
```

### Parcours 4 — Exploration de l'univers
```
Ecrivain --> "Montre-moi tout ce qui concerne le Chateau de Valmur"
    --> Agent appelle search_semantic("Chateau de Valmur")
        --> Bible retourne : fiche lieu + evenements associes + personnages lies
            --> Agent presente une vue consolidee
```

### Parcours 5 — Creation initiale de la bible
```
Ecrivain --> Decrit ses personnages, lieux, regles via l'agent ou l'UI
    --> Agent appelle create_character({name, description, traits...})
    --> Agent appelle create_location({name, description, atmosphere...})
        --> Bible stocke et indexe
            --> L'univers prend forme progressivement
```

### Parcours 6 — Backup et restauration
```
Ecrivain --> "Fais un backup de la bible"
    --> Agent appelle backup_bible()
        --> Bible copie le fichier .db avec timestamp
            --> Confirmation avec chemin du backup
```

### Parcours 7 — Exploration visuelle du graph [AJOUT ui-web]
```
Ecrivain --> Ouvre l'UI web dans son navigateur
    --> Voit le graph interactif de tout son univers
        --> Noeuds = entites (personnages, lieux, evenements)
        --> Liens = interactions, evenements partages, lieux
    --> Clique sur un noeud "Bob"
        --> Panneau lateral : fiche complete de Bob
        --> Graph filtre : seuls les noeuds lies a Bob
    --> Clique sur un lien Bob-Marie
        --> Detail de l'interaction
```

### Parcours 8 — Edition directe via l'UI [AJOUT ui-web]
```
Ecrivain --> Ouvre la liste des personnages dans l'UI
    --> Clique sur "Bob Martin"
        --> Formulaire d'edition avec tous les champs
    --> Modifie la description, sauvegarde
        --> L'UI appelle update_character via MCP HTTP
        --> Le graph se met a jour en temps reel
```

### Parcours 9 — Recherche dans l'UI [AJOUT ui-web]
```
Ecrivain --> Tape "lunettes" dans la barre de recherche de l'UI
    --> L'UI appelle search_fulltext("lunettes")
        --> Resultats affiches avec surbrillance
    --> Clique sur un resultat
        --> Navigation vers la fiche de l'entite
```

### Parcours 10 — Timeline visuelle [AJOUT ui-web]
```
Ecrivain --> Ouvre la vue Timeline dans l'UI
    --> Voit tous les evenements sur un axe chronologique (sort_order)
        --> Chaque evenement affiche titre, chapitre, personnages, lieu
    --> Filtre par personnage (ex: "Bob")
        --> Seuls les evenements de Bob sont visibles
    --> Drag & drop pour reordonner (modifie sort_order)
```

## Cas d'usage

### [CU-01] Creer une fiche personnage
- **Acteur** : Ecrivain (via agent ou UI)
- **Precondition** : Aucune
- **Scenario nominal** :
  1. L'acteur fournit les informations du personnage (nom, description, traits, background)
  2. Le systeme verifie l'unicite du nom
  3. Le systeme cree la fiche et genere les embeddings
  4. Le systeme confirme la creation
- **Scenarios alternatifs** :
  - [SA-01] Nom deja existant --> erreur avec suggestion de mise a jour
- **Postcondition** : Fiche creee, indexee en fulltext et semantique
- **Regles metier** : RM-01, RM-02

### [CU-02] Rechercher dans la bible (semantique)
- **Acteur** : Agent IA ou Ecrivain (via UI)
- **Precondition** : Au moins une entite existe dans la bible
- **Scenario nominal** :
  1. L'acteur envoie une requete en langage naturel
  2. Le systeme genere l'embedding de la requete
  3. Le systeme recherche les entites les plus proches (cosine similarity)
  4. Le systeme retourne les resultats tries par pertinence avec type d'entite et contenu
- **Scenarios alternatifs** :
  - [SA-01] Aucun resultat pertinent (score < seuil) --> reponse vide avec message
  - [SA-02] Requete trop vague --> retourne les N meilleurs resultats toutes categories
- **Postcondition** : Resultats retournes, aucune modification
- **Regles metier** : RM-03

### [CU-03] Rechercher dans la bible (fulltext)
- **Acteur** : Agent IA ou Ecrivain (via UI)
- **Precondition** : Au moins une entite existe
- **Scenario nominal** :
  1. L'acteur envoie une recherche textuelle exacte ou partielle
  2. Le systeme interroge l'index FTS5
  3. Le systeme retourne les resultats avec extraits et surbrillance
- **Scenarios alternatifs** :
  - [SA-01] Aucun resultat --> reponse vide
- **Postcondition** : Resultats retournes
- **Regles metier** : RM-03

### [CU-04] Mettre a jour une entite
- **Acteur** : Ecrivain (via agent ou UI)
- **Precondition** : L'entite existe
- **Scenario nominal** :
  1. L'acteur identifie l'entite (par nom ou ID)
  2. L'acteur fournit les champs a modifier
  3. Le systeme met a jour l'entite et regenere les embeddings
  4. Le systeme confirme la mise a jour
- **Scenarios alternatifs** :
  - [SA-01] Entite non trouvee --> erreur
  - [SA-02] Modification du nom vers un nom existant --> erreur
- **Postcondition** : Entite modifiee, index mis a jour
- **Regles metier** : RM-01, RM-04

### [CU-05] Supprimer une entite
- **Acteur** : Ecrivain (via agent ou UI)
- **Precondition** : L'entite existe
- **Scenario nominal** :
  1. L'acteur identifie l'entite a supprimer
  2. Le systeme supprime l'entite et ses embeddings
  3. Le systeme confirme la suppression
- **Scenarios alternatifs** :
  - [SA-01] Entite referencee par d'autres --> avertissement avec liste des references, suppression si confirmee
- **Postcondition** : Entite et embeddings supprimes, index mis a jour
- **Regles metier** : RM-05

### [CU-06] Consulter la timeline
- **Acteur** : Agent IA ou Ecrivain (via UI)
- **Precondition** : Des evenements existent
- **Scenario nominal** :
  1. L'acteur demande la timeline (optionnel : filtrer par chapitre, personnage, lieu)
  2. Le systeme retourne les evenements tries chronologiquement
- **Postcondition** : Timeline retournee
- **Regles metier** : RM-06

### [CU-07] Consulter les relations d'un personnage
- **Acteur** : Agent IA ou Ecrivain (via UI)
- **Precondition** : Le personnage existe
- **Scenario nominal** :
  1. L'acteur demande les relations d'un personnage
  2. Le systeme retourne toutes les interactions impliquant ce personnage
- **Postcondition** : Relations retournees
- **Regles metier** : Aucune

### [CU-08] Sauvegarder la bible (backup)
- **Acteur** : Ecrivain (via agent ou UI)
- **Precondition** : La bible existe
- **Scenario nominal** :
  1. L'acteur demande un backup
  2. Le systeme copie le fichier .db avec un timestamp
  3. Le systeme confirme avec le chemin du backup
- **Scenarios alternatifs** :
  - [SA-01] Espace disque insuffisant --> erreur
- **Postcondition** : Copie du fichier .db creee
- **Regles metier** : RM-07

### [CU-09] Restaurer une bible
- **Acteur** : Ecrivain
- **Precondition** : Un backup existe
- **Scenario nominal** :
  1. L'acteur fournit le chemin du backup
  2. Le systeme sauvegarde la bible actuelle (securite)
  3. Le systeme restaure le backup
  4. Le systeme re-indexe si necessaire
- **Postcondition** : Bible restauree
- **Regles metier** : RM-07

### [CU-10] Obtenir les statistiques de la bible
- **Acteur** : Ecrivain (via agent ou UI)
- **Precondition** : Aucune
- **Scenario nominal** :
  1. L'acteur demande les stats
  2. Le systeme retourne : nombre de personnages, lieux, evenements, interactions, regles, recherches, taille de la DB
- **Postcondition** : Stats retournees
- **Regles metier** : Aucune

### [CU-11] Explorer le graph d'entites [AJOUT ui-web]
- **Acteur** : Ecrivain (via UI)
- **Precondition** : Au moins 2 entites liees existent
- **Scenario nominal** :
  1. L'ecrivain ouvre la vue Graph dans l'UI
  2. Le systeme charge toutes les entites et leurs relations
  3. Le systeme affiche un graph force-directed interactif
  4. L'ecrivain navigue (zoom, pan, drag), clique sur un noeud pour voir la fiche
- **Scenarios alternatifs** :
  - [SA-01] Bible vide --> message "Creez vos premiers personnages et lieux"
  - [SA-02] Filtrage par type d'entite --> seuls les noeuds du type selectionne + leurs liens
- **Postcondition** : Graph affiche, navigation possible
- **Regles metier** : RM-08

### [CU-12] Consulter la timeline visuelle [AJOUT ui-web]
- **Acteur** : Ecrivain (via UI)
- **Precondition** : Des evenements existent
- **Scenario nominal** :
  1. L'ecrivain ouvre la vue Timeline dans l'UI
  2. Le systeme affiche les evenements sur un axe chronologique (sort_order)
  3. L'ecrivain filtre par personnage, lieu ou plage de chapitres
  4. L'ecrivain peut reordonner par drag & drop (modifie sort_order)
- **Postcondition** : Timeline affichee, modifications sauvegardees si reordonnement
- **Regles metier** : RM-06

## Regles metier

| ID | Regle | Justification |
|----|-------|---------------|
| RM-01 | Le nom d'une entite doit etre unique au sein de son type | Evite les doublons et la confusion |
| RM-02 | Tout personnage doit avoir au minimum un nom | Donnee minimale pour l'identification |
| RM-03 | La recherche semantique retourne max 10 resultats par defaut, configurable | Evite la surcharge d'information |
| RM-04 | Toute modification d'entite met a jour le timestamp updated_at et regenere les embeddings | Coherence des index |
| RM-05 | La suppression d'une entite referencee retourne un avertissement mais n'est pas bloquante | L'auteur a le dernier mot |
| RM-06 | Les evenements sont ordonnes par "moment narratif" (chapitre, acte, scene) et non par date reelle | La chronologie narrative prime |
| RM-07 | Un backup cree une copie horodatee du fichier .db, jamais un ecrasement | Securite des donnees |
| RM-08 | Le graph affiche les entites comme noeuds et les relations (interactions, evenements partages, lieux) comme liens | Visualisation coherente des connexions narratives [AJOUT ui-web] |

## Modele de donnees metier

```
[Personnage] 1--N [Interaction] N--1 [Personnage]
     |                  |
     |                  N
     |                  |
     N            [Evenement] N--1 [Lieu]
     |                  |
[Evenement]             N
                        |
                  [Regle du Monde]

[Recherche] (independant — notes de reference)
[Note] (independant — annotations libres)
```

**Entites :**
- **Personnage** : nom, description physique, personnalite, background, evolutions, notes
- **Lieu** : nom, description, atmosphere, geographie, notes
- **Evenement** : titre, description, moment narratif (chapitre/acte/scene), personnages impliques, lieu
- **Interaction** : personnages impliques, nature de la relation, description, moment narratif
- **Regle du Monde** : categorie (magie, technologie, societe, etc.), titre, description
- **Recherche** : sujet, contenu, sources
- **Note** : contenu libre, tags

## Exigences non-fonctionnelles

| Categorie | Exigence | Priorite |
|-----------|----------|----------|
| Performance | Recherche semantique < 500ms pour un corpus de 1000 fiches | P0 |
| Performance | Recherche fulltext < 100ms | P0 |
| Performance | CRUD < 200ms (incluant re-indexation) | P0 |
| Portabilite | Fonctionne sur macOS, Linux, Windows sans configuration externe | P0 |
| Stockage | Fichier unique .db, taille < 500 MB pour un univers complet | P1 |
| Backup | Copie physique du fichier, horodatee, en une commande | P0 |
| Demarrage | Temps de lancement du MCP < 3s | P1 |
| Robustesse | Pas de perte de donnees en cas de crash (transactions SQLite) | P0 |
| UI — Rendu graph | Graph interactif fluide (60fps) pour < 500 noeuds | P0 [AJOUT ui-web] |
| UI — Temps de chargement | Premiere page < 2s, navigation entre vues < 500ms | P0 [AJOUT ui-web] |
| UI — Responsive | Fonctionne sur ecran >= 1024px (pas mobile, c'est un outil desktop) | P1 [AJOUT ui-web] |
| Distribution | `npx barda-ecrivain-bible` lance le MCP + UI en une commande | P0 [AJOUT ui-web] |

## Contraintes de securite (Security by Design)
- **Donnees sensibles** : Contenu creatif proprietaire de l'auteur (non sensible au sens RGPD, mais propriete intellectuelle)
- **Authentification** : Non applicable (mono-utilisateur, local)
- **Autorisation** : Non applicable (acces total pour l'unique utilisateur)
- **Surface d'attaque** : Transport stdio (MCP agent) + HTTP localhost (UI web). Le port HTTP est restreint a 127.0.0.1. [MIS A JOUR ui-web]
- **Conformite** : Aucune (donnees fictives, pas de donnees personnelles reelles)
- **Chiffrement** : Non requis (fichier local). Possibilite future via SQLCipher si demande.
- **XSS** : L'UI web doit sanitizer les contenus affiches (les fiches contiennent du texte libre) [AJOUT ui-web]

## Priorites

| Priorite | Fonctionnalites |
|----------|----------------|
| P0 (MVP) | CRUD personnages, lieux, evenements, interactions, regles du monde. Recherche fulltext. Recherche semantique. Backup/restore. Stats. |
| P0 (MVP UI) | Transport HTTP/SSE. Restructuration monorepo. Scaffolding UI. Dashboard stats. Listes d'entites. Fiches editables. Recherche fulltext UI. Graph interactif. [AJOUT ui-web] |
| P1 (confort) | Recherches et notes. Timeline filtree. Relations graph d'un personnage. Export de la bible en texte. |
| P1 (confort UI) | Timeline visuelle drag & drop. Recherche semantique UI. Backup/restore UI. Wiki-style navigation (clic sur nom --> fiche). [AJOUT ui-web] |
| P2 (nice-to-have) | Import bulk (JSON). Suggestions de coherence. Detection de doublons. Templates de fiches. |
| P2 (nice-to-have UI) | Dark mode / theming. Import/export UI. Templates UI. Selecteur de bible (v3). [AJOUT ui-web] |
