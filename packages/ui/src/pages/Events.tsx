import EntityList from '../components/entities/EntityList'
import EntityCard from '../components/entities/EntityCard'
import type { Event } from '../types'

export default function Events() {
  return (
    <EntityList<Event>
      toolName="list_events"
      entityType="Evenements"
      createPath="/events/new"
      extractItems={(data) => (data as { events: Event[] }).events}
      keyExtractor={(e) => e.id}
      renderCard={(e) => (
        <EntityCard
          id={e.id}
          title={e.title}
          subtitle={e.chapter ? `Chapitre ${e.chapter}` : null}
          description={e.description}
          typeBadge="Evenement"
          badgeColor="bg-amber-500"
          basePath="/events"
        />
      )}
    />
  )
}
