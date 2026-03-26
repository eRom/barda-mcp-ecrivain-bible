# Analyse Team — ui-web

**Date** : 2026-03-26
**Nombre de taches analysees** : 20

## Niveaux de parallelisme

```
Niveau 1 (sequentiel)  : T01
Niveau 2 (parallel x2) : T02, T03
Niveau 3 (parallel x2) : T04, T05
Niveau 4 (parallel x4) : T06, T07, T09, T10
Niveau 5 (sequentiel)  : T08 (attend T07)
Niveau 6 (sequentiel)  : T11 (attend T08, T10)
Niveau 7 (parallel x5) : T12, T13, T14, T15, T16, T20
Niveau 8 (parallel x3) : T17, T18, T19
```

## Chemin critique

```
T01 --> T03 --> T04 --> T10 --> T11 --> T12
```

6 taches en serie. T10 (graph interactif) est la plus complexe.

## Goulots d'etranglement

| Tache | Dependants directs | Impact |
|-------|-------------------|--------|
| T01 | T02, T03 | Bloque tout |
| T04 | T06, T07, T09, T10, T11 | Bloque 5 taches |
| T11 | T12, T13, T14, T16, T20 | Bloque tout P1/P2 |

## Conflits de fichiers

| Fichier | Taches | Risque |
|---------|--------|--------|
| packages/ui/src/App.tsx | T05, T16 | Faible — ajouts routes et providers |
| packages/mcp/src/index.ts | T01, T02 | Nul — sequentiels |

## Verdict

**OUI** — Bon parallelisme au Niveau 4 (4 taches UI en parallele apres les fondations). Backend (T02) et frontend (T03-T10) sont sur des pistes independantes.

## Composition de team

### Agents

| Agent | Type | Taches | Mode |
|-------|------|--------|------|
| **fondations** | general-purpose | T01 --> T02 (sequentiel) | worktree principal |
| **ui-core** | general-purpose | T03 --> T04 --> T05 --> T06 --> T07 --> T08 (sequentiel, colonne vertebrale UI) | worktree principal (apres fondations) |
| **ui-graph** | general-purpose | T10 (graph interactif — tache la plus complexe, agent dedie) | worktree principal (apres T04) |
| **ui-search** | general-purpose | T09 (recherche fulltext UI) | worktree principal (apres T04) |
| **tests** | general-purpose | T11 (tests UI) | worktree principal (apres graph + fiches) |
| **ui-p1** | general-purpose | T12, T13, T14, T15, T16 (toutes les taches P1) | worktree principal (apres tests) |
| **ui-p2** | general-purpose | T17, T18, T19, T20 (toutes les taches P2) | worktree principal (apres P1) |

### Sequencement par vagues

**Vague 1 — Fondations** (1 agent, sequentiel)
```
fondations: T01 --> T02
```
Resultat : Monorepo restructure, MCP HTTP fonctionnel.

**Vague 2 — UI Core + Features** (3 agents paralleles)
```
ui-core:   T03 --> T04 --> T05 --> T06 --> T07 --> T08
ui-graph:  T10  (demarre apres T04 termine — attend signal)
ui-search: T09  (demarre apres T04 termine — attend signal)
```
Resultat : UI complete avec listes, fiches, graph et recherche.

**Vague 3 — Validation** (1 agent)
```
tests: T11
```
Resultat : Tests verts.

**Vague 4 — P1 + P2** (2 agents paralleles)
```
ui-p1: T12, T13, T14, T15, T16
ui-p2: T17, T18, T19, T20
```
Resultat : Toutes les features P1 et P2.

### Points de synchronisation
- **Apres Vague 1** : Monorepo et HTTP prets. Les tests MCP existants passent toujours.
- **Pendant Vague 2** : ui-graph et ui-search attendent que T04 (MCP Client) soit termine par ui-core.
- **Apres Vague 2** : Merge et verification du build complet.
- **Apres Vague 3** : Tests verts. P0 UI valide.

## Estimation du gain

| Metrique | Valeur |
|----------|--------|
| Unites sequentielles (P0) | ~11 taches en serie |
| Unites avec team | ~4 vagues |
| Gain estime | ~50% de reduction sur le P0 |

## Risques & Mitigations

| Risque | Impact | Mitigation |
|--------|--------|------------|
| ui-graph et ui-search demarrent avant que T04 soit pret | Eleve | Synchronisation explicite : attendre le message de ui-core |
| Conflits de merge entre les 3 agents Vague 2 | Moyen | Fichiers distincts par agent (graph/, search/, pages/) |
| Le monorepo restructure casse les tests MCP | Moyen | T01 valide `pnpm --filter mcp test` avant de continuer |
| Cytoscape.js trop lourd a integrer | Moyen | Agent dedie (ui-graph) pour gerer la complexite |
