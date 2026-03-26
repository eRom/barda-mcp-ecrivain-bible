import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useMcpQuery } from '../../hooks/useMcp'

interface EntityListProps<T> {
  toolName: string
  entityType: string
  createPath: string
  extractItems: (data: unknown) => T[]
  renderCard: (item: T) => ReactNode
  keyExtractor: (item: T) => string
}

export default function EntityList<T>({
  toolName,
  entityType,
  createPath,
  extractItems,
  renderCard,
  keyExtractor,
}: EntityListProps<T>) {
  const [offset, setOffset] = useState(0)
  const limit = 50

  const { data, isLoading, error } = useMcpQuery(toolName, { limit, offset })

  const items = data ? extractItems(data) : []

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[var(--foreground)]">{entityType}</h2>
        <Link
          to={createPath}
          className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-md shadow-xs hover:opacity-90 transition-opacity text-sm"
        >
          + Creer
        </Link>
      </div>

      {isLoading && (
        <div className="text-[var(--muted-foreground)]">Chargement...</div>
      )}

      {error && (
        <div className="text-[var(--destructive)]">Erreur : {(error as Error).message}</div>
      )}

      {!isLoading && !error && items.length === 0 && (
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-12 text-center">
          <p className="text-[var(--muted-foreground)] mb-4">Aucun element pour le moment.</p>
          <Link
            to={createPath}
            className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-md shadow-xs hover:opacity-90 transition-opacity text-sm"
          >
            Creer le premier
          </Link>
        </div>
      )}

      {items.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div key={keyExtractor(item)}>{renderCard(item)}</div>
            ))}
          </div>

          {/* Pagination */}
          {(items.length >= limit || offset > 0) && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <button
                onClick={() => setOffset(Math.max(0, offset - limit))}
                disabled={offset === 0}
                className="px-3 py-1.5 text-sm bg-[var(--secondary)] text-[var(--secondary-foreground)] rounded-md shadow-xs hover:opacity-80 disabled:opacity-30 transition-opacity"
              >
                Precedent
              </button>
              <span className="text-sm text-[var(--muted-foreground)]">
                {offset + 1} - {offset + items.length}
              </span>
              <button
                onClick={() => setOffset(offset + limit)}
                disabled={items.length < limit}
                className="px-3 py-1.5 text-sm bg-[var(--secondary)] text-[var(--secondary-foreground)] rounded-md shadow-xs hover:opacity-80 disabled:opacity-30 transition-opacity"
              >
                Suivant
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
