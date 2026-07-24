import { useState } from 'react'
import { CATEGORIES, ICONS } from '../data/elements.js'

function ElementTile({ item, category, onAdd }) {
  function onDragStart(e) {
    e.dataTransfer.setData(
      'application/funnelstudio',
      JSON.stringify({ kind: 'funnel', ...item }),
    )
    e.dataTransfer.effectAllowed = 'move'
  }
  return (
    <button
      type="button"
      className="tile"
      draggable
      onDragStart={onDragStart}
      onDoubleClick={() => onAdd({ kind: 'funnel', ...item })}
      title={`Arraste "${item.label}" para o quadro (ou duplo clique)`}
    >
      <div className={`tile__icon cat-${category}`}>
        <svg
          viewBox="0 0 24 24"
          width="22"
          height="22"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          dangerouslySetInnerHTML={{ __html: ICONS[item.type] }}
        />
      </div>
      <span className="tile__label">{item.label}</span>
    </button>
  )
}

export default function Sidebar({ onAdd }) {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()

  const cats = CATEGORIES.map((cat) => ({
    ...cat,
    items: q ? cat.items.filter((i) => i.label.toLowerCase().includes(q)) : cat.items,
  })).filter((cat) => cat.items.length > 0)

  function onDragStartNote(e) {
    e.dataTransfer.setData('application/funnelstudio', JSON.stringify({ kind: 'note' }))
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <aside className="sidebar">
      <div className="sidebar__search">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 5 5" />
        </svg>
        <input
          placeholder="Buscar elemento…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="sidebar__scroll">
        {cats.length === 0 && <p className="sidebar__empty">Nenhum elemento encontrado.</p>}
        {cats.map((cat) => (
          <section key={cat.id} className="sidebar__group">
            <h4 className="mono">{cat.label}</h4>
            <div className="sidebar__grid">
              {cat.items.map((item) => (
                <ElementTile key={item.type} item={item} category={cat.id} onAdd={onAdd} />
              ))}
            </div>
          </section>
        ))}

        {!q && (
          <section className="sidebar__group">
            <h4 className="mono">Anotações</h4>
            <button
              type="button"
              className="note-tile"
              draggable
              onDragStart={onDragStartNote}
              onDoubleClick={() => onAdd({ kind: 'note' })}
              title="Arraste para adicionar uma nota (ou duplo clique)"
            >
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                dangerouslySetInnerHTML={{ __html: ICONS.note }}
              />
              <span>Nota de texto</span>
            </button>
          </section>
        )}
      </div>

      <div className="sidebar__hint mono">Arraste um elemento para o quadro</div>
    </aside>
  )
}
