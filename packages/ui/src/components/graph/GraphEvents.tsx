import { useEffect } from 'react'
import { useRegisterEvents, useSigma } from '@react-sigma/core'
import type { GraphNode, EntityType } from '../../hooks/useGraph'

interface GraphEventsProps {
  onSelectNode: (node: GraphNode | null) => void
}

export default function GraphEvents({ onSelectNode }: GraphEventsProps) {
  const sigma = useSigma()
  const registerEvents = useRegisterEvents()

  useEffect(() => {
    registerEvents({
      clickNode: ({ node }) => {
        const graph = sigma.getGraph()
        const attrs = graph.getNodeAttributes(node)
        onSelectNode({
          id: node,
          label: attrs.label,
          type: attrs.entityType as EntityType,
          description: attrs.description,
        })
      },
      clickStage: () => {
        onSelectNode(null)
      },
    })
  }, [registerEvents, sigma, onSelectNode])

  return null
}
