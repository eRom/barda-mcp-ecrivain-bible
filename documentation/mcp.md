# Bible d'Ecrivain MCP — Reference des outils

Documentation complete des 47 outils MCP exposes par le serveur Bible d'Ecrivain.

---

## Table des matieres

- [Personnages](#personnages)
  - [create_character](#create_character)
  - [get_character](#get_character)
  - [update_character](#update_character)
  - [delete_character](#delete_character)
  - [list_characters](#list_characters)
- [Lieux](#lieux)
  - [create_location](#create_location)
  - [get_location](#get_location)
  - [update_location](#update_location)
  - [delete_location](#delete_location)
  - [list_locations](#list_locations)
- [Evenements et Timeline](#evenements-et-timeline)
  - [create_event](#create_event)
  - [get_event](#get_event)
  - [update_event](#update_event)
  - [delete_event](#delete_event)
  - [list_events](#list_events)
  - [get_timeline](#get_timeline)
  - [get_timeline_filtered](#get_timeline_filtered)
- [Interactions et Relations](#interactions-et-relations)
  - [create_interaction](#create_interaction)
  - [get_interaction](#get_interaction)
  - [update_interaction](#update_interaction)
  - [delete_interaction](#delete_interaction)
  - [list_interactions](#list_interactions)
  - [get_character_relations](#get_character_relations)
- [Regles du Monde](#regles-du-monde)
  - [create_world_rule](#create_world_rule)
  - [get_world_rule](#get_world_rule)
  - [update_world_rule](#update_world_rule)
  - [delete_world_rule](#delete_world_rule)
  - [list_world_rules](#list_world_rules)
- [Recherches documentaires](#recherches-documentaires)
  - [create_research](#create_research)
  - [get_research](#get_research)
  - [update_research](#update_research)
  - [delete_research](#delete_research)
  - [list_research](#list_research)
- [Notes](#notes)
  - [create_note](#create_note)
  - [get_note](#get_note)
  - [update_note](#update_note)
  - [delete_note](#delete_note)
  - [list_notes](#list_notes)
- [Recherche](#recherche)
  - [search_fulltext](#search_fulltext)
  - [search_semantic](#search_semantic)
- [Export et Import](#export-et-import)
  - [export_bible](#export_bible)
  - [import_bulk](#import_bulk)
- [Detection de doublons](#detection-de-doublons)
  - [detect_duplicates](#detect_duplicates)
- [Templates](#templates)
  - [list_templates](#list_templates)
  - [get_template](#get_template)
- [Sauvegarde et Restauration](#sauvegarde-et-restauration)
  - [backup_bible](#backup_bible)
  - [restore_bible](#restore_bible)
  - [list_backups](#list_backups)
- [Statistiques](#statistiques)
  - [get_bible_stats](#get_bible_stats)
- [Diagnostic](#diagnostic)
  - [ping](#ping)

---

## Personnages

Gestion des fiches personnages : traits physiques, personnalite, background, evolution.

### create_character

Cree un nouveau personnage dans la bible. Le nom doit etre unique.

**Parametres :**

| Parametre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `name` | string | oui | Nom du personnage (unique) |
| `description` | string | non | Description generale du personnage |
| `traits` | string | non | Traits du personnage (JSON) |
| `background` | string | non | Histoire, origines, passe |
| `notes` | string | non | Notes libres, evolution prevue |

**Exemple :**

```
Utilisateur : "Cree le personnage Bob Martin, la quarantaine,
               cheveux bruns, ancien flic reconverti en libraire.
               Il porte des lunettes rondes et boite legerement."

Agent appelle : create_character({
  name: "Bob Martin",
  description: "Quarantaine, cheveux bruns, lunettes rondes, boite legerement",
  traits: "{\"physical\":[\"cheveux bruns\",\"lunettes rondes\",\"boiterie legere\"],
            \"personality\":[\"methodique\",\"nostalgique\"]}",
  background: "Ancien flic reconverti en libraire",
  notes: "A quitte la police apres une affaire traumatisante"
})
```

**Retour :** La fiche complete du personnage avec son ID (UUID).

---

### get_character

Recupere la fiche complete d'un personnage par son nom ou son identifiant.

**Parametres :**

| Parametre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `name` | string | non* | Nom du personnage |
| `id` | string | non* | Identifiant UUID |

*Au moins un des deux est requis.*

**Exemple :**

```
Utilisateur : "C'est quoi deja les traits de Bob ?"

Agent appelle : get_character({ name: "Bob Martin" })
```

---

### update_character

Met a jour les champs d'un personnage existant. Seuls les champs fournis sont modifies.

**Parametres :**

| Parametre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `id` | string | oui | UUID du personnage |
| `name` | string | non | Nouveau nom (doit rester unique) |
| `description` | string | non | Nouvelle description |
| `traits` | string | non | Nouveaux traits (JSON) |
| `background` | string | non | Nouveau background |
| `notes` | string | non | Nouvelles notes |

**Exemple :**

```
Utilisateur : "Bob se fait operer des yeux au chapitre 9,
               il ne porte plus de lunettes."

Agent appelle : update_character({
  id: "uuid-de-bob",
  description: "Quarantaine, cheveux bruns, boite legerement. Plus de lunettes depuis le chapitre 9.",
  notes: "Opere des yeux au chapitre 9. Avant : lunettes rondes."
})
```

---

### delete_character

Supprime un personnage et son embedding associe.

**Parametres :**

| Parametre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `id` | string | oui | UUID du personnage |

---

### list_characters

Liste tous les personnages de la bible avec pagination.

**Parametres :**

| Parametre | Type | Requis | Defaut | Description |
|-----------|------|--------|--------|-------------|
| `limit` | number | non | 50 | Nombre maximum de resultats |
| `offset` | number | non | 0 | Decalage pour la pagination |

**Exemple :**

```
Utilisateur : "Combien de personnages j'ai ?"

Agent appelle : list_characters({})
```

---

## Lieux

Gestion des fiches lieux : description, atmosphere, geographie.

### create_location

Cree un nouveau lieu dans la bible. Le nom doit etre unique.

**Parametres :**

| Parametre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `name` | string | oui | Nom du lieu (unique) |
| `description` | string | non | Description generale |
| `atmosphere` | string | non | Ambiance, sensations, couleurs |
| `geography` | string | non | Geographie, topographie, climat |
| `notes` | string | non | Notes libres |

**Exemple :**

```
Utilisateur : "La librairie de Bob s'appelle Le Vieux Grimoire,
               c'est une petite boutique en centre-ville."

Agent appelle : create_location({
  name: "Librairie Le Vieux Grimoire",
  description: "Petite librairie de quartier, facade en bois peint bleu delave",
  atmosphere: "Odeur de vieux papier, lumiere tamisee, craquements du plancher",
  geography: "Rue des Augustins, centre-ville, entre la boulangerie et le pressing"
})
```

---

### get_location

Recupere un lieu par son nom ou son identifiant.

**Parametres :**

| Parametre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `name` | string | non* | Nom du lieu |
| `id` | string | non* | UUID du lieu |

*Au moins un des deux est requis.*

---

### update_location

Met a jour un lieu existant. Seuls les champs fournis sont modifies.

**Parametres :**

| Parametre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `id` | string | oui | UUID du lieu |
| `name` | string | non | Nouveau nom |
| `description` | string | non | Nouvelle description |
| `atmosphere` | string | non | Nouvelle atmosphere |
| `geography` | string | non | Nouvelle geographie |
| `notes` | string | non | Nouvelles notes |

---

### delete_location

Supprime un lieu et son embedding associe.

**Parametres :**

| Parametre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `id` | string | oui | UUID du lieu |

---

### list_locations

Liste tous les lieux avec pagination.

**Parametres :**

| Parametre | Type | Requis | Defaut | Description |
|-----------|------|--------|--------|-------------|
| `limit` | number | non | 50 | Nombre max (1-200) |
| `offset` | number | non | 0 | Decalage |

---

## Evenements et Timeline

Gestion des evenements narratifs et de la chronologie de l'histoire.

### create_event

Cree un nouvel evenement dans la timeline. Le `sort_order` est auto-incremente si non fourni.

**Parametres :**

| Parametre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `title` | string | oui | Titre de l'evenement |
| `description` | string | non | Description detaillee |
| `chapter` | string | non | Chapitre ou section (ex: "chapitre 3", "acte 2") |
| `sort_order` | number | non | Ordre dans la timeline (auto-incremente si omis) |
| `location_id` | string | non | UUID du lieu ou ca se passe |
| `characters` | string[] | non | Liste d'UUIDs des personnages impliques |
| `notes` | string | non | Notes libres |

**Exemple :**

```
Utilisateur : "Au chapitre 3, Bob trouve un cadavre dans la librairie."

Agent appelle : create_event({
  title: "Decouverte du cadavre",
  description: "Bob trouve le corps de Victor derriere les etageres de la section polar",
  chapter: "chapitre 3",
  location_id: "uuid-librairie",
  characters: ["uuid-bob", "uuid-victor"],
  notes: "Element declencheur de l'intrigue principale"
})
```

---

### get_event

Recupere un evenement par son ID, **enrichi** avec les noms des personnages et du lieu.

**Parametres :**

| Parametre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `id` | string | oui | UUID de l'evenement |

---

### update_event

Met a jour un evenement existant.

**Parametres :**

| Parametre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `id` | string | oui | UUID de l'evenement |
| `title` | string | non | Nouveau titre |
| `description` | string | non | Nouvelle description |
| `chapter` | string | non | Nouveau chapitre |
| `sort_order` | number | non | Nouvel ordre |
| `location_id` | string | non | Nouvel UUID du lieu |
| `characters` | string[] | non | Nouvelle liste de personnages |
| `notes` | string | non | Nouvelles notes |

---

### delete_event

Supprime un evenement et son embedding.

**Parametres :**

| Parametre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `id` | string | oui | UUID de l'evenement |

---

### list_events

Liste tous les evenements avec pagination.

**Parametres :**

| Parametre | Type | Requis | Defaut | Description |
|-----------|------|--------|--------|-------------|
| `limit` | number | non | 50 | Nombre max |
| `offset` | number | non | 0 | Decalage |

---

### get_timeline

Retourne **tous** les evenements tries par ordre chronologique (`sort_order`), enrichis avec les noms des personnages et du lieu.

**Parametres :** Aucun.

**Exemple :**

```
Utilisateur : "Montre-moi toute la chronologie de l'histoire."

Agent appelle : get_timeline()

Reponse :
  1. [ch.1] Ouverture de la librairie — Bob, Marie — Le Vieux Grimoire
  2. [ch.2] Premiere visite de l'inspecteur — Duval — Le Vieux Grimoire
  3. [ch.3] Decouverte du cadavre — Bob, Victor — Le Vieux Grimoire
  ...
```

---

### get_timeline_filtered

Timeline filtree par personnage, lieu et/ou plage de chapitres. Les filtres se combinent en **AND**.

**Parametres :**

| Parametre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `character_id` | string | non | UUID d'un personnage — seuls ses evenements |
| `location_id` | string | non | UUID d'un lieu — seuls les evenements dans ce lieu |
| `chapter_from` | string | non | Chapitre de debut (inclusif) |
| `chapter_to` | string | non | Chapitre de fin (inclusif) |

**Exemple :**

```
Utilisateur : "Qu'est-ce qui arrive a Bob dans les chapitres 1 a 5 ?"

Agent appelle : get_timeline_filtered({
  character_id: "uuid-bob",
  chapter_from: "chapitre 1",
  chapter_to: "chapitre 5"
})
```

```
Utilisateur : "Que s'est-il passe au commissariat ?"

Agent appelle : get_timeline_filtered({
  location_id: "uuid-commissariat"
})
```

---

## Interactions et Relations

Gestion des interactions entre personnages et consultation du reseau relationnel.

### create_interaction

Cree une interaction entre personnages (**minimum 2**).

**Parametres :**

| Parametre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `description` | string | oui | Description de l'interaction |
| `characters` | string[] | oui | UUIDs des personnages (min 2) |
| `nature` | string | non | Type de relation (amitie, conflit, romance, alliance...) |
| `chapter` | string | non | Chapitre de reference |
| `sort_order` | integer | non | Ordre de tri (auto-incremente si omis) |
| `notes` | string | non | Notes libres |

**Exemple :**

```
Utilisateur : "Bob et Marie se connaissent depuis l'ecole de police.
               Ils etaient partenaires avant que Bob quitte la police."

Agent appelle : create_interaction({
  description: "Bob et Marie etaient partenaires a la brigade criminelle pendant 5 ans",
  characters: ["uuid-bob", "uuid-marie"],
  nature: "anciens collegues / amitie",
  chapter: "chapitre 1",
  notes: "Tension sous-jacente : Marie n'a jamais compris pourquoi Bob a demissionne"
})
```

---

### get_interaction

Recupere une interaction par son ID, enrichie avec les noms des personnages.

**Parametres :**

| Parametre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `id` | string | oui | UUID de l'interaction |

---

### update_interaction

Met a jour une interaction. Si `characters` est fourni, minimum 2 requis.

**Parametres :**

| Parametre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `id` | string | oui | UUID de l'interaction |
| `description` | string | non | Nouvelle description |
| `characters` | string[] | non | Nouveaux personnages (min 2) |
| `nature` | string | non | Nouvelle nature |
| `chapter` | string | non | Nouveau chapitre |
| `sort_order` | integer | non | Nouvel ordre |
| `notes` | string | non | Nouvelles notes |

---

### delete_interaction

Supprime une interaction et son embedding.

**Parametres :**

| Parametre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `id` | string | oui | UUID de l'interaction |

---

### list_interactions

Liste toutes les interactions avec pagination.

**Parametres :**

| Parametre | Type | Requis | Defaut | Description |
|-----------|------|--------|--------|-------------|
| `limit` | number | non | 50 | Nombre max (1-200) |
| `offset` | number | non | 0 | Decalage |

---

### get_character_relations

Retourne **toutes** les interactions impliquant un personnage donne, triees par ordre chronologique, enrichies avec les noms.

**Parametres :**

| Parametre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `character_id` | string | oui | UUID du personnage |

**Exemple :**

```
Utilisateur : "Bob et Marie se sont-ils deja croises ?"

Agent appelle : get_character_relations({ character_id: "uuid-bob" })

Reponse :
  1. [ch.1] anciens collegues — Bob Martin, Marie Duval
     "Partenaires a la brigade criminelle pendant 5 ans"
  2. [ch.4] tension — Bob Martin, Marie Duval
     "Marie confronte Bob sur sa demission"
```

---

## Regles du Monde

Gestion des regles de l'univers narratif : systemes de magie, technologie, societe, religion, etc.

### create_world_rule

Cree une nouvelle regle du monde.

**Parametres :**

| Parametre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `category` | string | oui | Categorie (magie, technologie, societe, religion...) |
| `title` | string | oui | Titre de la regle |
| `description` | string | oui | Description detaillee |
| `notes` | string | non | Notes libres |

**Exemple :**

```
Utilisateur : "Dans mon univers, la magie est interdite depuis
               la Guerre des Cendres, il y a 200 ans."

Agent appelle : create_world_rule({
  category: "magie",
  title: "Interdiction de la magie",
  description: "La magie est interdite par decret royal depuis la Guerre des Cendres (il y a 200 ans). Tout pratiquant est passible de mort. La connaissance magique est transmise clandestinement.",
  notes: "Exception : les Guerisseurs du Temple ont une derogation officielle"
})
```

---

### get_world_rule

Recupere une regle par son ID.

**Parametres :**

| Parametre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `id` | string | oui | UUID de la regle |

---

### update_world_rule

Met a jour une regle du monde.

**Parametres :**

| Parametre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `id` | string | oui | UUID de la regle |
| `category` | string | non | Nouvelle categorie |
| `title` | string | non | Nouveau titre |
| `description` | string | non | Nouvelle description |
| `notes` | string | non | Nouvelles notes |

---

### delete_world_rule

Supprime une regle et son embedding.

**Parametres :**

| Parametre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `id` | string | oui | UUID de la regle |

---

### list_world_rules

Liste les regles du monde, avec filtre optionnel par categorie.

**Parametres :**

| Parametre | Type | Requis | Defaut | Description |
|-----------|------|--------|--------|-------------|
| `category` | string | non | — | Filtrer par categorie |
| `limit` | number | non | 50 | Nombre max |
| `offset` | number | non | 0 | Decalage |

**Exemple :**

```
Utilisateur : "Quelles sont les regles de magie dans mon univers ?"

Agent appelle : list_world_rules({ category: "magie" })
```

---

## Recherches documentaires

Notes de recherche : documentation, references, sources utilisees pour nourrir l'univers.

### create_research

Cree une fiche de recherche.

**Parametres :**

| Parametre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `topic` | string | oui | Sujet de la recherche |
| `content` | string | oui | Contenu, notes de recherche |
| `sources` | string | non | Sources (JSON array : `["url", "livre"]`) |
| `notes` | string | non | Notes libres |

**Exemple :**

```
Utilisateur : "J'ai fait des recherches sur les techniques de police
               scientifique des annees 90 pour mon polar."

Agent appelle : create_research({
  topic: "Police scientifique annees 90",
  content: "Pas d'ADN systematique avant 1998. Empreintes digitales + temoignages. Autopsies basiques. Pas de cameras de surveillance generalisees.",
  sources: "[\"Le guide de la police scientifique, Ed. Dunod\",\"Interview commissaire Leblanc\"]",
  notes: "Important pour les chapitres 5-8 ou l'enquete patine"
})
```

---

### get_research

Recupere une fiche de recherche par ID.

**Parametres :**

| Parametre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `id` | string | oui | UUID de la recherche |

---

### update_research

Met a jour une fiche de recherche.

**Parametres :**

| Parametre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `id` | string | oui | UUID de la recherche |
| `topic` | string | non | Nouveau sujet |
| `content` | string | non | Nouveau contenu |
| `sources` | string | non | Nouvelles sources (JSON array) |
| `notes` | string | non | Nouvelles notes |

---

### delete_research

Supprime une fiche de recherche et son embedding.

**Parametres :**

| Parametre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `id` | string | oui | UUID de la recherche |

---

### list_research

Liste toutes les fiches de recherche avec pagination.

**Parametres :**

| Parametre | Type | Requis | Defaut | Description |
|-----------|------|--------|--------|-------------|
| `limit` | number | non | 50 | Nombre max |
| `offset` | number | non | 0 | Decalage |

---

## Notes

Notes libres avec systeme de tags pour organiser les idees.

### create_note

Cree une note.

**Parametres :**

| Parametre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `content` | string | oui | Contenu de la note |
| `tags` | string | non | Tags (JSON array : `["idee", "a-revoir"]`) |

**Exemple :**

```
Utilisateur : "Note pour plus tard : peut-etre faire mourir Victor
               au chapitre 7 plutot qu'au chapitre 3."

Agent appelle : create_note({
  content: "Idee : deplacer la mort de Victor au chapitre 7 pour renforcer la tension. Au chapitre 3, Victor serait juste blesse. Cela permet de developper sa relation avec Bob.",
  tags: "[\"structure\",\"a-discuter\",\"victor\"]"
})
```

---

### get_note

Recupere une note par ID.

**Parametres :**

| Parametre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `id` | string | oui | UUID de la note |

---

### update_note

Met a jour une note.

**Parametres :**

| Parametre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `id` | string | oui | UUID de la note |
| `content` | string | non | Nouveau contenu |
| `tags` | string | non | Nouveaux tags (JSON array) |

---

### delete_note

Supprime une note et son embedding.

**Parametres :**

| Parametre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `id` | string | oui | UUID de la note |

---

### list_notes

Liste les notes avec pagination et filtrage optionnel par tag.

**Parametres :**

| Parametre | Type | Requis | Defaut | Description |
|-----------|------|--------|--------|-------------|
| `limit` | number | non | 50 | Nombre max |
| `offset` | number | non | 0 | Decalage |
| `tag` | string | non | — | Filtrer par tag |

**Exemple :**

```
Utilisateur : "Quelles notes j'ai taguees 'a-discuter' ?"

Agent appelle : list_notes({ tag: "a-discuter" })
```

---

## Recherche

Deux modes de recherche complementaires pour retrouver l'information dans la bible.

### search_fulltext

Recherche textuelle exacte dans toute la bible via FTS5. Supporte la syntaxe avancee : prefixes (`bob*`), phrases (`"yeux verts"`), booleens (`OR`, `NOT`).

**Parametres :**

| Parametre | Type | Requis | Defaut | Description |
|-----------|------|--------|--------|-------------|
| `query` | string | oui | — | Requete de recherche (syntaxe FTS5) |
| `entity_type` | string | non | — | Filtrer par type : character, location, event, interaction, world_rule, research, note |
| `limit` | number | non | 10 | Nombre max de resultats |

**Exemples :**

```
Utilisateur : "Qui a des lunettes dans mon histoire ?"

Agent appelle : search_fulltext({
  query: "lunettes",
  entity_type: "character"
})
```

```
Utilisateur : "Cherche tout ce qui parle du commissariat"

Agent appelle : search_fulltext({ query: "commissariat" })
```

```
# Recherche avancee FTS5
search_fulltext({ query: "bob*" })              # Prefixe : bob, bobby, bobine...
search_fulltext({ query: "\"yeux verts\"" })     # Phrase exacte
search_fulltext({ query: "magie NOT interdite" })  # Booleen
```

**Retour :** Liste de resultats avec type d'entite, snippet (extrait avec le terme en surbrillance), score de pertinence, et donnees completes de l'entite.

---

### search_semantic

Recherche par **sens** et similarite semantique via embeddings vectoriels. Trouve des entites conceptuellement proches de la requete, **meme sans mots-cles exacts**.

C'est l'outil le plus puissant pour les questions floues.

**Parametres :**

| Parametre | Type | Requis | Defaut | Description |
|-----------|------|--------|--------|-------------|
| `query` | string | oui | — | Requete en langage naturel |
| `entity_type` | string | non | — | Filtrer par type |
| `limit` | number | non | 10 | Nombre max de resultats |
| `threshold` | number | non | 0.5 | Score de similarite minimum (0 a 1) |

**Exemples :**

```
Utilisateur : "Je sais plus si Bob avait des problemes de vue"

Agent appelle : search_semantic({
  query: "Bob problemes de vue lunettes vision"
})

Reponse :
  1. [character] Bob Martin — score 0.87
     "Quarantaine, cheveux bruns, lunettes rondes..."
  2. [event] Operation des yeux de Bob — score 0.82
     "Bob se fait operer au chapitre 9"
```

```
Utilisateur : "Quels lieux ont une ambiance sombre dans mon histoire ?"

Agent appelle : search_semantic({
  query: "lieu sombre inquietant menaçant",
  entity_type: "location",
  threshold: 0.6
})
```

```
Utilisateur : "Bob portait-il des lunettes a l'eglise du chateau ?"

Agent appelle :
  search_semantic({ query: "Bob lunettes eglise chateau" })
  get_timeline_filtered({ character_id: "uuid-bob" })

--> Croise les resultats pour repondre avec precision
```

---

## Export et Import

### export_bible

Exporte la bible complete (ou un seul type d'entite) en document Markdown structure.

**Parametres :**

| Parametre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `entity_type` | string | non | Type a exporter : characters, locations, events, interactions, world_rules, research, notes. Si omis, exporte tout. |

**Exemples :**

```
Utilisateur : "Exporte-moi toute la bible"

Agent appelle : export_bible()

--> Document Markdown complet :
    # Bible
    ## Personnages
    ### Bob Martin
    - Description : ...
    ### Marie Duval
    - Description : ...
    ## Lieux
    ...
```

```
Utilisateur : "Donne-moi juste la liste de mes personnages"

Agent appelle : export_bible({ entity_type: "characters" })
```

---

### import_bulk

Import massif d'entites depuis un objet JSON structure. Transaction tout-ou-rien : si une erreur survient, rien n'est insere.

**Parametres :**

| Parametre | Type | Requis | Defaut | Description |
|-----------|------|--------|--------|-------------|
| `data` | object | oui | — | Objet JSON (voir structure ci-dessous) |
| `on_conflict` | string | non | "skip" | Strategie doublons : `"skip"` (ignore) ou `"update"` (ecrase) |

**Structure de `data` :**

```json
{
  "characters": [
    { "name": "Alice", "description": "..." },
    { "name": "Charlie", "description": "..." }
  ],
  "locations": [
    { "name": "Le Phare", "description": "..." }
  ],
  "events": [...],
  "interactions": [...],
  "world_rules": [...],
  "research": [...],
  "notes": [...]
}
```

Toutes les cles sont optionnelles. Seuls les types fournis sont importes.

**Exemple :**

```
Utilisateur : "J'ai prepare mes personnages dans un fichier JSON,
               importe-les dans la bible."

Agent appelle : import_bulk({
  data: {
    characters: [
      { name: "Alice Moreau", description: "Journaliste d'investigation, 35 ans" },
      { name: "Le Professeur", description: "Ancien universitaire, identite inconnue" }
    ]
  },
  on_conflict: "skip"
})

Reponse : { imported: { characters: 2 }, skipped: 0, errors: [] }
```

---

## Detection de doublons

### detect_duplicates

Detecte les fiches potentiellement dupliquees en comparant la similarite semantique entre les embeddings.

**Parametres :**

| Parametre | Type | Requis | Defaut | Description |
|-----------|------|--------|--------|-------------|
| `entity_type` | string | non | — | Filtrer par type d'entite |
| `threshold` | number | non | 0.85 | Seuil de similarite (0 a 1) |

**Exemple :**

```
Utilisateur : "Est-ce que j'ai des fiches en double ?"

Agent appelle : detect_duplicates({ threshold: 0.8 })

Reponse :
  - Bob Martin (character) <-> Robert Martin (character) — score 0.92
  - Le Vieux Grimoire (location) <-> Librairie Grimoire (location) — score 0.88
```

---

## Templates

Templates de fiches preremplis par genre litteraire pour guider la creation.

### list_templates

Liste les genres disponibles.

**Parametres :** Aucun.

**Genres disponibles :** fantasy, polar, sf, historique, romance.

**Types d'entites :** character, location, world_rule.

---

### get_template

Retourne un template prerempli pour un genre et un type d'entite.

**Parametres :**

| Parametre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `genre` | string | oui | Genre : fantasy, polar, sf, historique, romance |
| `entity_type` | string | oui | Type : character, location, world_rule |

**Exemple :**

```
Utilisateur : "Je commence un roman de fantasy, donne-moi un modele
               de fiche personnage."

Agent appelle : get_template({ genre: "fantasy", entity_type: "character" })

Reponse :
  {
    name: "[Nom du personnage]",
    description: "Race, age, apparence physique...",
    traits: { physical: ["taille","cheveux","yeux","cicatrices"],
              personality: ["trait dominant","defaut","peur"] },
    background: "Origines, formation, evenement fondateur...",
    notes: "Arc narratif prevu, evolution..."
  }
```

---

## Sauvegarde et Restauration

### backup_bible

Cree une sauvegarde de la bible dans le dossier `backups/`.

**Parametres :**

| Parametre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `label` | string | non | Label ajoute au nom du fichier |

**Exemple :**

```
Utilisateur : "Sauvegarde la bible avant que je modifie le chapitre 10"

Agent appelle : backup_bible({ label: "avant-chapitre-10" })

Reponse : bible_2026-03-25_143000_avant-chapitre-10.db (245 KB)
```

---

### restore_bible

Restaure la bible depuis un backup. Verifie l'integrite du fichier et sauvegarde automatiquement la bible actuelle avant restauration.

**Parametres :**

| Parametre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `backup_name` | string | oui | Nom du fichier de backup |

**Exemple :**

```
Utilisateur : "J'ai fait n'importe quoi, restore le backup d'hier"

Agent appelle : list_backups()
--> bible_2026-03-25_143000_avant-chapitre-10.db

Agent appelle : restore_bible({
  backup_name: "bible_2026-03-25_143000_avant-chapitre-10.db"
})
```

---

### list_backups

Liste tous les backups disponibles avec taille et date.

**Parametres :** Aucun.

---

## Statistiques

### get_bible_stats

Retourne les statistiques completes de la bible.

**Parametres :** Aucun.

**Exemple :**

```
Utilisateur : "Ou en est ma bible ?"

Agent appelle : get_bible_stats()

Reponse :
  {
    characters: 12,
    locations: 8,
    events: 34,
    interactions: 15,
    world_rules: 6,
    research: 3,
    notes: 9,
    embeddings: 87,
    db_size: "2.4 MB",
    last_modified: "2026-03-25T14:30:00"
  }
```

---

## Diagnostic

### ping

Verifie que le serveur est operationnel.

**Parametres :** Aucun.

**Retour :** `"pong — bible-ecrivain MCP operationnel"`
