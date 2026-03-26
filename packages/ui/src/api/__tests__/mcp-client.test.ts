import { describe, it, expect, vi, beforeEach } from 'vitest'
import { callTool, listTools } from '../mcp-client'

describe('mcp-client', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('callTool', () => {
    it('sends correct JSON-RPC body', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            jsonrpc: '2.0',
            id: 1,
            result: { content: [{ type: 'text', text: '{"ok":true}' }] },
          }),
      })
      globalThis.fetch = mockFetch

      await callTool('ping', { foo: 'bar' })

      expect(mockFetch).toHaveBeenCalledWith('/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.any(String),
      })

      const body = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(body.jsonrpc).toBe('2.0')
      expect(body.id).toBeGreaterThan(0)
      expect(body.method).toBe('tools/call')
      expect(body.params).toEqual({ name: 'ping', arguments: { foo: 'bar' } })
    })

    it('parses successful response content', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            jsonrpc: '2.0',
            id: 1,
            result: {
              content: [{ type: 'text', text: '{"characters":["Alice","Bob"]}' }],
            },
          }),
      })

      const result = await callTool('list_characters')
      expect(result).toEqual({ characters: ['Alice', 'Bob'] })
    })

    it('throws on isError response', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            jsonrpc: '2.0',
            id: 1,
            result: {
              isError: true,
              content: [{ type: 'text', text: 'Personnage introuvable' }],
            },
          }),
      })

      await expect(callTool('get_character', { id: '999' })).rejects.toThrow(
        'Personnage introuvable',
      )
    })

    it('throws on JSON-RPC error', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            jsonrpc: '2.0',
            id: 1,
            error: { code: -32601, message: 'Method not found' },
          }),
      })

      await expect(callTool('unknown_tool')).rejects.toThrow('Method not found')
    })

    it('throws on network error', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      })

      await expect(callTool('ping')).rejects.toThrow('HTTP 500: Internal Server Error')
    })

    it('returns null when result has empty content', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            jsonrpc: '2.0',
            id: 1,
            result: { content: [] },
          }),
      })

      const result = await callTool('ping')
      expect(result).toBeNull()
    })
  })

  describe('listTools', () => {
    it('sends tools/list JSON-RPC request', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            jsonrpc: '2.0',
            id: 1,
            result: {
              tools: [
                { name: 'ping', description: 'Ping', inputSchema: {} },
                { name: 'list_characters', description: 'List chars', inputSchema: {} },
              ],
            },
          }),
      })
      globalThis.fetch = mockFetch

      const tools = await listTools()

      const body = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(body.method).toBe('tools/list')
      expect(body.params).toBeUndefined()
      expect(tools).toHaveLength(2)
      expect(tools[0].name).toBe('ping')
    })

    it('returns empty array when no tools', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            jsonrpc: '2.0',
            id: 1,
            result: {},
          }),
      })

      const tools = await listTools()
      expect(tools).toEqual([])
    })
  })
})
