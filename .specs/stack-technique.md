# Stack Technique — Bible d'Écrivain MCP

**Date** : 2026-03-25
**Statut** : Décidé
**Contexte** : .specs/mvp/brainstorming.md

## Résumé du besoin
Serveur MCP standalone en TypeScript exposant des outils CRUD et de recherche (fulltext + sémantique) sur une base SQLite unique contenant les données d'un univers narratif.

## Stacks considérées

| Stack | Priorise | Coûte | Apprentissage |
|-------|----------|-------|---------------|
| TypeScript + better-sqlite3 + MCP SDK | Cohérence Cruchot, typage, écosystème MCP natif | Compilation TS, gestion extensions native | Faible (écosystème connu) |
| Python + sqlite3 + mcp-python | Simplicité embedding (PyTorch natif), libs ML matures | Incohérent avec Cruchot, packaging plus complexe | Moyen (nouveau runtime) |
| Rust + rusqlite + custom MCP | Performance brute, binaire unique | Temps de développement 3x+, écosystème MCP immature | Élevé |

## Stack retenue
**TypeScript + better-sqlite3 + MCP SDK**

Cohérence avec l'écosystème Cruchot (TypeScript natif), SDK MCP officiel et mature, typage fort sur les schémas de données. La performance de SQLite est largement suffisante pour le corpus visé (centaines à milliers de fiches).

## Choix techniques concrets

### Runtime & Langage
| Brique | Choix | Alternative |
|--------|-------|-------------|
| Langage | TypeScript 5.x (strict mode) | — |
| Runtime | Node.js >= 20 LTS | — |
| Runner (dev) | tsx | ts-node |
| Build | tsup (bundle ESM) | esbuild direct |

### Serveur MCP
| Brique | Choix | Alternative |
|--------|-------|-------------|
| SDK | @modelcontextprotocol/sdk | Implémentation custom stdio |
| Transport | stdio | HTTP/SSE (non nécessaire, local) |
| Validation | zod (intégré au SDK) | — |

### Base de données
| Brique | Choix | Alternative |
|--------|-------|-------------|
| Binding SQLite | better-sqlite3 | @libsql/client |
| ORM | drizzle-orm (+ drizzle-kit) | kysely, knex |
| Fulltext | SQLite FTS5 (natif) | — |
| Migrations | drizzle-kit (generate + migrate) | — |

### Recherche sémantique
| Brique | Choix | Alternative |
|--------|-------|-------------|
| Embeddings locaux | @huggingface/transformers (ONNX) | fastembed, API externe |
| Modèle | multilingual-e5-small (~130MB) | all-MiniLM-L6-v2 (anglais) |
| Stockage vecteurs | SQLite (table dédiée, BLOB) | sqlite-vec extension |
| Similarité | Cosine similarity en JS (in-memory) | sqlite-vec KNN |

**Note :** Le choix de stocker les embeddings en SQLite et calculer la similarité en JS est volontaire — pour un corpus < 10 000 fiches, c'est instantané et ça évite la dépendance à sqlite-vec (encore jeune). Migration vers sqlite-vec possible si besoin.

### Tests & Qualité
| Brique | Choix | Alternative |
|--------|-------|-------------|
| Tests | vitest | jest |
| Lint | eslint + @typescript-eslint | biome |
| Format | prettier | biome |

### Packaging & Distribution
| Brique | Choix | Alternative |
|--------|-------|-------------|
| Package manager | pnpm | npm, yarn |
| Distribution | npm package | binaire standalone (pkg) |
| Config MCP | Fichier JSON barda Cruchot | .mcp.json standard |

## Tooling concret

| Outil | Rôle | Installation |
|-------|------|-------------|
| pnpm | Package manager | npm install -g pnpm |
| tsx | Runner TypeScript (dev) | pnpm add -D tsx |
| tsup | Bundler pour build prod | pnpm add -D tsup |
| drizzle-kit | Génération et exécution migrations | pnpm add -D drizzle-kit |
| vitest | Framework de test | pnpm add -D vitest |
| eslint | Linter | pnpm add -D eslint |
| prettier | Formateur | pnpm add -D prettier |

## Dépendances runtime

| Package | Version | Rôle |
|---------|---------|------|
| @modelcontextprotocol/sdk | ^1.x | SDK serveur MCP |
| better-sqlite3 | ^11.x | Binding SQLite natif |
| drizzle-orm | ^0.39.x | ORM TypeScript |
| zod | ^3.x | Validation schémas (tools MCP) |
| @huggingface/transformers | ^3.x | Embeddings locaux ONNX |

## Ce qu'on ne fait PAS avec cette stack
- Pas de serveur HTTP/API REST — tout passe par MCP stdio
- Pas de frontend — l'UI est fournie par Cruchot (barda)
- Pas d'ORM lourd (TypeORM, Prisma) — Drizzle est léger et SQL-first
- Pas de vector DB externe (Qdrant, Chroma, Pinecone) — SQLite + JS suffit
- Pas d'API d'embedding externe — tout est local, sans clé API
- Pas de Docker/containerisation — c'est un outil local
