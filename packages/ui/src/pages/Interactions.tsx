import EntityList from '../components/entities/EntityList'
import EntityCard from '../components/entities/EntityCard'
import type { Interaction } from '../types'

export default function Interactions() {
  return (
    <EntityList<Interaction>
      toolName="list_interactions"
      entityType="Interactions"
      createPath="/interactions/new"
      extractItems={(data) => (data as { results: Interaction[] }).results}
      keyExtractor={(i) => i.id}
      renderCard={(i) => (
        <EntityCard
          id={i.id}
          title={i.description.slice(0, 60) + (i.description.length > 60 ? '...' : '')}
          subtitle={i.nature}
          description={i.notes}
          typeBadge="Interaction"
          badgeColor="bg-violet-500"
          basePath="/interactions"
        />
      )}
    />
  )
}
