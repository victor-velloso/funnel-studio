import { vi } from 'vitest'

export function jsonResponse(status, body, headers = {}) {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  })
}

// Troca o fetch global por uma fila de respostas; devolve o mock para inspecionar chamadas.
export function mockFetch(...respostas) {
  const fila = [...respostas]
  const fn = vi.fn(async () => {
    const r = fila.shift()
    if (!r) throw new Error('fetch inesperado')
    if (r instanceof Error) throw r
    return typeof r === 'function' ? r() : r
  })
  vi.stubGlobal('fetch', fn)
  return fn
}

export function chamada(fetchFn, i = 0) {
  const [url, init = {}] = fetchFn.mock.calls[i]
  return {
    url: String(url),
    method: init.method ?? 'GET',
    headers: init.headers ?? {},
    body: init.body ? JSON.parse(init.body) : undefined,
  }
}

export function logar(pessoa = { nome: 'Victor Velloso', email: 'victor@elyon.test', pode_gravar: true }) {
  localStorage.setItem(
    'elyon-funnel-studio:sessao',
    JSON.stringify({ token: 'fs_teste', expira_em: new Date(Date.now() + 86400_000).toISOString(), pessoa }),
  )
}
