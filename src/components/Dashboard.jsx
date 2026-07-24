import { useMemo, useRef, useState } from 'react'
import { formatDate } from '../lib/storage.js'
import { toast } from '../lib/toast.js'
import { buildTemplate } from '../data/templates.js'
import MiniPreview from './MiniPreview.jsx'
import TemplateModal from './TemplateModal.jsx'
import ThemeToggle from './ThemeToggle.jsx'

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
                  toast('Funil duplicado')
                }}
              >
                Duplicar
              </button>
              <button
                className="menu__danger"
                onClick={() => {
                  if (confirmDelete) {
                    onDelete(funnel.id)
                    toast('Funil excluído')
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
  const [showTemplates, setShowTemplates] = useState(false)
  const [query, setQuery] = useState('')

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return [...funnels]
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .filter((f) => !q || f.name.toLowerCase().includes(q))
  }, [funnels, query])

  function handleImportFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    file.text().then((text) => {
      try {
        onImport(JSON.parse(text))
        toast('Funil importado')
      } catch {
        toast('Arquivo inválido — esperado um .funnel.json', 'error')
      }
    })
    e.target.value = ''
  }

  function handlePickTemplate(spec) {
    const { nodes, edges } = buildTemplate(spec)
    onCreate(spec.id === 'blank' ? 'Funil sem título' : spec.name, nodes, edges)
    setShowTemplates(false)
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
          <button className="btn btn--primary" onClick={() => setShowTemplates(true)}>
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
          <div>
            <span className="badge">Planejamento visual</span>
            <h1>
              Seus <em>funis</em>
            </h1>
            <p>Desenhe, organize e compartilhe a arquitetura dos seus funis de venda.</p>
          </div>
          {funnels.length > 0 && (
            <div className="dashboard__search">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="6.5" />
                <path d="m16 16 5 5" />
              </svg>
              <input
                placeholder="Buscar funil…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          )}
        </div>

        {funnels.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="rgb(242, 86, 43)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 4h18l-6.5 8v6.5L9.5 21v-9L3 4z" />
            </svg>
            <h2>Desenhe seu primeiro funil</h2>
            <p>Crie um quadro em branco ou parta de um template de VSL, webinar ou lançamento.</p>
            <button className="btn btn--primary" onClick={() => setShowTemplates(true)}>
              + Criar funil
            </button>
          </div>
        ) : visible.length === 0 ? (
          <div className="empty-state">
            <h2>Nenhum funil encontrado</h2>
            <p>Nada com o nome “{query.trim()}”. Tente outra busca.</p>
          </div>
        ) : (
          <div className="funnel-grid">
            {visible.map((f) => (
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

      {showTemplates && (
        <TemplateModal onPick={handlePickTemplate} onClose={() => setShowTemplates(false)} />
      )}
    </div>
  )
}
