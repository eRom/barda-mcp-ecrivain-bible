import { useMemo, useState } from 'react'
import Graph from 'graphology'
import { useMcpQuery } from './useMcp'
import type { Character, Location, Event, Interaction } from '../types'

export type EntityType = 'character' | 'location' | 'event' | 'interaction' | 'world_rule'

export const ENTITY_COLORS: Record<EntityType, string> = {
  character: '#3B82F6',
  location: '#10B981',
  event: '#F59E0B',
  interaction: '#8B5CF6',
  world_rule: '#EC4899',
}

export const ENTITY_SIZES: Record<EntityType, number> = {
  character: 15,
  location: 12,
  event: 10,
  interaction: 8,
  world_rule: 10,
}

export const ENTITY_LABELS: Record<EntityType, string> = {
  character: 'Personnages',
  location: 'Lieux',
  event: 'Evenements',
  interaction: 'Interactions',
  world_rule: 'Regles',
}

export interface GraphNode {
  id: string
  label: string
  type: EntityType
  description?: string | null
}

export function useGraph() {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)

  const characters = useMcpQuery<Character[]>('list_characters')
  const locations = useMcpQuery<Location[]>('list_locations')
  const events = useMcpQuery<Event[]>('list_events')
  const interactions = useMcpQuery<Interaction[]>('list_interactions')

  const isLoading =
    characters.isLoading || locations.isLoading || events.isLoading || interactions.isLoading

  const graph = useMemo(() => {
    const g = new Graph({ multi: false, type: 'undirected' })

    // Add character nodes
    if (characters.data) {
      for (const c of characters.data) {
        g.addNode(c.id, {
          label: c.name,
          type: 'character' as EntityType,
          color: ENTITY_COLORS.character,
          size: ENTITY_SIZES.character,
          description: c.description,
          x: Math.random() * 100,
          y: Math.random() * 100,
        })
      }
    }

    // Add location nodes
    if (locations.data) {
      for (const l of locations.data) {
        g.addNode(l.id, {
          label: l.name,
          type: 'location' as EntityType,
          color: ENTITY_COLORS.location,
          size: ENTITY_SIZES.location,
          description: l.description,
          x: Math.random() * 100,
          y: Math.random() * 100,
        })
      }
    }

    // Add event nodes
    if (events.data) {
      for (const e of events.data) {
        g.addNode(e.id, {
          label: e.title,
          type: 'event' as EntityType,
          color: ENTITY_COLORS.event,
          size: ENTITY_SIZES.event,
          description: e.description,
          x: Math.random() * 100,
          y: Math.random() * 100,
        })
      }
    }

    // Add interaction nodes
    if (interactions.data) {
      for (const i of interactions.data) {
        const label =
          i.description.length > 40 ? i.description.slice(0, 40) + '...' : i.description
        g.addNode(i.id, {
          label,
          type: 'interaction' as EntityType,
          color: ENTITY_COLORS.interaction,
          size: ENTITY_SIZES.interaction,
          description: i.description,
          x: Math.random() * 100,
          y: Math.random() * 100,
        })
      }
    }

    // Add edges from interactions (between characters)
    if (interactions.data) {
      for (const inter of interactions.data) {
        let charIds: string[] = []
        try {
          charIds = JSON.parse(inter.characters)
        } catch {
          // characters might be a comma-separated string
          charIds = inter.characters.split(',').map((s) => s.trim())
        }
        // Create edges between each pair of characters
        for (let a = 0; a < charIds.length; a++) {
          for (let b = a + 1; b < charIds.length; b++) {
            if (g.hasNode(charIds[a]) && g.hasNode(charIds[b])) {
              const edgeKey = `inter-${charIds[a]}-${charIds[b]}-${inter.id}`
              if (!g.hasEdge(edgeKey)) {
                g.addEdgeWithKey(edgeKey, charIds[a], charIds[b], {
                  color: '#4B5563',
                  size: 1,
                })
              }
            }
          }
          // Also edge interaction node -> character
          if (g.hasNode(charIds[a]) && g.hasNode(inter.id)) {
            const edgeKey = `ilink-${inter.id}-${charIds[a]}`
            if (!g.hasEdge(edgeKey)) {
              g.addEdgeWithKey(edgeKey, inter.id, charIds[a], {
                color: '#6B7280',
                size: 0.5,
              })
            }
          }
        }
      }
    }

    // Add edges from events (event -> characters, event -> location)
    if (events.data) {
      for (const ev of events.data) {
        // Event -> characters
        if (ev.characters) {
          let charIds: string[] = []
          try {
            charIds = JSON.parse(ev.characters)
          } catch {
            charIds = ev.characters.split(',').map((s) => s.trim())
          }
          for (const cid of charIds) {
            if (g.hasNode(cid) && g.hasNode(ev.id)) {
              const edgeKey = `ev-char-${ev.id}-${cid}`
              if (!g.hasEdge(edgeKey)) {
                g.addEdgeWithKey(edgeKey, ev.id, cid, {
                  color: '#6B7280',
                  size: 0.5,
                })
              }
            }
          }
        }
        // Event -> location
        if (ev.location_id && g.hasNode(ev.location_id) && g.hasNode(ev.id)) {
          const edgeKey = `ev-loc-${ev.id}-${ev.location_id}`
          if (!g.hasEdge(edgeKey)) {
            g.addEdgeWithKey(edgeKey, ev.id, ev.location_id, {
              color: '#6B7280',
              size: 0.5,
            })
          }
        }
      }
    }

    return g
  }, [characters.data, locations.data, events.data, interactions.data])

  return { graph, isLoading, selectedNode, setSelectedNode }
}
