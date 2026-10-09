import { useEffect, useState } from 'react'
import { listarFunis, exportarFunil } from '../lib/api.js'
import { ESPECIALISTAS, nomeEspecialista, quemSalvou, formatDataHora, baixarArquivo } from '../lib/sistema.js'
import { toast } from '../lib/toast.js'

const FILTRO_KEY = 'elyon-funnel-studio:filtro-sistema'

function lerFiltro() {
  try {
    return JSON.parse(localStorage.getItem(FILTRO_KEY) ?? 'null') ?? { especialista: '', busca: '' }
  } catch {
    return { especialista: '', busca: '' }
  }
}

export default function SystemFunnels({ sessao, localById, onLogin, onOpen, onHistory }) {
  const [filtro, setFiltro] = useState(lerFiltro)
  const [busca, setBusca] = useState(filtro.busca)
  const [estado, setEstado] = useState({ carregando: true, erro: null, funis: [] })
  const [recarregar, setRecarregar] = useState(0)
  const [abrindo, setAbrindo] = useState(null)

  // Debounce da busca para não chamar a API a cada tecla.
  useEffect(() => {
    const t = setTimeout(() => setFiltro((f) => (f.busca === busca ? f : { ...f, busca })), 300)
    return () => clearTimeout(t)
  }, [busca])

  useEffect(() => {
    localStorage.setItem(FILTRO_KEY, JSON.stringify(filtro))
  }, [filtro])

  useEffect(() => {
    if (!sessao) return
    let vivo = true
    setEstado((s) => ({ ...s, carregando: true, erro: null }))
    listarFunis(filtro)
      .then((funis) => vivo && setEstado({ carregando: false, erro: null, funis }))
      .catch((err) => vivo && setEstado({ carregando: false, erro: err.message, funis: [] }))
    return () => {
      vivo = false
    }
  }, [sessao, filtro, recarregar])

  if (!sessao) {
    return (
      <div className="empty-state">
        <h2>Funis do Funnel Control</h2>
        <p>Entre com sua conta do Funnel Control para abrir, salvar e ver o histórico dos funis da equipe.</p>
        <button className="btn btn--primary" onClick={() => onLogin()}>
          Entrar no sistema
        </button>
      </div>
    )
  }

  async function abrir(id) {
    setAbrindo(id)
    try {
      await onOpen(id)
    } finally {
      setAbrindo(null)
    }
  }

  async function baixar(f) {
    try {
      const { blob, filename } = await exportarFunil(f.id)
      baixarArquivo(blob, filename)
      toast('JSON baixado do sistema')
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  const { carregando, erro, funis } = estado

  return (
    <section className="system">
      <div className="system__filters">
        <div className="chips" role="tablist" aria-label="Filtrar por especialista">
          {[{ id: '', nome: 'Todos' }, ...ESPECIALISTAS].map((e) => (
            <button
              key={e.id || 'todos'}
              role="tab"
              aria-selected={filtro.especialista === e.id}
              className={`chip ${filtro.especialista === e.id ? 'is-active' : ''}`}
              onClick={() => setFiltro((f) => ({ ...f, especialista: e.id }))}
            >
              {e.nome}
            </button>
          ))}
        </div>
        <div className="dashboard__search">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="6.5" />
            <path d="m16 16 5 5" />
          </svg>
          <input
            placeholder="Buscar no sistema…"
            aria-label="Buscar no sistema"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
      </div>

      {erro ? (
        <div className="empty-state">
          <h2>Não deu para carregar</h2>
          <p>{erro}</p>
          <button className="btn btn--secondary" onClick={() => setRecarregar((n) => n + 1)}>
            Tentar de novo
          </button>
        </div>
      ) : carregando && !funis.length ? (
        <div className="system__loading mono">Carregando funis do sistema…</div>
      ) : !funis.length ? (
        <div className="empty-state">
          <h2>Nenhum funil encontrado</h2>
          <p>
            {filtro.busca || filtro.especialista
              ? 'Nada com esse filtro. Tente outra busca ou outro especialista.'
              : 'Ainda não há funis no sistema. Abra um funil local e use “Salvar no sistema”.'}
          </p>
        </div>
      ) : (
        <div className={`system__list ${carregando ? 'is-loading' : ''}`}>
          <div className="system__row system__row--head mono">
            <span>Funil</span>
            <span>Especialista</span>
            <span>Versão</span>
            <span>Atualizado</span>
            <span />
          </div>
          {funis.map((f) => {
            const local = localById?.get(f.id)
            return (
              <div key={f.id} className="system__row">
                <button className="system__name" onClick={() => abrir(f.id)} disabled={abrindo === f.id}>
                  <strong>{f.nome}</strong>
                  <span>
                    {f.n_nos ?? 0} {f.n_nos === 1 ? 'elemento' : 'elementos'} · {f.n_ligacoes ?? 0}{' '}
                    {f.n_ligacoes === 1 ? 'ligação' : 'ligações'}
                    {local?.sistema && local.sistema.versao < f.versao && ' · sua cópia está desatualizada'}
                  </span>
                </button>
                <span className="tag">{nomeEspecialista(f.especialista)}</span>
                <span className="mono system__version">v{f.versao}</span>
                <span className="system__updated">
                  {formatDataHora(f.atualizado_em)}
                  <small>{quemSalvou(f.atualizado_por)}</small>
                </span>
                <span className="system__actions">
                  <button className="btn btn--secondary btn--sm" onClick={() => onHistory(f)}>
                    Histórico
                  </button>
                  <button className="btn btn--secondary btn--sm" onClick={() => baixar(f)} title="Baixar o JSON do sistema">
                    JSON
                  </button>
                  <button className="btn btn--primary btn--sm" onClick={() => abrir(f.id)} disabled={abrindo === f.id}>
                    {abrindo === f.id ? 'Abrindo…' : 'Abrir'}
                  </button>
                </span>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
