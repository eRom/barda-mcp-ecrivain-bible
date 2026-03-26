import { useEffect } from 'react'
import { SigmaContainer, useLoadGraph } from '@react-sigma/core'
import '@react-sigma/core/lib/style.css'
import Graph from 'graphology'
import GraphEvents from './GraphEvents'
import GraphLayout from './GraphLayout'
import type { GraphNode } from '../../hooks/useGraph'

interface GraphLoaderProps {
  graph: Graph
}

function GraphLoader({ graph }: GraphLoaderProps) {
  const loadGraph = useLoadGraph()

  useEffect(() => {
    loadGraph(graph)
  }, [loadGraph, graph])

  return null
}

interface GraphViewProps {
  graph: Graph
  onSelectNode: (node: GraphNode | null) => void
}

export default function GraphView({ graph, onSelectNode }: GraphViewProps) {
  return (
    <SigmaContainer
      className="h-full w-full"
      style={{ backgroundColor: '#0f172a' }}
      settings={{
        renderLabels: true,
        labelSize: 12,
        labelWeight: 'bold',
        labelColor: { color: '#e2e8f0' },
        labelRenderedSizeThreshold: 6,
        defaultEdgeColor: '#334155',
        defaultEdgeType: 'line',
        edgeReducer: (_edge, data) => ({
          ...data,
          color: data.color || '#334155',
          size: data.size || 0.5,
        }),
        nodeReducer: (_node, data) => ({
          ...data,
        }),
        allowInvalidContainer: true,
      }}
    >
      <GraphLoader graph={graph} />
      <GraphEvents onSelectNode={onSelectNode} />
      <GraphLayout />
    </SigmaContainer>
  )
}
