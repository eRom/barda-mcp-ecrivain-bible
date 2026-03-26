# Architecture Technique — ui-web

**Date** : 2026-03-26
**Statut** : Decide
**Contexte** : brainstorming.md, architecture-fonctionnelle.md, stack-technique.md

## Probleme architectural
Ajouter une interface web a un serveur MCP qui ne parle que stdio. L'UI doit etre cliente MCP (ISO perimetre), afficher un graph interactif de l'univers narratif, et etre distribuee via un simple `npx`. Le tout dans un monorepo avec le MCP existant.

## Flux principal

```
Navigateur (React SPA)
    |
    | HTTP (localhost:3000)
    |
    v
+----------------------------------+
|  Node.js Server (unique process) |
|                                  |
|  [Express/HTTP]                  |
|    |-- GET /*  --> UI statique   |
|    |-- POST /mcp --> MCP handler |
|    |-- GET /mcp/sse --> SSE      |
|                                  |
|  [MCP Server]                    |
|    |-- 47 tools (existants)      |
|    |-- StreamableHTTPTransport   |
|                                  |
|  [SQLite] bible.db               |
+----------------------------------+
```

L'UI et le MCP sont servis par le **meme process Node.js** sur le meme port. Pas de CORS, pas de proxy, pas de process supplementaire.

## Decisions architecturales

### Decision 1 : Monorepo pnpm workspaces
**Probleme** : Comment organiser le code MCP existant + la nouvelle UI ?
**Options** :
  - Option A : Monorepo pnpm workspaces (`packages/mcp/` + `packages/ui/`) --> un seul repo, types partages, CI unique
  - Option B : Repos separes --> independance, mais synchro types penible
  - Option C : UI dans le meme package --> simple mais melange des concerns
**Choix** : Option A — Monorepo
**Raison** : Types partages, atomic commits, un seul CI. pnpm workspaces est trivial a configurer.

### Decision 2 : Transport HTTP pour le MCP
**Probleme** : L'UI web ne peut pas parler stdio. Comment communiquer avec le MCP ?
**Options** :
  - Option A : Ajouter StreamableHTTPServerTransport au MCP SDK --> transport natif, standard
  - Option B : Bridge WebSocket custom --> plus de controle, mais reimplemente le protocole
  - Option C : API REST wrapper devant le MCP --> decouplage, mais perd l'ISO MCP
**Choix** : Option A — StreamableHTTPServerTransport
**Raison** : Le SDK MCP le supporte nativement. L'UI reste cliente MCP, pas d'une API custom. ISO parfait avec les tools existants.

