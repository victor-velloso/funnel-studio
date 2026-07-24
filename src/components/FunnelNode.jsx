import { memo, useState } from 'react'
import { Handle, Position, useReactFlow, NodeResizer } from '@xyflow/react'
import { ICONS, PAGE_WIREFRAMES, findElement } from '../data/elements.js'

const HANDLES = [
  { id: 'top', position: Position.Top },
  { id: 'right', position: Position.Right },
  { id: 'bottom', position: Position.Bottom },
  { id: 'left', position: Position.Left },
]

function Label({ id, value, className, selected }) {
  const { setNodes } = useReactFlow()
  const [editing, setEditing] = useState(false)

  function commit(next) {
    setNodes((nodes) =>
      nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, label: next.trim() || n.data.label } } : n,
      ),
    )
    setEditing(false)
  }

  if (editing) {
    return (
      <input
        className={`${className} ${className}--input nodrag`}
        defaultValue={value}
        autoFocus
        onFocus={(e) => e.target.select()}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit(e.target.value)
          if (e.key === 'Escape') setEditing(false)
        }}
        onBlur={(e) => commit(e.target.value)}
      />
    )
  }
  return (
    <span
      className={className}
      onClick={() => selected && setEditing(true)}
      onDoubleClick={() => setEditing(true)}
      title="Clique para editar o texto"
    >
      {value}
    </span>
  )
}

export const FunnelNode = memo(function FunnelNode({ id, data, selected }) {
  const category = findElement(data.icon)?.category ?? 'pages'
  const handles = HANDLES.map((h) => (
    <Handle key={h.id} id={h.id} type="source" position={h.position} className="fs-handle" />
  ))

  return (
    <div className={`fnode ${selected ? 'is-selected' : ''}`}>
      {category === 'pages' ? (
        <div className="pnode">
          <div className="pnode__bar">
            <i />
            <i />
            <i />
          </div>
          <svg
            className="pnode__body"
            viewBox="0 0 64 60"
            dangerouslySetInnerHTML={{
              __html: PAGE_WIREFRAMES[data.icon] ?? PAGE_WIREFRAMES.default,
            }}
          />
          {handles}
        </div>
      ) : (
        <div
          className={`fnode__tile cat-${category} ${
            category === 'milestones' ? 'fnode__tile--diamond' : ''
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            width="26"
            height="26"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            dangerouslySetInnerHTML={{ __html: ICONS[data.icon] ?? ICONS.note }}
          />
          {handles}
        </div>
      )}
      <Label id={id} value={data.label} className="fnode__label" selected={selected} />
    </div>
  )
})

export const NoteNode = memo(function NoteNode({ id, data, selected }) {
  const { setNodes } = useReactFlow()
  return (
    <div className={`nnode ${selected ? 'is-selected' : ''}`}>
      <NodeResizer
        isVisible={selected}
        minWidth={160}
        minHeight={80}
        lineClassName="nnode__resize-line"
        handleClassName="nnode__resize-handle"
      />
      <span className="nnode__tag mono">Nota</span>
      <textarea
        className="nnode__text nodrag"
        value={data.text}
        placeholder="Escreva uma anotação…"
        onChange={(e) =>
          setNodes((nodes) =>
            nodes.map((n) =>
              n.id === id ? { ...n, data: { ...n.data, text: e.target.value } } : n,
            ),
          )
        }
      />
      {HANDLES.map((h) => (
        <Handle key={h.id} id={h.id} type="source" position={h.position} className="fs-handle" />
      ))}
    </div>
  )
})
