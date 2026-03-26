# Architecture Technique — mvp

**Date** : 2026-03-25
**Statut** : Décidé
**Contexte** : brainstorming.md, architecture-fonctionnelle.md, stack-technique.md

## Problème architectural
Exposer une base de connaissances narratives via MCP avec deux modes de recherche (fulltext exact + sémantique vectoriel) tout en maintenant la simplicité d'un fichier unique portable et sauvegardable.

## Flux principal

```
[Client LLM / Cruchot]
        │ stdio (JSON-RPC)
        ▼
┌─────────────────────────┐
│   MCP Server (Node.js)  │
│                         │
│  ┌───────────────────┐  │
│  │   Tool Router     │  │
│  │  (CallTool)       │  │
│  └──────┬────────────┘  │
│         │               │
│  ┌──────▼────────────┐  │
│  │  Service Layer    │  │
│  │  (CRUD + Search)  │  │
│  └──────┬────────────┘  │
│         │               │
│  ┌──────▼────────────┐  │
│  │  Data Layer       │  │
│  │  Drizzle + SQLite │  │
│  │  FTS5 + Vectors   │  │
│  └──────┬────────────┘  │
│         │               │
│  ┌──────▼────────────┐  │
│  │  Embedding Engine │  │
│  │  HF Transformers  │  │
│  │  (ONNX local)     │  │
│  └───────────────────┘  │
│                         │
│  [ bible.db ] ◄── fichier unique
└─────────────────────────┘
```

## Décisions architecturales

### Décision 1 : Transport stdio uniquement
**Problème** : Quel transport MCP exposer ?
**Options** :
  - Option A : stdio → communication par stdin/stdout, standard MCP → simple, universel
  - Option B : HTTP/SSE → serveur web, accessible réseau → plus complexe, overkill pour du local
**Choix** : stdio
**Raison** : Mono-utilisateur local. Cruchot et Claude Desktop utilisent stdio nativement. Zéro configuration réseau.

### Décision 2 : Fichier SQLite unique pour tout
**Problème** : Comment stocker données structurées + index fulltext + embeddings vectoriels ?
**Options** :
  - Option A : Un seul fichier SQLite (tables + FTS5 virtual tables + embeddings en BLOB) → portable, backup trivial
  - Option B : SQLite (données) + fichiers séparés (embeddings) → séparation des concerns / backup complexe
  - Option C : SQLite + sqlite-vec extension → natif mais dépendance binaire fragile
**Choix** : Option A — tout dans SQLite
**Raison** : Un fichier = une bible. Backup = `cp`. Le corpus est petit (< 10K fiches), la similarité cosinus en JS est instantanée.

### Décision 3 : Embeddings locaux sans API externe
**Problème** : Comment générer les embeddings pour la recherche sémantique ?
**Options** :
  - Option A : Modèle ONNX local via @huggingface/transformers → autonome, pas de clé API
  - Option B : API OpenAI/Anthropic → meilleure qualité, mais dépendance externe + coût
  - Option C : Pas d'embeddings, FTS5 seul → simple mais pas de recherche sémantique
**Choix** : Option A — ONNX local
**Raison** : Standalone total. Le modèle multilingual-e5-small est suffisant pour du contenu littéraire français. Premier lancement télécharge ~130MB, ensuite caché.

### Décision 4 : Cosine similarity en JS vs sqlite-vec
**Problème** : Où calculer la similarité vectorielle ?
**Options** :
  - Option A : Charger les embeddings en mémoire, cosine similarity en JS → simple, pas de dépendance native
  - Option B : sqlite-vec extension → performant, mais dépendance binaire, cross-platform fragile
**Choix** : Option A — JS in-memory
**Raison** : Pour < 10 000 vecteurs de dimension 384 (E5-small), le calcul en JS prend < 50ms. sqlite-vec est un plan d'évolution si le corpus explose.

### Décision 5 : Architecture par domaine (tools)
**Problème** : Comment organiser les tools MCP ?
**Options** :
  - Option A : Un fichier par type d'entité (characters.ts, locations.ts, ...) → clair, isolé
  - Option B : Un seul fichier avec tous les tools → simple mais monolithique
**Choix** : Option A — un fichier par domaine
**Raison** : Chaque domaine a sa propre logique CRUD. Le router central importe et dispatche.

