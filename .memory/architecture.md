# Architecture — Bible d'Ecrivain MCP

**Derniere mise a jour** : 2026-03-26

## Vue d'ensemble

Serveur MCP standalone (stdio + HTTP) en TypeScript pour gerer une bible d'ecrivain. Deux interfaces : outils MCP pour agents IA, et UI web React pour l'humain. Monorepo pnpm workspaces.

## Stack

- Runtime : Node.js >= 20, TypeScript 5.x (strict)
- MCP : @modelcontextprotocol/sdk (stdio + HTTP via Express)
- DB : SQLite (better-sqlite3, drizzle-orm, FTS5)
- Embeddings : @huggingface/transformers (Xenova/multilingual-e5-base, ONNX local)
- UI : React 19, Vite, Tailwind CSS 4, TanStack Query, React Router, Sigma.js + graphology
- Tests : vitest (90 tests : 61 MCP + 29 UI)

## Arborescence

```
barda-mcp-ecrivain-bible/
  packages/
    mcp/                    # Serveur MCP (package: @barda/mcp)
      src/
        index.ts            # Entry point (stdio ou HTTP selon --ui)
        server.ts           # McpServer setup + registerAllTools
        http.ts             # Express : POST /mcp (JSON-RPC) + GET /* (UI statique)
        db/                 # schema.ts (Drizzle), index.ts (getDb), fts.ts (FTS5 triggers)
        tools/              # 14 fichiers, ~47 tools MCP (CRUD x7, search, backup, stats, export, import, duplicates, templates)
        embeddings/         # model.ts (singleton HF), index.ts (generate/index/remove), similarity.ts (cosine/topK)
      tests/                # 16 fichiers, 61 tests
      scripts/              # seed-matrix.ts (donnees de test Matrix)
      data/                 # bible.db (gitignore)
      public/               # Build UI copie ici pour prod (gitignore)
    ui/                     # Interface web React (package: @barda/ui)
      src/
        api/mcp-client.ts   # Wrapper fetch JSON-RPC
        hooks/              # useMcp, useGraph, useToast, useTheme
        components/
          layout/           # Sidebar (Lucide icons), Header, Layout
          entities/         # EntityList, EntityForm, EntityCard
          graph/            # GraphView (Sigma.js), GraphControls, GraphLayout, GraphEvents, GraphLegend, NodeDetail
          search/           # SearchBar, SearchResults
          common/           # ConfirmDialog, EntityLink, TemplateSelector, Toaster
          timeline/         # TimelineView
        pages/              # 20+ pages (Dashboard, *Detail, Graph, Search, Timeline, Backups, ImportExport)
      src/styles/globals.css # Design system Cruchot (oklch CSS vars)
  .specs/                   # Specs (mvp/ + ui-web/)
  documentation/            # mcp.md (ref 47 tools), system-prompt.md
  CLAUDE.md                 # Best practices stack
```

## Flux de donnees

```
UI React (navigateur)
  |-- fetch POST /mcp (JSON-RPC) --> Express (http.ts)
  |                                     |-- route tools/list --> liste des tools
  |                                     |-- route tools/call --> execute le tool handler
  |                                                                 |-- Drizzle ORM --> SQLite (bible.db)
  |                                                                 |-- FTS5 (triggers auto)
  |                                                                 |-- Embeddings (HF Transformers)
  |-- GET /* --> fichiers statiques (public/)

Agent IA (Cruchot/Claude Desktop)
  |-- stdio JSON-RPC --> McpServer --> memes tools
```

## Dependances externes critiques

- `better-sqlite3` : binding natif, necessite compilation (node-gyp/prebuild)
- `@huggingface/transformers` : modele ONNX ~200MB telecharge au premier lancement
- `sigma` + `graphology` : graph WebGL, ~300KB gzip
- `express` : serveur HTTP (mode --ui uniquement)
