import { useGraph } from '../hooks/useGraph'
import GraphView from '../components/graph/GraphView'
import GraphControls from '../components/graph/GraphControls'
import GraphLegend from '../components/graph/GraphLegend'
import NodeDetail from '../components/graph/NodeDetail'

export default function Graph() {
  const { graph, isLoading, selectedNode, setSelectedNode } = useGraph()

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500" />
          <p className="text-sm text-slate-400">Chargement du graph...</p>
        </div>
      </div>
    )
  }

  if (graph.order === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-900">
        <div className="text-center">
          <p className="mb-2 text-lg text-slate-300">Aucune entite dans la bible</p>
          <p className="text-sm text-slate-500">
            Creez des personnages, lieux et evenements pour voir le graph
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex h-full">
      <div className="relative flex-1">
        <GraphView graph={graph} onSelectNode={setSelectedNode} />
        <GraphControls />
        <GraphLegend />
      </div>
      {selectedNode && <NodeDetail node={selectedNode} onClose={() => setSelectedNode(null)} />}
    </div>
  )
}
