import { useEffect } from 'react'
import { SigmaContainer, useLoadGraph, useSigma } from '@react-sigma/core'
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

/** Highlights the selected node's branch by dimming everything else */
function GraphHighlighter({ selectedNodeId }: { selectedNodeId: string | null }) {
  const sigma = useSigma()

  useEffect(() => {
    // Capture camera state BEFORE any change
    const camera = sigma.getCamera()
    const cameraState = camera.getState()

    if (!selectedNodeId) {
      sigma.setSetting('nodeReducer', (_node, data) => ({ ...data }))
      sigma.setSetting('edgeReducer', (_edge, data) => ({
        ...data,
        color: data.color || '#444444',
        size: data.size || 0.5,
      }))
      sigma.refresh()
      // Restore camera position
      camera.setState(cameraState)
      return
    }

    const graph = sigma.getGraph()
    if (!graph.hasNode(selectedNodeId)) return

    const connectedNodes = new Set<string>()
    connectedNodes.add(selectedNodeId)
    graph.forEachNeighbor(selectedNodeId, (neighbor) => {
      connectedNodes.add(neighbor)
    })

    const connectedEdges = new Set<string>()
    graph.forEachEdge(selectedNodeId, (edge) => {
      connectedEdges.add(edge)
    })

    sigma.setSetting('nodeReducer', (node, data) => {
      if (connectedNodes.has(node)) {
        return {
          ...data,
          size: node === selectedNodeId ? (data.size || 10) * 1.3 : data.size,
          zIndex: 1,
        }
      }
      return {
        ...data,
        color: '#333333',
        size: (data.size || 10) * 0.6,
        label: '',
        zIndex: 0,
      }
    })

    sigma.setSetting('edgeReducer', (edge, data) => {
      if (connectedEdges.has(edge)) {
        return {
          ...data,
          color: '#888888',
          size: 1.5,
          zIndex: 1,
        }
      }
      return {
        ...data,
        color: '#1a1a1a',
        size: 0.2,
        zIndex: 0,
      }
    })

    sigma.refresh()
    // Restore camera — no zoom/pan change
    camera.setState(cameraState)
  }, [sigma, selectedNodeId])

  return null
}

interface GraphViewProps {
  graph: Graph
  onSelectNode: (node: GraphNode | null) => void
  selectedNodeId?: string | null
}

export default function GraphView({ graph, onSelectNode, selectedNodeId }: GraphViewProps) {
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
      <GraphHighlighter selectedNodeId={selectedNodeId || null} />
    </SigmaContainer>
  )
}
