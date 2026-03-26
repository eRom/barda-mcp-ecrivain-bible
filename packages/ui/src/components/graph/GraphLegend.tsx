import { ENTITY_COLORS, ENTITY_LABELS, type EntityType } from '../../hooks/useGraph'

const LEGEND_ITEMS: EntityType[] = ['character', 'location', 'event', 'interaction', 'world_rule']

export default function GraphLegend() {
  return (
    <div className="absolute bottom-4 left-4 z-10 rounded-lg bg-slate-800/90 px-3 py-2 backdrop-blur-sm">
      <div className="mb-1.5 text-xs font-semibold text-slate-400">Legende</div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {LEGEND_ITEMS.map((type) => (
          <div key={type} className="flex items-center gap-1.5">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: ENTITY_COLORS[type] }}
            />
            <span className="text-xs text-slate-300">{ENTITY_LABELS[type]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
