import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement, type ReactNode } from 'react'
import { useMcpQuery, useMcpMutation } from '../useMcp'

vi.mock('../../api/mcp-client', () => ({
  callTool: vi.fn(),
}))

import { callTool } from '../../api/mcp-client'
const mockCallTool = vi.mocked(callTool)

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

describe('useMcpQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls callTool with correct params', async () => {
    mockCallTool.mockResolvedValue([{ id: '1', name: 'Alice' }])

    const { result } = renderHook(
      () => useMcpQuery('list_characters', { limit: 10 }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(mockCallTool).toHaveBeenCalledWith('list_characters', { limit: 10 })
    expect(result.current.data).toEqual([{ id: '1', name: 'Alice' }])
  })

  it('uses cache on second call with same params', async () => {
    mockCallTool.mockResolvedValue([{ id: '1', name: 'Alice' }])

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, staleTime: Infinity },
      },
    })
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children)

    const { result: r1 } = renderHook(
      () => useMcpQuery('list_characters'),
      { wrapper },
    )
    await waitFor(() => expect(r1.current.isSuccess).toBe(true))

    const { result: r2 } = renderHook(
      () => useMcpQuery('list_characters'),
      { wrapper },
    )
    await waitFor(() => expect(r2.current.isSuccess).toBe(true))

    // callTool should only have been called once (cache hit with infinite staleTime)
    expect(mockCallTool).toHaveBeenCalledTimes(1)
  })

  it('respects enabled option', async () => {
    mockCallTool.mockResolvedValue([])

    const { result } = renderHook(
      () => useMcpQuery('list_characters', undefined, { enabled: false }),
      { wrapper: createWrapper() },
    )

    // Should not fetch when disabled
    expect(result.current.isFetching).toBe(false)
    expect(mockCallTool).not.toHaveBeenCalled()
  })
})

describe('useMcpMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls callTool on mutate', async () => {
    mockCallTool.mockResolvedValue({ id: '1', name: 'Alice' })

    const { result } = renderHook(
      () => useMcpMutation('create_character', ['list_characters']),
      { wrapper: createWrapper() },
    )

    result.current.mutate({ name: 'Alice' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockCallTool).toHaveBeenCalledWith('create_character', { name: 'Alice' })
  })

  it('invalidates query keys on success', async () => {
    mockCallTool.mockResolvedValue({ id: '2', name: 'Bob' })

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })
    const spy = vi.spyOn(queryClient, 'invalidateQueries')

    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children)

    const { result } = renderHook(
      () => useMcpMutation('create_character', ['list_characters', 'get_bible_stats']),
      { wrapper },
    )

    result.current.mutate({ name: 'Bob' })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(spy).toHaveBeenCalledWith({ queryKey: ['list_characters'] })
    expect(spy).toHaveBeenCalledWith({ queryKey: ['get_bible_stats'] })
  })
})
