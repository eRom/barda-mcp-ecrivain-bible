import EntityList from '../components/entities/EntityList'
import EntityCard from '../components/entities/EntityCard'
import type { Research } from '../types'

export default function ResearchPage() {
  return (
    <EntityList<Research>
      toolName="list_research"
      entityType="Recherches"
      createPath="/research/new"
      extractItems={(data) => (data as { research: Research[] }).research}
      keyExtractor={(r) => r.id}
      renderCard={(r) => (
        <EntityCard
          id={r.id}
          title={r.topic}
          description={r.content}
          typeBadge="Recherche"
          badgeColor="bg-cyan-500"
          basePath="/research"
        />
      )}
    />
  )
}
