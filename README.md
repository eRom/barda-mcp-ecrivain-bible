# Bible d'Ecrivain MCP

Serveur MCP standalone pour gerer une **bible d'ecrivain** — une base de connaissances structuree et cherchable d'un univers narratif.

La bible centralise personnages, lieux, evenements, interactions, regles du monde, recherches et notes. Elle sert de **memoire externe** pour les auteurs, accessible par un agent IA via le protocole [MCP](https://modelcontextprotocol.io).

```
"Bob portait des lunettes a l'eglise du chateau ?"
  --> L'agent interroge la bible
  --> "Oui, Bob portait encore ses lunettes au chapitre 6.
       Il ne s'est fait operer qu'au chapitre 9."
```

## Installation

**Prerequis :** Node.js >= 20, pnpm

```bash
git clone <url>
cd barda-mcp-ecrivain-bible
pnpm install
pnpm build
```

> Au premier lancement, le modele d'embeddings (~200 MB) est telecharge automatiquement depuis HuggingFace. C'est une operation unique.

## Configuration MCP

### Claude Desktop

Ajouter dans `claude_desktop_config.json` :

```json
{
  "mcpServers": {
    "bible-ecrivain": {
      "command": "node",
      "args": ["/chemin/vers/barda-mcp-ecrivain-bible/dist/index.js"]
    }
  }
}
```

### Claude Code

Ajouter dans les settings MCP :

```json
{
  "bible-ecrivain": {
    "command": "node",
    "args": ["/chemin/vers/barda-mcp-ecrivain-bible/dist/index.js"]
  }
}
```

### Cruchot (barda)

Ajouter la definition dans la configuration barda :

```json
{
  "command": "node",
  "args": ["/chemin/vers/barda-mcp-ecrivain-bible/dist/index.js"],
  "transportType": "stdio"
}
```

### Base de donnees personnalisee

Par defaut, la bible est stockee dans `data/bible.db`. Pour utiliser un autre chemin :

```json
"args": ["/chemin/vers/dist/index.js", "--db-path", "/chemin/vers/ma-bible.db"]
```

## Fonctionnalites

| Domaine | Tools | Description |
|---------|-------|-------------|
| Personnages | 5 | Fiches completes (physique, personnalite, background) |
| Lieux | 5 | Descriptions, atmosphere, geographie |
| Evenements | 7 | Timeline narrative, chronologie, filtres avances |
| Interactions | 6 | Relations entre personnages, reseau relationnel |
| Regles du Monde | 5 | Magie, technologie, societe, religion... |
| Recherches | 5 | Notes de recherche documentaire avec sources |
| Notes | 5 | Notes libres avec tags |
| Recherche | 2 | Fulltext (FTS5) + semantique (embeddings) |
| Export / Import | 2 | Markdown structure + import JSON massif |
| Utilitaires | 5 | Backup/restore, stats, doublons, templates |
| **Total** | **47** | |

La **recherche semantique** retrouve l'information par le sens, pas juste par les mots exacts. Ideal pour les questions floues comme *"je sais plus si Bob avait des problemes de vue"*.

> Pour la documentation complete de chaque outil avec parametres et exemples, voir [documentation/mcp.md](documentation/mcp.md).

## Architecture

```
Client (Claude / Cruchot)        Bible MCP (ce serveur)
+---------------------+         +------------------------+
| LLM = intelligence  |  stdio  | Memoire structuree     |
| Analyse, comprend,  | <-----> | CRUD + Recherche       |
| decide quoi stocker |         | FTS5 + Embeddings      |
+---------------------+         | SQLite (1 fichier .db) |
                                +------------------------+
```

- **Le client** (LLM) est l'intelligence : il comprend le texte et appelle les bons outils.
- **La bible** est la memoire : elle stocke, indexe, et retrouve. Pas de LLM embarque.
- **Un seul fichier** `bible.db` = toute la bible. Backup = copier ce fichier.

## Stack technique

| Brique | Choix |
|--------|-------|
| Runtime | Node.js >= 20, TypeScript |
| MCP | @modelcontextprotocol/sdk (stdio) |
| DB | SQLite via better-sqlite3 + Drizzle ORM |
| Fulltext | SQLite FTS5 |
| Embeddings | @huggingface/transformers (Xenova/multilingual-e5-base, local) |
| Tests | vitest (61 tests) |
| Build | tsup (ESM) |

## Developpement

```bash
pnpm dev          # Lancer en mode dev (tsx)
pnpm build        # Build production
pnpm test         # Tests (61 tests)
pnpm db:generate  # Generer migrations
```

## Licence

MIT
