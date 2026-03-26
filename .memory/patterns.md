# Patterns — Bible d'Ecrivain MCP

**Derniere mise a jour** : 2026-03-26

## Nommage

- **Packages** : `@barda/mcp`, `@barda/ui` (scope @barda)
- **Tools MCP** : snake_case (`create_character`, `search_semantic`, `get_timeline_filtered`)
- **Fichiers tools** : un fichier par domaine (`characters.ts`, `locations.ts`, `search.ts`)
- **Fonctions d'enregistrement** : `registerXxxTools(server, db, dbPath?)` exportees par chaque fichier
- **Composants React** : PascalCase (`EntityForm`, `GraphView`, `SearchBar`)
- **Hooks React** : camelCase prefixe use (`useMcpQuery`, `useGraph`, `useToast`)
- **CSS** : variables CSS oklch (`var(--background)`, `var(--sidebar-accent)`)

## Architecture MCP

- **McpServer** (API haut niveau v1.28+) : `server.tool(name, description, schema, handler)`
- **Descriptions en francais** pour l'utilisateur final
- **Retour standard** : `{ content: [{ type: "text", text: JSON.stringify(result, null, 2) }] }`
- **Retour erreur** : `{ isError: true, content: [{ type: "text", text: message }] }`
- **Validation** : Zod schemas sur chaque tool input (le SDK convertit en JSON Schema)
- **IDs** : UUID v4 via `crypto.randomUUID()`
- **Timestamps** : `Date.now()` (millisecondes)

## Architecture UI

- **Data fetching** : TanStack Query exclusivement (pas de store global)
- **MCP Client** : wrapper fetch JSON-RPC dans `api/mcp-client.ts`, hooks `useMcpQuery`/`useMcpMutation`
- **Routing** : React Router v7, routes dans `App.tsx`
- **Formulaires** : composant `EntityForm` generique (mode lecture/edition/creation)
- **Listes** : composant `EntityList` generique avec pagination
- **Graph** : Sigma.js WebGL + graphology, ForceAtlas2 via worker, `entityType` (pas `type` — reserve par Sigma)
- **Design system** : CSS custom properties oklch (Cruchot), dark mode par defaut
- **Badges entites** : pattern "10% opacity bg + colored text" (`bg-blue-500/10 text-blue-400`)

## HTTP Transport

- Express sur 127.0.0.1 uniquement
- POST /mcp : routeur JSON-RPC maison (pas le transport SDK, appel direct des handlers)
- GET /* : express.static pour l'UI, SPA fallback `/{*path}` (Express 5 syntax)
- Acces aux tools internes via `mcpServer._registeredTools` (TypeScript private, accessible runtime)

## Tests

- **Framework** : vitest pour MCP et UI
- **MCP** : DB en memoire (`:memory:`), schema + FTS init, 16 fichiers / 61 tests
- **UI** : jsdom + @testing-library/react, mock fetch pour MCP client, 5 fichiers / 29 tests
- **Embeddings** : mock dans les tests (vecteurs deterministes, pas de modele reel)
- **Backup** : tmpdir avec fichier DB reel (pas :memory:)

## Conventions de commit

- Messages en anglais, descriptifs
- Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
- Un commit par fix/feature logique
