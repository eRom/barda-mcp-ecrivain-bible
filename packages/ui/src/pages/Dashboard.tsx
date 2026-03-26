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
  { key: 'characters', label: 'Personnages', path: '/characters', color: 'bg-blue-500' },
  { key: 'locations', label: 'Lieux', path: '/locations', color: 'bg-emerald-500' },
  { key: 'events', label: 'Evenements', path: '/events', color: 'bg-amber-500' },
  { key: 'interactions', label: 'Interactions', path: '/interactions', color: 'bg-violet-500' },
  { key: 'worldRules', label: 'Regles', path: '/world-rules', color: 'bg-pink-500' },
  { key: 'research', label: 'Recherches', path: '/research', color: 'bg-cyan-500' },
  { key: 'notes', label: 'Notes', path: '/notes', color: 'bg-orange-500' },
] as const

export default function Dashboard() {
  const { data: stats, isLoading, error } = useMcpQuery<BibleStats>('get_bible_stats')

  if (isLoading) {
    return <div className="p-8 text-gray-500">Chargement...</div>
  }

  if (error) {
    return <div className="p-8 text-red-500">Erreur : {(error as Error).message}</div>
  }

  if (!stats) {
    return <div className="p-8 text-gray-500">Aucune donnee</div>
  }

  const isEmpty = stats.totalEntities === 0

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Tableau de bord</h2>

      {isEmpty ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">Votre bible est vide</p>
          <p className="text-gray-400 mb-6">Commencez par creer un personnage ou un lieu pour donner vie a votre univers.</p>
          <div className="flex gap-3 justify-center">
            <Link to="/characters/new" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              Nouveau personnage
            </Link>
            <Link to="/locations/new" className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
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
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${card.color}`} />
                  <span className="text-sm text-gray-500 dark:text-gray-400">{card.label}</span>
                </div>
                <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-2">
                  {stats.entities[card.key]}
                </p>
              </Link>
            ))}
          </div>

          {/* Database info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-8">
            <div className="flex flex-wrap gap-6 text-sm text-gray-500 dark:text-gray-400">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">{stats.totalEntities}</span> entites
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">{stats.totalEmbeddings}</span> embeddings
              </div>
              <div>
                Taille : <span className="font-medium text-gray-700 dark:text-gray-300">{formatBytes(stats.database.size)}</span>
              </div>
              <div>
                Modifie le <span className="font-medium text-gray-700 dark:text-gray-300">{formatDate(stats.database.lastModified)}</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/characters/new"
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow text-center"
        >
          <div className="text-2xl mb-1">P+</div>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Nouveau personnage</div>
        </Link>
        <Link
          to="/locations/new"
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow text-center"
        >
          <div className="text-2xl mb-1">L+</div>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Nouveau lieu</div>
        </Link>
        <Link
          to="/backups"
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow text-center"
        >
          <div className="text-2xl mb-1">B</div>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Backup</div>
        </Link>
        <Link
          to="/graph"
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow text-center"
        >
          <div className="text-2xl mb-1">G</div>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Explorer le graph</div>
        </Link>
      </div>
    </div>
  )
}
