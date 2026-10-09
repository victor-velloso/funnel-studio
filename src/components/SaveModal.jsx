import { useMemo, useState } from 'react'
import { salvarFunil } from '../lib/api.js'
import {
  ESPECIALISTAS,
  TIPOS_PRECO,
  montarPrecos,
  reaisParaCentavos,
  centavosParaReais,
} from '../lib/sistema.js'
import { CloseIcon } from './ConfirmModal.jsx'

function linhaVazia() {
  return { rotulo: '', valor: '', tipo: 'front', no_id: '' }
}

function paraLinha(p) {
  return {
    rotulo: p.rotulo ?? '',
    valor: centavosParaReais(p.valor_centavos),
    tipo: p.tipo ?? '',
    no_id: p.no_id ?? '',
  }
}

// Salva o quadro no Funnel Control. `getDocumento()` devolve o JSON atual do quadro.
// Em 409 mostra a escolha: recarregar a versão do sistema ou salvar por cima.
export default function SaveModal({ funnel, nodes, getDocumento, onSaved, onReload, onClose }) {
  const sugestao = useMemo(() => montarPrecos(nodes, funnel.precos ?? []), [nodes, funnel.precos])
  const [nome, setNome] = useState(funnel.name)
  const [especialista, setEspecialista] = useState(funnel.especialista ?? '')
  const [linhas, setLinhas] = useState(() => sugestao.precos.map(paraLinha))
  const [nota, setNota] = useState(
    funnel.sistema?.restauradaDe ? `Restaurada da versão ${funnel.sistema.restauradaDe}` : '',
  )
  const [fase, setFase] = useState('form')
  const [ocupado, setOcupado] = useState(null)
  const [erro, setErro] = useState(null)
  const [conflito, setConflito] = useState(null)

  const versaoBase = funnel.sistema?.versao ?? 0
  const rotuloDoNo = useMemo(() => {
    const m = new Map()
    for (const n of nodes) m.set(n.id, n.data?.label || n.data?.text || n.type)
    return m
  }, [nodes])

  function setLinha(i, patch) {
    setLinhas((ls) => ls.map((l, j) => (j === i ? { ...l, ...patch } : l)))
  }

  function validar() {
    if (!nome.trim()) return { erro: 'Dê um nome ao funil.' }
    if (!especialista) return { erro: 'Escolha o especialista.' }
    const precos = []
    for (const [i, l] of linhas.entries()) {
      if (!l.rotulo.trim() && !l.valor.trim()) continue
      const valor = reaisParaCentavos(l.valor)
      if (!l.rotulo.trim()) return { erro: `Preço ${i + 1}: falta o rótulo.` }
      if (valor === null) return { erro: `Preço ${i + 1}: valor inválido. Use o formato 497,00.` }
      const p = { rotulo: l.rotulo.trim(), valor_centavos: valor }
      if (l.tipo) p.tipo = l.tipo
      if (l.no_id && rotuloDoNo.has(l.no_id)) p.no_id = l.no_id
      precos.push(p)
    }
    return { precos }
  }

  async function salvar(base) {
    const { erro: erroValidacao, precos } = validar()
    if (erroValidacao) {
      setErro(erroValidacao)
      return
    }
    setErro(null)
    setOcupado('salvando')
    const nomeFinal = nome.trim()
    const documento = { ...getDocumento(), name: nomeFinal, especialista, precos }
    try {
      const res = await salvarFunil({
        documento,
        especialista,
        nome: nomeFinal,
        precos,
        versao_base: base,
        nota,
      })
      onSaved({ res, nome: nomeFinal, especialista, precos })
    } catch (err) {
      setOcupado(null)
      if (err.status === 409) {
        setConflito({ versaoAtual: err.body?.versao_atual, base })
        setFase('conflito')
        return
      }
      setErro(err.message)
    }
  }

  async function recarregar() {
    setOcupado('recarregando')
    try {
      await onReload()
    } catch (err) {
      setErro(err.message)
      setOcupado(null)
    }
  }

  return (
    <div className="modal-overlay" onClick={() => !ocupado && onClose()}>
      <div className="modal" role="dialog" aria-label="Salvar no sistema" onClick={(e) => e.stopPropagation()}>
        <header className="modal__header">
          <div>
            <h2>{fase === 'conflito' ? 'Alguém salvou antes de você' : 'Salvar no sistema'}</h2>
            <p>
              {fase === 'conflito'
                ? 'O funil mudou no Funnel Control enquanto você editava.'
                : versaoBase
                  ? `Cria a versão ${versaoBase + 1} no Funnel Control. A versão ${versaoBase} fica no histórico.`
                  : 'Primeira vez deste funil no Funnel Control.'}
            </p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Fechar" disabled={!!ocupado}>
            <CloseIcon />
          </button>
        </header>

        {fase === 'conflito' ? (
          <div className="conflict">
            <p className="conflict__lead">
              Você partiu da {conflito.base ? `versão ${conflito.base}` : 'cópia local (funil novo)'}, mas no sistema já
              existe a <strong>versão {conflito.versaoAtual ?? 'mais nova'}</strong>. O que você quer fazer?
            </p>
            <div className="conflict__options">
              <div className="conflict__option">
                <h3>Recarregar a versão do sistema</h3>
                <p>
                  Traz a versão {conflito.versaoAtual} para o quadro. As alterações que você fez aqui e não salvou
                  serão descartadas.
                </p>
                <button className="btn btn--secondary" onClick={recarregar} disabled={!!ocupado}>
                  {ocupado === 'recarregando' ? 'Recarregando…' : `Recarregar versão ${conflito.versaoAtual ?? ''}`}
                </button>
              </div>
              <div className="conflict__option conflict__option--danger">
                <h3>Salvar por cima</h3>
                <p>
                  Grava o seu quadro como versão {(conflito.versaoAtual ?? 0) + 1}. A versão {conflito.versaoAtual} de
                  quem salvou antes continua no histórico e pode ser reaberta.
                </p>
                <button
                  className="btn btn--primary"
                  onClick={() => salvar(conflito.versaoAtual)}
                  disabled={!!ocupado || !Number.isInteger(conflito.versaoAtual)}
                >
                  {ocupado === 'salvando' ? 'Salvando…' : 'Salvar por cima mesmo assim'}
                </button>
              </div>
            </div>
            <p className="modal__hint">
              Quer juntar as duas? Use “Exportar JSON” para guardar a sua cópia, recarregue e refaça suas mudanças.
            </p>
            {erro && (
              <p className="form__error" role="alert">
                {erro}
              </p>
            )}
            <footer className="modal__footer modal__footer--end">
              <button className="btn btn--secondary" onClick={onClose} disabled={!!ocupado}>
                Cancelar
              </button>
            </footer>
          </div>
        ) : (
          <form
            className="form"
            onSubmit={(e) => {
              e.preventDefault()
              salvar(versaoBase)
            }}
          >
            <div className="form__row">
              <label className="field">
                <span>Nome do funil</span>
                <input value={nome} onChange={(e) => setNome(e.target.value)} autoFocus />
              </label>
              <label className="field">
                <span>Especialista</span>
                <select value={especialista} onChange={(e) => setEspecialista(e.target.value)} aria-label="Especialista">
                  <option value="" disabled>
                    Escolha…
                  </option>
                  {ESPECIALISTAS.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nome}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="field">
              <span>Preços</span>
              <p className="field__hint">
                {sugestao.encontrados > 0
                  ? `${sugestao.encontrados} ${sugestao.encontrados === 1 ? 'preço encontrado' : 'preços encontrados'} nos elementos do funil. Confira antes de salvar.`
                  : 'Nenhum preço nos elementos. Escreva “R$ 47” no rótulo de um elemento para ele aparecer aqui, ou adicione à mão.'}
              </p>
              {linhas.length > 0 && (
                <div className="prices">
                  <div className="prices__row prices__row--head mono">
                    <span>Rótulo</span>
                    <span>Valor (R$)</span>
                    <span>Tipo</span>
                    <span>Elemento</span>
                    <span />
                  </div>
                  {linhas.map((l, i) => (
                    <div className="prices__row" key={i}>
                      <input
                        aria-label={`Rótulo do preço ${i + 1}`}
                        value={l.rotulo}
                        placeholder="Front"
                        onChange={(e) => setLinha(i, { rotulo: e.target.value })}
                      />
                      <input
                        aria-label={`Valor do preço ${i + 1}`}
                        value={l.valor}
                        inputMode="decimal"
                        placeholder="497,00"
                        onChange={(e) => setLinha(i, { valor: e.target.value })}
                      />
                      <select
                        aria-label={`Tipo do preço ${i + 1}`}
                        value={l.tipo}
                        onChange={(e) => setLinha(i, { tipo: e.target.value })}
                      >
                        <option value="">—</option>
                        {TIPOS_PRECO.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.nome}
                          </option>
                        ))}
                      </select>
                      <span className="prices__node" title={rotuloDoNo.get(l.no_id) ?? ''}>
                        {l.no_id ? rotuloDoNo.get(l.no_id) ?? '—' : '—'}
                      </span>
                      <button
                        type="button"
                        className="icon-btn icon-btn--sm"
                        aria-label={`Remover preço ${i + 1}`}
                        onClick={() => setLinhas((ls) => ls.filter((_, j) => j !== i))}
                      >
                        <CloseIcon />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => setLinhas((ls) => [...ls, linhaVazia()])}
              >
                + Adicionar preço
              </button>
            </div>

            <label className="field">
              <span>O que mudou (opcional)</span>
              <input
                value={nota}
                onChange={(e) => setNota(e.target.value)}
                placeholder="Ex.: troquei o upsell por downsell"
              />
            </label>

            {erro && (
              <p className="form__error" role="alert">
                {erro}
              </p>
            )}

            <footer className="modal__footer modal__footer--end">
              <button type="button" className="btn btn--secondary" onClick={onClose} disabled={!!ocupado}>
                Cancelar
              </button>
              <button type="submit" className="btn btn--primary" disabled={!!ocupado}>
                {ocupado === 'salvando' ? 'Salvando…' : 'Salvar no sistema'}
              </button>
            </footer>
          </form>
        )}
      </div>
    </div>
  )
}
