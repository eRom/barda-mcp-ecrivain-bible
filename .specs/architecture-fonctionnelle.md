# Architecture Fonctionnelle — Bible d'Écrivain MCP

**Date de création** : 2026-03-25
**Dernière mise à jour** : 2026-03-25
**Chantiers intégrés** : mvp

## Vision produit
Un serveur MCP standalone qui sert de mémoire externe structurée et cherchable pour les écrivains. Il centralise toutes les données d'un univers narratif (personnages, lieux, événements, interactions, règles, recherches) et les expose via des outils MCP permettant à un agent IA de consulter et enrichir la bible pendant les sessions d'écriture. La bible est la seule source de vérité de l'univers.

## Personas

### L'Écrivain
- **Qui** : Auteur de fiction (fantasy, SF, polar, historique) travaillant sur un projet long (roman, série)
- **Objectif** : Maintenir la cohérence de son univers narratif sans surcharge mentale
- **Frustration actuelle** : Notes dispersées, pas de recherche efficace, oublis fréquents ("Bob portait-il des lunettes à ce moment-là ?")
- **Fréquence d'usage** : Quotidienne pendant les sessions d'écriture

### L'Agent IA (via Cruchot)
- **Qui** : LLM utilisé comme co-auteur/assistant d'écriture
- **Objectif** : Accéder instantanément aux données de l'univers pour produire du contenu cohérent
- **Frustration actuelle** : Pas de mémoire persistante entre sessions, l'auteur doit re-contextualiser à chaque fois
- **Fréquence d'usage** : À chaque session d'écriture, potentiellement des dizaines de requêtes par session

## Parcours utilisateurs

### Parcours 1 — Consultation rapide pendant l'écriture
```
Écrivain → Pose une question à l'agent ("Bob a les yeux de quelle couleur ?")
    → Agent appelle search_character("Bob", "yeux")
        → Bible retourne la fiche Bob avec traits physiques
            → Agent répond : "Bob a les yeux verts, mentionné chapitre 3"
```

### Parcours 2 — Vérification de cohérence temporelle
```
Écrivain → "Est-ce que Marie connaissait déjà Pierre au chapitre 5 ?"
    → Agent appelle search_interactions("Marie", "Pierre")
    → Agent appelle search_events(chapter_max: 5)
        → Bible retourne les interactions et événements pertinents
            → Agent synthétise la timeline relationnelle
```

### Parcours 3 — Enrichissement après écriture
```
Écrivain → "Met ce nouveau paragraphe dans la bible"
    → Agent (LLM) analyse le texte, identifie les changements
    → Agent appelle update_character("Bob", nouvelle_description)
    → Agent appelle create_event("Opération des yeux de Bob", chapitre: 9)
        → Bible stocke et ré-indexe les embeddings
            → Confirmation à l'écrivain
```

### Parcours 4 — Exploration de l'univers
```
Écrivain → "Montre-moi tout ce qui concerne le Château de Valmur"
    → Agent appelle search_semantic("Château de Valmur")
        → Bible retourne : fiche lieu + événements associés + personnages liés
            → Agent présente une vue consolidée
```

### Parcours 5 — Création initiale de la bible
```
Écrivain → Décrit ses personnages, lieux, règles via l'agent ou l'UI
    → Agent appelle create_character({name, description, traits...})
    → Agent appelle create_location({name, description, atmosphere...})
        → Bible stocke et indexe
            → L'univers prend forme progressivement
```

### Parcours 6 — Backup et restauration
```
Écrivain → "Fais un backup de la bible"
    → Agent appelle backup_bible()
        → Bible copie le fichier .db avec timestamp
            → Confirmation avec chemin du backup
```

## Cas d'usage

### [CU-01] Créer une fiche personnage
- **Acteur** : Écrivain (via agent ou UI)
- **Précondition** : Aucune
- **Scénario nominal** :
  1. L'acteur fournit les informations du personnage (nom, description, traits, background)
  2. Le système vérifie l'unicité du nom
  3. Le système crée la fiche et génère les embeddings
  4. Le système confirme la création
- **Scénarios alternatifs** :
  - [SA-01] Nom déjà existant → erreur avec suggestion de mise à jour
