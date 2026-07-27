import { memo, useEffect, useRef, useState } from 'react'
import { Handle, Position, useReactFlow, NodeResizer, NodeToolbar } from '@xyflow/react'
import { ICONS, PAGE_WIREFRAMES, findElement } from '../data/elements.js'

const HANDLES = [
  { id: 'top', position: Position.Top },
  { id: 'right', position: Position.Right },
  { id: 'bottom', position: Position.Bottom },
  { id: 'left', position: Position.Left },
]

function autoGrowEl(el) {
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

function clearEditRequest(setNodes, id) {
  setNodes((nodes) =>
    nodes.map((n) =>
      n.id === id ? { ...n, data: { ...n.data, editRequested: undefined } } : n,
    ),
  )
}

function Label({ id, value, className, selected, editRequested }) {
  const { setNodes } = useReactFlow()
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    if (editRequested) {
      setEditing(true)
      clearEditRequest(setNodes, id)
    }
  }, [editRequested, id, setNodes])

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
      <textarea
        className={`${className} ${className}--input nodrag`}
        defaultValue={value}
        rows={1}
        ref={(el) => {
          if (!el) return
          autoGrowEl(el)
          if (document.activeElement !== el) requestAnimationFrame(() => el.focus())
        }}
        onFocus={(e) => e.target.select()}
        onInput={(e) => autoGrowEl(e.target)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            commit(e.target.value)
          }
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
      <Label
        id={id}
        value={data.label}
        className="fnode__label"
        selected={selected}
        editRequested={data.editRequested}
      />
    </div>
  )
})

const TEXT_SIZES = [
  { id: 'sm', label: 'P' },
  { id: 'md', label: 'M' },
  { id: 'lg', label: 'G' },
  { id: 'xl', label: 'GG' },
]

// Texto livre: escrita direta no quadro, sem card — fundo transparente.
export const TextNode = memo(function TextNode({ id, data, selected }) {
  const { setNodes } = useReactFlow()
  const [editing, setEditing] = useState(() => !data.text)
  const size = data.size ?? 'md'

  useEffect(() => {
    if (data.editRequested) {
      setEditing(true)
      clearEditRequest(setNodes, id)
    }
  }, [data.editRequested, id, setNodes])

  function patch(patchData) {
    setNodes((nodes) =>
      nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patchData } } : n)),
    )
  }

  function commit(value) {
    patch({ text: value.replace(/\s+$/, '') })
    setEditing(false)
  }

  return (
    <div className={`tnode tnode--${size} ${selected ? 'is-selected' : ''}`}>
      <NodeToolbar isVisible={selected && !editing} position={Position.Top} offset={10}>
        <div className="tnode__sizes">
          {TEXT_SIZES.map((s) => (
            <button
              key={s.id}
              className={`mono ${s.id === size ? 'is-active' : ''}`}
              onClick={() => patch({ size: s.id })}
              title={`Tamanho ${s.label}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </NodeToolbar>
      {editing ? (
        <textarea
          className="nodrag"
          autoFocus
          rows={1}
          defaultValue={data.text}
          placeholder="Escreva…"
          ref={(el) => {
            if (!el) return
            autoGrowEl(el)
            // autoFocus não é confiável dentro do React Flow — força no próximo frame
            if (document.activeElement !== el) requestAnimationFrame(() => el.focus())
          }}
          onFocus={(e) => e.target.select()}
          onInput={(e) => autoGrowEl(e.target)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setEditing(false)
          }}
          onBlur={(e) => commit(e.target.value)}
        />
      ) : (
        <span
          className={data.text ? '' : 'tnode__placeholder'}
          onClick={() => selected && setEditing(true)}
          onDoubleClick={() => setEditing(true)}
          title="Clique para editar o texto"
        >
          {data.text || 'Texto'}
        </span>
      )}
    </div>
  )
})

export const NoteNode = memo(function NoteNode({ id, data, selected }) {
  const { setNodes } = useReactFlow()
  const textareaRef = useRef(null)

  useEffect(() => {
    if (data.editRequested) {
      textareaRef.current?.focus()
      clearEditRequest(setNodes, id)
    }
  }, [data.editRequested, id, setNodes])

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
        ref={textareaRef}
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
