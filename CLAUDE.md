# Bible d'Écrivain MCP — Guide de développement

## Projet
Serveur MCP standalone en TypeScript pour gerer une bible d'ecrivain — base de connaissances structuree et cherchable (fulltext + semantique) d'un univers narratif. Deux interfaces : MCP stdio pour les agents IA, et UI web pour l'humain.

## Stack
- **Runtime** : Node.js >= 20, TypeScript 5.x (strict)
- **MCP** : @modelcontextprotocol/sdk (stdio + HTTP transport)
- **DB** : better-sqlite3, drizzle-orm, FTS5
- **Embeddings** : @huggingface/transformers (ONNX, modele Xenova/multilingual-e5-base)
- **UI** : React 19, Vite, Tailwind CSS 4, TanStack Query, React Router, @react-sigma/core (Sigma.js + graphology)
- **Tests** : vitest
- **Build** : tsup (MCP), Vite (UI)
- **Package manager** : pnpm (workspaces)

## Commandes
```bash
# Depuis la racine (monorepo)
pnpm build                    # Build mcp + ui
pnpm test                     # Tests mcp + ui
pnpm --filter mcp dev         # MCP mode stdio (dev)
pnpm --filter mcp dev -- --ui # MCP mode HTTP + UI (dev)
pnpm --filter ui dev          # UI Vite dev server (avec proxy vers MCP)

# Depuis packages/mcp/
pnpm build        # Build production (tsup)
pnpm test         # Tests MCP (vitest)
pnpm db:generate  # Generer migrations (drizzle-kit)

# Depuis packages/ui/
pnpm dev          # Vite dev server
pnpm build        # Build production (copie dans packages/mcp/public/)
pnpm test         # Tests UI (vitest + testing-library)
```

## Structure (monorepo)
```
packages/
  mcp/                        # Serveur MCP
    src/
      index.ts                # Entry point (stdio + HTTP modes)
      server.ts               # McpServer setup + tool registration
      http.ts                 # Serveur HTTP : routes MCP + static UI
      db/                     # Schema, connexion, FTS, migrations
      tools/                  # Un fichier par domaine (47 tools)
      embeddings/             # Pipeline embedding
    tests/
    public/                   # Build UI copie ici pour prod
    data/                     # bible.db par defaut
    backups/
  ui/                         # Interface web React
    src/
      main.tsx                # Entry point React
      App.tsx                 # Router principal
      api/mcp-client.ts       # Wrapper fetch JSON-RPC
      hooks/                  # useMcp, useGraph, useToast...
      components/
        layout/               # Sidebar, Header
        entities/              # EntityList, EntityForm, EntityCard
        graph/                 # GraphView (@react-sigma/core (Sigma.js + graphology))
        timeline/              # TimelineView
        search/                # SearchBar, SearchResults
        common/                # Boutons, modals, toasts
      pages/                  # Dashboard, Characters, Graph, Search...
      types/                  # Character, Location, Event...
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

## Patterns UI (React + Vite + Tailwind)

### MCP Client cote navigateur
- Wrapper fetch maison dans `api/mcp-client.ts` — PAS le SDK MCP complet
- Format : POST /mcp avec body JSON-RPC `{jsonrpc:"2.0", id:N, method:"tools/call", params:{name, arguments}}`
- Parser `result.content[0].text` (JSON.parse) pour extraire les donnees

### Data fetching (TanStack Query)
- `useMcpQuery(toolName, params)` pour les lectures (cache automatique)
- `useMcpMutation(toolName, invalidateKeys)` pour les ecritures (invalidation du cache)
- Pas de store global (Redux/Zustand) — React Query est le state manager

### Graph (@react-sigma/core + graphology)
- Sigma.js = WebGL, 60+ FPS meme avec 500+ noeuds
- graphology pour le modele de donnees du graph (type-safe)
- Layout : Force-Atlas 2 (via graphology-layout-forceatlas2) — meilleur clustering que d3-force
- Noeuds colores par type : character=#3B82F6, location=#10B981, event=#F59E0B, interaction=#8B5CF6, world_rule=#EC4899
- Edges : interactions -> lien entre personnages, events -> lien event-personnage/lieu
- Le hook `useGraph` construit un graphology Graph a partir des appels MCP

### Composants
- `EntityList` : generique pour tous les types d'entites (liste + pagination + bouton creer)
- `EntityForm` : generique pour edition/creation (mode lecture par defaut, toggle edition)
- `EntityLink` : nom d'entite cliquable qui navigue vers sa fiche (wiki-style)
- `SearchBar` : debounce 300ms, toujours visible dans le header

### Pieges a eviter
- Ne JAMAIS utiliser `dangerouslySetInnerHTML` (les fiches contiennent du texte libre)
- Le proxy Vite `/mcp -> http://localhost:3000/mcp` est pour le dev uniquement. En prod, meme serveur.
- Sigma.js renderer doit etre kill() au unmount (fuite memoire WebGL sinon)
- React Query : utiliser `staleTime` pour eviter des re-fetches excessifs

## Conventions de code
- ESM uniquement (`"type": "module"` dans package.json)
- Imports avec extensions `.js` (resolution TypeScript ESM) — cote MCP uniquement
- Cote UI : imports sans extension (Vite gere la resolution)
- Pas de classes sauf pour le Server MCP — preferer fonctions et modules
- Erreurs typees avec des codes : `{ code: "CHARACTER_NOT_FOUND", message: "..." }`
- Tous les IDs sont des UUID v4 (text en SQLite)

## Regles de suppression
- Ne JAMAIS utiliser `rm`, `rmdir`, ou `unlink` pour supprimer des fichiers/dossiers
- Toujours utiliser la commande `trash` pour envoyer dans la corbeille macOS