### Decision 3 : Serveur HTTP unique pour UI + MCP
**Probleme** : Comment servir l'UI statique et l'endpoint MCP HTTP ?
**Options** :
  - Option A : Un seul serveur HTTP Node (Express ou http natif) qui route `/mcp` vers le transport MCP et `/*` vers les fichiers statiques --> un process, un port
  - Option B : Deux serveurs (Vite dev pour l'UI + MCP HTTP) --> plus complexe en prod, CORS
**Choix** : Option A — Serveur unique
**Raison** : Un process, un port, zero CORS. En dev, Vite proxy vers le MCP. En prod, le serveur sert le bundle statique.

### Decision 4 : Stack frontend
**Probleme** : Quel framework pour l'UI ?
**Options** :
  - Option A : React + Vite + Tailwind CSS --> ecosysteme massif, composants riches, libs graph matures
  - Option B : Svelte + Vite + Tailwind --> plus leger, moins de boilerplate, mais moins de libs graph
  - Option C : Vue + Vite + Tailwind --> bon compromis, mais Romain/Cruchot sont en React
**Choix** : Option A — React + Vite + Tailwind
**Raison** : Ecosysteme le plus riche pour les libs de visualisation (graph, timeline). Coherence avec l'univers Cruchot.

### Decision 5 : Librairie de graph
**Probleme** : Quelle lib pour le graph force-directed interactif ?
**Options** :
  - Option A : react-force-graph (wrapper Three.js/d3) --> 3D optionnel, performant, API simple
  - Option B : @react-sigma/core (Sigma.js) + react wrapper --> mature, extensible, beaucoup de layouts
  - Option C : d3-force direct --> controle total mais integration React penible
  - Option D : @react-sigma/core (graphology + sigma.js) --> WebGL, tres performant pour gros graphs
**Choix** : Option B — @react-sigma/core (Sigma.js)
**Raison** : Le plus mature pour des graphs de connaissance. Layouts multiples (force, dagre, circle), styling avance, evenements clic/hover, filtrage, zoom/pan natifs. API declarative. Performant jusqu'a ~5000 noeuds. Bien documente.

### Decision 6 : Client MCP cote UI
**Probleme** : Comment l'UI appelle les tools MCP ?
**Options** :
  - Option A : Wrapper fetch maison qui envoie des JSON-RPC au endpoint `/mcp` --> simple, zero dependance
  - Option B : MCP SDK Client cote navigateur --> plus correct protocolairement, mais lourd pour un browser
**Choix** : Option A — Wrapper fetch maison
**Raison** : Le protocole MCP est du JSON-RPC simple. Un wrapper de ~50 lignes suffit. Pas besoin d'embarquer le SDK complet cote navigateur.

### Decision 7 : Mode de lancement
**Probleme** : Comment l'auteur lance l'application ?
**Options** :
  - Option A : `npx barda-ecrivain-bible` --> installe, lance le serveur HTTP+MCP, ouvre le navigateur
  - Option B : `npx barda-ecrivain-bible` lance seulement le serveur, l'auteur ouvre manuellement le navigateur
**Choix** : Option A avec fallback B
**Raison** : `open` (macOS) / `xdg-open` (Linux) / `start` (Windows) pour ouvrir le navigateur automatiquement. Si ca echoue, affiche l'URL dans le terminal.

## Structure du projet

```
barda-mcp-ecrivain-bible/
|-- packages/
|   |-- mcp/                          # Code MCP existant (deplace)
|   |   |-- src/
|   |   |   |-- index.ts              # Entry point (stdio + HTTP modes)
|   |   |   |-- server.ts             # McpServer creation
|   |   |   |-- http.ts               # [NEW] Serveur HTTP : routes MCP + static UI
|   |   |   |-- db/                   # Schema, connexion, FTS, migrations
|   |   |   |-- tools/                # 47 tools existants
|   |   |   |-- embeddings/           # Pipeline embeddings
|   |   |   +-- types/
|   |   |-- tests/
|   |   |-- data/
|   |   |-- backups/
|   |   |-- public/                   # [NEW] Build UI copie ici pour prod
|   |   |-- package.json
|   |   |-- tsconfig.json
|   |   +-- tsup.config.ts
|   |
|   +-- ui/                           # [NEW] Interface web React
|       |-- src/
|       |   |-- main.tsx              # Entry point React
|       |   |-- App.tsx               # Router principal
|       |   |-- api/
|       |   |   +-- mcp-client.ts     # Wrapper fetch JSON-RPC
|       |   |-- components/
|       |   |   |-- layout/           # Sidebar, header, navigation
|       |   |   |-- entities/         # Listes, fiches, formulaires
|       |   |   |-- graph/            # Graph cytoscape
|       |   |   |-- timeline/         # Timeline visuelle
|       |   |   |-- search/           # Barre de recherche, resultats
|       |   |   +-- common/           # Boutons, modals, toasts
|       |   |-- pages/
|       |   |   |-- Dashboard.tsx     # Stats + acces rapide
|       |   |   |-- Characters.tsx    # Liste + detail personnages
|       |   |   |-- Locations.tsx     # Liste + detail lieux
|       |   |   |-- Events.tsx        # Liste + timeline
|       |   |   |-- Interactions.tsx  # Liste interactions
|       |   |   |-- WorldRules.tsx    # Liste regles
|       |   |   |-- Research.tsx      # Liste recherches
|       |   |   |-- Notes.tsx         # Liste notes
|       |   |   |-- Graph.tsx         # Vue graph full-page
|       |   |   |-- Search.tsx        # Page recherche
|       |   |   +-- Backups.tsx       # Gestion backups
|       |   |-- hooks/
|       |   |   |-- useMcp.ts         # Hook appel MCP generique
|       |   |   |-- useEntities.ts    # Hook CRUD entites
|       |   |   +-- useGraph.ts       # Hook donnees graph
|       |   |-- types/
|       |   |   +-- index.ts          # Types entites (partages avec MCP)
|       |   +-- styles/
|       |       +-- globals.css       # Tailwind + customs
|       |-- index.html
|       |-- package.json
|       |-- vite.config.ts
|       |-- tailwind.config.ts
|       +-- tsconfig.json
|
|-- package.json                      # Workspace root
|-- pnpm-workspace.yaml
|-- CLAUDE.md
|-- README.md
|-- documentation/
+-- .specs/
```

## Securite (Security by Design)

### Authentification & Autorisation
- Non applicable (mono-utilisateur local).
- Le serveur HTTP ecoute **uniquement sur 127.0.0.1** — jamais sur 0.0.0.0.

### Validation des entrees
- **Couche MCP** : Zod schemas sur chaque tool input (existant, inchange).
- **Couche UI** : Validation cote client avant envoi (UX), mais la validation MCP fait autorite.
- **Sanitization XSS** : Les champs texte libres (description, notes, background) sont affiches via React JSX (auto-escaped). Pas de `dangerouslySetInnerHTML`.

### Protection des donnees
- Meme modele que le MCP : fichier local, pas de chiffrement.
- Le bundle UI statique ne contient aucune donnee de la bible.

### Surface d'attaque & Mitigations

| Point d'entree | Menace | Mitigation |
|-----------------|--------|------------|
| Port HTTP local | Acces depuis un autre appareil du reseau | Bind 127.0.0.1 uniquement |
| Endpoint /mcp | Requetes malformees | Validation JSON-RPC + Zod (MCP) |
| UI (champs texte) | XSS via contenu de la bible | React auto-escape, pas de dangerouslySetInnerHTML |
| Bundle statique | Injection de code | Servi depuis le filesystem local, pas de CDN |

## Risques architecturaux

| Risque | Probabilite | Impact | Mitigation |
|--------|-------------|--------|------------|
| StreamableHTTPServerTransport immature | Moyen | Eleve | Fallback : SSEServerTransport ou wrapper HTTP custom |
| Perf graph > 500 noeuds | Faible | Moyen | Cytoscape.js gere bien 5000+ noeuds. Pagination si necessaire |
| Monorepo restructuration casse les imports | Certain | Faible | Fait en premiere tache, avant tout le reste |
| Bundle UI trop gros pour npx | Moyen | Faible | Vite tree-shaking + compression. Cytoscape ~300KB gzip |
| CORS entre Vite dev server et MCP | Certain (en dev) | Faible | Vite proxy config |
