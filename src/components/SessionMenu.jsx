import { useState } from 'react'

function iniciais(nome = '', email = '') {
  const partes = (nome || email).trim().split(/[\s@.]+/).filter(Boolean)
  return ((partes[0]?.[0] ?? '?') + (partes[1]?.[0] ?? '')).toUpperCase()
}

// Entrar / quem está logado / sair — no topo do painel e do editor.
export default function SessionMenu({ sessao, onLogin, onLogout }) {
  const [open, setOpen] = useState(false)

  if (!sessao) {
    return (
      <button className="btn btn--secondary" onClick={() => onLogin()}>
        Entrar no sistema
      </button>
    )
  }

  const { pessoa } = sessao
  return (
    <div className="session">
      <button
        className="session__chip"
        onClick={() => setOpen((v) => !v)}
        aria-label="Conta do Funnel Control"
        aria-expanded={open}
      >
        <span className="session__avatar">{iniciais(pessoa?.nome, pessoa?.email)}</span>
        <span className="session__name">{pessoa?.nome?.split(' ')[0] || pessoa?.email}</span>
      </button>
      {open && (
        <div className="menu session__menu" onMouseLeave={() => setOpen(false)}>
          <div className="session__info">
            <strong>{pessoa?.nome || pessoa?.email}</strong>
            <span>{pessoa?.email}</span>
            <span className="mono session__role">
              {pessoa?.papel ?? 'conta'} · {pessoa?.pode_gravar ? 'pode gravar' : 'só leitura'}
            </span>
          </div>
          <button
            className="menu__danger"
            onClick={() => {
              setOpen(false)
              onLogout()
            }}
          >
            Sair do Funnel Control
          </button>
        </div>
      )}
    </div>
  )
}
