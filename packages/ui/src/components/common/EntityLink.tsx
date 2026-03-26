import { useState } from 'react'
import { Link } from 'react-router-dom'

const TYPE_COLORS: Record<string, string> = {
  character: '#3B82F6',
  location: '#10B981',
  event: '#F59E0B',
  interaction: '#8B5CF6',
  world_rule: '#EC4899',
  research: '#06B6D4',
  note: '#F97316',
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

interface EntityLinkProps {
  entityType: string
  entityId: string
  label: string
  description?: string | null
}

export default function EntityLink({ entityType, entityId, label, description }: EntityLinkProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const color = TYPE_COLORS[entityType] ?? '#6B7280'
  const route = TYPE_ROUTES[entityType] ?? ''

  return (
    <span className="relative inline-block">
      <Link
        to={`${route}/${entityId}`}
        className="font-medium hover:underline transition-colors"
        style={{ color }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {label}
      </Link>
      {showTooltip && description && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-800 rounded shadow-lg whitespace-nowrap max-w-[250px] truncate z-50 pointer-events-none">
          {description}
        </span>
      )}
    </span>
  )
}
