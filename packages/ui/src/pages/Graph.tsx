import { useGraph } from '../hooks/useGraph'
import GraphView from '../components/graph/GraphView'
import NodeDetail from '../components/graph/NodeDetail'

export default function Graph() {
  const { graph, isLoading, selectedNode, setSelectedNode } = useGraph()

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-[var(--background)]">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[var(--muted)] border-t-[var(--sidebar-primary)]" />
          <p className="text-sm text-[var(--muted-foreground)]">Chargement du graph...</p>
        </div>
      </div>
    )
  }

  if (graph.order === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-[var(--background)]">
        <div className="text-center">
          <p className="mb-2 text-lg text-[var(--foreground)]">Aucune entite dans la bible</p>
          <p className="text-sm text-[var(--muted-foreground)]">
            Creez des personnages, lieux et evenements pour voir le graph
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex" style={{ height: 'calc(100vh - 38px)' }}>
      <div className="relative flex-1">
        <GraphView graph={graph} onSelectNode={setSelectedNode} />
      </div>
      {selectedNode && <NodeDetail node={selectedNode} onClose={() => setSelectedNode(null)} />}
    </div>
  )
}
