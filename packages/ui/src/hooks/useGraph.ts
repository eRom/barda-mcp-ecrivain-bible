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

// Les tools list retournent des formats differents : { characters: [...] }, { results: [...] }, { events: [...] }
// Cette fonction extrait le tableau depuis n'importe quel format
function extractArray<T>(data: unknown): T[] {
  if (!data || typeof data !== 'object') return []
  if (Array.isArray(data)) return data as T[]
  const obj = data as Record<string, unknown>
  // Cherche la premiere valeur qui est un tableau
  for (const key of Object.keys(obj)) {
    if (Array.isArray(obj[key])) return obj[key] as T[]
  }
  return []
}

export function useGraph() {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)

  const characters = useMcpQuery<unknown>('list_characters', { limit: 200 })
  const locations = useMcpQuery<unknown>('list_locations', { limit: 200 })
  const events = useMcpQuery<unknown>('list_events', { limit: 200 })
  const interactions = useMcpQuery<unknown>('list_interactions', { limit: 200 })

  const isLoading =
    characters.isLoading || locations.isLoading || events.isLoading || interactions.isLoading

  const graph = useMemo(() => {
    const g = new Graph({ multi: false, type: 'undirected' })

    const charList = extractArray<Character>(characters.data)
    const locList = extractArray<Location>(locations.data)
    const evtList = extractArray<Event>(events.data)
    const interList = extractArray<Interaction>(interactions.data)

    // Add character nodes
    if (charList.length > 0) {
      for (const c of charList) {
        g.addNode(c.id, {
          label: c.name,
          entityType: 'character' as EntityType,
          color: ENTITY_COLORS.character,
          size: ENTITY_SIZES.character,
          description: c.description,
          x: Math.random() * 100,
          y: Math.random() * 100,
        })
      }
    }

    // Add location nodes
    if (locList.length > 0) {
      for (const l of locList) {
        g.addNode(l.id, {
          label: l.name,
          entityType: 'location' as EntityType,
          color: ENTITY_COLORS.location,
          size: ENTITY_SIZES.location,
          description: l.description,
          x: Math.random() * 100,
          y: Math.random() * 100,
        })
      }
    }

    // Add event nodes
    if (evtList.length > 0) {
      for (const e of evtList) {
        g.addNode(e.id, {
          label: e.title,
          entityType: 'event' as EntityType,
          color: ENTITY_COLORS.event,
          size: ENTITY_SIZES.event,
          description: e.description,
          x: Math.random() * 100,
          y: Math.random() * 100,
        })
      }
    }

    // Add interaction nodes
    if (interList.length > 0) {
      for (const i of interList) {
        const label =
          i.description.length > 40 ? i.description.slice(0, 40) + '...' : i.description
        g.addNode(i.id, {
          label,
          entityType: 'interaction' as EntityType,
          color: ENTITY_COLORS.interaction,
          size: ENTITY_SIZES.interaction,
          description: i.description,
          x: Math.random() * 100,
          y: Math.random() * 100,
        })
      }
    }

    // Add edges from interactions (between characters)
    if (interList.length > 0) {
      for (const inter of interList) {
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
    if (evtList.length > 0) {
      for (const ev of evtList) {
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
        // Event -> location (handle both camelCase and snake_case)
        const locId = (ev as unknown as Record<string, unknown>).locationId as string || ev.location_id
        if (locId && g.hasNode(locId) && g.hasNode(ev.id)) {
          const edgeKey = `ev-loc-${ev.id}-${locId}`
          if (!g.hasEdge(edgeKey)) {
            g.addEdgeWithKey(edgeKey, ev.id, locId, {
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
