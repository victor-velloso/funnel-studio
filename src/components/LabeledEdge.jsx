import { BaseEdge, EdgeLabelRenderer, getBezierPath, useReactFlow } from '@xyflow/react'

// Edge padrão com rótulo editável (duplo clique na conexão para rotular).
export default function LabeledEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  data,
  selected,
}) {
  const { setEdges } = useReactFlow()
  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const label = data?.label ?? ''
  const editing = data?.editing ?? false

  function commit(value) {
    setEdges((es) =>
      es.map((e) =>
        e.id === id ? { ...e, data: { ...e.data, label: value.trim(), editing: false } } : e,
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
