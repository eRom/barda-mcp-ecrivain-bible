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
          const nodeType = attrs.type as EntityType
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
      <div className="flex flex-col gap-1 rounded-lg bg-slate-800/90 p-2 backdrop-blur-sm">
        <button
          onClick={() => camera.zoomIn({ duration: 300 })}
          className="rounded px-3 py-1.5 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-700"
          title="Zoom avant"
        >
          +
        </button>
        <button
          onClick={() => camera.zoomOut({ duration: 300 })}
          className="rounded px-3 py-1.5 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-700"
          title="Zoom arriere"
        >
          -
        </button>
        <div className="my-1 border-t border-slate-600" />
        <button
          onClick={() => camera.reset({ duration: 300 })}
          className="rounded px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-700"
          title="Recentrer"
        >
          Recentrer
        </button>
      </div>

      {/* Type filters */}
      <div className="rounded-lg bg-slate-800/90 p-2 backdrop-blur-sm">
        <div className="mb-1.5 text-xs font-semibold text-slate-400">Filtres</div>
        {ALL_TYPES.map((type) => (
          <label
            key={type}
            className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm transition-colors hover:bg-slate-700"
          >
            <input
              type="checkbox"
              checked={!hiddenTypes.has(type)}
              onChange={() => toggleType(type)}
              className="h-3 w-3 rounded border-slate-500"
            />
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: ENTITY_COLORS[type] }}
            />
            <span className="text-slate-200">{ENTITY_LABELS[type]}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
