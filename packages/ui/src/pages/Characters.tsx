import EntityList from '../components/entities/EntityList'
import EntityCard from '../components/entities/EntityCard'
import type { Character } from '../types'

export default function Characters() {
  return (
    <EntityList<Character>
      toolName="list_characters"
      entityType="Personnages"
      createPath="/characters/new"
      extractItems={(data) => (data as { characters: Character[] }).characters}
      keyExtractor={(c) => c.id}
      renderCard={(c) => (
        <EntityCard
          id={c.id}
          title={c.name}
          description={c.description}
          typeBadge="Personnage"
          badgeColor="bg-blue-500"
          basePath="/characters"
        />
      )}
    />
  )
}
