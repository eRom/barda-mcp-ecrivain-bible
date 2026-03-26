# Brainstorming : ui-web

**Date** : 2026-03-26
**Statut** : Decide
**Mode** : Ajout de fonctionnalite

## Idee initiale
Ajouter une interface web autonome a la bible d'ecrivain, inspiree d'Obsidian — avec un graph interactif de dependances entre entites, des fiches editables, une navigation wiki-style et une timeline visuelle — permettant a l'auteur de gerer sa bible sans passer par un LLM.

## Hypotheses validees
- L'UI est un complement au MCP, pas un remplacement de Cruchot : Cruchot = chat LLM, UI = gestion visuelle directe
- L'UI est **cliente MCP** : elle appelle les memes tools que le LLM, via HTTP/SSE (ISO perimetre)
- Le graph interactif est le coeur de l'UI — sans lui, pas d'interet par rapport a Cruchot
- App web (pas Electron) : le MCP sert le bundle statique + expose les tools via HTTP
- Distribution via `npx barda-ecrivain-bible` : une seule commande, zero config
- Monorepo pnpm workspaces : `packages/mcp/` + `packages/ui/`
- Le changement de bible (--db-path) necessite un restart du process (pas de hot-swap, coherent avec un LLM potentiellement connecte)
- La gestion de fichiers (selecteur de bible) est prevue pour une v3 future

## Hypotheses rejetees
- Electron : trop lourd (150MB+), scope explosion, maintenance updates
- Vanilla JS / HTMX : le graph interactif necessite un vrai framework
- UI accede directement a la DB : risque de lock, perte d'ISO avec le MCP
- Hot-swap de bible : incoherent si un LLM est connecte en parallele
- Repo separe pour l'UI : synchro types penible, CI croisee

## Risques identifies
- Perf du graph via HTTP/MCP pour un corpus > 500 entites (toutes les requetes passent par JSON-RPC)
- Restructuration monorepo casse les chemins existants (imports, configs, CI)
- Le MCP SDK StreamableHTTPServerTransport peut avoir des limitations non documentees
- La complexite du graph force-directed (d3-force) est significative
- Le bundle UI inclus dans le package npm augmente sa taille

## Alternatives considerees
| Approche | Priorise | Sacrifie |
|----------|----------|----------|
| A — SPA web + MCP HTTP (retenue) | Simplicite, un seul process, zero config | Pas d'acces distant, perf graph via HTTP |
| B — Electron tout-en-un | UX "double-clic", distribution simple | Poids, complexite, maintenance |
| C — HTML/HTMX sans framework | Simplicite extreme, zero tooling | Le graph interactif (coeur de l'UI) |

## Decision retenue
**Approche A — SPA web servie par le MCP en mode HTTP.** Un seul process Node sert l'UI statique et expose les tools MCP via HTTP/SSE. `npx barda-ecrivain-bible` lance tout et ouvre le navigateur.

## Prerequis avant implementation
1. Restructurer en monorepo pnpm workspaces (deplacer le code MCP dans packages/mcp/)
2. Ajouter le transport HTTP/SSE au serveur MCP
3. Valider que le MCP SDK supporte StreamableHTTPServerTransport correctement
4. Choisir la stack frontend (framework, graph lib, CSS)

## Hors scope (explicitement exclu)
- Authentification / multi-utilisateurs
- Acces distant (l'UI est localhost only)
- Hot-swap de bible (restart requis)
- Mode offline-first / PWA
- Edition collaborative temps reel
- Selecteur de fichier bible dans l'UI (v3)

## Contraintes de securite identifiees
- Port HTTP local expose : restreindre a 127.0.0.1 (pas 0.0.0.0)
- Pas d'authentification (mono-utilisateur local, meme modele que le MCP stdio)
- Validation des inputs cote UI (XSS) meme si le MCP valide deja via Zod
- Le bundle statique ne contient aucune donnee sensible
