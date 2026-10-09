export function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  )
}

export default function ConfirmModal({
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  onDismiss,
}) {
  return (
    <div className="modal-overlay" onClick={onDismiss ?? onCancel}>
      <div className="modal modal--narrow" role="dialog" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <header className="modal__header">
          <div>
            <h2>{title}</h2>
            <p>{message}</p>
          </div>
        </header>
        <footer className="modal__footer modal__footer--end">
          <button className="btn btn--secondary" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button className="btn btn--primary" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </footer>
      </div>
    </div>
  )
}
