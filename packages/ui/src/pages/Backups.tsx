import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useMcpQuery, useMcpMutation } from '../hooks/useMcp'
import { useToast } from '../hooks/useToast'
import ConfirmDialog from '../components/common/ConfirmDialog'

interface Backup {
  name: string
  size: number
  modifiedAt: string
}

interface BackupListResponse {
  total: number
  backups: Backup[]
  message?: string
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function Backups() {
  const toast = useToast()
  const queryClient = useQueryClient()
  const [label, setLabel] = useState('')
  const [restoreTarget, setRestoreTarget] = useState<string | null>(null)

  const { data, isLoading } = useMcpQuery<BackupListResponse>('list_backups')
  const backupMutation = useMcpMutation('backup_bible', ['list_backups'])
  const restoreMutation = useMcpMutation('restore_bible', ['list_backups'])

  const backups = data?.backups ?? []

  function handleBackup() {
    const params: Record<string, unknown> = {}
    if (label.trim()) params.label = label.trim()
    backupMutation.mutate(params, {
      onSuccess: () => {
        toast.success('Sauvegarde creee')
        setLabel('')
      },
      onError: (err) => toast.error(err.message),
    })
  }

  function handleRestore() {
    if (!restoreTarget) return
    restoreMutation.mutate({ backup_name: restoreTarget }, {
      onSuccess: () => {
        toast.success('Bible restauree avec succes')
        setRestoreTarget(null)
        // Invalidate all queries to reload fresh data
        queryClient.invalidateQueries()
      },
      onError: (err) => {
        toast.error(err.message)
        setRestoreTarget(null)
      },
    })
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold text-[var(--foreground)] mb-6">Sauvegardes</h2>

      {/* Create backup */}
      <div className="flex items-end gap-3 mb-8 p-4 bg-[var(--card)] border border-[var(--border)] rounded-lg">
        <div className="flex-1">
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
            Label (optionnel)
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="ex: avant-refonte-chapitre-3"
            className="w-full h-9 rounded-md border border-[var(--input)] bg-transparent px-3 py-1 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-[var(--ring)] focus:ring-2 focus:ring-[var(--ring)]/50 focus:outline-none"
          />
        </div>
        <button
          onClick={handleBackup}
          disabled={backupMutation.isPending}
          className="px-4 py-2 text-sm font-medium bg-[var(--primary)] text-[var(--primary-foreground)] rounded-md shadow-xs hover:opacity-90 disabled:opacity-50 whitespace-nowrap transition-opacity"
        >
          {backupMutation.isPending ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </div>

      {/* Backup list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 border-2 border-[var(--ring)] border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 text-sm text-[var(--muted-foreground)]">Chargement...</span>
        </div>
      ) : backups.length === 0 ? (
        <div className="text-center py-12 text-[var(--muted-foreground)]">
          <p>Aucune sauvegarde disponible.</p>
          <p className="text-sm mt-1">Cliquez sur "Sauvegarder" pour creer votre premiere sauvegarde.</p>
        </div>
      ) : (
        <div className="border border-[var(--border)] rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--muted)] border-b border-[var(--border)]">
                <th className="text-left px-4 py-2 font-medium text-[var(--muted-foreground)]">Nom</th>
                <th className="text-left px-4 py-2 font-medium text-[var(--muted-foreground)]">Date</th>
                <th className="text-right px-4 py-2 font-medium text-[var(--muted-foreground)]">Taille</th>
                <th className="text-right px-4 py-2 font-medium text-[var(--muted-foreground)]">Action</th>
              </tr>
            </thead>
            <tbody>
              {backups.map((b) => (
                <tr key={b.name} className="border-b border-[var(--border)] hover:bg-[var(--accent)]">
                  <td className="px-4 py-2 font-mono text-xs text-[var(--foreground)] truncate max-w-[200px]">
                    {b.name}
                  </td>
                  <td className="px-4 py-2 text-[var(--muted-foreground)]">
                    {formatDate(b.modifiedAt)}
                  </td>
                  <td className="px-4 py-2 text-right text-[var(--muted-foreground)]">
                    {formatSize(b.size)}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => setRestoreTarget(b.name)}
                      disabled={restoreMutation.isPending}
                      className="text-xs px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-md hover:opacity-80 disabled:opacity-50 transition-opacity"
                    >
                      Restaurer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={restoreTarget !== null}
        title="Restaurer cette sauvegarde ?"
        message={`La bible actuelle sera sauvegardee automatiquement puis remplacee par "${restoreTarget}". Un redemarrage du serveur peut etre necessaire.`}
        confirmLabel="Restaurer"
        onConfirm={handleRestore}
        onCancel={() => setRestoreTarget(null)}
      />
    </div>
  )
}
