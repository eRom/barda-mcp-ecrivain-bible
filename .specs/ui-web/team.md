# Team Orchestration — ui-web

**Date** : 2026-03-26
**Team name** : `bible-ui`
**Agents** : 7
**Vagues** : 4
**Mode** : Agent Team (TeamCreate + TaskCreate + Agent) + cmux split-pane

## Prerequis

- [ ] Monorepo fonctionnel (apres Vague 1)
- [ ] `pnpm --filter mcp test` passe (61 tests existants)
- [ ] `pnpm --filter mcp build` compile

## Lancement

```
Execute le fichier .specs/ui-web/team.md
```

---

## Etape 0 — Initialisation de la Team

### 0.1 Creer la team

```tool
TeamCreate({
  team_name: "bible-ui",
  description: "Bible d'Ecrivain — UI web : SPA React + MCP HTTP, graph interactif, fiches editables, timeline, recherche."
})
```

### 0.2 Creer toutes les taches (TaskCreate)

| Task | Subject | Blocked by |
|------|---------|------------|
| T01 | Restructuration monorepo | — |
| T02 | Transport HTTP pour MCP | T01 |
| T03 | Scaffolding UI (Vite+React+Tailwind) | T01 |
| T04 | MCP Client Layer (fetch JSON-RPC + hooks) | T03 |
| T05 | Layout et Navigation | T03 |
| T06 | Dashboard | T04, T05 |
| T07 | Listes d'entites | T04, T05 |
| T08 | Fiches editables | T07 |
| T09 | Recherche fulltext UI | T04, T05 |
| T10 | Graph interactif (@react-sigma/core (Sigma.js + graphology)) | T04 |
| T11 | Tests UI | T08, T10 |
| T12 | Timeline visuelle | T11 |
| T13 | Recherche semantique UI | T11 |
| T14 | Backup/Restore UI | T11 |
| T15 | Wiki-style navigation | T08 |
| T16 | Toasts/Notifications | T11 |
| T17 | Dark mode | T16 |
| T18 | Import/Export UI | T16 |
| T19 | Templates UI | T16 |
| T20 | Config npx barda | T11 |

---

## Vague 1 — Fondations (1 agent)

```tool
Agent({
  name: "fondations",
  team_name: "bible-ui",
  mode: "auto",
  prompt: "
Tu es l'agent 'fondations' de la team 'bible-ui'.

Lis : CLAUDE.md, .specs/ui-web/tasks.md, .specs/ui-web/architecture-technique.md

Tu es owner de T01 et T02. Execute sequentiellement.

**T01 — Restructuration monorepo**
1. Cree pnpm-workspace.yaml : packages: ['packages/*']
2. Cree packages/mcp/ et packages/ui/
3. Deplace TOUT le code existant (src/, tests/, data/, backups/, package.json, tsconfig.json, tsup.config.ts, drizzle.config.ts, vitest.config.ts, .eslintrc.cjs, .prettierrc) dans packages/mcp/
4. Cree un package.json racine avec scripts workspace (build, test, dev)
5. Ajuste les chemins dans packages/mcp/ (tsconfig paths, drizzle config, etc.)
6. Verifie : pnpm install && pnpm --filter mcp build && pnpm --filter mcp test (61 tests doivent passer)

**T02 — Transport HTTP pour MCP**
1. Installe express dans packages/mcp/
2. Cree packages/mcp/src/http.ts :
   - Fonction startHttpServer(mcpServer, dbPath, options: {port, uiDir?})
   - Express app sur 127.0.0.1
   - POST /mcp : recoit JSON-RPC, appelle mcpServer via in-process (pas de transport, appel direct des handlers)
   - GET /* : sert les fichiers statiques depuis uiDir (si fourni)
   - Affiche URL dans le terminal
   - Tente open navigateur (child_process.exec open/xdg-open/start)
3. Modifie packages/mcp/src/index.ts :
   - --ui flag : lance startHttpServer au lieu de StdioServerTransport
   - --port optionnel (defaut 3000)
   - Sans --ui : comportement stdio inchange
4. Verifie : node packages/mcp/dist/index.js --ui demarre, curl -X POST http://localhost:3000/mcp avec tools/list retourne les 47 tools

IMPORTANT : Le JSON-RPC MCP est simple. Le POST /mcp recoit un body JSON-RPC, tu peux utiliser server.server (le low-level Server) avec handleRequest ou simplement router manuellement vers les tool handlers. Recherche la bonne approche dans le SDK.
"
})
```

