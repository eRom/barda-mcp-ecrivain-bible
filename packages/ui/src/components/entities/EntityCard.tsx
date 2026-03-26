import { Link } from 'react-router-dom'

interface EntityCardProps {
  id: string
  title: string
  subtitle?: string | null
  description?: string | null
  typeBadge: string
  badgeColor: string
  basePath: string
}

const BADGE_STYLES: Record<string, string> = {
  'bg-blue-500': 'bg-blue-500/10 text-blue-400',
  'bg-emerald-500': 'bg-emerald-500/10 text-emerald-400',
  'bg-amber-500': 'bg-amber-500/10 text-amber-400',
  'bg-violet-500': 'bg-purple-500/10 text-purple-400',
  'bg-pink-500': 'bg-pink-500/10 text-pink-400',
  'bg-cyan-500': 'bg-cyan-500/10 text-cyan-400',
  'bg-orange-500': 'bg-gray-500/10 text-gray-400',
}

export default function EntityCard({
  id,
  title,
  subtitle,
  description,
  typeBadge,
  badgeColor,
  basePath,
}: EntityCardProps) {
  const badgeClass = BADGE_STYLES[badgeColor] ?? 'bg-gray-500/10 text-gray-400'

  return (
    <Link
      to={`${basePath}/${id}`}
      className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-4 hover:shadow-md hover:border-[var(--border)] transition-all duration-200 block"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-[var(--card-foreground)] truncate">{title}</h3>
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${badgeClass}`}>
          {typeBadge}
        </span>
      </div>
      {subtitle && (
        <p className="text-xs text-[var(--muted-foreground)] mb-1">{subtitle}</p>
      )}
      {description && (
        <p className="text-sm text-[var(--muted-foreground)] line-clamp-2">{description}</p>
      )}
    </Link>
  )
}
