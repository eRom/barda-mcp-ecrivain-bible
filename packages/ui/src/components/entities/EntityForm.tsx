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
                  className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Editer
                </button>
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteDialog(true)}
                    className="px-3 py-1.5 text-sm border border-red-300 dark:border-red-700 text-red-500 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30"
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
                  className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Annuler
                </button>
              </div>
            )}

            {timestamps && (
              <div className="text-xs text-gray-400">
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
              className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {isSaving ? 'Creation...' : 'Creer'}
            </button>
          </div>
        )}

        {fields.map((field) => (
          <div key={field.name}>
            <label htmlFor={`field-${field.name}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {field.type === 'textarea' ? (
              <textarea
                id={`field-${field.name}`}
                value={formData[field.name] ?? ''}
                onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                disabled={!editing}
                required={field.required}
                rows={5}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-600 dark:disabled:text-gray-400"
              />
            ) : (
              <input
                id={`field-${field.name}`}
                type="text"
                value={formData[field.name] ?? ''}
                onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                disabled={!editing}
                required={field.required}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:text-gray-600 dark:disabled:text-gray-400"
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
