import { useCallback, useState } from 'react'
import { useSigma, useCamera } from '@react-sigma/core'
import { ENTITY_COLORS, ENTITY_LABELS, type EntityType } from '../../hooks/useGraph'

const ALL_TYPES: EntityType[] = ['character', 'location', 'event', 'interaction']

export default function GraphControls() {
  const sigma = useSigma()
  const camera = useCamera()
  const [hiddenTypes, setHiddenTypes] = useState<Set<EntityType>>(new Set())

  const toggleType = useCallback(
    (type: EntityType) => {
      setHiddenTypes((prev) => {
        const next = new Set(prev)
        if (next.has(type)) {
          next.delete(type)
        } else {
          next.add(type)
        }

        const graph = sigma.getGraph()
        graph.forEachNode((nodeId, attrs) => {
          const nodeType = attrs.entityType as EntityType
          graph.setNodeAttribute(nodeId, 'hidden', next.has(nodeType))
        })
        graph.forEachEdge((edgeId) => {
          const [source, target] = graph.extremities(edgeId)
          const sourceType = graph.getNodeAttribute(source, 'type') as EntityType
          const targetType = graph.getNodeAttribute(target, 'type') as EntityType
          graph.setEdgeAttribute(edgeId, 'hidden', next.has(sourceType) || next.has(targetType))
        })
        sigma.refresh()

        return next
      })
    },
    [sigma],
  )

  return (
    <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
      {/* Zoom controls */}
      <div className="flex flex-col gap-1 rounded-lg bg-[var(--card)] border border-[var(--border)] p-2">
        <button
          onClick={() => camera.zoomIn({ duration: 300 })}
          className="rounded px-3 py-1.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--accent)]"
          title="Zoom avant"
        >
          +
        </button>
        <button
          onClick={() => camera.zoomOut({ duration: 300 })}
          className="rounded px-3 py-1.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-[var(--accent)]"
          title="Zoom arriere"
        >
          -
        </button>
        <div className="my-1 border-t border-[var(--border)]" />
        <button
          onClick={() => camera.reset({ duration: 300 })}
          className="rounded px-3 py-1.5 text-xs font-medium text-[var(--muted-foreground)] transition-colors hover:bg-[var(--accent)]"
          title="Recentrer"
        >
          Recentrer
        </button>
      </div>

      {/* Type filters */}
      <div className="rounded-lg bg-[var(--card)] border border-[var(--border)] p-2">
        <div className="mb-1.5 text-xs font-semibold text-[var(--muted-foreground)]">Filtres</div>
        {ALL_TYPES.map((type) => (
          <label
            key={type}
            className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm transition-colors hover:bg-[var(--accent)]"
          >
            <input
              type="checkbox"
              checked={!hiddenTypes.has(type)}
              onChange={() => toggleType(type)}
              className="h-3 w-3 rounded"
            />
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: ENTITY_COLORS[type] }}
            />
            <span className="text-[var(--foreground)]">{ENTITY_LABELS[type]}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