- **Postcondition** : Fiche créée, indexée en fulltext et sémantique
- **Règles métier** : RM-01, RM-02

### [CU-02] Rechercher dans la bible (sémantique)
- **Acteur** : Agent IA
- **Précondition** : Au moins une entité existe dans la bible
- **Scénario nominal** :
  1. L'agent envoie une requête en langage naturel
  2. Le système génère l'embedding de la requête
  3. Le système recherche les entités les plus proches (cosine similarity)
  4. Le système retourne les résultats triés par pertinence avec type d'entité et contenu
- **Scénarios alternatifs** :
  - [SA-01] Aucun résultat pertinent (score < seuil) → réponse vide avec message
  - [SA-02] Requête trop vague → retourne les N meilleurs résultats toutes catégories
- **Postcondition** : Résultats retournés, aucune modification
- **Règles métier** : RM-03

### [CU-03] Rechercher dans la bible (fulltext)
- **Acteur** : Agent IA ou Écrivain
- **Précondition** : Au moins une entité existe
- **Scénario nominal** :
  1. L'acteur envoie une recherche textuelle exacte ou partielle
  2. Le système interroge l'index FTS5
  3. Le système retourne les résultats avec extraits et surbrillance
- **Scénarios alternatifs** :
  - [SA-01] Aucun résultat → réponse vide
- **Postcondition** : Résultats retournés
- **Règles métier** : RM-03

### [CU-04] Mettre à jour une entité
- **Acteur** : Écrivain (via agent ou UI)
- **Précondition** : L'entité existe
- **Scénario nominal** :
  1. L'acteur identifie l'entité (par nom ou ID)
  2. L'acteur fournit les champs à modifier
  3. Le système met à jour l'entité et régénère les embeddings
  4. Le système confirme la mise à jour
- **Scénarios alternatifs** :
  - [SA-01] Entité non trouvée → erreur
  - [SA-02] Modification du nom vers un nom existant → erreur
- **Postcondition** : Entité modifiée, index mis à jour
- **Règles métier** : RM-01, RM-04

### [CU-05] Supprimer une entité
- **Acteur** : Écrivain (via agent ou UI)
- **Précondition** : L'entité existe
- **Scénario nominal** :
  1. L'acteur identifie l'entité à supprimer
  2. Le système supprime l'entité et ses embeddings
  3. Le système confirme la suppression
- **Scénarios alternatifs** :
  - [SA-01] Entité référencée par d'autres (ex: personnage dans des événements) → avertissement avec liste des références, suppression si confirmée
- **Postcondition** : Entité et embeddings supprimés, index mis à jour
- **Règles métier** : RM-05

### [CU-06] Consulter la timeline
- **Acteur** : Agent IA ou Écrivain
- **Précondition** : Des événements existent
- **Scénario nominal** :
  1. L'acteur demande la timeline (optionnel : filtrer par chapitre, personnage, lieu)
  2. Le système retourne les événements triés chronologiquement
- **Postcondition** : Timeline retournée
- **Règles métier** : RM-06

### [CU-07] Consulter les relations d'un personnage
- **Acteur** : Agent IA ou Écrivain
- **Précondition** : Le personnage existe
- **Scénario nominal** :
  1. L'acteur demande les relations d'un personnage
  2. Le système retourne toutes les interactions impliquant ce personnage
- **Postcondition** : Relations retournées
- **Règles métier** : Aucune

### [CU-08] Sauvegarder la bible (backup)
- **Acteur** : Écrivain (via agent ou UI)
- **Précondition** : La bible existe
- **Scénario nominal** :
  1. L'acteur demande un backup
  2. Le système copie le fichier .db avec un timestamp
  3. Le système confirme avec le chemin du backup
- **Scénarios alternatifs** :
  - [SA-01] Espace disque insuffisant → erreur
- **Postcondition** : Copie du fichier .db créée
- **Règles métier** : RM-07

### [CU-09] Restaurer une bible
- **Acteur** : Écrivain
- **Précondition** : Un backup existe
- **Scénario nominal** :
  1. L'acteur fournit le chemin du backup
  2. Le système sauvegarde la bible actuelle (sécurité)
  3. Le système restaure le backup
  4. Le système ré-indexe si nécessaire
