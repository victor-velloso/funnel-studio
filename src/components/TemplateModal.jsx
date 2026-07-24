import { useMemo } from 'react'
import { TEMPLATES, buildTemplate } from '../data/templates.js'
import MiniPreview from './MiniPreview.jsx'

export default function TemplateModal({ onPick, onClose }) {
  // Instância única por abertura, apenas para os previews
  const previews = useMemo(() => TEMPLATES.map((t) => ({ ...t, content: buildTemplate(t) })), [])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header className="modal__header">
          <div>
            <h2>Novo funil</h2>
            <p>Comece em branco ou parta de uma estrutura pronta.</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Fechar">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </header>
        <div className="template-grid">
          {previews.map((t) => (
            <button key={t.id} type="button" className="template-card" onClick={() => onPick(t)}>
              <MiniPreview nodes={t.content.nodes} edges={t.content.edges} />
              <div className="template-card__body">
                <h3>{t.name}</h3>
                <p>{t.description}</p>
                {t.content.nodes.length > 0 && (
                  <span className="template-card__count mono">
                    {t.content.nodes.length} elementos
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
