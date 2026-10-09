import { useState } from 'react'
import { entrar } from '../lib/api.js'
import { CloseIcon } from './ConfirmModal.jsx'

export default function LoginModal({ motivo, onSuccess, onClose }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim() || !senha) {
      setErro('Preencha e-mail e senha.')
      return
    }
    setEnviando(true)
    setErro(null)
    try {
      const sessao = await entrar(email, senha)
      onSuccess(sessao)
    } catch (err) {
      setErro(err.message)
      setEnviando(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={() => !enviando && onClose()}>
      <form
        className="modal modal--narrow"
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        aria-label="Entrar no Funnel Control"
      >
        <header className="modal__header">
          <div>
            <h2>Entrar no Funnel Control</h2>
            <p>{motivo ?? 'Use o mesmo e-mail e senha do Funnel Control.'}</p>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Fechar" disabled={enviando}>
            <CloseIcon />
          </button>
        </header>

        <div className="form">
          <label className="field">
            <span>E-mail</span>
            <input
              type="email"
              autoComplete="username"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@empresa.com"
            />
          </label>
          <label className="field">
            <span>Senha</span>
            <input
              type="password"
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </label>
          {erro && (
            <p className="form__error" role="alert">
              {erro}
            </p>
          )}
        </div>

        <footer className="modal__footer">
          <span className="modal__hint">O acesso fica guardado neste navegador por até 30 dias.</span>
          <button type="submit" className="btn btn--primary" disabled={enviando}>
            {enviando ? 'Entrando…' : 'Entrar'}
          </button>
        </footer>
      </form>
    </div>
  )
}
