import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useMcpQuery } from '../hooks/useMcp'
import SearchResults from '../components/search/SearchResults'

const ENTITY_TYPES = [
  { value: '', label: 'Tous' },
  { value: 'character', label: 'Personnages' },
  { value: 'location', label: 'Lieux' },
  { value: 'event', label: 'Evenements' },
  { value: 'interaction', label: 'Interactions' },
  { value: 'world_rule', label: 'Regles' },
  { value: 'research', label: 'Recherches' },
  { value: 'note', label: 'Notes' },
]

interface FulltextResult {
  entity_type: string
  entity_id: string
  snippet: string
  rank: number
  entity: Record<string, unknown> | null
}

interface SemanticResult {
  entity_type: string
  entity_id: string
  score: number
  entity: Record<string, unknown> | null
}

interface SearchResponse {
  results: Array<FulltextResult | SemanticResult>
  message?: string
}

export default function Search() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const [typeFilter, setTypeFilter] = useState('')
  const [mode, setMode] = useState<'fulltext' | 'semantic'>('fulltext')
  const [threshold, setThreshold] = useState(0.5)

  const fulltextParams: Record<string, unknown> = { query, limit: 20 }
  if (typeFilter) fulltextParams.entity_type = typeFilter

  const semanticParams: Record<string, unknown> = { query, limit: 20, threshold }
  if (typeFilter) semanticParams.entity_type = typeFilter

  const { data: fulltextData, isLoading: ftLoading } = useMcpQuery<SearchResponse>(
    'search_fulltext',
    fulltextParams,
    { enabled: !!query && mode === 'fulltext' },
  )

  const { data: semanticData, isLoading: semLoading } = useMcpQuery<SearchResponse>(
    'search_semantic',
    semanticParams,
    { enabled: !!query && mode === 'semantic' },
  )

  const data = mode === 'fulltext' ? fulltextData : semanticData
  const isLoading = mode === 'fulltext' ? ftLoading : semLoading
  const results = data?.results ?? []

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">
        {query ? (
          <>Recherche : &laquo;&nbsp;{query}&nbsp;&raquo;</>
        ) : (
          'Recherche'
        )}
      </h2>

      {query && (
        <>
          {/* Mode toggle */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex rounded-md border border-[var(--border)] overflow-hidden">
              <button
                onClick={() => setMode('fulltext')}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  mode === 'fulltext'
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                    : 'bg-transparent text-[var(--muted-foreground)] hover:bg-[var(--accent)]'
                }`}
              >
                Exacte
              </button>
              <button
                onClick={() => setMode('semantic')}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  mode === 'semantic'
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                    : 'bg-transparent text-[var(--muted-foreground)] hover:bg-[var(--accent)]'
                }`}
              >
                Semantique
              </button>
            </div>

            {/* Threshold slider (semantic only) */}
            {mode === 'semantic' && (
              <div className="flex items-center gap-2">
                <label className="text-xs text-[var(--muted-foreground)]">Seuil :</label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={threshold}
                  onChange={(e) => setThreshold(parseFloat(e.target.value))}
                  className="w-24 h-1 accent-[var(--ring)]"
                />
                <span className="text-xs font-mono text-[var(--muted-foreground)] w-8">{threshold.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Type filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            {ENTITY_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => setTypeFilter(t.value)}
                className={`text-xs px-3 py-1 rounded-full border transition-all duration-200 ${
                  typeFilter === t.value
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)]'
                    : 'bg-transparent text-[var(--muted-foreground)] border-[var(--border)] hover:border-[var(--ring)]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </>
      )}

      {query ? (
        <>
          {data?.message && results.length === 0 && (
            <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-sm text-amber-400">
              {data.message}
            </div>
          )}
          <SearchResults
            results={results}
            isLoading={isLoading}
            query={query}
            showScore={mode === 'semantic'}
          />
        </>
      ) : (
        <div className="text-center py-12 text-[var(--muted-foreground)]">
          <svg className="mx-auto h-16 w-16 mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p>Tapez un terme dans la barre de recherche pour explorer la bible.</p>
        </div>
      )}
    </div>
  )
}