---

## Vague 2 — UI Core + Features (3 agents paralleles)

### Layout cmux — 3 panes

```bash
cmux new-split right --pane [current]
cmux new-split down --pane [right-pane]
```

```
+-------------------+-------------------+
|                   | ui-graph          |
| ui-core           +-------------------+
|                   | ui-search         |
+-------------------+-------------------+
```

### Spawn 3 agents

**ui-core** (pane gauche — colonne vertebrale de l'UI) :
```tool
Agent({
  name: "ui-core",
  team_name: "bible-ui",
  mode: "auto",
  prompt: "
Tu es l'agent 'ui-core'. Tu construis la colonne vertebrale de l'UI.

Lis : CLAUDE.md, .specs/ui-web/tasks.md, .specs/ui-web/architecture-technique.md
Lis aussi packages/mcp/src/tools/index.ts pour comprendre les tools disponibles.

Tu es owner de T03, T04, T05, T06, T07, T08. Execute sequentiellement.

T03 — Scaffolding UI : Vite + React 19 + TypeScript + Tailwind CSS 4 + React Router + TanStack Query.
  vite.config.ts : proxy /mcp vers http://localhost:3000
  Build script : copie dist/ vers packages/mcp/public/

T04 — MCP Client : packages/ui/src/api/mcp-client.ts
  callTool(name, params) : POST /mcp, body JSON-RPC {jsonrpc:'2.0', id:N, method:'tools/call', params:{name, arguments}}, parse result.content[0].text
  hooks/useMcp.ts : useMcpQuery(tool, params, queryKey) + useMcpMutation(tool, invalidateKeys)
  types/index.ts : types Character, Location, Event, Interaction, WorldRule, Research, Note

T05 — Layout : Sidebar (liens toutes sections, icones), Header (titre bible + search bar), Layout wrapper.
  React Router avec toutes les routes (pages placeholder).

T06 — Dashboard : appelle get_bible_stats, affiche compteurs en cards, boutons rapides.

T07 — Listes : composant EntityList generique. Pages Characters, Locations, Events, Interactions, WorldRules, Research, Notes utilisant EntityList. Bouton creer. Clic -> detail.

T08 — Fiches : composant EntityForm generique (mode lecture/edition). Pages *Detail pour chaque type. Create/update/delete via mutations MCP. Selecteurs personnages/lieux pour events et interactions.

QUAND T04 EST TERMINE, envoie un message a l'orchestrateur pour debloquer ui-graph et ui-search.
"
})
```

**ui-graph** (pane haut-droite) :
```tool
Agent({
  name: "ui-graph",
  team_name: "bible-ui",
  mode: "auto",
  prompt: "
Tu es l'agent 'ui-graph'. Tu geres le graph interactif.

ATTENDS que ui-core ait termine T04 (MCP Client Layer) avant de commencer.
Lis : CLAUDE.md, .specs/ui-web/tasks.md (T10), packages/ui/src/api/mcp-client.ts, packages/ui/src/hooks/useMcp.ts

Tu es owner de T10.

T10 — Graph interactif avec @react-sigma/core (Sigma.js + graphology) :
1. Installe cytoscape et react-cytoscapejs
2. hooks/useGraph.ts : charge list_characters, list_locations, list_events, list_interactions via useMcpQuery, construit les noeuds et edges
   - Noeuds : chaque entite = un noeud {id, label: name/title, type, color}
   - Couleurs : character=#3B82F6 (bleu), location=#10B981 (vert), event=#F59E0B (orange), interaction=#8B5CF6 (violet), world_rule=#EC4899 (rose)
   - Edges : interaction.characters[] -> lien entre personnages, event.characters[] -> lien event-personnage, event.location_id -> lien event-lieu
3. components/graph/GraphView.tsx : cytoscape avec layout fcose (ou cose-bilkent), zoom, pan, drag
4. Clic noeud : panneau lateral avec resume + lien 'Voir la fiche'
5. Clic edge : detail de la relation
6. components/graph/GraphControls.tsx : filtres par type (checkboxes toggle), bouton reset view, bouton fit
7. components/graph/GraphLegend.tsx : legende des couleurs
8. pages/Graph.tsx : page full-height avec GraphView + panneau lateral
"
})
```

**ui-search** (pane bas-droite) :
```tool
Agent({
  name: "ui-search",
  team_name: "bible-ui",
  mode: "auto",
  prompt: "
Tu es l'agent 'ui-search'. Tu geres la recherche.

ATTENDS que ui-core ait termine T04 (MCP Client Layer) avant de commencer.
Lis : CLAUDE.md, .specs/ui-web/tasks.md (T09), packages/ui/src/api/mcp-client.ts, packages/ui/src/hooks/useMcp.ts

Tu es owner de T09.

T09 — Recherche fulltext UI :
1. components/search/SearchBar.tsx : input avec debounce 300ms, icone recherche, clearable
2. components/search/SearchResults.tsx : resultats groupes par type, snippet avec highlight, clic -> navigation
3. pages/Search.tsx : page dediee avec SearchBar + SearchResults + filtre par type
4. Integre SearchBar dans le Header (Layout) : en tapant, redirige vers /search?q=query
5. Appelle search_fulltext via useMcpQuery
6. Etat vide, etat chargement, etat aucun resultat
"
})
```

---

## Vague 3 — Validation (1 agent)

```tool
Agent({
  name: "tests",
  team_name: "bible-ui",
  mode: "auto",
  prompt: "
Tu es l'agent 'tests'.

Lis tous les fichiers packages/ui/src/ pour comprendre l'implementation.

Tu es owner de T11.

T11 — Tests UI :
1. Configure vitest dans packages/ui/ avec jsdom et @testing-library/react
2. Tests MCP Client : mock fetch, verifier format JSON-RPC, gestion erreurs, parsing reponse
3. Tests hooks : mock client, verifier cache invalidation apres mutation
4. Tests EntityForm : render, soumission, validation champs requis
5. Tests GraphView : render avec donnees mock, verifier initialisation cytoscape
6. Tests SearchBar : debounce, navigation

Verifie : pnpm --filter ui test passe
Verifie aussi : pnpm --filter mcp test passe toujours (pas de regression)
"
})
```

---

## Vague 4 — P1 + P2 (2 agents paralleles)

```tool
Agent({
  name: "ui-p1",
  team_name: "bible-ui",
  mode: "auto",
  prompt: "Tu es l'agent 'ui-p1'. Owner de T12-T16.
  Lis .specs/ui-web/tasks.md pour les details.
  T12: Timeline visuelle (axe vertical, filtres, drag&drop reorder)
  T13: Recherche semantique (toggle fulltext/semantic, slider threshold)
  T14: Backup/Restore UI (liste backups, boutons backup/restore)
  T15: Wiki-style navigation (EntityLink composant, liens cliquables dans fiches)
  T16: Toasts (succes/erreur, auto-dismiss 3s, empilables)"
})
```

```tool
Agent({
  name: "ui-p2",
  team_name: "bible-ui",
  mode: "auto",
  prompt: "Tu es l'agent 'ui-p2'. Owner de T17-T20.
  Lis .specs/ui-web/tasks.md pour les details.
  T17: Dark mode (toggle header, Tailwind dark class, localStorage)
  T18: Import/Export UI (export Markdown download, import JSON dropzone)
  T19: Templates UI (TemplateSelector modal dans formulaires creation)
  T20: Config npx (package.json bin, barda.json, auto-open browser, README update)"
})
```

---

## Annexe — Resume agents et taches

| Agent | Taches | Vague |
|-------|--------|-------|
| fondations | T01, T02 | 1 |
| ui-core | T03, T04, T05, T06, T07, T08 | 2 |
| ui-graph | T10 | 2 |
| ui-search | T09 | 2 |
| tests | T11 | 3 |
| ui-p1 | T12, T13, T14, T15, T16 | 4 |
| ui-p2 | T17, T18, T19, T20 | 4 |
