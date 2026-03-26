import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement, type ReactNode } from 'react'
import { useGraph, ENTITY_COLORS } from '../useGraph'

// Mock the MCP client
vi.mock('../../api/mcp-client', () => ({
  callTool: vi.fn(),
}))

import { callTool } from '../../api/mcp-client'
const mockCallTool = vi.mocked(callTool)

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

describe('useGraph', () => {
  it('builds graph with character nodes', async () => {
    mockCallTool.mockImplementation((name: string) => {
      if (name === 'list_characters')
        return Promise.resolve([
          { id: 'c1', name: 'Alice', description: 'Heroine' },
          { id: 'c2', name: 'Bob', description: 'Rival' },
        ])
      return Promise.resolve([])
    })

    const { result } = renderHook(() => useGraph(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const g = result.current.graph
    expect(g.hasNode('c1')).toBe(true)
    expect(g.hasNode('c2')).toBe(true)
    expect(g.getNodeAttribute('c1', 'label')).toBe('Alice')
    expect(g.getNodeAttribute('c1', 'color')).toBe(ENTITY_COLORS.character)
  })

  it('creates edges from interactions between characters', async () => {
    mockCallTool.mockImplementation((name: string) => {
      if (name === 'list_characters')
        return Promise.resolve([
          { id: 'c1', name: 'Alice', description: '' },
          { id: 'c2', name: 'Bob', description: '' },
        ])
      if (name === 'list_interactions')
        return Promise.resolve([
          { id: 'i1', description: 'Dialogue', characters: JSON.stringify(['c1', 'c2']), nature: 'dialogue' },
        ])
      return Promise.resolve([])
    })

    const { result } = renderHook(() => useGraph(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const g = result.current.graph
    // Should have edges between c1 and c2
    expect(g.edges().length).toBeGreaterThan(0)

    // Interaction node should exist
    expect(g.hasNode('i1')).toBe(true)
    expect(g.getNodeAttribute('i1', 'color')).toBe(ENTITY_COLORS.interaction)
  })

  it('creates edges from events to characters and locations', async () => {
    mockCallTool.mockImplementation((name: string) => {
      if (name === 'list_characters')
        return Promise.resolve([{ id: 'c1', name: 'Alice', description: '' }])
      if (name === 'list_locations')
        return Promise.resolve([{ id: 'l1', name: 'Foret', description: '' }])
      if (name === 'list_events')
        return Promise.resolve([
          {
            id: 'e1',
            title: 'Bataille',
            description: 'Grande bataille',
            characters: JSON.stringify(['c1']),
            location_id: 'l1',
          },
        ])
      return Promise.resolve([])
    })

    const { result } = renderHook(() => useGraph(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const g = result.current.graph
    expect(g.hasNode('e1')).toBe(true)
    expect(g.hasNode('c1')).toBe(true)
    expect(g.hasNode('l1')).toBe(true)

    // event -> character edge
    expect(g.hasEdge('ev-char-e1-c1')).toBe(true)
    // event -> location edge
    expect(g.hasEdge('ev-loc-e1-l1')).toBe(true)
  })

  it('handles empty data gracefully', async () => {
    mockCallTool.mockResolvedValue([])

    const { result } = renderHook(() => useGraph(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.graph.order).toBe(0)
    expect(result.current.graph.size).toBe(0)
  })
})
