import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSigma } from '@react-sigma/core'
import { ENTITY_COLORS, ENTITY_LABELS, type GraphNode, type EntityType } from '../../hooks/useGraph'

interface NodeDetailProps {
  node: GraphNode
  onClose: () => void
}

function entityRoute(type: EntityType): string {
  switch (type) {
    case 'character':
      return '/characters'
    case 'location':
      return '/locations'
    case 'event':
      return '/events'
    case 'interaction':
      return '/interactions'
    case 'world_rule':
      return '/world-rules'
  }
}

export default function NodeDetail({ node, onClose }: NodeDetailProps) {
  const navigate = useNavigate()
  const sigma = useSigma()

  const neighbors = useMemo(() => {
    const graph = sigma.getGraph()
    if (!graph.hasNode(node.id)) return []
    return graph.mapNeighbors(node.id, (neighborId, attrs) => ({
      id: neighborId,
      label: attrs.label as string,
      type: attrs.entityType as EntityType,
    }))
  }, [sigma, node.id])

  const description = node.description
    ? node.description.length > 200
      ? node.description.slice(0, 200) + '...'
      : node.description
    : null

  return (
    <div className="flex h-full w-80 flex-col border-l border-[var(--border)] bg-[var(--card)]">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-[var(--border)] p-4">
        <div className="min-w-0 flex-1">
          <span
            className="mb-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white"
            style={{ backgroundColor: ENTITY_COLORS[node.type] }}
          >
            {ENTITY_LABELS[node.type]}
          </span>
          <h3 className="truncate text-lg font-semibold text-[var(--foreground)]">{node.label}</h3>
        </div>
        <button
          onClick={onClose}
          className="ml-2 rounded p-1 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {description && <p className="mb-4 text-sm leading-relaxed text-[var(--muted-foreground)]">{description}</p>}

        <button
          onClick={() => navigate(`${entityRoute(node.type)}/${node.id}`)}
          className="mb-6 w-full rounded-md bg-[var(--secondary)] px-4 py-2 text-sm font-medium text-[var(--secondary-foreground)] shadow-xs transition-opacity hover:opacity-80"
        >
          Voir la fiche complete
        </button>

        {/* Connexions */}
        {neighbors.length > 0 && (
          <div>
            <h4 className="mb-2 text-xs font-semibold tracking-wide text-[var(--muted-foreground)] uppercase">
              Connexions ({neighbors.length})
            </h4>
            <ul className="space-y-1">
              {neighbors.map((n) => (
                <li
                  key={n.id}
                  className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 transition-colors hover:bg-[var(--accent)]"
                  onClick={() =>
                    navigate(`${entityRoute(n.type)}/${n.id}`)
                  }
                >
                  <span
                    className="inline-block h-2 w-2 flex-shrink-0 rounded-full"
                    style={{ backgroundColor: ENTITY_COLORS[n.type] }}
                  />
                  <span className="truncate text-sm text-[var(--foreground)]">{n.label}</span>
                  <span className="ml-auto text-xs text-[var(--muted-foreground)]">{ENTITY_LABELS[n.type]}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
