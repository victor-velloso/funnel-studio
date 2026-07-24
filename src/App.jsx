import { useCallback, useEffect, useState } from 'react'
import Dashboard from './components/Dashboard.jsx'
import Editor from './components/Editor.jsx'
import Toasts from './components/Toasts.jsx'
import { loadWorkspace, saveWorkspace, newFunnel, uid } from './lib/storage.js'

const THEME_KEY = 'elyon-funnel-studio:theme'

export default function App() {
  const [workspace, setWorkspace] = useState(loadWorkspace)
  const [openId, setOpenId] = useState(null)
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) ?? 'dark')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  const toggleTheme = useCallback(
    () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
    [],
  )

  const persist = useCallback((updater) => {
    setWorkspace((ws) => {
      const next = typeof updater === 'function' ? updater(ws) : updater
      saveWorkspace(next)
      return next
    })
  }, [])

  const createFunnel = useCallback(
    (name, nodes = [], edges = []) => {
      const funnel = newFunnel(name, nodes, edges)
      persist((ws) => ({ ...ws, funnels: [funnel, ...ws.funnels] }))
      setOpenId(funnel.id)
    },
    [persist],
  )

  const duplicateFunnel = useCallback(
    (id) => {
      persist((ws) => {
        const src = ws.funnels.find((f) => f.id === id)
        if (!src) return ws
        const copy = {
          ...structuredClone(src),
          id: uid(),
          name: `${src.name} (cópia)`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }
        return { ...ws, funnels: [copy, ...ws.funnels] }
      })
    },
    [persist],
  )

  const renameFunnel = useCallback(
    (id, name) => {
      persist((ws) => ({
        ...ws,
        funnels: ws.funnels.map((f) =>
          f.id === id ? { ...f, name: name.trim() || f.name, updatedAt: Date.now() } : f,
        ),
      }))
    },
    [persist],
  )

  const deleteFunnel = useCallback(
    (id) => {
      persist((ws) => ({ ...ws, funnels: ws.funnels.filter((f) => f.id !== id) }))
      setOpenId((cur) => (cur === id ? null : cur))
    },
    [persist],
  )

  const updateFunnel = useCallback(
    (id, patch) => {
      persist((ws) => ({
        ...ws,
        funnels: ws.funnels.map((f) =>
          f.id === id ? { ...f, ...patch, updatedAt: Date.now() } : f,
        ),
      }))
    },
    [persist],
  )

  const importFunnel = useCallback(
    (data) => {
      const funnel = {
        id: uid(),
        name: typeof data.name === 'string' ? data.name : 'Funil importado',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        nodes: Array.isArray(data.nodes) ? data.nodes : [],
        edges: Array.isArray(data.edges) ? data.edges : [],
        viewport: data.viewport ?? null,
      }
      persist((ws) => ({ ...ws, funnels: [funnel, ...ws.funnels] }))
      setOpenId(funnel.id)
    },
    [persist],
  )

  const openFunnel = workspace.funnels.find((f) => f.id === openId)

  return (
    <>
      {openFunnel ? (
        <Editor
          key={openFunnel.id}
          funnel={openFunnel}
          theme={theme}
          onToggleTheme={toggleTheme}
          onBack={() => setOpenId(null)}
          onChange={(patch) => updateFunnel(openFunnel.id, patch)}
          onRename={(name) => renameFunnel(openFunnel.id, name)}
        />
      ) : (
        <Dashboard
          funnels={workspace.funnels}
          theme={theme}
          onToggleTheme={toggleTheme}
          onOpen={setOpenId}
          onCreate={createFunnel}
          onDuplicate={duplicateFunnel}
          onRename={renameFunnel}
          onDelete={deleteFunnel}
          onImport={importFunnel}
        />
      )}
      <Toasts />
    </>
  )
}
