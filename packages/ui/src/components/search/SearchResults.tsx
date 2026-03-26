import { useNavigate } from 'react-router-dom'

interface SearchResult {
  entity_type: string
  entity_id: string
  snippet?: string
  rank?: number
  score?: number
  entity: Record<string, unknown> | null
}

interface SearchResultsProps {
  results: SearchResult[]
  isLoading: boolean
  query: string
  showScore?: boolean
}

const TYPE_LABELS: Record<string, string> = {
  character: 'Personnage',
  location: 'Lieu',
  event: 'Evenement',
  interaction: 'Interaction',
  world_rule: 'Regle',
  research: 'Recherche',
  note: 'Note',
}

const TYPE_COLORS: Record<string, string> = {
  character: 'bg-blue-100 text-blue-800',
  location: 'bg-emerald-100 text-emerald-800',
  event: 'bg-amber-100 text-amber-800',
  interaction: 'bg-violet-100 text-violet-800',
  world_rule: 'bg-pink-100 text-pink-800',
  research: 'bg-cyan-100 text-cyan-800',
  note: 'bg-gray-100 text-gray-800',
}

const TYPE_ROUTES: Record<string, string> = {
  character: '/characters',
  location: '/locations',
  event: '/events',
  interaction: '/interactions',
  world_rule: '/world-rules',
  research: '/research',
  note: '/notes',
}

function getEntityName(result: SearchResult): string {
  if (!result.entity) return result.entity_id
  const e = result.entity
  return (e.name as string) || (e.title as string) || (e.topic as string) || (e.category as string) || result.entity_id
}

function parseSnippet(snippet: string): Array<{ text: string; bold: boolean }> {
  const parts: Array<{ text: string; bold: boolean }> = []
  let remaining = snippet
  while (remaining.length > 0) {
    const openIdx = remaining.indexOf('<b>')
    if (openIdx === -1) {
      parts.push({ text: remaining, bold: false })
      break
    }
    if (openIdx > 0) {
      parts.push({ text: remaining.slice(0, openIdx), bold: false })
    }
    const closeIdx = remaining.indexOf('</b>', openIdx)
    if (closeIdx === -1) {
      parts.push({ text: remaining.slice(openIdx + 3), bold: true })
      break
    }
    parts.push({ text: remaining.slice(openIdx + 3, closeIdx), bold: true })
    remaining = remaining.slice(closeIdx + 4)
  }
  return parts
}

function groupByType(results: SearchResult[]): Record<string, SearchResult[]> {
  const groups: Record<string, SearchResult[]> = {}
  for (const r of results) {
    if (!groups[r.entity_type]) groups[r.entity_type] = []
    groups[r.entity_type].push(r)
  }
  return groups
}

export default function SearchResults({ results, isLoading, query, showScore }: SearchResultsProps) {
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-sm text-gray-500">Recherche en cours...</span>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <svg className="mx-auto h-12 w-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <p>Aucun resultat pour &laquo;&nbsp;{query}&nbsp;&raquo;</p>
      </div>
    )
  }

  const grouped = groupByType(results)

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([type, items]) => (
        <section key={type}>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
            {TYPE_LABELS[type] ?? type} ({items.length})
          </h3>
          <div className="space-y-2">
            {items.map((item) => (
              <button
                key={item.entity_id}
                onClick={() => navigate(`${TYPE_ROUTES[item.entity_type] ?? ''}/${item.entity_id}`)}
                className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${TYPE_COLORS[item.entity_type] ?? 'bg-gray-100 text-gray-800'}`}>
                    {TYPE_LABELS[item.entity_type] ?? item.entity_type}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {getEntityName(item)}
                  </span>
                  {showScore && item.score != null && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-full">
                      {Math.round(item.score * 100)}%
                    </span>
                  )}
                </div>
                {item.snippet ? (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {parseSnippet(item.snippet).map((part, i) =>
                      part.bold ? (
                        <strong key={i} className="text-gray-900 bg-yellow-100 px-0.5 rounded">
                          {part.text}
                        </strong>
                      ) : (
                        <span key={i}>{part.text}</span>
                      ),
                    )}
                  </p>
                ) : item.entity ? (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {(item.entity.description as string) ?? (item.entity.content as string) ?? ''}
                  </p>
                ) : null}
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
