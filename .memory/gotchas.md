# Gotchas — Bible d'Ecrivain MCP

**Derniere mise a jour** : 2026-03-26

## Express 5 — wildcard route syntax

**Probleme** : `app.get("*", handler)` crash avec `PathError: Missing parameter name`.
**Cause** : Express 5 (via path-to-regexp v8) exige des parametres nommes dans les wildcards.
**Fix** : Utiliser `app.get("/{*path}", handler)` au lieu de `app.get("*", handler)`.
**Fichier** : `packages/mcp/src/http.ts`

## Sigma.js — attribut `type` reserve

**Probleme** : `Error: Sigma: could not find a suitable program for node type "character"!`
**Cause** : Sigma utilise l'attribut `type` des noeuds pour choisir le programme de rendu WebGL (`"circle"`, `"point"`, etc.). Notre attribut custom `type: "character"` entrait en conflit.
**Fix** : Renommer en `entityType` dans graphology, lire `attrs.entityType` partout.
**Fichiers** : `useGraph.ts`, `GraphControls.tsx`, `GraphEvents.tsx`, `NodeDetail.tsx`

## Sigma.js — hooks hors SigmaContainer

**Probleme** : `Error: No context provided: useSigmaContext() can only be used in a descendant of <SigmaContainer>`
**Cause** : `GraphControls`, `GraphLegend`, et `NodeDetail` utilisaient `useSigma()`/`useCamera()` mais etaient rendus en dehors du `<SigmaContainer>` dans `Graph.tsx`.
**Fix** :
- GraphControls + GraphLegend : deplaces a l'interieur de `GraphView.tsx` (dans le SigmaContainer)
- NodeDetail : remplace `useSigma()` par un prop `graph: Graph` (graphology) passe depuis `Graph.tsx`
**Fichiers** : `GraphView.tsx`, `Graph.tsx`, `NodeDetail.tsx`

## Sigma.js — camera jump au clic

**Probleme** : Quand on clique un noeud, le zoom/pan change brusquement.
**Cause** : `sigma.refresh()` apres modification des reducers recalcule les bornes de la scene.
**Fix** : Sauvegarder `camera.getState()` avant le refresh et `camera.setState()` apres.
**Fichier** : `GraphView.tsx` (GraphHighlighter)

## Formats de retour MCP non uniformes

**Probleme** : Les tools `list_*` retournent des formats differents : `{ characters: [...] }`, `{ events: [...] }`, `{ results: [...] }`.
**Cause** : Chaque agent qui a cree les CRUD tools a utilise un format legerement different.
**Fix** : Helper `extractArray()` dans `useGraph.ts` qui cherche le premier tableau dans l'objet retourne.
**Impact** : Toute l'UI doit utiliser extractArray ou un equivalent quand elle consomme des listes.

## camelCase vs snake_case dans les reponses MCP

**Probleme** : Les types UI definissent `location_id` (snake_case) mais les donnees retournees par Drizzle utilisent `locationId` (camelCase).
**Cause** : Drizzle ORM convertit automatiquement les noms de colonnes en camelCase.
**Fix** : Dans `useGraph.ts`, checker les deux formats : `(ev as any).locationId || ev.location_id`.
**Impact** : Potentiellement tout le code UI qui lit des champs multi-mots.

## Validation limit <= 200 sur certains tools

**Probleme** : `list_locations` et `list_interactions` ont un Zod max(200) sur le parametre `limit`, contrairement aux autres tools qui acceptent 500.
**Fix** : Toujours utiliser `limit: 200` max dans l'UI pour etre safe avec tous les tools.

## Package name collision workspace

**Probleme** : `pnpm --filter mcp` ne marchait pas.
**Cause** : Le package MCP et le workspace root avaient le meme name `barda-ecrivain-bible`. pnpm ne pouvait pas resoudre le filtre.
**Fix** : Renommer les packages en `@barda/mcp` et `@barda/ui`. Root reste `barda-ecrivain-bible`.

## WAL et backup SQLite

**Probleme** : Apres restore, des donnees "fantomes" du WAL persistent.
**Cause** : `fs.copyFileSync` ne copie pas les fichiers WAL/SHM associes.
**Fix** : `PRAGMA wal_checkpoint(TRUNCATE)` avant backup et apres restore, puis nettoyage des fichiers .db-wal et .db-shm.
**Fichier** : `packages/mcp/src/tools/backup.ts`

## @huggingface/transformers — type union pipeline()

**Probleme** : TypeScript erreur sur l'appel `pipeline('feature-extraction', ...)` — union type trop complexe.
**Fix** : `@ts-expect-error` sur la ligne concernee. Bug connu de la lib.
**Fichier** : `packages/mcp/src/embeddings/model.ts`

## Gandalf dans la bible Matrix

**Probleme** : Un personnage "Gandalf" traine dans la DB de test.
**Cause** : Teste manuel avant le seed Matrix, jamais nettoye.
**Fix** : Supprimer via l'UI ou recreer la DB (`trash packages/mcp/data/bible.db` puis relancer le seed).
