# Analyse Team — mvp

**Date** : 2026-03-25
**Nombre de taches analysees** : 22

## Niveaux de parallelisme

```
Niveau 1 (sequentiel)  : T01
Niveau 2 (parallel x2) : T02, T04
Niveau 3 (parallel x7) : T03, T05, T06, T07, T08, T09, T11, T13, T14
Niveau 4 (parallel x2) : T10, T12
Niveau 5 (sequentiel)  : T15
Niveau 6 (parallel x4) : T16, T17, T18, T19
Niveau 7 (parallel x3) : T20, T21, T22
```

## Chemin critique

```
T01 → T02 → T11 → T12 → T15 → T19
```

6 taches en série, dont T11 (pipeline embeddings) est la plus longue.

## Goulots d'etranglement

| Tache | Dependants directs | Impact |
|-------|-------------------|--------|
| T01 | T02, T04 | Bloque tout |
| T02 | T03, T05-T09, T11, T13, T14 | Bloque 10 taches |
| T04 | T05-T14 | Bloque 10 taches |
| T15 | T16-T22 | Bloque tout P1/P2 |

T02 (DB) et T04 (MCP Server) sont les deux goulots principaux du P0. Ils doivent être terminés avant que les agents CRUD puissent démarrer.

## Conflits de fichiers

| Fichier | Taches | Risque |
|---------|--------|--------|
| `src/tools/index.ts` | T05, T06, T07, T08, T09, T10, T12, T13, T14 | **Moyen** — chaque tool ajoute un import + registration. Merges simples mais nombreux. |
| `src/tools/search.ts` | T10, T12 | **Moyen** — fulltext et semantic dans le même fichier. T10 crée, T12 modifie. Séquencer. |
| `src/db/fts.ts` | T03, T16, T17 | **Faible** — T03 crée, T16/T17 ajoutent des triggers (P1, séquentiel après T15). |

## Verdict

**OUI** — Le parallélisme est significatif au Niveau 3 (7 taches simultanées après les fondations). Les conflits de fichiers sont gérables avec un séquençage T10 → T12 pour `search.ts`.

**Gain optimal :** 3 agents parallèles sur les CRUD tools (T05-T09), pendant qu'un agent gère le pipeline embeddings (T11).

## Composition de team

### Agents

| Agent | Type | Taches | Mode |
|-------|------|--------|------|
| **fondations** | backend | T01 → T02 + T04 (séquentiel) | worktree principal |
| **crud-alpha** | backend | T05 (Characters), T07 (Events), T09 (World Rules) | worktree isolé |
| **crud-beta** | backend | T06 (Locations), T08 (Interactions) | worktree isolé |
| **search-engine** | backend | T03 (FTS5) → T10 (Fulltext) → T11 (Embeddings) → T12 (Semantic) | worktree isolé |
| **utilities** | backend | T13 (Backup), T14 (Stats) | worktree isolé |
| **tests** | fullstack | T15 (tous les tests P0) | worktree principal (après merge) |

### Sequencement par vagues

**Vague 1 — Fondations** (séquentiel, 1 agent)
```
fondations: T01 → T02 + T04
```
*Résultat :* Projet initialisé, DB prête, serveur MCP bootable.

**Vague 2 — Features P0** (parallèle, 4 agents)
```
crud-alpha:    T05, T07, T09    (3 domaines CRUD)
crud-beta:     T06, T08         (2 domaines CRUD)
search-engine: T03 → T10 → T11 → T12  (index + recherche)
utilities:     T13, T14         (backup + stats)
```
*Résultat :* Tous les tools P0 implémentés.

**Vague 3 — Validation** (séquentiel, 1 agent)
```
tests: T15
```
*Résultat :* Tous les tests passent, MVP validé.

### Points de synchronisation
- **Après Vague 1** : Merge des fondations. Les agents Vague 2 partent de ce commit.
- **Après Vague 2** : Merge de tous les worktrees. Résolution des conflits sur `src/tools/index.ts`.
- **Après Vague 3** : MVP complet et testé.

## Estimation du gain

| Metrique | Valeur |
|----------|--------|
| Unites sequentielles (P0) | ~15 taches en série |
| Unites avec team | ~3 vagues (fondations + 4 parallèles + tests) |
| Gain estime | ~60% de réduction du temps de développement P0 |

## Risques & Mitigations

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Conflits merge sur tools/index.ts | Moyen | Fichier simple (liste d'imports), merge trivial |
| search.ts partagé T10/T12 | Moyen | Séquencé dans le même agent (search-engine) |
| Pattern CRUD divergent entre agents | Moyen | T05 (Characters) sert de référence — les autres copient le pattern |
| Embedding pipeline bloquant | Faible | Isolé dans son propre agent, ne bloque pas les CRUD |
