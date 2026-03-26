import EntityList from '../components/entities/EntityList'
import EntityCard from '../components/entities/EntityCard'
import type { Note } from '../types'

export default function Notes() {
  return (
    <EntityList<Note>
      toolName="list_notes"
      entityType="Notes"
      createPath="/notes/new"
      extractItems={(data) => (data as { notes: Note[] }).notes}
      keyExtractor={(n) => n.id}
      renderCard={(n) => {
        const tags = n.tags ? JSON.parse(n.tags) as string[] : []
        return (
          <EntityCard
            id={n.id}
            title={n.content.slice(0, 50) + (n.content.length > 50 ? '...' : '')}
            subtitle={tags.length > 0 ? tags.join(', ') : null}
            description={n.content}
            typeBadge="Note"
            badgeColor="bg-orange-500"
            basePath="/notes"
          />
        )
      }}
    />
  )
}
