# Brainstorming : mvp

**Date** : 2026-03-25
**Statut** : Décidé
**Mode** : Nouveau projet

## Idée initiale
Construire un serveur MCP standalone qui sert de "bible d'écrivain" — une base de connaissances structurée et cherchable (sémantique + fulltext) centralisant personnages, lieux, chronologies, interactions, règles du monde et recherches d'un univers narratif, accessible en CRUD par des agents IA et une UI humaine.

## Hypothèses validées
- Le besoin principal est le **retrieval intelligent** pendant l'écriture : "Bob portait-il des lunettes à l'église ?"
- L'intelligence (extraction, analyse) reste côté client (Cruchot/LLM), la bible est une **mémoire passive mais cherchable**
- Un seul auteur, un seul univers à la fois — pas de multi-tenancy
- Les fiches utilisent du **texte libre** pour les descriptions/évolutions, la recherche sémantique fait le travail de corrélation
- Le MCP est standalone, intégré comme "barda" dans Cruchot via sa définition
- Le backup est un copie du fichier SQLite unique
- L'utilisateur principal est un ami de Romain qui écrit un livre (surprise), utilise actuellement ChatGPT

## Hypothèses rejetées
- LLM intégré dans le serveur MCP — complexité inutile, le client a déjà l'intelligence
- Fichiers Markdown/JSON comme stockage — pas d'historique, pas de delta, recherche limitée
- Qdrant séparé pour les vecteurs — surarchitecture pour du mono-utilisateur
- Versioning granulaire par attribut de personnage — trop lourd à saisir, le texte libre + sémantique suffit
- Multi-univers — un auteur écrit un livre à la fois

## Risques identifiés
- sqlite-vec est relativement récent, API potentiellement instable → fallback cosine similarity en JS
- Modèle d'embedding local moins performant qu'un modèle API → acceptable pour la taille du corpus (centaines de fiches, pas millions)
- La qualité du retrieval dépend de la qualité des données saisies → UX de saisie critique
- Corpus en français principalement → nécessite un modèle d'embedding multilingue

## Alternatives considérées
| Approche | Priorise | Sacrifie |
|----------|----------|----------|
| A — SQLite tout-en-un (FTS5 + embeddings) | Simplicité, portabilité, backup trivial | Flexibilité vector search |
| B — SQLite + Qdrant séparé | Puissance vector search, cohérence Cruchot | Simplicité, un système de plus |
| C — Fichiers JSON + index mémoire | Transparence, lisibilité humaine | ACID, historique, performance |

## Décision retenue
**Approche A — SQLite tout-en-un.** Un seul fichier `.db` = une bible. Backup = copier un fichier. FTS5 pour le fulltext, embeddings stockés en SQLite pour la recherche sémantique. TypeScript pour le MCP server, cohérent avec l'écosystème Cruchot.

## Prérequis avant implémentation
1. Valider le modèle d'embedding multilingue local (compatible Node.js/TypeScript)
2. Valider que better-sqlite3 + FTS5 couvrent les besoins de recherche fulltext
3. Définir le schéma des entités narratives (personnages, lieux, événements, etc.)
4. Définir la liste des tools MCP exposés

## Hors scope (explicitement exclu)
- Le manuscrit/texte du roman (la bible = référence, pas contenu)
- Multi-univers / multi-projet dans la même instance
- LLM/IA intégrée dans le serveur MCP
- Interface UI (fournie par Cruchot via le barda)
- Collaboration multi-auteurs simultanée
- Génération de contenu narratif

## Contraintes de sécurité identifiées
- Données non sensibles (fiction), mais contenu propriétaire de l'auteur → protection de la propriété intellectuelle
- MCP en stdio (local) → pas d'exposition réseau, surface d'attaque minimale
- Backup du fichier SQLite → intégrité des données, pas de chiffrement requis sauf demande explicite
- Pas d'authentification nécessaire (mono-utilisateur, local)
