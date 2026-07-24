import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  MiniMap,
  Controls,
  Panel,
  ConnectionMode,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  useReactFlow,
  useViewport,
  getViewportForBounds,
} from '@xyflow/react'
import { toPng } from 'html-to-image'
import { FunnelNode, NoteNode } from './FunnelNode.jsx'
import LabeledEdge from './LabeledEdge.jsx'
import Sidebar from './Sidebar.jsx'
import ThemeToggle from './ThemeToggle.jsx'
import HelpModal from './HelpModal.jsx'
import { EDGE_OPTIONS } from '../lib/flow.js'
import { layoutNodes } from '../lib/layout.js'
import { toast } from '../lib/toast.js'
import { uid, downloadJSON, slug, formatTime } from '../lib/storage.js'

const nodeTypes = { funnel: FunnelNode, note: NoteNode }
const edgeTypes = { default: LabeledEdge }

/* ---------- Histórico (undo/redo) ---------- */

function snapshot(nodes, edges) {
  return {
    nodes: nodes.map((n) => ({ ...n, selected: false, dragging: false })),
    edges: edges.map((e) =>
      e.data?.editing ? { ...e, selected: false, data: { ...e.data, editing: false } } : { ...e, selected: false },
    ),
  }
}

function signature(snap) {
  return JSON.stringify({
    n: snap.nodes.map(({ id, type, position, data, style }) => ({ id, type, position, data, style })),
    e: snap.edges.map(({ id, source, target, sourceHandle, targetHandle, data }) => ({
      id,
      source,
      target,
      sourceHandle,
      targetHandle,
      label: data?.label ?? '',
    })),
  })
}

function useHistory(nodes, edges, setNodes, setEdges) {
  const past = useRef([])
  const future = useRef([])
  const settled = useRef(null)
  const restoring = useRef(false)
  const [, force] = useReducer((c) => c + 1, 0)

  if (settled.current === null) settled.current = snapshot(nodes, edges)

  // Comita um passo de histórico quando o estado "assenta" (320ms sem mudanças).
  // Coalesce arrastes e digitação em passos únicos.
  useEffect(() => {
    if (restoring.current) {
      restoring.current = false
      settled.current = snapshot(nodes, edges)
      return
    }
    const t = setTimeout(() => {
      const cur = snapshot(nodes, edges)
      if (signature(cur) !== signature(settled.current)) {
        past.current.push(settled.current)
        if (past.current.length > 60) past.current.shift()
        future.current = []
        settled.current = cur
        force()
      }
    }, 320)
    return () => clearTimeout(t)
  }, [nodes, edges])

  const undo = useCallback(() => {
    if (!past.current.length) return
    future.current.push(settled.current)
    const prev = past.current.pop()
    settled.current = prev
    restoring.current = true
    setNodes(prev.nodes)
    setEdges(prev.edges)
    force()
  }, [setNodes, setEdges])

  const redo = useCallback(() => {
    if (!future.current.length) return
    past.current.push(settled.current)
    const next = future.current.pop()
    settled.current = next
    restoring.current = true
    setNodes(next.nodes)
    setEdges(next.edges)
    force()
  }, [setNodes, setEdges])

  return { undo, redo, canUndo: past.current.length > 0, canRedo: future.current.length > 0 }
}

/* ---------- Toolbar ---------- */

function Toolbar({
  name,
  onRename,
  onBack,
  savedAt,
  onExportJSON,
  onExportPNG,
  onImportInto,
  theme,
  onToggleTheme,
  undo,
  redo,
  canUndo,
  canRedo,
  onAutoLayout,
  canLayout,
}) {
  const [editing, setEditing] = useState(false)
  const fileRef = useRef(null)

  return (
    <header className="toolbar">
      <div className="toolbar__left">
        <button className="icon-btn" aria-label="Voltar ao painel" onClick={onBack}>
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M11 18l-6-6 6-6" />
          </svg>
        </button>
        <img className="toolbar__logo" src="/logo.png" alt="Elyon Studios" />
        <div className="brand__divider" />
        {editing ? (
          <input
            className="toolbar__name toolbar__name--input"
            defaultValue={name}
            autoFocus
            onFocus={(e) => e.target.select()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onRename(e.target.value)
                setEditing(false)
              }
              if (e.key === 'Escape') setEditing(false)
            }}
            onBlur={(e) => {
              onRename(e.target.value)
              setEditing(false)
            }}
          />
        ) : (
          <button className="toolbar__name" onClick={() => setEditing(true)} title="Clique para renomear">
            {name}
          </button>
        )}
        <div className="brand__divider" />
        <button className="icon-btn" onClick={undo} disabled={!canUndo} aria-label="Desfazer" title="Desfazer (⌘Z)">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 14 4 9l5-5" />
            <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H12" />
          </svg>
        </button>
        <button className="icon-btn" onClick={redo} disabled={!canRedo} aria-label="Refazer" title="Refazer (⌘⇧Z)">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 14 5-5-5-5" />
            <path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H12" />
          </svg>
        </button>
        <button
          className="icon-btn"
          onClick={onAutoLayout}
          disabled={!canLayout}
          aria-label="Organizar o quadro"
          title="Organizar o quadro (auto-layout) — ⌘Z desfaz"
        >
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2.5" y="9.5" width="6" height="5" rx="1.5" />
            <rect x="15.5" y="3" width="6" height="5" rx="1.5" />
            <rect x="15.5" y="16" width="6" height="5" rx="1.5" />
            <path d="M8.5 12h3.5m0 0V5.5h3.5M12 12v6.5h3.5" />
          </svg>
        </button>
      </div>

      <div className="toolbar__right">
        {savedAt && <span className="toolbar__saved mono">Salvo às {formatTime(savedAt)}</span>}
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        <button className="btn btn--secondary" onClick={() => fileRef.current?.click()}>
          Importar
        </button>
        <button className="btn btn--secondary" onClick={onExportJSON}>
          Exportar JSON
        </button>
        <button className="btn btn--primary" onClick={onExportPNG}>
          Exportar PNG
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) file.text().then(onImportInto)
            e.target.value = ''
          }}
        />
      </div>
    </header>
  )
}

