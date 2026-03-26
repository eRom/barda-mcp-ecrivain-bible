import { Link } from 'react-router-dom'
import { useMcpQuery } from '../hooks/useMcp'
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
  { key: 'characters', label: 'Personnages', path: '/characters', badgeClass: 'bg-blue-500/10 text-blue-400', dotClass: 'bg-blue-400' },
  { key: 'locations', label: 'Lieux', path: '/locations', badgeClass: 'bg-emerald-500/10 text-emerald-400', dotClass: 'bg-emerald-400' },
  { key: 'events', label: 'Evenements', path: '/events', badgeClass: 'bg-amber-500/10 text-amber-400', dotClass: 'bg-amber-400' },
  { key: 'interactions', label: 'Interactions', path: '/interactions', badgeClass: 'bg-purple-500/10 text-purple-400', dotClass: 'bg-purple-400' },
  { key: 'worldRules', label: 'Regles', path: '/world-rules', badgeClass: 'bg-pink-500/10 text-pink-400', dotClass: 'bg-pink-400' },
  { key: 'research', label: 'Recherches', path: '/research', badgeClass: 'bg-cyan-500/10 text-cyan-400', dotClass: 'bg-cyan-400' },
  { key: 'notes', label: 'Notes', path: '/notes', badgeClass: 'bg-gray-500/10 text-gray-400', dotClass: 'bg-gray-400' },
] as const

export default function Dashboard() {
  const { data: stats, isLoading, error } = useMcpQuery<BibleStats>('get_bible_stats')

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
                className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-4 hover:shadow-md hover:border-[var(--border)] transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${card.dotClass}`} />
                  <span className="text-sm text-[var(--muted-foreground)]">{card.label}</span>
                </div>
                <p className="text-3xl font-bold text-[var(--foreground)] mt-2">
                  {stats.entities[card.key]}
                </p>
              </Link>
            ))}
          </div>

          {/* Database info */}
          <div className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-4 mb-8">
            <div className="flex flex-wrap gap-6 text-sm text-[var(--muted-foreground)]">
              <div>
                <span className="font-medium text-[var(--foreground)]">{stats.totalEntities}</span> entites
              </div>
              <div>
                <span className="font-medium text-[var(--foreground)]">{stats.totalEmbeddings}</span> embeddings
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

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/characters/new"
          className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-4 hover:shadow-md hover:border-[var(--border)] transition-all duration-200 text-center"
        >
          <div className="text-2xl mb-1">P+</div>
          <div className="text-sm font-medium text-[var(--foreground)]">Nouveau personnage</div>
        </Link>
        <Link
          to="/locations/new"
          className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-4 hover:shadow-md hover:border-[var(--border)] transition-all duration-200 text-center"
        >
          <div className="text-2xl mb-1">L+</div>
          <div className="text-sm font-medium text-[var(--foreground)]">Nouveau lieu</div>
        </Link>
        <Link
          to="/backups"
          className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-4 hover:shadow-md hover:border-[var(--border)] transition-all duration-200 text-center"
        >
          <div className="text-2xl mb-1">B</div>
          <div className="text-sm font-medium text-[var(--foreground)]">Backup</div>
        </Link>
        <Link
          to="/graph"
          className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-4 hover:shadow-md hover:border-[var(--border)] transition-all duration-200 text-center"
        >
          <div className="text-2xl mb-1">G</div>
          <div className="text-sm font-medium text-[var(--foreground)]">Explorer le graph</div>
        </Link>
      </div>
    </div>
  )
}
