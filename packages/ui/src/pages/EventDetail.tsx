import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMcpQuery, useMcpMutation } from '../hooks/useMcp'
import { useToast } from '../hooks/useToast'
import EntityForm, { type FieldConfig } from '../components/entities/EntityForm'
import EntityLink from '../components/common/EntityLink'
import type { Event, Character, Location } from '../types'

const fields: FieldConfig[] = [
  { name: 'title', label: 'Titre', type: 'text', required: true },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'chapter', label: 'Chapitre', type: 'text' },
  { name: 'notes', label: 'Notes', type: 'textarea' },
]

export default function EventDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isNew = id === 'new' || !id

  const { data, isLoading } = useMcpQuery<Event>(
    'get_event',
    { id },
    { enabled: !isNew },
  )

  const { data: charsData } = useMcpQuery<{ characters: Character[] }>('list_characters', { limit: 200 })
  const { data: locsData } = useMcpQuery<{ results: Location[] }>('list_locations', { limit: 200 })

  const [selectedChars, setSelectedChars] = useState<string[]>([])
  const [selectedLocation, setSelectedLocation] = useState<string>('')

  useEffect(() => {
    if (data) {
      setSelectedChars(data.characters ? JSON.parse(data.characters) : [])
      setSelectedLocation(data.location_id ?? '')
    }
  }, [data])

  const toast = useToast()
  const updateMutation = useMcpMutation('update_event', ['list_events', 'get_event'])
  const createMutation = useMcpMutation('create_event', ['list_events'])
  const deleteMutation = useMcpMutation('delete_event', ['list_events'])

  if (!isNew && isLoading) {
    return <div className="p-8 text-[var(--muted-foreground)]">Chargement...</div>
  }

  const characters = charsData?.characters ?? []
  const locations = locsData?.results ?? []

  function toggleChar(charId: string) {
    setSelectedChars((prev) =>
      prev.includes(charId) ? prev.filter((c) => c !== charId) : [...prev, charId],
    )
  }

  function handleSave(formData: Record<string, string>) {
    const payload = {
      ...formData,
      characters: JSON.stringify(selectedChars),
      location_id: selectedLocation || undefined,
    }
    if (isNew) {
      createMutation.mutate(payload, {
        onSuccess: (result) => {
          const created = result as Event
          toast.success('Evenement cree')
          navigate(`/events/${created.id}`, { replace: true })
        },
        onError: (err) => toast.error(err.message),
      })
    } else {
      updateMutation.mutate({ id, ...payload }, {
        onSuccess: () => toast.success('Fiche mise a jour'),
        onError: (err) => toast.error(err.message),
      })
    }
  }

  function handleDelete() {
    deleteMutation.mutate({ id: id! }, {
      onSuccess: () => {
        toast.success('Evenement supprime')
        navigate('/events')
      },
      onError: (err) => toast.error(err.message),
    })
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6">
        {isNew ? 'Nouvel evenement' : data?.title ?? 'Evenement'}
      </h2>

      <EntityForm
        fields={fields}
        initialData={data as unknown as Record<string, string | null>}
        isNew={isNew}
        onSave={handleSave}
        onDelete={isNew ? undefined : handleDelete}
        isSaving={createMutation.isPending || updateMutation.isPending}
        timestamps={data ? { created_at: data.created_at, updated_at: data.updated_at } : undefined}
      />

      {/* Wiki-style links for associated entities (read mode) */}
      {!isNew && data && (
        <div className="mt-6 p-4 bg-[var(--card)] border border-[var(--border)] rounded-lg space-y-3">
          <div>
            <span className="text-sm font-medium text-[var(--muted-foreground)]">Lieu : </span>
            {selectedLocation ? (
              (() => {
                const loc = locations.find((l) => l.id === selectedLocation)
                return loc ? (
                  <EntityLink entityType="location" entityId={loc.id} label={loc.name} description={loc.description} />
                ) : (
                  <span className="text-sm text-[var(--muted-foreground)]">--</span>
                )
              })()
            ) : (
              <span className="text-sm text-[var(--muted-foreground)]">Aucun</span>
            )}
          </div>
          {selectedChars.length > 0 && (
            <div>
              <span className="text-sm font-medium text-[var(--muted-foreground)]">Personnages : </span>
              <span className="inline-flex flex-wrap gap-x-2 gap-y-1">
                {selectedChars.map((charId) => {
                  const char = characters.find((c) => c.id === charId)
                  return char ? (
                    <EntityLink key={charId} entityType="character" entityId={char.id} label={char.name} description={char.description} />
                  ) : null
                })}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Location selector */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Lieu</label>
        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="w-full h-9 rounded-md border border-[var(--input)] bg-transparent px-3 py-1 text-sm text-[var(--foreground)] focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--ring)]/50 focus:outline-none"
        >
          <option value="">-- Aucun lieu --</option>
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id}>{loc.name}</option>
          ))}
        </select>
      </div>

      {/* Characters selector */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Personnages</label>
        <div className="flex flex-wrap gap-2">
          {characters.map((char) => (
            <button
              key={char.id}
              type="button"
              onClick={() => toggleChar(char.id)}
              className={`px-3 py-1 text-sm rounded-full border transition-all duration-200 ${
                selectedChars.includes(char.id)
                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                  : 'bg-transparent text-[var(--muted-foreground)] border-[var(--border)] hover:border-blue-500/30'
              }`}
            >
              {char.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
