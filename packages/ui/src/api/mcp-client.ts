let requestId = 0

interface JsonRpcResponse {
  jsonrpc: '2.0'
  id: number
  result?: {
    content?: Array<{ type: string; text: string }>
    isError?: boolean
    tools?: Array<{ name: string; description: string; inputSchema: Record<string, unknown> }>
  }
  error?: { code: number; message: string }
}

export async function callTool(name: string, params: Record<string, unknown> = {}): Promise<unknown> {
  const res = await fetch('/mcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: ++requestId,
      method: 'tools/call',
      params: { name, arguments: params },
    }),
  })

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`)
  }

  const json: JsonRpcResponse = await res.json()

  if (json.error) {
    throw new Error(json.error.message)
  }

  const result = json.result
  if (!result || !result.content || result.content.length === 0) {
    return null
  }

  if (result.isError) {
    throw new Error(result.content[0].text)
  }

  return JSON.parse(result.content[0].text)
}

export async function listTools(): Promise<Array<{ name: string; description: string; inputSchema: Record<string, unknown> }>> {
  const res = await fetch('/mcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: ++requestId,
      method: 'tools/list',
    }),
  })

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`)
  }

  const json: JsonRpcResponse = await res.json()

  if (json.error) {
    throw new Error(json.error.message)
  }

  return json.result?.tools ?? []
}
