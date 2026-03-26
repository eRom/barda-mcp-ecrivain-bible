interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Supprimer',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-[var(--background)] rounded-lg border border-[var(--border)] p-6 shadow-lg max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">{title}</h3>
        <p className="text-sm text-[var(--muted-foreground)] mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm bg-[var(--secondary)] text-[var(--secondary-foreground)] rounded-md shadow-xs hover:opacity-80 transition-opacity"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm bg-[var(--destructive)] text-white rounded-md shadow-xs hover:opacity-90 transition-opacity"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
