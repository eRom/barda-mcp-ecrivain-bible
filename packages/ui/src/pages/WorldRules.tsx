import EntityList from '../components/entities/EntityList'
import EntityCard from '../components/entities/EntityCard'
import type { WorldRule } from '../types'

export default function WorldRules() {
  return (
    <EntityList<WorldRule>
      toolName="list_world_rules"
      entityType="Regles du monde"
      createPath="/world-rules/new"
      extractItems={(data) => (data as { worldRules: WorldRule[] }).worldRules}
      keyExtractor={(r) => r.id}
      renderCard={(r) => (
        <EntityCard
          id={r.id}
          title={r.title}
          subtitle={r.category}
          description={r.description}
          typeBadge="Regle"
          badgeColor="bg-pink-500"
          basePath="/world-rules"
        />
      )}
    />
  )
}
