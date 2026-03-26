import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMcpQuery, useMcpMutation } from '../hooks/useMcp'
import { useToast } from '../hooks/useToast'
import EntityForm, { type FieldConfig } from '../components/entities/EntityForm'
import EntityLink from '../components/common/EntityLink'
import type { Interaction, Character } from '../types'

const fields: FieldConfig[] = [
  { name: 'description', label: 'Description', type: 'textarea', required: true },
  { name: 'nature', label: 'Nature', type: 'text' },
  { name: 'chapter', label: 'Chapitre', type: 'text' },
  { name: 'notes', label: 'Notes', type: 'textarea' },
]

export default function InteractionDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isNew = id === 'new' || !id

  const { data, isLoading } = useMcpQuery<Interaction>(
    'get_interaction',
    { id },
    { enabled: !isNew },
  )

  const { data: charsData } = useMcpQuery<{ characters: Character[] }>('list_characters', { limit: 200 })

  const [selectedChars, setSelectedChars] = useState<string[]>([])

  useEffect(() => {
    if (data) {
      setSelectedChars(JSON.parse(data.characters))
    }
  }, [data])

  const toast = useToast()
  const updateMutation = useMcpMutation('update_interaction', ['list_interactions', 'get_interaction'])
  const createMutation = useMcpMutation('create_interaction', ['list_interactions'])
  const deleteMutation = useMcpMutation('delete_interaction', ['list_interactions'])

  if (!isNew && isLoading) {
    return <div className="p-8 text-[var(--muted-foreground)]">Chargement...</div>
  }

  const characters = charsData?.characters ?? []

  function toggleChar(charId: string) {
    setSelectedChars((prev) =>
      prev.includes(charId) ? prev.filter((c) => c !== charId) : [...prev, charId],
    )
  }

  function handleSave(formData: Record<string, string>) {
    const payload = {
      ...formData,
      characters: JSON.stringify(selectedChars),
    }
    if (isNew) {
      createMutation.mutate(payload, {
        onSuccess: (result) => {
          const created = result as Interaction
          toast.success('Interaction creee')
          navigate(`/interactions/${created.id}`, { replace: true })
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
        toast.success('Interaction supprimee')
        navigate('/interactions')
      },
      onError: (err) => toast.error(err.message),
    })
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6">
        {isNew ? 'Nouvelle interaction' : 'Interaction'}
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

      {/* Wiki-style links for associated characters (read mode) */}
      {!isNew && data && selectedChars.length > 0 && (
        <div className="mt-6 p-4 bg-[var(--card)] border border-[var(--border)] rounded-lg">
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

      {/* Characters selector */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
          Personnages <span className="text-[var(--destructive)]">*</span>
          <span className="text-xs text-[var(--muted-foreground)] ml-2">(min. 2)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {characters.map((char) => (
            <button
              key={char.id}
              type="button"
              onClick={() => toggleChar(char.id)}
              className={`px-3 py-1 text-sm rounded-full border transition-all duration-200 ${
                selectedChars.includes(char.id)
                  ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                  : 'bg-transparent text-[var(--muted-foreground)] border-[var(--border)] hover:border-purple-500/30'
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
