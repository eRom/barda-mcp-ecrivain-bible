import { useState } from 'react'
import { callTool } from '../../api/mcp-client'

const GENRES = ['fantasy', 'polar', 'sf', 'historique', 'romance'] as const

const GENRE_LABELS: Record<string, string> = {
  fantasy: 'Fantasy',
  polar: 'Polar / Thriller',
  sf: 'Science-fiction',
  historique: 'Historique',
  romance: 'Romance',
}

interface TemplateSelectorProps {
  entityType: 'character' | 'location' | 'world_rule'
  open: boolean
  onClose: () => void
  onSelect: (data: Record<string, string>) => void
}

export default function TemplateSelector({
  entityType,
  open,
  onClose,
  onSelect,
}: TemplateSelectorProps) {
  const [genre, setGenre] = useState<string>(GENRES[0])
  const [preview, setPreview] = useState<Record<string, string> | null>(null)
  const [loading, setLoading] = useState(false)

  async function loadPreview(g: string) {
    setLoading(true)
    try {
      const result = await callTool('get_template', { genre: g, entity_type: entityType }) as {
        template?: Record<string, string>
      }
      setPreview(result.template ?? null)
    } catch {
      setPreview(null)
    } finally {
      setLoading(false)
    }
  }

  async function handleGenreChange(g: string) {
    setGenre(g)
    await loadPreview(g)
  }

  function handleUse() {
    if (preview) {
      onSelect(preview)
      onClose()
    }
  }

  // Load preview on open
  if (open && !preview && !loading) {
    loadPreview(genre)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Utiliser un template
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Genre selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Genre litteraire
          </label>
          <select
            value={genre}
            onChange={(e) => handleGenreChange(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {GENRES.map((g) => (
              <option key={g} value={g}>{GENRE_LABELS[g] ?? g}</option>
            ))}
          </select>
        </div>

        {/* Preview */}
        {loading ? (
          <div className="py-8 text-center text-gray-400">Chargement...</div>
        ) : preview ? (
          <div className="space-y-3 mb-4">
            {Object.entries(preview).map(([key, value]) => (
              <div key={key}>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  {key}
                </span>
                <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-lg p-2 mt-0.5">
                  {value}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-400">Aucun template disponible</div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Annuler
          </button>
          <button
            onClick={handleUse}
            disabled={!preview}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            Utiliser ce template
          </button>
        </div>
      </div>
    </div>
  )
}
