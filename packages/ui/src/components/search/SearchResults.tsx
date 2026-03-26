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

const TYPE_BADGE_STYLES: Record<string, string> = {
  character: 'bg-blue-500/10 text-blue-400',
  location: 'bg-emerald-500/10 text-emerald-400',
  event: 'bg-amber-500/10 text-amber-400',
  interaction: 'bg-purple-500/10 text-purple-400',
  world_rule: 'bg-pink-500/10 text-pink-400',
  research: 'bg-cyan-500/10 text-cyan-400',
  note: 'bg-gray-500/10 text-gray-400',
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
        <div className="h-6 w-6 border-2 border-[var(--ring)] border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-sm text-[var(--muted-foreground)]">Recherche en cours...</span>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12 text-[var(--muted-foreground)]">
        <svg className="mx-auto h-12 w-12 mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <h3 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wide mb-2">
            {TYPE_LABELS[type] ?? type} ({items.length})
          </h3>
          <div className="space-y-2">
            {items.map((item) => (
              <button
                key={item.entity_id}
                onClick={() => navigate(`${TYPE_ROUTES[item.entity_type] ?? ''}/${item.entity_id}`)}
                className="w-full text-left p-3 bg-[var(--card)] border border-[var(--border)] rounded-lg hover:shadow-md hover:border-[var(--border)] transition-all duration-200"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${TYPE_BADGE_STYLES[item.entity_type] ?? 'bg-gray-500/10 text-gray-400'}`}>
                    {TYPE_LABELS[item.entity_type] ?? item.entity_type}
                  </span>
                  <span className="text-sm font-medium text-[var(--foreground)]">
                    {getEntityName(item)}
                  </span>
                  {showScore && item.score != null && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded-full">
                      {Math.round(item.score * 100)}%
                    </span>
                  )}
                </div>
                {item.snippet ? (
                  <p className="text-sm text-[var(--muted-foreground)] line-clamp-2">
                    {parseSnippet(item.snippet).map((part, i) =>
                      part.bold ? (
                        <strong key={i} className="text-[var(--foreground)] bg-amber-500/10 px-0.5 rounded">
                          {part.text}
                        </strong>
                      ) : (
                        <span key={i}>{part.text}</span>
                      ),
                    )}
                  </p>
                ) : item.entity ? (
                  <p className="text-sm text-[var(--muted-foreground)] line-clamp-2">
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
