import { BaseEdge, EdgeLabelRenderer, useReactFlow } from '@xyflow/react'
import { caminhoDaLigacao } from '../lib/flow.js'

// Ligação com rótulo editável (duplo clique). Aceita bezier, step, smoothstep e straight.
export default function LabeledEdge({
  id,
  type = 'default',
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  pathOptions,
  style,
  markerEnd,
  data,
  label: labelProp,
  selected,
}) {
  const { setEdges } = useReactFlow()
  const [path, labelX, labelY] = caminhoDaLigacao({
    type,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    pathOptions,
  })

  const label = data?.label ?? labelProp ?? ''
  const editing = data?.editing ?? false

  function commit(value) {
    const next = value.trim()
    setEdges((es) =>
      es.map((e) =>
        e.id === id
          ? {
              ...e,
              label: next || undefined,
              data: { ...e.data, label: next, editing: false },
            }
          : e,
      ),
    )
  }

  function startEditing() {
    setEdges((es) =>
      es.map((e) => (e.id === id ? { ...e, data: { ...e.data, editing: true } } : e)),
    )
  }

  return (
    <>
      <BaseEdge id={id} path={path} style={style} markerEnd={markerEnd} />
      {(label || editing) && (
        <EdgeLabelRenderer>
          <div
            className={`edge-label nodrag nopan ${selected ? 'is-selected' : ''}`}
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
            }}
          >
            {editing ? (
              <input
                autoFocus
                defaultValue={label}
                placeholder="ex.: 3% conv."
                onFocus={(e) => e.target.select()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commit(e.target.value)
                  if (e.key === 'Escape') commit(label)
                }}
                onBlur={(e) => commit(e.target.value)}
              />
            ) : (
              <span onDoubleClick={startEditing} title="Duplo clique para editar o rótulo">
                {label}
              </span>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