### Décision 6 : Synchronisation FTS5 par triggers SQL
**Problème** : Comment maintenir l'index fulltext à jour ?
**Options** :
  - Option A : Triggers SQL (INSERT/UPDATE/DELETE) qui mirrorent les données dans les tables FTS5 → automatique, fiable
  - Option B : Synchronisation applicative dans le code TS → flexible mais risque de désynchronisation
**Choix** : Option A — triggers SQL
**Raison** : La base de données garantit la cohérence. Impossible d'oublier de mettre à jour l'index.

### Décision 7 : Ré-indexation des embeddings à la modification
**Problème** : Quand régénérer les embeddings d'une entité modifiée ?
**Options** :
  - Option A : Synchrone à la modification → latence ajoutée (~100-200ms) mais toujours à jour
  - Option B : File d'attente async → latence nulle sur le CRUD, mais index potentiellement stale
**Choix** : Option A — synchrone
**Raison** : Mono-utilisateur, pas de contrainte de latence stricte. La cohérence prime.

## Structure du projet

```
barda-mcp-ecrivain-bible/
├── src/
│   ├── index.ts                 # Entry point : crée le serveur, connecte le transport
│   ├── server.ts                # Instancie le Server MCP, enregistre les handlers
│   ├── db/
│   │   ├── index.ts             # Connexion SQLite, init WAL + FK, chargement FTS5
│   │   ├── schema.ts            # Schéma Drizzle (toutes les tables)
│   │   ├── fts.ts               # Création tables FTS5 + triggers (raw SQL)
│   │   └── migrations/          # Migrations générées par drizzle-kit
│   ├── tools/
│   │   ├── index.ts             # Registry central : exporte tous les tools
│   │   ├── characters.ts        # CRUD personnages
│   │   ├── locations.ts         # CRUD lieux
│   │   ├── events.ts            # CRUD événements + timeline
│   │   ├── interactions.ts      # CRUD interactions
│   │   ├── world-rules.ts       # CRUD règles du monde
│   │   ├── search.ts            # search_semantic + search_fulltext
│   │   ├── backup.ts            # backup + restore
│   │   └── stats.ts             # Statistiques de la bible
│   ├── embeddings/
│   │   ├── index.ts             # Pipeline : texte → embedding → stockage
│   │   ├── model.ts             # Chargement modèle HF Transformers (singleton)
│   │   └── similarity.ts        # Cosine similarity, top-K retrieval
│   └── types/
│       └── index.ts             # Types partagés (entités, résultats search)
├── data/                        # Répertoire par défaut
│   └── .gitkeep
├── backups/                     # Répertoire par défaut pour les backups
│   └── .gitkeep
├── tests/
│   ├── tools/                   # Tests par domaine
│   ├── embeddings/              # Tests pipeline embedding
│   └── helpers/                 # Fixtures, factory, DB en mémoire
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── drizzle.config.ts
├── vitest.config.ts
├── .eslintrc.cjs
├── .prettierrc
├── CLAUDE.md
└── .specs/
```

## Modèle de données technique

### Tables principales (Drizzle schema)

```
characters
├── id          TEXT PRIMARY KEY (UUID)
├── name        TEXT NOT NULL UNIQUE
├── description TEXT         -- description physique, personnalité, background
├── traits      TEXT         -- JSON: {physical: [...], personality: [...]}
├── background  TEXT         -- histoire, origines
├── notes       TEXT         -- évolutions, remarques libres
├── created_at  INTEGER      -- timestamp unix
└── updated_at  INTEGER      -- timestamp unix

locations
├── id          TEXT PRIMARY KEY (UUID)
├── name        TEXT NOT NULL UNIQUE
├── description TEXT         -- description du lieu
├── atmosphere  TEXT         -- ambiance, sensations
├── geography   TEXT         -- position, carte, environnement
├── notes       TEXT
├── created_at  INTEGER
└── updated_at  INTEGER

events
├── id          TEXT PRIMARY KEY (UUID)
├── title       TEXT NOT NULL
├── description TEXT
├── chapter     TEXT         -- moment narratif (ex: "chapitre 3", "acte 2 scène 1")
├── sort_order  INTEGER      -- pour tri chronologique narratif
├── location_id TEXT         -- FK → locations.id (nullable)
├── characters  TEXT         -- JSON: ["uuid1", "uuid2"]
├── notes       TEXT
├── created_at  INTEGER
└── updated_at  INTEGER

interactions
├── id          TEXT PRIMARY KEY (UUID)
├── description TEXT NOT NULL
├── nature      TEXT         -- type de relation (ami, ennemi, mentor, amant...)
├── characters  TEXT NOT NULL -- JSON: ["uuid1", "uuid2"] (min 2)
├── chapter     TEXT         -- moment narratif
├── sort_order  INTEGER
├── notes       TEXT
├── created_at  INTEGER
└── updated_at  INTEGER

world_rules
├── id          TEXT PRIMARY KEY (UUID)
├── category    TEXT NOT NULL -- magie, technologie, société, religion...
├── title       TEXT NOT NULL
├── description TEXT NOT NULL
├── notes       TEXT
├── created_at  INTEGER
└── updated_at  INTEGER

research
├── id          TEXT PRIMARY KEY (UUID)
├── topic       TEXT NOT NULL
├── content     TEXT NOT NULL
├── sources     TEXT         -- JSON: ["url1", "livre1"]
├── notes       TEXT
├── created_at  INTEGER
└── updated_at  INTEGER

notes
├── id          TEXT PRIMARY KEY (UUID)
├── content     TEXT NOT NULL
├── tags        TEXT         -- JSON: ["tag1", "tag2"]
├── created_at  INTEGER
└── updated_at  INTEGER
```

