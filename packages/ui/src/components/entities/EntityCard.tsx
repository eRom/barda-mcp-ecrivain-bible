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

export default function EntityCard({
  id,
  title,
  subtitle,
  description,
  typeBadge,
  badgeColor,
  basePath,
}: EntityCardProps) {
  return (
    <Link
      to={`${basePath}/${id}`}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow block"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 truncate">{title}</h3>
        <span className={`text-xs px-2 py-0.5 rounded-full text-white shrink-0 ${badgeColor}`}>
          {typeBadge}
        </span>
      </div>
      {subtitle && (
        <p className="text-xs text-gray-400 mb-1">{subtitle}</p>
      )}
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{description}</p>
      )}
    </Link>
  )
}