- **Postcondition** : Bible restaurée
- **Règles métier** : RM-07

### [CU-10] Obtenir les statistiques de la bible
- **Acteur** : Écrivain (via agent ou UI)
- **Précondition** : Aucune
- **Scénario nominal** :
  1. L'acteur demande les stats
  2. Le système retourne : nombre de personnages, lieux, événements, interactions, règles, recherches, taille de la DB
- **Postcondition** : Stats retournées
- **Règles métier** : Aucune

## Règles métier

| ID | Règle | Justification |
|----|-------|---------------|
| RM-01 | Le nom d'une entité doit être unique au sein de son type | Évite les doublons et la confusion |
| RM-02 | Tout personnage doit avoir au minimum un nom | Donnée minimale pour l'identification |
| RM-03 | La recherche sémantique retourne max 10 résultats par défaut, configurable | Évite la surcharge d'information |
| RM-04 | Toute modification d'entité met à jour le timestamp `updated_at` et régénère les embeddings | Cohérence des index |
| RM-05 | La suppression d'une entité référencée retourne un avertissement mais n'est pas bloquante | L'auteur a le dernier mot |
| RM-06 | Les événements sont ordonnés par "moment narratif" (chapitre, acte, scène) et non par date réelle | La chronologie narrative prime |
| RM-07 | Un backup crée une copie horodatée du fichier .db, jamais un écrasement | Sécurité des données |

## Modèle de données métier

```
[Personnage] 1──N [Interaction] N──1 [Personnage]
     │                  │
     │                  N
     │                  │
     N            [Événement] N──1 [Lieu]
     │                  │
[Événement]             N
                        │
                  [Règle du Monde]

[Recherche] (indépendant — notes de référence)
[Note] (indépendant — annotations libres)
```

**Entités :**
- **Personnage** : nom, description physique, personnalité, background, évolutions, notes
- **Lieu** : nom, description, atmosphère, géographie, notes
- **Événement** : titre, description, moment narratif (chapitre/acte/scène), personnages impliqués, lieu
- **Interaction** : personnages impliqués, nature de la relation, description, moment narratif
- **Règle du Monde** : catégorie (magie, technologie, société, etc.), titre, description
- **Recherche** : sujet, contenu, sources
- **Note** : contenu libre, tags

## Exigences non-fonctionnelles

| Catégorie | Exigence | Priorité |
|-----------|----------|----------|
| Performance | Recherche sémantique < 500ms pour un corpus de 1000 fiches | P0 |
| Performance | Recherche fulltext < 100ms | P0 |
| Performance | CRUD < 200ms (incluant ré-indexation) | P0 |
| Portabilité | Fonctionne sur macOS, Linux, Windows sans configuration externe | P0 |
| Stockage | Fichier unique .db, taille < 500 MB pour un univers complet | P1 |
| Backup | Copie physique du fichier, horodatée, en une commande | P0 |
| Démarrage | Temps de lancement du MCP < 3s | P1 |
| Robustesse | Pas de perte de données en cas de crash (transactions SQLite) | P0 |

## Contraintes de sécurité (Security by Design)
- **Données sensibles** : Contenu créatif propriétaire de l'auteur (non sensible au sens RGPD, mais propriété intellectuelle)
- **Authentification** : Non applicable (mono-utilisateur, local)
- **Autorisation** : Non applicable (accès total pour l'unique utilisateur)
- **Surface d'attaque** : Transport stdio uniquement = pas d'exposition réseau. Risque quasi nul.
- **Conformité** : Aucune (données fictives, pas de données personnelles réelles)
- **Chiffrement** : Non requis (fichier local). Possibilité future via SQLCipher si demandé.

## Priorités

| Priorité | Fonctionnalités |
|----------|----------------|
| P0 (MVP) | CRUD personnages, lieux, événements, interactions, règles du monde. Recherche fulltext. Recherche sémantique. Backup/restore. Stats. |
| P1 (confort) | Recherches et notes. Timeline filtrée. Relations graph d'un personnage. Export de la bible en texte. |
| P2 (nice-to-have) | Import bulk (JSON). Suggestions de cohérence. Détection de doublons. Templates de fiches. |
