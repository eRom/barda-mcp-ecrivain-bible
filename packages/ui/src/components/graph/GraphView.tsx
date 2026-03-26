import { useEffect } from 'react'
import { SigmaContainer, useLoadGraph } from '@react-sigma/core'
import '@react-sigma/core/lib/style.css'
import Graph from 'graphology'
import GraphEvents from './GraphEvents'
import GraphLayout from './GraphLayout'
import GraphControls from './GraphControls'
import GraphLegend from './GraphLegend'
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
  // Use a color that matches --background dark (oklch(0.236 0 0) ~= #383838, but we use something even darker)
  const bgColor = '#2a2a2a'

  return (
    <SigmaContainer
      className="h-full w-full"
      style={{ backgroundColor: bgColor }}
      settings={{
        renderLabels: true,
        labelSize: 12,
        labelWeight: 'bold',
        labelColor: { color: '#e2e8f0' },
        labelRenderedSizeThreshold: 6,
        defaultEdgeColor: '#444444',
        defaultEdgeType: 'line',
        edgeReducer: (_edge, data) => ({
          ...data,
          color: data.color || '#444444',
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
      <GraphControls />
      <GraphLegend />
    </SigmaContainer>
  )
}
