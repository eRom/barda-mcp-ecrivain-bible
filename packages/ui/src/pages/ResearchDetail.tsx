import { useParams, useNavigate } from 'react-router-dom'
import { useMcpQuery, useMcpMutation } from '../hooks/useMcp'
import { useToast } from '../hooks/useToast'
import EntityForm, { type FieldConfig } from '../components/entities/EntityForm'
import type { Research } from '../types'

const fields: FieldConfig[] = [
  { name: 'topic', label: 'Sujet', type: 'text', required: true },
  { name: 'content', label: 'Contenu', type: 'textarea', required: true },
  { name: 'sources', label: 'Sources (JSON)', type: 'textarea' },
  { name: 'notes', label: 'Notes', type: 'textarea' },
]

export default function ResearchDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isNew = id === 'new' || !id

  const { data, isLoading } = useMcpQuery<Research>(
    'get_research',
    { id },
    { enabled: !isNew },
  )

  const toast = useToast()
  const updateMutation = useMcpMutation('update_research', ['list_research', 'get_research'])
  const createMutation = useMcpMutation('create_research', ['list_research'])
  const deleteMutation = useMcpMutation('delete_research', ['list_research'])

  if (!isNew && isLoading) {
    return <div className="p-8 text-[var(--muted-foreground)]">Chargement...</div>
  }

  async function handleSave(formData: Record<string, string>) {
    try {
      if (isNew) {
        const result = await createMutation.mutateAsync(formData)
        const created = result as Research
        toast.success('Recherche creee')
        navigate(`/research/${created.id}`, { replace: true })
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
        toast.success('Recherche supprimee')
        navigate('/research')
      },
      onError: (err) => toast.error(err.message),
    })
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6">
        {isNew ? 'Nouvelle recherche' : data?.topic ?? 'Recherche'}
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
