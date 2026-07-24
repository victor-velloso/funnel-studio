const KEY = 'elyon-funnel-studio:v1'

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}

export function loadWorkspace() {
  try {
    const raw = localStorage.getItem(KEY)
    const ws = raw ? JSON.parse(raw) : null
    if (ws && Array.isArray(ws.funnels)) return ws
  } catch {
    /* corrompido — recomeça vazio */
  }
  return { funnels: [] }
}

export function saveWorkspace(ws) {
  localStorage.setItem(KEY, JSON.stringify(ws))
}

export function newFunnel(name = 'Funil sem título') {
  const now = Date.now()
  return {
    id: uid(),
    name,
    createdAt: now,
    updatedAt: now,
    nodes: [],
    edges: [],
    viewport: null,
  }
}

export function downloadJSON(funnel) {
  const blob = new Blob([JSON.stringify(funnel, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${slug(funnel.name)}.funnel.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function slug(name) {
  return (
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'funil'
  )
}

export function formatDate(ts) {
  return new Date(ts).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatTime(ts) {
  return new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}
