# Bible d'Écrivain MCP — Guide de développement

## Projet
Serveur MCP standalone (stdio) en TypeScript pour gérer une bible d'écrivain — base de connaissances structurée et cherchable (fulltext + sémantique) d'un univers narratif.

## Stack
- **Runtime** : Node.js >= 20, TypeScript 5.x (strict)
- **MCP** : @modelcontextprotocol/sdk (stdio transport)
- **DB** : better-sqlite3, drizzle-orm, FTS5
- **Embeddings** : @huggingface/transformers (ONNX, modèle Xenova/multilingual-e5-base)
- **Tests** : vitest
- **Build** : tsup (ESM)
- **Package manager** : pnpm

## Commandes
```bash
pnpm dev          # Lancer en mode dev (tsx)
pnpm build        # Build production (tsup)
pnpm test         # Tests (vitest)
pnpm db:generate  # Générer migrations (drizzle-kit)
pnpm db:migrate   # Appliquer migrations
pnpm lint         # ESLint
pnpm format       # Prettier
```

## Structure
```
src/
  index.ts          # Entry point MCP server
  server.ts         # Server setup + tool registration
  db/
    index.ts        # Connection + init
    schema.ts       # Drizzle schema
    migrations/     # SQL migrations générées
  tools/            # Un fichier par domaine (characters, locations, events...)
  embeddings/
    index.ts        # Pipeline embedding (génération + stockage + recherche)
  utils/
data/               # Répertoire par défaut pour bible.db
```

## Patterns MCP (@modelcontextprotocol/sdk)

### Création du serveur (API haut niveau — v1.28+)
- Utiliser `new McpServer({ name, version })` + `StdioServerTransport`
- Import : `import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'`
- Import : `import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'`
- Enregistrer les tools via `server.registerTool(name, { description, inputSchema }, handler)`
- inputSchema : objet Zod (le SDK convertit automatiquement en JSON Schema)
- Handler reçoit les params parsés + un objet `ctx` (logging, etc.)
- Réponses : `{ content: [{ type: "text", text: "..." }] }` — toujours un tableau de content blocks
- **IMPORTANT** : utiliser `console.error()` pour tout log (stdout réservé au protocole JSON-RPC)

### Nommage des tools
- Format snake_case : `create_character`, `search_semantic`, `get_timeline`
- Préfixe par domaine implicite (pas de namespace, le MCP est mono-domaine)
- Description en français pour l'utilisateur final

### Gestion d'erreurs
- Retourner `{ isError: true, content: [{ type: "text", text: "..." }] }` pour les erreurs métier
- Les erreurs système (crash DB) remontent via le protocole MCP natif

## Patterns SQLite (better-sqlite3)

### Connection
- Mode WAL activé : `db.pragma('journal_mode = WAL')`
- Foreign keys activés : `db.pragma('foreign_keys = ON')`
- Toujours utiliser des transactions pour les opérations multi-statements
- `db.prepare(sql).run(params)` pour les mutations, `.get()` / `.all()` pour les lectures

### FTS5
- Tables virtuelles FTS5 synchronisées via triggers INSERT/UPDATE/DELETE
- Requêtes via `MATCH` avec syntax FTS5 (préfixes, phrases, booléens)
- `highlight()` et `snippet()` pour les extraits dans les résultats
- Rebuilder l'index : `INSERT INTO fts_table(fts_table) VALUES('rebuild')`

### Pièges à éviter
- Ne JAMAIS utiliser `db.exec()` avec du SQL dynamique non assaini
- better-sqlite3 est synchrone — c'est voulu et performant, ne pas wrapper en async inutilement
- Les migrations Drizzle sont push-based : `drizzle-kit generate` puis `drizzle-kit migrate`

## Patterns Drizzle ORM

### Schéma
- Définir les tables dans `src/db/schema.ts` avec `sqliteTable()`
- Types : `text()`, `integer()`, `real()`, `blob()`
- Relations via `relations()` pour les joins type-safe
- JSON stocké en `text()` avec sérialisation manuelle (pas de type JSON natif SQLite)

### Queries
- Préférer l'API query (`db.query.characters.findMany()`) pour les lectures simples
- Utiliser l'API SQL (`db.select().from().where()`) pour les requêtes complexes
- Transactions via `db.transaction(tx => { ... })`

## Patterns Embeddings (@huggingface/transformers)

### Pipeline
- Charger le modèle une seule fois au démarrage : `pipeline('feature-extraction', 'Xenova/multilingual-e5-base')`
- Options : `{ pooling: 'mean', normalize: true }` pour obtenir des vecteurs normalisés L2
- Dimension du vecteur : 768 (e5-base) — Float32Array
- Stocker comme Float32Array sérialisé en Buffer SQLite (BLOB)
- Cosine similarity calculée en JS : `dot(a, b) / (norm(a) * norm(b))`
- Alternative : sqlite-vec (`npm install sqlite-vec`) fournit `vec_distance_cosine()` natif

### Pièges à éviter
- Le premier chargement du modèle télécharge ~200MB — gérer le cas "premier lancement"
- Le modèle est caché dans `~/.cache/huggingface` par défaut
- Préfixer les requêtes avec "query: " et les documents avec "passage: " pour les modèles E5
- Ne PAS utiliser `intfloat/multilingual-e5-large` directement (problèmes de compatibilité Transformers.js) — utiliser les versions Xenova

## Conventions de code
- ESM uniquement (`"type": "module"` dans package.json)
- Imports avec extensions `.js` (résolution TypeScript ESM)
- Pas de classes sauf pour le Server MCP — préférer fonctions et modules
- Erreurs typées avec des codes : `{ code: "CHARACTER_NOT_FOUND", message: "..." }`
- Tous les IDs sont des UUID v4 (text en SQLite)

## Règles de suppression
- Ne JAMAIS utiliser `rm`, `rmdir`, ou `unlink` pour supprimer des fichiers/dossiers
- Toujours utiliser la commande `trash` pour envoyer dans la corbeille macOS
