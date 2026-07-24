import { useRef, useState } from 'react'
import { formatDate } from '../lib/storage.js'
import ThemeToggle from './ThemeToggle.jsx'

function MiniPreview({ nodes, edges }) {
  if (!nodes.length) {
    return (
      <div className="card-preview card-preview--empty">
        <span>Quadro vazio</span>
      </div>
    )
  }
  const xs = nodes.map((n) => n.position.x)
  const ys = nodes.map((n) => n.position.y)
  const minX = Math.min(...xs)
  const minY = Math.min(...ys)
  const w = Math.max(...xs) - minX + 1
  const h = Math.max(...ys) - minY + 1
  const scale = Math.min(180 / Math.max(w, 1), 84 / Math.max(h, 1))
  const px = (x) => 10 + (x - minX) * scale
  const py = (y) => 10 + (y - minY) * scale
  const pos = Object.fromEntries(nodes.map((n) => [n.id, [px(n.position.x), py(n.position.y)]]))
  return (
    <svg className="card-preview" viewBox="0 0 200 104" aria-hidden="true">
      {edges.map(
        (e) =>
          pos[e.source] &&
          pos[e.target] && (
            <line
              key={e.id}
              x1={pos[e.source][0]}
              y1={pos[e.source][1]}
              x2={pos[e.target][0]}
              y2={pos[e.target][1]}
              style={{ stroke: 'var(--border)' }}
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
          ),
      )}
      {nodes.map((n) => (
        <rect
          key={n.id}
          x={pos[n.id][0] - 5}
          y={pos[n.id][1] - 5}
          width="10"
          height="10"
          rx="3"
          style={{
            fill: 'var(--bg-surface-alt)',
            stroke: n.type === 'note' ? 'var(--border)' : 'var(--accent)',
          }}
          strokeWidth="1.5"
        />
      ))}
    </svg>
  )
}

function FunnelCard({ funnel, onOpen, onDuplicate, onRename, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <article className="funnel-card" onClick={() => !renaming && onOpen(funnel.id)}>
      <MiniPreview nodes={funnel.nodes} edges={funnel.edges} />
      <div className="funnel-card__body">
        <div className="funnel-card__info">
          {renaming ? (
            <input
              className="funnel-card__rename"
              defaultValue={funnel.name}
              autoFocus
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onRename(funnel.id, e.target.value)
                  setRenaming(false)
                }
                if (e.key === 'Escape') setRenaming(false)
              }}
              onBlur={(e) => {
                onRename(funnel.id, e.target.value)
                setRenaming(false)
              }}
            />
          ) : (
            <h3>{funnel.name}</h3>
          )}
          <p>
            {funnel.nodes.length} {funnel.nodes.length === 1 ? 'elemento' : 'elementos'} ·{' '}
            {formatDate(funnel.updatedAt)}
          </p>
        </div>
        <div className="funnel-card__actions" onClick={(e) => e.stopPropagation()}>
          <button
            className="icon-btn"
            aria-label="Opções"
            onClick={() => {
              setMenuOpen((v) => !v)
              setConfirmDelete(false)
            }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <circle cx="5" cy="12" r="1.7" />
              <circle cx="12" cy="12" r="1.7" />
              <circle cx="19" cy="12" r="1.7" />
            </svg>
          </button>
          {menuOpen && (
            <div className="menu" onMouseLeave={() => setMenuOpen(false)}>
              <button
                onClick={() => {
                  setRenaming(true)
                  setMenuOpen(false)
                }}
              >
                Renomear
              </button>
              <button
                onClick={() => {
                  onDuplicate(funnel.id)
                  setMenuOpen(false)
                }}
              >
                Duplicar
              </button>
              <button
                className="menu__danger"
                onClick={() => {
                  if (confirmDelete) {
                    onDelete(funnel.id)
                  } else {
                    setConfirmDelete(true)
                  }
                }}
              >
                {confirmDelete ? 'Confirmar exclusão?' : 'Excluir'}
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

export default function Dashboard({
  funnels,
  theme,
  onToggleTheme,
  onOpen,
  onCreate,
  onDuplicate,
  onRename,
  onDelete,
  onImport,
}) {
  const fileRef = useRef(null)

  function handleImportFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    file.text().then((text) => {
      try {
        onImport(JSON.parse(text))
      } catch {
        alert('Arquivo inválido — esperado um .funnel.json exportado pelo Funnel Studio.')
      }
    })
    e.target.value = ''
  }

  return (
    <div className="dashboard">
      <header className="dashboard__nav">
        <div className="brand">
          <img src="/logo.png" alt="Elyon Studios" />
          <div className="brand__divider" />
          <span className="brand__app">Funnel Studio</span>
        </div>
        <div className="dashboard__nav-actions">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <button className="btn btn--secondary" onClick={() => fileRef.current?.click()}>
            Importar JSON
          </button>
          <button className="btn btn--primary" onClick={() => onCreate('Funil sem título')}>
            + Novo funil
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            hidden
            onChange={handleImportFile}
          />
        </div>
      </header>

      <main className="dashboard__main">
        <div className="dashboard__heading">
          <span className="badge">Planejamento visual</span>
          <h1>
            Seus <em>funis</em>
          </h1>
          <p>Desenhe, organize e compartilhe a arquitetura dos seus funis de venda.</p>
        </div>

        {funnels.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="rgb(242, 86, 43)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 4h18l-6.5 8v6.5L9.5 21v-9L3 4z" />
            </svg>
            <h2>Desenhe seu primeiro funil</h2>
            <p>Crie um quadro em branco e arraste elementos de tráfego, páginas e ações.</p>
            <button className="btn btn--primary" onClick={() => onCreate('Meu primeiro funil')}>
              + Criar funil
            </button>
          </div>
        ) : (
          <div className="funnel-grid">
            {funnels.map((f) => (
              <FunnelCard
                key={f.id}
                funnel={f}
                onOpen={onOpen}
                onDuplicate={onDuplicate}
                onRename={onRename}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="dashboard__footer">
        <span>Elyon Studios™ — ferramenta interna</span>
        <span className="mono">100% offline · dados no seu navegador</span>
      </footer>
    </div>
  )
}
