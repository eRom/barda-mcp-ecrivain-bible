import EntityList from '../components/entities/EntityList'
import EntityCard from '../components/entities/EntityCard'
import type { Location } from '../types'

export default function Locations() {
  return (
    <EntityList<Location>
      toolName="list_locations"
      entityType="Lieux"
      createPath="/locations/new"
      extractItems={(data) => (data as { results: Location[] }).results}
      keyExtractor={(l) => l.id}
      renderCard={(l) => (
        <EntityCard
          id={l.id}
          title={l.name}
          subtitle={l.atmosphere}
          description={l.description}
          typeBadge="Lieu"
          badgeColor="bg-emerald-500"
          basePath="/locations"
        />
      )}
    />
  )
}
