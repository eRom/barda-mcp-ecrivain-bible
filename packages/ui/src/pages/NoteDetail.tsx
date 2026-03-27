import { useParams, useNavigate } from 'react-router-dom'
import { useMcpQuery, useMcpMutation } from '../hooks/useMcp'
import { useToast } from '../hooks/useToast'
import EntityForm, { type FieldConfig } from '../components/entities/EntityForm'
import type { Note } from '../types'

const fields: FieldConfig[] = [
  { name: 'content', label: 'Contenu', type: 'textarea', required: true },
  { name: 'tags', label: 'Tags (JSON)', type: 'text' },
]

export default function NoteDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isNew = id === 'new' || !id

  const { data, isLoading } = useMcpQuery<Note>(
    'get_note',
    { id },
    { enabled: !isNew },
  )

  const toast = useToast()
  const updateMutation = useMcpMutation('update_note', ['list_notes', 'get_note'])
  const createMutation = useMcpMutation('create_note', ['list_notes'])
  const deleteMutation = useMcpMutation('delete_note', ['list_notes'])

  if (!isNew && isLoading) {
    return <div className="p-8 text-[var(--muted-foreground)]">Chargement...</div>
  }

  async function handleSave(formData: Record<string, string>) {
    try {
      if (isNew) {
        const result = await createMutation.mutateAsync(formData)
        const created = result as Note
        toast.success('Note creee')
        navigate(`/notes/${created.id}`, { replace: true })
      } else {
        await updateMutation.mutateAsync({ id, ...formData })
        toast.success('Fiche mise a jour')
      }
    } catch (err) {
      toast.error((err as Error).message)
      throw err
    }
  }

  function handleDelete() {
    deleteMutation.mutate({ id: id! }, {
      onSuccess: () => {
        toast.success('Note supprimee')
        navigate('/notes')
      },
      onError: (err) => toast.error(err.message),
    })
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6">
        {isNew ? 'Nouvelle note' : 'Note'}
      </h2>
      <EntityForm
        fields={fields}
        initialData={data as unknown as Record<string, string | null>}
        isNew={isNew}
        onSave={handleSave}
        onDelete={isNew ? undefined : handleDelete}
        isSaving={createMutation.isPending || updateMutation.isPending}
        timestamps={data ? { created_at: (data as any).createdAt ?? data.created_at, updated_at: (data as any).updatedAt ?? data.updated_at } : undefined}
      />
    </div>
  )
}
