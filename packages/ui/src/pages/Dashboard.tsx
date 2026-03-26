import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMcpQuery, useMcpMutation } from '../hooks/useMcp'
import type { BibleStats } from '../types'

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

function formatDate(iso: string | null): string {
  if (!iso) return '--'
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const statCards = [
  { key: 'characters', label: 'Personnages', path: '/characters', dotClass: 'bg-blue-400', color: '#3B82F6', bg: '/bg/bg-personnages.svg' },
  { key: 'locations', label: 'Lieux', path: '/locations', dotClass: 'bg-emerald-400', color: '#10B981', bg: '/bg/bg-lieux.svg' },
  { key: 'events', label: 'Evenements', path: '/events', dotClass: 'bg-amber-400', color: '#F59E0B', bg: '/bg/bg-evenements.svg' },
  { key: 'interactions', label: 'Interactions', path: '/interactions', dotClass: 'bg-purple-400', color: '#8B5CF6', bg: '/bg/bg-interactions.svg' },
  { key: 'worldRules', label: 'Regles', path: '/world-rules', dotClass: 'bg-pink-400', color: '#EC4899', bg: '/bg/bg-regles.svg' },
  { key: 'research', label: 'Recherches', path: '/research', dotClass: 'bg-cyan-400', color: '#06B6D4', bg: '/bg/bg-recherches.svg' },
  { key: 'notes', label: 'Notes', path: '/notes', dotClass: 'bg-gray-400', color: '#9CA3AF', bg: '/bg/bg-notes.svg' },
] as const

export default function Dashboard() {
  const { data: stats, isLoading, error } = useMcpQuery<BibleStats>('get_bible_stats')
  const reindexMutation = useMcpMutation('reindex_embeddings', ['get_bible_stats'])
  const [reindexing, setReindexing] = useState(false)

  const handleReindex = async () => {
    setReindexing(true)
    try {
      await reindexMutation.mutateAsync({})
    } finally {
      setReindexing(false)
    }
  }

  if (isLoading) {
    return <div className="p-8 text-[var(--muted-foreground)]">Chargement...</div>
  }

  if (error) {
    return <div className="p-8 text-[var(--destructive)]">Erreur : {(error as Error).message}</div>
  }

  if (!stats) {
    return <div className="p-8 text-[var(--muted-foreground)]">Aucune donnee</div>
  }

  const isEmpty = stats.totalEntities === 0

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6">Tableau de bord</h2>

      {isEmpty ? (
        <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-12 text-center">
          <p className="text-xl text-[var(--foreground)] mb-2">Votre bible est vide</p>
          <p className="text-[var(--muted-foreground)] mb-6">Commencez par creer un personnage ou un lieu pour donner vie a votre univers.</p>
          <div className="flex gap-3 justify-center">
            <Link to="/characters/new" className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-md shadow-xs hover:opacity-90 transition-opacity">
              Nouveau personnage
            </Link>
            <Link to="/locations/new" className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-md shadow-xs hover:opacity-90 transition-opacity">
              Nouveau lieu
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Stats cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((card) => (
              <Link
                key={card.key}
                to={card.path}
                className="group relative overflow-hidden rounded-lg border border-[var(--border)] transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
              >
                {/* Layer 1: colored background tint */}
                <div
                  className="absolute inset-0 opacity-[0.06] dark:opacity-[0.10] transition-opacity group-hover:opacity-[0.10] dark:group-hover:opacity-[0.18]"
                  style={{ backgroundColor: card.color }}
                />

                {/* Layer 2: radial glow */}
                <div
                  className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background: `radial-gradient(circle at 80% 80%, ${card.color}15 0%, transparent 70%)`,
                  }}
                />

                {/* Layer 3: SVG illustration */}
                <div
                  className="absolute inset-0 bg-no-repeat bg-right-bottom opacity-[0.08] dark:opacity-[0.15] transition-opacity duration-300 group-hover:opacity-[0.15] dark:group-hover:opacity-[0.25]"
                  style={{
                    backgroundImage: `url(${card.bg})`,
                    backgroundSize: '75%',
                  }}
                />

                {/* Layer 4: text content */}
                <div className="relative z-10 p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-3 w-3 rounded-full ${card.dotClass} shadow-[0_0_6px_1px] transition-shadow group-hover:shadow-[0_0_10px_2px]`}
                      style={{ boxShadow: undefined, '--tw-shadow-color': card.color } as React.CSSProperties}
                    />
                    <span className="text-sm text-[var(--muted-foreground)]">{card.label}</span>
                  </div>
                  <p className="text-3xl font-bold text-[var(--foreground)] mt-2">
                    {stats.entities[card.key]}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Database info */}
          <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-4 mb-8">
            <div className="flex flex-wrap items-center gap-6 text-sm text-[var(--muted-foreground)]">
              <div>
                <span className="font-medium text-[var(--foreground)]">{stats.totalEntities}</span> entites
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-[var(--foreground)]">{stats.totalEmbeddings}</span> embeddings
                {stats.totalEmbeddings < stats.totalEntities && (
                  <button
                    onClick={handleReindex}
                    disabled={reindexing}
                    className="px-2 py-0.5 text-xs rounded border border-[var(--border)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {reindexing ? 'Indexation...' : 'Reindexer'}
                  </button>
                )}
              </div>
              <div>
                Taille : <span className="font-medium text-[var(--foreground)]">{formatBytes(stats.database.size)}</span>
              </div>
              <div>
                Modifie le <span className="font-medium text-[var(--foreground)]">{formatDate(stats.database.lastModified)}</span>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  )
}