/* ---------- Indicador de zoom ---------- */

function ZoomBadge() {
  const { zoom } = useViewport()
  const { fitView } = useReactFlow()
  return (
    <button
      className="zoom-badge mono"
      onClick={() => fitView({ padding: 0.25, duration: 300 })}
      title="Ajustar à tela"
    >
      {Math.round(zoom * 100)}%
    </button>
  )
}

/* ---------- Canvas ---------- */

function Canvas({ funnel, theme, onToggleTheme, onChange, onRename, onBack }) {
  const [nodes, setNodes] = useState(funnel.nodes)
  const [edges, setEdges] = useState(() =>
    funnel.edges.map((e) => (e.data?.editing ? { ...e, data: { ...e.data, editing: false } } : e)),
  )
  const [savedAt, setSavedAt] = useState(null)
  const [helpOpen, setHelpOpen] = useState(false)
  const { screenToFlowPosition, getViewport, getNodesBounds, fitView } = useReactFlow()
  const wrapperRef = useRef(null)

  const { undo, redo, canUndo, canRedo } = useHistory(nodes, edges, setNodes, setEdges)

  // Refs estáveis para o auto-save (onChange do App muda de identidade a cada render)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const latestRef = useRef({ nodes, edges })
  latestRef.current = { nodes, edges }

  // Auto-save com debounce
  const firstRun = useRef(true)
  const dirtyRef = useRef(false)
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false
      return
    }
    dirtyRef.current = true
    const t = setTimeout(() => {
      onChangeRef.current({ nodes, edges, viewport: getViewport() })
      setSavedAt(Date.now())
    }, 600)
    return () => clearTimeout(t)
  }, [nodes, edges, getViewport])

  // Flush no unmount — sem isso, alterações feitas até 600ms antes de sair se perdem.
  // Só salva se algo mudou (evita gravar viewport pré-fitView no double-mount do StrictMode).
  useEffect(() => {
    return () => {
      if (!dirtyRef.current) return
      let viewport = null
      try {
        viewport = getViewport()
      } catch {
        /* store já desmontado */
      }
      onChangeRef.current({ ...latestRef.current, ...(viewport ? { viewport } : {}) })
    }
  }, [getViewport])

  const onNodesChange = useCallback(
    (changes) => setNodes((ns) => applyNodeChanges(changes, ns)),
    [],
  )
  const onEdgesChange = useCallback(
    (changes) => setEdges((es) => applyEdgeChanges(changes, es)),
    [],
  )
  const onConnect = useCallback(
    (connection) => setEdges((es) => addEdge({ ...connection, ...EDGE_OPTIONS }, es)),
    [],
  )

  const onEdgeDoubleClick = useCallback((_, edge) => {
    setEdges((es) =>
      es.map((e) => (e.id === edge.id ? { ...e, data: { ...e.data, editing: true } } : e)),
    )
  }, [])

  const addElement = useCallback(
    (payload) => {
      const rect = wrapperRef.current?.getBoundingClientRect()
      if (!rect) return
      const jitter = () => Math.round((Math.random() - 0.5) * 80)
      const position = screenToFlowPosition({
        x: rect.left + rect.width / 2 + jitter(),
        y: rect.top + rect.height / 2 + jitter(),
      })
      if (payload.kind === 'note') {
        setNodes((ns) => [
          ...ns,
          {
            id: uid(),
            type: 'note',
            position: { x: position.x - 110, y: position.y - 50 },
            data: { text: '' },
            style: { width: 220, height: 100 },
          },
        ])
      } else {
        setNodes((ns) => [
          ...ns,
          {
            id: uid(),
            type: 'funnel',
            position: { x: position.x - 44, y: position.y - 44 },
            data: { label: payload.label, icon: payload.type },
          },
        ])
      }
    },
    [screenToFlowPosition],
  )

  const selectedNodeCount = nodes.filter((n) => n.selected).length
  const selectedCount = selectedNodeCount + edges.filter((e) => e.selected).length

  const deleteSelection = useCallback(() => {
    const removed = new Set(nodes.filter((n) => n.selected).map((n) => n.id))
    setNodes((ns) => ns.filter((n) => !n.selected))
    setEdges((es) => es.filter((e) => !e.selected && !removed.has(e.source) && !removed.has(e.target)))
  }, [nodes])

  const duplicateSelection = useCallback(() => {
    const selNodes = nodes.filter((n) => n.selected)
    if (!selNodes.length) return
    const idMap = {}
    const clones = selNodes.map((n) => {
      const nid = uid()
      idMap[n.id] = nid
      return {
        ...structuredClone(n),
        id: nid,
        position: { x: n.position.x + 40, y: n.position.y + 40 },
        selected: true,
      }
    })
    const cloneEdges = edges
      .filter((e) => idMap[e.source] && idMap[e.target])
      .map((e) => ({
        ...structuredClone(e),
        id: uid(),
        source: idMap[e.source],
        target: idMap[e.target],
        selected: false,
      }))
    setNodes((ns) => [...ns.map((n) => ({ ...n, selected: false })), ...clones])
    setEdges((es) => [...es.map((e) => ({ ...e, selected: false })), ...cloneEdges])
  }, [nodes, edges])

  // Auto-layout sob demanda (nunca automático) — entra no histórico, ⌘Z desfaz
  const autoLayout = useCallback(() => {
    if (!nodes.length) return
    setNodes(layoutNodes(nodes, edges))
    setEdges((es) => es.map((e) => ({ ...e, sourceHandle: 'right', targetHandle: 'left' })))
    setTimeout(() => fitView({ padding: 0.25, duration: 300 }), 80)
    toast('Quadro organizado — ⌘Z desfaz')
  }, [nodes, edges, fitView])

  // Atalhos de teclado
  useEffect(() => {
    const onKey = (e) => {
      const t = e.target
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable) return
      const mod = e.metaKey || e.ctrlKey
      const k = e.key.toLowerCase()
      if (mod && k === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      } else if ((mod && k === 'z' && e.shiftKey) || (mod && k === 'y')) {
        e.preventDefault()
        redo()
      } else if (mod && k === 'd') {
        e.preventDefault()
        duplicateSelection()
      } else if (e.key === '?') {
        setHelpOpen(true)
      } else if (e.key === 'Escape') {
        setHelpOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo, duplicateSelection])

  const onDragOver = useCallback((e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (e) => {
      e.preventDefault()
      const raw = e.dataTransfer.getData('application/funnelstudio')
      if (!raw) return
      const payload = JSON.parse(raw)
      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY })

      if (payload.kind === 'note') {
        setNodes((ns) => [
          ...ns,
          {
            id: uid(),
            type: 'note',
            position: { x: position.x - 110, y: position.y - 50 },
            data: { text: '' },
            style: { width: 220, height: 100 },
          },
        ])
      } else {
        setNodes((ns) => [
          ...ns,
          {
            id: uid(),
            type: 'funnel',
            position: { x: position.x - 44, y: position.y - 44 },
            data: { label: payload.label, icon: payload.type },
          },
        ])
      }
    },
    [screenToFlowPosition],
  )

  const exportJSON = useCallback(() => {
    downloadJSON({ ...funnel, nodes, edges, viewport: getViewport() })
    toast('JSON exportado')
  }, [funnel, nodes, edges, getViewport])

  const importInto = useCallback((text) => {
    try {
      const data = JSON.parse(text)
      if (!Array.isArray(data.nodes)) throw new Error('sem nodes')
      setNodes(data.nodes)
      setEdges(Array.isArray(data.edges) ? data.edges : [])
      toast('Funil importado no quadro')
    } catch {
      toast('Arquivo inválido — esperado um .funnel.json', 'error')
    }
  }, [])

  const exportPNG = useCallback(() => {
    if (!nodes.length) {
      toast('O quadro está vazio — adicione elementos antes', 'error')
      return
    }
    const bounds = getNodesBounds(nodes.map((n) => n.id))
    const scale = 2
    const pad = 80
    const width = Math.min((bounds.width + pad * 2) * scale, 8192)
    const height = Math.min((bounds.height + pad * 2) * scale, 8192)
    const viewport = getViewportForBounds(bounds, width, height, 0.2, 4, 0.08)
    const el = wrapperRef.current?.querySelector('.react-flow__viewport')
    if (!el) return
    toPng(el, {
      backgroundColor: theme === 'light' ? '#ffffff' : '#171717',
      width,
      height,
      style: {
        width: `${width}px`,
        height: `${height}px`,
        transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
      },
      filter: (node) => !node.classList?.contains('react-flow__minimap'),
    })
      .then((dataUrl) => {
        const a = document.createElement('a')
        a.href = dataUrl
        a.download = `${slug(funnel.name)}.png`
        a.click()
        toast('PNG exportado')
      })
      .catch(() => toast('Não foi possível gerar o PNG', 'error'))
  }, [nodes, funnel.name, getNodesBounds, theme])

  return (
    <div className="editor">
      <Toolbar
        name={funnel.name}
        onRename={onRename}
        onBack={onBack}
        savedAt={savedAt}
        onExportJSON={exportJSON}
        onExportPNG={exportPNG}
        onImportInto={importInto}
        theme={theme}
        onToggleTheme={onToggleTheme}
        undo={undo}
        redo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onAutoLayout={autoLayout}
        canLayout={nodes.length > 0}
      />
      <div className="editor__body">
        <Sidebar onAdd={addElement} />
        <div className="editor__canvas" ref={wrapperRef}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onEdgeDoubleClick={onEdgeDoubleClick}
            onDrop={onDrop}
            onDragOver={onDragOver}
            connectionMode={ConnectionMode.Loose}
            connectionRadius={34}
            defaultEdgeOptions={EDGE_OPTIONS}
            connectionLineStyle={{ stroke: 'rgb(242, 86, 43)', strokeWidth: 1.8, strokeDasharray: '7 5' }}
            defaultViewport={funnel.viewport ?? undefined}
            fitView={!funnel.viewport && funnel.nodes.length > 0}
            fitViewOptions={{ padding: 0.25 }}
            deleteKeyCode={['Backspace', 'Delete']}
            selectionKeyCode="Shift"
            multiSelectionKeyCode={['Meta', 'Control']}
            proOptions={{ hideAttribution: true }}
            zoomOnDoubleClick={false}
            snapToGrid
            snapGrid={[11, 11]}
            minZoom={0.15}
            maxZoom={2.5}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={22}
              size={1.4}
              color={theme === 'light' ? 'rgba(0,0,0,0.14)' : 'rgba(255,255,255,0.10)'}
            />
            <MiniMap
              pannable
              zoomable
              bgColor={theme === 'light' ? '#ffffff' : '#1E1E1E'}
              maskColor={theme === 'light' ? 'rgba(255,255,255,0.75)' : 'rgba(23,23,23,0.75)'}
              nodeColor={theme === 'light' ? '#DEDEDE' : '#4D4D4D'}
              nodeStrokeColor="transparent"
            />
            <Controls showInteractive={false} position="bottom-left" />
            <Panel position="bottom-left" className="zoom-panel">
              <ZoomBadge />
            </Panel>
            <Panel position="top-right" className="help-panel">
              <button className="icon-btn" onClick={() => setHelpOpen(true)} aria-label="Atalhos e ajuda" title="Atalhos (?)">
                <span className="mono">?</span>
              </button>
            </Panel>
            {selectedCount > 0 && (
              <Panel position="bottom-center">
                <div className="selection-bar">
                  <span>
                    {selectedCount} {selectedCount === 1 ? 'item selecionado' : 'itens selecionados'}
                  </span>
                  {selectedNodeCount > 0 && (
                    <button className="btn btn--secondary" onClick={duplicateSelection} title="Duplicar (⌘D)">
                      Duplicar
                    </button>
                  )}
                  <button className="btn btn--danger" onClick={deleteSelection}>
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3.5 6h17M8 6V4.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V6M18.5 6l-.9 13a1.8 1.8 0 0 1-1.8 1.7H8.2a1.8 1.8 0 0 1-1.8-1.7L5.5 6M10 10.5v6M14 10.5v6" />
                    </svg>
                    Excluir
                  </button>
                </div>
              </Panel>
            )}
            {nodes.length === 0 && (
              <div className="canvas-empty">
                <p className="mono">Quadro em branco</p>
                <h2>Arraste elementos da barra lateral</h2>
                <p>Conecte-os arrastando das bordas de cada elemento.</p>
              </div>
            )}
          </ReactFlow>
          {helpOpen && <HelpModal onClose={() => setHelpOpen(false)} />}
        </div>
      </div>
    </div>
  )
}

export default function Editor(props) {
  return (
    <ReactFlowProvider>
      <Canvas {...props} />
    </ReactFlowProvider>
  )
}
