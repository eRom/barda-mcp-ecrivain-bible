# Fichiers cles — Bible d'Ecrivain MCP

**Derniere mise a jour** : 2026-03-26

## Config racine

| Fichier | Role |
|---------|------|
| `package.json` | Workspace root, scripts dev/build/test |
| `pnpm-workspace.yaml` | Declare packages/* |
| `CLAUDE.md` | Best practices stack pour les agents |
| `.gitignore` | Exclut node_modules, dist, data/*.db, backups/*.db, packages/mcp/public/ |

## MCP — Core (packages/mcp/)

| Fichier | Role |
|---------|------|
| `src/index.ts` | Entry point : parse --ui/--port/--db-path, lance stdio ou HTTP |
| `src/server.ts` | Cree McpServer, appelle registerAllTools |
| `src/http.ts` | Express : POST /mcp (JSON-RPC router), GET /* (UI statique), CORS, auto-open browser |
| `src/db/schema.ts` | Schema Drizzle : 8 tables (characters, locations, events, interactions, world_rules, research, notes, embeddings) |
| `src/db/index.ts` | getDb(path) : ouvre SQLite, WAL, FK, init FTS, retourne {sqlite, db} |
| `src/db/fts.ts` | initFts() : CREATE VIRTUAL TABLE bible_fts + triggers INSERT/UPDATE/DELETE pour 7 tables |
| `src/tools/index.ts` | registerAllTools() : importe et enregistre les 14 modules de tools + tool ping |
| `src/tools/characters.ts` | 5 tools CRUD personnages (create/get/update/delete/list) |
| `src/tools/locations.ts` | 5 tools CRUD lieux |
| `src/tools/events.ts` | 7 tools CRUD evenements + get_timeline + get_timeline_filtered |
| `src/tools/interactions.ts` | 6 tools CRUD interactions + get_character_relations |
| `src/tools/world-rules.ts` | 5 tools CRUD regles du monde |
| `src/tools/research.ts` | 5 tools CRUD recherches |
| `src/tools/notes.ts` | 5 tools CRUD notes (filtrage par tag) |
| `src/tools/search.ts` | search_fulltext (FTS5) + search_semantic (embeddings) |
| `src/tools/backup.ts` | backup_bible, restore_bible, list_backups |
| `src/tools/stats.ts` | get_bible_stats |
| `src/tools/export.ts` | export_bible (Markdown) |
| `src/tools/import.ts` | import_bulk (JSON, transaction, skip/update) |
| `src/tools/duplicates.ts` | detect_duplicates (cosine similarity) |
| `src/tools/templates.ts` | list_templates, get_template (5 genres x 3 types) |
| `src/embeddings/model.ts` | Singleton pipeline HF Transformers (Xenova/multilingual-e5-base) |
| `src/embeddings/index.ts` | generateEmbedding, indexEntity, removeEntityEmbedding |
| `src/embeddings/similarity.ts` | cosineSimilarity, topK |
| `scripts/seed-matrix.ts` | Script de seed : 73 entites univers Matrix |

## UI — Web (packages/ui/)

| Fichier | Role |
|---------|------|
| `src/api/mcp-client.ts` | callTool(name, params) : fetch POST /mcp JSON-RPC, parse result |
| `src/hooks/useMcp.ts` | useMcpQuery (TanStack Query wrapper), useMcpMutation (+ invalidation) |
| `src/hooks/useGraph.ts` | Charge 4 listes MCP, construit graphology Graph (noeuds + edges), extractArray helper |
| `src/hooks/useToast.ts` | toast.success/error, useSyncExternalStore |
| `src/hooks/useTheme.ts` | Dark/light toggle, localStorage, default dark |
| `src/components/layout/Sidebar.tsx` | Lucide icons, 3 sections (entites / outils / admin), collapsible |
| `src/components/layout/Header.tsx` | h-38px, SearchBar integree, theme toggle |
| `src/components/graph/GraphView.tsx` | SigmaContainer + GraphLoader + GraphHighlighter (dim non-connected) |
| `src/components/graph/NodeDetail.tsx` | Panneau lateral au clic noeud (description, connexions, lien fiche) |
| `src/components/entities/EntityForm.tsx` | Formulaire generique CRUD (lecture/edition/creation) |
| `src/components/entities/EntityList.tsx` | Liste generique avec pagination |
| `src/styles/globals.css` | Design system Cruchot : CSS vars oklch, scrollbar custom, dark mode |
| `src/types/index.ts` | Interfaces Character, Location, Event, Interaction, WorldRule, Research, Note, BibleStats |

## Documentation

| Fichier | Role |
|---------|------|
| `documentation/mcp.md` | Reference complete des 47 tools MCP avec parametres et exemples |
| `documentation/system-prompt.md` | Prompt systeme pour l'agent IA (coach ecriture + archiviste bible) |
| `README.md` | Presentation, installation, configuration MCP |
