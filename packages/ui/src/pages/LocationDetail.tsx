import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMcpQuery, useMcpMutation } from '../hooks/useMcp'
import { useToast } from '../hooks/useToast'
import EntityForm, { type FieldConfig } from '../components/entities/EntityForm'
import TemplateSelector from '../components/common/TemplateSelector'
import type { Location } from '../types'

const fields: FieldConfig[] = [
  { name: 'name', label: 'Nom', type: 'text', required: true },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'atmosphere', label: 'Atmosphere', type: 'textarea' },
  { name: 'geography', label: 'Geographie', type: 'textarea' },
  { name: 'notes', label: 'Notes', type: 'textarea' },
]

export default function LocationDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isNew = id === 'new' || !id

  const { data, isLoading } = useMcpQuery<Location>(
    'get_location',
    { id },
    { enabled: !isNew },
  )

  const toast = useToast()
  const [templateOpen, setTemplateOpen] = useState(false)
  const [templateData, setTemplateData] = useState<Record<string, string> | null>(null)
  const updateMutation = useMcpMutation('update_location', ['list_locations', 'get_location'])
  const createMutation = useMcpMutation('create_location', ['list_locations'])
  const deleteMutation = useMcpMutation('delete_location', ['list_locations'])

  if (!isNew && isLoading) {
    return <div className="p-8 text-[var(--muted-foreground)]">Chargement...</div>
  }

  async function handleSave(formData: Record<string, string>) {
    try {
      if (isNew) {
        const result = await createMutation.mutateAsync(formData)
        const created = result as Location
        toast.success('Lieu cree')
        navigate(`/locations/${created.id}`, { replace: true })
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
        toast.success('Lieu supprime')
        navigate('/locations')
      },
      onError: (err) => toast.error(err.message),
    })
  }

  const formInitialData = templateData ?? (data as unknown as Record<string, string | null>)

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[var(--foreground)]">
          {isNew ? 'Nouveau lieu' : data?.name ?? 'Lieu'}
        </h2>
        {isNew && (
          <button
            type="button"
            onClick={() => setTemplateOpen(true)}
            className="px-3 py-1.5 text-sm bg-[var(--secondary)] text-[var(--secondary-foreground)] rounded-md shadow-xs hover:opacity-80 transition-opacity"
          >
            Utiliser un template
          </button>
        )}
      </div>
      <EntityForm
        key={templateData ? 'tpl' : 'default'}
        fields={fields}
        initialData={formInitialData}
        isNew={isNew}
        onSave={handleSave}
        onDelete={isNew ? undefined : handleDelete}
        isSaving={createMutation.isPending || updateMutation.isPending}
        timestamps={data ? { created_at: (data as any).createdAt ?? data.created_at, updated_at: (data as any).updatedAt ?? data.updated_at } : undefined}
      />
      <TemplateSelector
        entityType="location"
        open={templateOpen}
        onClose={() => setTemplateOpen(false)}
        onSelect={(tpl) => setTemplateData(tpl)}
      />
    </div>
  )
}
