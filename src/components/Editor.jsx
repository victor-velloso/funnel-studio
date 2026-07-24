import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  MiniMap,
  Controls,
  Panel,
  ConnectionMode,
  MarkerType,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  useReactFlow,
  getViewportForBounds,
} from '@xyflow/react'
import { toPng } from 'html-to-image'
import { FunnelNode, NoteNode } from './FunnelNode.jsx'
import Sidebar from './Sidebar.jsx'
import ThemeToggle from './ThemeToggle.jsx'
import { uid, downloadJSON, slug, formatTime } from '../lib/storage.js'

const nodeTypes = { funnel: FunnelNode, note: NoteNode }

const edgeDefaults = {
  type: 'default',
  markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18, color: '#8a8a8a' },
  style: { stroke: '#6b6b6b', strokeWidth: 1.8, strokeDasharray: '7 5' },
}

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

function Canvas({ funnel, theme, onToggleTheme, onChange, onRename, onBack }) {
  const [nodes, setNodes] = useState(funnel.nodes)
  const [edges, setEdges] = useState(funnel.edges)
  const [savedAt, setSavedAt] = useState(null)
  const { screenToFlowPosition, getViewport, getNodesBounds } = useReactFlow()
  const wrapperRef = useRef(null)

  // Refs estáveis para o auto-save (onChange do App muda de identidade a cada render)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const latestRef = useRef({ nodes, edges })
  latestRef.current = { nodes, edges }

  // Auto-save com debounce
  const firstRun = useRef(true)
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false
      return
    }
    const t = setTimeout(() => {
      onChangeRef.current({ nodes, edges, viewport: getViewport() })
      setSavedAt(Date.now())
    }, 600)
    return () => clearTimeout(t)
  }, [nodes, edges, getViewport])

  // Flush no unmount — sem isso, alterações feitas até 600ms antes de sair se perdem
  useEffect(() => {
    return () => {
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
    (connection) => setEdges((es) => addEdge({ ...connection, ...edgeDefaults }, es)),
    [],
  )

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

  const selectedCount =
    nodes.filter((n) => n.selected).length + edges.filter((e) => e.selected).length

  const deleteSelection = useCallback(() => {
    setNodes((ns) => {
      const removed = new Set(ns.filter((n) => n.selected).map((n) => n.id))
      setEdges((es) =>
        es.filter((e) => !e.selected && !removed.has(e.source) && !removed.has(e.target)),
      )
      return ns.filter((n) => !n.selected)
    })
  }, [])

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
  }, [funnel, nodes, edges, getViewport])

  const importInto = useCallback((text) => {
    try {
      const data = JSON.parse(text)
      if (!Array.isArray(data.nodes)) throw new Error('sem nodes')
      setNodes(data.nodes)
      setEdges(Array.isArray(data.edges) ? data.edges : [])
    } catch {
      alert('Arquivo inválido — esperado um .funnel.json exportado pelo Funnel Studio.')
    }
  }, [])

  const exportPNG = useCallback(() => {
    if (!nodes.length) {
      alert('O quadro está vazio — adicione elementos antes de exportar.')
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
      })
      .catch(() => alert('Não foi possível gerar o PNG. Tente novamente.'))
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
      />
      <div className="editor__body">
        <Sidebar onAdd={addElement} />
        <div className="editor__canvas" ref={wrapperRef}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            connectionMode={ConnectionMode.Loose}
            connectionRadius={34}
            defaultEdgeOptions={edgeDefaults}
            connectionLineStyle={{ stroke: 'rgb(242, 86, 43)', strokeWidth: 1.8, strokeDasharray: '7 5' }}
            defaultViewport={funnel.viewport ?? undefined}
            fitView={!funnel.viewport && funnel.nodes.length > 0}
            fitViewOptions={{ padding: 0.25 }}
            deleteKeyCode={['Backspace', 'Delete']}
            selectionKeyCode="Shift"
            multiSelectionKeyCode={['Meta', 'Control']}
            proOptions={{ hideAttribution: true }}
            zoomOnDoubleClick={false}
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
            {selectedCount > 0 && (
              <Panel position="bottom-center">
                <div className="selection-bar">
                  <span>
                    {selectedCount} {selectedCount === 1 ? 'item selecionado' : 'itens selecionados'}
                  </span>
                  <button className="btn btn--danger" onClick={deleteSelection}>
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3.5 6h17M8 6V4.5A1.5 1.5 0 0 1 9.5 3h5A1.5 1.5 0 0 1 16 4.5V6M18.5 6l-.9 13a1.8 1.8 0 0 1-1.8 1.7H8.2a1.8 1.8 0 0 1-1.8-1.7L5.5 6M10 10.5v6M14 10.5v6" />
                    </svg>
                    Excluir
                  </button>
                </div>
              </Panel>
            )}
            <Controls showInteractive={false} position="bottom-left" />
            {nodes.length === 0 && (
              <div className="canvas-empty">
                <p className="mono">Quadro em branco</p>
                <h2>Arraste elementos da barra lateral</h2>
                <p>Conecte-os arrastando das bordas de cada elemento.</p>
              </div>
            )}
          </ReactFlow>
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
