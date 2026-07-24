const SHORTCUTS = [
  ['Arrastar da borda de um elemento', 'Conectar'],
  ['Duplo clique na conexão', 'Rotular a conexão'],
  ['Clique no rótulo (elemento selecionado)', 'Editar o texto'],
  ['Duplo clique no elemento da barra lateral', 'Adicionar ao centro'],
  ['Delete / Backspace', 'Excluir seleção'],
  ['⌘Z / Ctrl+Z', 'Desfazer'],
  ['⌘⇧Z / Ctrl+Shift+Z', 'Refazer'],
  ['⌘D / Ctrl+D', 'Duplicar seleção'],
  ['Shift + arrastar', 'Seleção em área'],
  ['⌘/Ctrl + clique', 'Adicionar à seleção'],
  ['Scroll / pinch', 'Zoom'],
]

export default function HelpModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--narrow" onClick={(e) => e.stopPropagation()}>
        <header className="modal__header">
          <div>
            <h2>Atalhos</h2>
            <p>Tudo o que dá para fazer no quadro.</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Fechar">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </header>
        <ul className="shortcut-list">
          {SHORTCUTS.map(([keys, action]) => (
            <li key={keys}>
              <span>{action}</span>
              <kbd>{keys}</kbd>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
