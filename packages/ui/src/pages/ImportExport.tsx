import { useState, useCallback } from 'react'
import { useMcpMutation } from '../hooks/useMcp'
import { useToast } from '../hooks/useToast'
import { callTool } from '../api/mcp-client'

const ENTITY_TYPES = [
  { value: '', label: 'Tout exporter' },
  { value: 'character', label: 'Personnages' },
  { value: 'location', label: 'Lieux' },
  { value: 'event', label: 'Evenements' },
  { value: 'interaction', label: 'Interactions' },
  { value: 'world_rule', label: 'Regles du monde' },
  { value: 'research', label: 'Recherches' },
  { value: 'note', label: 'Notes' },
]

interface ImportPreview {
  fileName: string
  data: Record<string, unknown>
  counts: Record<string, number>
  total: number
}

export default function ImportExport() {
  const toast = useToast()

  // Export state
  const [exportType, setExportType] = useState('')
  const [exporting, setExporting] = useState(false)

  // Import state
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [onConflict, setOnConflict] = useState<'skip' | 'update'>('skip')
  const [dragOver, setDragOver] = useState(false)
  const importMutation = useMcpMutation('import_bulk', [
    'list_characters', 'list_locations', 'list_events',
    'list_interactions', 'list_world_rules', 'list_research', 'list_notes',
    'get_bible_stats',
  ])
  const [importResult, setImportResult] = useState<Record<string, unknown> | null>(null)

  async function handleExport() {
    setExporting(true)
    try {
      const params: Record<string, unknown> = {}
      if (exportType) params.entity_type = exportType
      const result = await callTool('export_bible', params) as { markdown?: string; content?: string }
      const content = result.markdown ?? result.content ?? JSON.stringify(result, null, 2)
      const blob = new Blob([content as string], { type: 'text/markdown;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bible-export${exportType ? `-${exportType}` : ''}.md`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Export telecharge')
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setExporting(false)
    }
  }

  function parseImportFile(file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        const counts: Record<string, number> = {}
        let total = 0

        // Count entities by type
        const typeMappings = [
          'characters', 'locations', 'events',
          'interactions', 'world_rules', 'research', 'notes',
        ]
        for (const key of typeMappings) {
          if (Array.isArray(data[key])) {
            counts[key] = data[key].length
            total += data[key].length
          }
        }

        // Handle flat array format
        if (Array.isArray(data)) {
          counts['entites'] = data.length
          total = data.length
        }

        setPreview({ fileName: file.name, data, counts, total })
        setImportResult(null)
      } catch {
        toast.error('Fichier JSON invalide')
      }
    }
    reader.readAsText(file)
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) parseImportFile(file)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && file.name.endsWith('.json')) {
      parseImportFile(file)
    } else {
      toast.error('Seuls les fichiers .json sont acceptes')
    }
  }, [])

  function handleImport() {
    if (!preview) return
    importMutation.mutate(
      { data: preview.data, on_conflict: onConflict },
      {
        onSuccess: (result) => {
          setImportResult(result as Record<string, unknown>)
          toast.success('Import termine')
        },
        onError: (err) => toast.error(err.message),
      },
    )
  }

  function handleClearPreview() {
    setPreview(null)
    setImportResult(null)
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-8">Import / Export</h2>

      {/* Export section */}
      <section className="mb-10">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Exporter</h3>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Exportez votre bible en Markdown. Vous pouvez filtrer par type d'entite.
          </p>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type
              </label>
              <select
                value={exportType}
                onChange={(e) => setExportType(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ENTITY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="px-4 py-2 text-sm font-medium bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 whitespace-nowrap"
            >
              {exporting ? 'Export...' : 'Exporter en Markdown'}
            </button>
          </div>
        </div>
      </section>

      {/* Import section */}
      <section>
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Importer</h3>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          {!preview ? (
            <>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Importez un fichier JSON contenant des entites.
              </p>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragOver
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Glissez un fichier .json ici
                </p>
                <label className="inline-block px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer">
                  Ou choisir un fichier
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
            </>
          ) : (
            <>
              {/* Preview */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Fichier : {preview.fileName}
                  </h4>
                  <button
                    onClick={handleClearPreview}
                    className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    Changer de fichier
                  </button>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 space-y-1">
                  {Object.entries(preview.counts).map(([type, count]) => (
                    <div key={type} className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300 capitalize">{type}</span>
                      <span className="font-medium text-gray-800 dark:text-gray-100">{count}</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-1 mt-1 flex justify-between text-sm font-semibold">
                    <span className="text-gray-700 dark:text-gray-200">Total</span>
                    <span className="text-gray-800 dark:text-gray-100">{preview.total}</span>
                  </div>
                </div>
              </div>

              {/* on_conflict choice */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  En cas de doublon
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                    <input
                      type="radio"
                      name="on_conflict"
                      value="skip"
                      checked={onConflict === 'skip'}
                      onChange={() => setOnConflict('skip')}
                      className="text-blue-500"
                    />
                    Ignorer les doublons
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                    <input
                      type="radio"
                      name="on_conflict"
                      value="update"
                      checked={onConflict === 'update'}
                      onChange={() => setOnConflict('update')}
                      className="text-blue-500"
                    />
                    Ecraser les doublons
                  </label>
                </div>
              </div>

              {/* Import button */}
              <button
                onClick={handleImport}
                disabled={importMutation.isPending}
                className="px-4 py-2 text-sm font-medium bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50"
              >
                {importMutation.isPending ? 'Importation...' : `Importer ${preview.total} entites`}
              </button>

              {/* Import result */}
              {importResult && (
                <div className="mt-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-emerald-800 dark:text-emerald-300 mb-2">Resultat</h4>
                  <div className="space-y-1 text-sm text-emerald-700 dark:text-emerald-400">
                    {importResult.imported !== undefined && (
                      <p>Importes : {String(importResult.imported)}</p>
                    )}
                    {importResult.skipped !== undefined && Number(importResult.skipped) > 0 && (
                      <p>Ignores : {String(importResult.skipped)}</p>
                    )}
                    {importResult.errors !== undefined && Number(importResult.errors) > 0 && (
                      <p className="text-red-600 dark:text-red-400">Erreurs : {String(importResult.errors)}</p>
                    )}
                    {typeof importResult.message === 'string' && (
                      <p>{importResult.message}</p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}