### Tables FTS5 (virtual, raw SQL)

```
bible_fts (FTS5 virtual table)
├── entity_type TEXT   -- "character", "location", "event", ...
├── entity_id   TEXT   -- UUID de l'entité source
├── content     TEXT   -- Concaténation des champs textuels de l'entité
```

Synchronisée par triggers SQL sur chaque table principale (INSERT, UPDATE, DELETE).

### Table embeddings

```
embeddings
├── id          TEXT PRIMARY KEY (UUID)
├── entity_type TEXT NOT NULL
├── entity_id   TEXT NOT NULL
├── embedding   BLOB NOT NULL    -- Float32Array sérialisé (384 dimensions pour E5-small)
├── content_hash TEXT NOT NULL   -- Hash du contenu source (pour détecter si re-index nécessaire)
├── created_at  INTEGER
└── updated_at  INTEGER

UNIQUE(entity_type, entity_id)
```

## Sécurité (Security by Design)

### Authentification & Autorisation
- Non applicable. Transport stdio = accès local uniquement, par le processus parent (Cruchot/Claude Desktop).
- Pas de tokens, pas de sessions.

### Validation des entrées
- **Couche MCP** : Zod schemas sur chaque tool input. Rejet avant exécution si invalide.
- **Couche DB** : Contraintes NOT NULL, UNIQUE, FK sur le schéma SQLite.
- **Sanitization** : Les contenus textuels sont stockés tels quels (pas de HTML/script à risque dans du stdio).

### Protection des données
- **Au repos** : Fichier SQLite local. Permissions filesystem standard. Pas de chiffrement par défaut (option SQLCipher future).
- **En transit** : stdio = communication inter-process, pas de réseau. Aucun risque d'interception.
- **Backup** : Copie physique du fichier .db. Intégrité vérifiable via `PRAGMA integrity_check`.

### Surface d'attaque & Mitigations

| Point d'entrée | Menace | Mitigation |
|-----------------|--------|------------|
| Tool inputs MCP | Injection SQL via paramètres | Prepared statements (better-sqlite3 natif), Zod validation |
| Chemin fichier backup | Path traversal | Validation du chemin, restriction au répertoire backups/ |
| Modèle embedding | Supply chain (modèle malveillant) | Modèle épinglé par hash, source HuggingFace officielle |
| Fichier .db | Accès non autorisé | Permissions filesystem (0600), responsabilité OS |

## Risques architecturaux

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| @huggingface/transformers incompatible avec une future version Node.js | Faible | Moyen | Épingler la version, fallback sur API externe |
| Modèle E5-small insuffisant pour du contenu littéraire complexe | Faible | Moyen | Seuil de similarité configurable, fallback FTS5 |
| Premier lancement lent (téléchargement modèle 130MB) | Certain | Faible | Message de progression, téléchargement une seule fois |
| better-sqlite3 nécessite compilation native (node-gyp) | Moyen | Moyen | Prebuild binaries disponibles, documentation d'installation |
| Corruption du fichier .db | Très faible | Critique | WAL mode, backup réguliers, PRAGMA integrity_check |
