import { useState, useEffect } from 'react'
import ConfirmDialog from '../common/ConfirmDialog'

export interface FieldConfig {
  name: string
  label: string
  type: 'text' | 'textarea'
  required?: boolean
}

interface EntityFormProps {
  fields: FieldConfig[]
  initialData?: Record<string, string | null>
  isNew?: boolean
  onSave: (data: Record<string, string>) => void
  onDelete?: () => void
  isSaving?: boolean
  timestamps?: { created_at: number; updated_at: number }
}

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function EntityForm({
  fields,
  initialData,
  isNew = false,
  onSave,
  onDelete,
  isSaving = false,
  timestamps,
}: EntityFormProps) {
  const [editing, setEditing] = useState(isNew)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    const data: Record<string, string> = {}
    fields.forEach((f) => {
      data[f.name] = initialData?.[f.name] ?? ''
    })
    setFormData(data)
  }, [initialData, fields])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const cleaned: Record<string, string> = {}
    fields.forEach((f) => {
      const val = formData[f.name]?.trim() ?? ''
      if (val) cleaned[f.name] = val
    })
    onSave(cleaned)
    if (!isNew) setEditing(false)
  }

  function handleCancel() {
    const data: Record<string, string> = {}
    fields.forEach((f) => {
      data[f.name] = initialData?.[f.name] ?? ''
    })
    setFormData(data)
    setEditing(false)
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isNew && (
          <div className="flex items-center justify-between mb-4">
            {!editing ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 text-sm bg-[var(--primary)] text-[var(--primary-foreground)] rounded-md shadow-xs hover:opacity-90 transition-opacity"
                >
                  Editer
                </button>
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteDialog(true)}
                    className="px-4 py-2 text-sm bg-[var(--destructive)] text-white rounded-md shadow-xs hover:opacity-90 transition-opacity"
                  >
                    Supprimer
                  </button>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 text-sm bg-[var(--primary)] text-[var(--primary-foreground)] rounded-md shadow-xs hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm bg-[var(--secondary)] text-[var(--secondary-foreground)] rounded-md shadow-xs hover:opacity-80 transition-opacity"
                >
                  Annuler
                </button>
              </div>
            )}

            {timestamps && (
              <div className="text-xs text-[var(--muted-foreground)]">
                Cree le {formatTimestamp(timestamps.created_at)}
                {' | '}
                Modifie le {formatTimestamp(timestamps.updated_at)}
              </div>
            )}
          </div>
        )}

        {isNew && (
          <div className="flex gap-2 mb-4">
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 text-sm bg-[var(--primary)] text-[var(--primary-foreground)] rounded-md shadow-xs hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {isSaving ? 'Creation...' : 'Creer'}
            </button>
          </div>
        )}

        {fields.map((field) => (
          <div key={field.name}>
            <label htmlFor={`field-${field.name}`} className="block text-sm font-medium text-[var(--foreground)] mb-1">
              {field.label}
              {field.required && <span className="text-[var(--destructive)] ml-0.5">*</span>}
            </label>
            {field.type === 'textarea' ? (
              <textarea
                id={`field-${field.name}`}
                value={formData[field.name] ?? ''}
                onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                disabled={!editing}
                required={field.required}
                rows={5}
                className="w-full h-auto rounded-md border border-[var(--input)] bg-transparent px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--ring)]/50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            ) : (
              <input
                id={`field-${field.name}`}
                type="text"
                value={formData[field.name] ?? ''}
                onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                disabled={!editing}
                required={field.required}
                className="w-full h-9 rounded-md border border-[var(--input)] bg-transparent px-3 py-1 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--ring)]/50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            )}
          </div>
        ))}
      </form>

      <ConfirmDialog
        open={showDeleteDialog}
        title="Confirmer la suppression"
        message="Cette action est irreversible. Voulez-vous vraiment supprimer cet element ?"
        onConfirm={() => {
          setShowDeleteDialog(false)
          onDelete?.()
        }}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </>
  )
}
