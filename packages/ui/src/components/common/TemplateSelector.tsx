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
      <div className="relative bg-[var(--background)] rounded-lg border border-[var(--border)] p-6 shadow-lg max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[var(--foreground)]">
            Utiliser un template
          </h3>
          <button
            onClick={onClose}
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Genre selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
            Genre litteraire
          </label>
          <select
            value={genre}
            onChange={(e) => handleGenreChange(e.target.value)}
            className="w-full h-9 rounded-md border border-[var(--input)] bg-transparent px-3 py-1 text-sm text-[var(--foreground)] focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--ring)]/50 focus:outline-none"
          >
            {GENRES.map((g) => (
              <option key={g} value={g}>{GENRE_LABELS[g] ?? g}</option>
            ))}
          </select>
        </div>

        {/* Preview */}
        {loading ? (
          <div className="py-8 text-center text-[var(--muted-foreground)]">Chargement...</div>
        ) : preview ? (
          <div className="space-y-3 mb-4">
            {Object.entries(preview).map(([key, value]) => (
              <div key={key}>
                <span className="text-xs font-medium text-[var(--muted-foreground)] uppercase">
                  {key}
                </span>
                <p className="text-sm text-[var(--foreground)] bg-[var(--muted)] rounded-lg p-2 mt-0.5">
                  {value}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-[var(--muted-foreground)]">Aucun template disponible</div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-[var(--border)]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-[var(--secondary)] text-[var(--secondary-foreground)] rounded-md shadow-xs hover:opacity-80 transition-opacity"
          >
            Annuler
          </button>
          <button
            onClick={handleUse}
            disabled={!preview}
            className="px-4 py-2 text-sm bg-[var(--primary)] text-[var(--primary-foreground)] rounded-md shadow-xs hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            Utiliser ce template
          </button>
        </div>
      </div>
    </div>
  )
}
