import { useEffect, useState } from 'react'
import { listarVersoes, exportarFunil } from '../lib/api.js'
import { nomeEspecialista, quemSalvou, formatDataHora, baixarArquivo } from '../lib/sistema.js'
import { toast } from '../lib/toast.js'
import { CloseIcon } from './ConfirmModal.jsx'

// Histórico de versões de um funil do sistema. `onOpenVersion(versao, versaoAtual)`
// carrega a versão no quadro; `temPendencias` pede confirmação antes de substituir.
export default function HistoryModal({ funilId, nome, versaoAberta, temPendencias, onOpenVersion, onClose }) {
  const [estado, setEstado] = useState({ carregando: true, erro: null, versoes: [] })
  const [confirmar, setConfirmar] = useState(null)
  const [abrindo, setAbrindo] = useState(null)

  useEffect(() => {
    let vivo = true
    listarVersoes(funilId)
      .then((versoes) => {
        if (!vivo) return
        const ordenadas = [...versoes].sort((a, b) => b.versao - a.versao)
        setEstado({ carregando: false, erro: null, versoes: ordenadas })
      })
      .catch((err) => vivo && setEstado({ carregando: false, erro: err.message, versoes: [] }))
    return () => {
      vivo = false
    }
  }, [funilId])

  const atual = estado.versoes[0]?.versao

  async function abrir(versao) {
    if (temPendencias && confirmar !== versao) {
      setConfirmar(versao)
      return
    }
    setAbrindo(versao)
    try {
      await onOpenVersion(versao, atual)
    } catch (err) {
      toast(err.message, 'error')
      setAbrindo(null)
      setConfirmar(null)
    }
  }

  async function baixar(versao) {
    try {
      const { blob, filename } = await exportarFunil(funilId, versao)
      baixarArquivo(blob, filename)
      toast(`JSON da versão ${versao} baixado`)
    } catch (err) {
      toast(err.message, 'error')
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" role="dialog" aria-label="Histórico de versões" onClick={(e) => e.stopPropagation()}>
        <header className="modal__header">
          <div>
            <h2>Histórico de versões</h2>
            <p>{nome ? `“${nome}” no Funnel Control. ` : ''}Cada salvamento que muda algo vira uma versão.</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Fechar">
            <CloseIcon />
          </button>
        </header>

        {confirmar !== null && (
          <div className="callout callout--warn" role="alert">
            <p>
              Abrir a versão {confirmar} substitui o que está no quadro. As alterações que ainda não foram salvas no
              sistema serão perdidas. Se quiser guardá-las, cancele e use “Exportar JSON” antes.
            </p>
            <div className="callout__actions">
              <button className="btn btn--secondary btn--sm" onClick={() => setConfirmar(null)}>
                Cancelar
              </button>
              <button className="btn btn--primary btn--sm" onClick={() => abrir(confirmar)}>
                Abrir a versão {confirmar} mesmo assim
              </button>
            </div>
          </div>
        )}

        {estado.carregando ? (
          <div className="system__loading mono">Carregando histórico…</div>
        ) : estado.erro ? (
          <p className="form__error">{estado.erro}</p>
        ) : !estado.versoes.length ? (
          <p className="modal__hint">Este funil ainda não tem versões.</p>
        ) : (
          <ol className="versions">
            {estado.versoes.map((v) => (
              <li key={v.versao} className={v.versao === versaoAberta ? 'is-open' : ''}>
                <div className="versions__num mono">
                  v{v.versao}
                  {v.versao === atual && <span className="versions__badge">atual</span>}
                </div>
                <div className="versions__body">
                  <strong>{v.nota || v.nome}</strong>
                  <span>
                    {formatDataHora(v.salvo_em)} · {quemSalvou(v.salvo_por)}
                    {v.nota && ` · ${v.nome}`} · {nomeEspecialista(v.especialista)}
                  </span>
                </div>
                <div className="versions__actions">
                  <button className="btn btn--secondary btn--sm" onClick={() => baixar(v.versao)}>
                    JSON
                  </button>
                  <button
                    className="btn btn--primary btn--sm"
                    onClick={() => abrir(v.versao)}
                    disabled={abrindo !== null}
                  >
                    {abrindo === v.versao ? 'Abrindo…' : v.versao === versaoAberta ? 'Reabrir' : 'Abrir'}
                  </button>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  )
}
