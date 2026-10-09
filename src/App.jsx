import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Dashboard from './components/Dashboard.jsx'
import Editor from './components/Editor.jsx'
import Toasts from './components/Toasts.jsx'
import LoginModal from './components/LoginModal.jsx'
import HistoryModal from './components/HistoryModal.jsx'
import ConfirmModal from './components/ConfirmModal.jsx'
import { loadWorkspace, saveWorkspace, newFunnel, uid } from './lib/storage.js'
import { lerSessao, onSessaoExpirada, quemSou, sair, abrirFunil } from './lib/api.js'
import { fromFunilSistema, statusSistema, ESPECIALISTAS } from './lib/sistema.js'
import { toast } from './lib/toast.js'

const THEME_KEY = 'elyon-funnel-studio:theme'

export default function App() {
  const [workspace, setWorkspace] = useState(loadWorkspace)
  const [openId, setOpenId] = useState(null)
  const [editorRev, setEditorRev] = useState(0)
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) ?? 'dark')
  const [sessao, setSessao] = useState(lerSessao)
  const [login, setLogin] = useState(null)
  const [historico, setHistorico] = useState(null)
  const [confirmacao, setConfirmacao] = useState(null)
  const workspaceRef = useRef(workspace)
  workspaceRef.current = workspace

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  // 401 em qualquer chamada: limpa a sessão e pede login de novo.
  useEffect(
    () =>
      onSessaoExpirada(() => {
        setSessao(null)
        setLogin((cur) => cur ?? { motivo: 'Sua sessão expirou. Entre de novo para continuar.' })
      }),
    [],
  )

  // Confere o token guardado e atualiza nome/papel (pode ter mudado no FC).
  useEffect(() => {
    if (!lerSessao()) return
    quemSou()
      .then((pessoa) => setSessao((s) => (s ? { ...s, pessoa } : s)))
      .catch(() => {})
  }, [])

  const toggleTheme = useCallback(
    () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
    [],
  )

  const requestLogin = useCallback((motivo, depois) => {
    setLogin({ motivo, depois })
  }, [])

  const logout = useCallback(async () => {
    await sair()
    setSessao(null)
    toast('Você saiu do Funnel Control. Os funis locais continuam aqui.')
  }, [])

  const persist = useCallback((updater) => {
    setWorkspace((ws) => {
      const next = typeof updater === 'function' ? updater(ws) : updater
      saveWorkspace(next)
      return next
    })
  }, [])

  const createFunnel = useCallback(
    (name, nodes = [], edges = []) => {
      const funnel = newFunnel(name, nodes, edges)
      persist((ws) => ({ ...ws, funnels: [funnel, ...ws.funnels] }))
      setOpenId(funnel.id)
    },
    [persist],
  )

  const duplicateFunnel = useCallback(
    (id) => {
      persist((ws) => {
        const src = ws.funnels.find((f) => f.id === id)
        if (!src) return ws
        const { sistema, ...rest } = structuredClone(src)
        const copy = {
          ...rest,
          id: uid(),
          name: `${src.name} (cópia)`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }
        return { ...ws, funnels: [copy, ...ws.funnels] }
      })
    },
    [persist],
  )

  const renameFunnel = useCallback(
    (id, name) => {
      persist((ws) => ({
        ...ws,
        funnels: ws.funnels.map((f) =>
          f.id === id ? { ...f, name: name.trim() || f.name, updatedAt: Date.now() } : f,
        ),
      }))
    },
    [persist],
  )

  const deleteFunnel = useCallback(
    (id) => {
      persist((ws) => ({ ...ws, funnels: ws.funnels.filter((f) => f.id !== id) }))
      setOpenId((cur) => (cur === id ? null : cur))
    },
    [persist],
  )

  const updateFunnel = useCallback(
    (id, patch) => {
      persist((ws) => ({
        ...ws,
        funnels: ws.funnels.map((f) =>
          f.id === id ? { ...f, ...patch, updatedAt: Date.now() } : f,
        ),
      }))
    },
    [persist],
  )

  const importFunnel = useCallback(
    (data) => {
      const funnel = {
        id: uid(),
        name: typeof data.name === 'string' ? data.name : 'Funil importado',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        nodes: Array.isArray(data.nodes) ? data.nodes : [],
        edges: Array.isArray(data.edges) ? data.edges : [],
        viewport: data.viewport ?? null,
      }
      if (ESPECIALISTAS.some((e) => e.id === data.especialista)) funnel.especialista = data.especialista
      if (Array.isArray(data.precos)) funnel.precos = data.precos
      persist((ws) => ({ ...ws, funnels: [funnel, ...ws.funnels] }))
      setOpenId(funnel.id)
    },
    [persist],
  )

  /* ---------- Funnel Control ---------- */

  // Coloca um funil do sistema no navegador (substitui a cópia local) e abre no editor.
  const loadFromSystem = useCallback(
    (funil, opts) => {
      const local = fromFunilSistema(funil, opts)
      persist((ws) => {
        const existe = ws.funnels.some((f) => f.id === local.id)
        return {
          ...ws,
          funnels: existe
            ? ws.funnels.map((f) => (f.id === local.id ? local : f))
            : [local, ...ws.funnels],
        }
      })
      setOpenId(local.id)
      setEditorRev((r) => r + 1)
      return local
    },
    [persist],
  )

  const openFromSystem = useCallback(
    async (id) => {
      let funil
      try {
        funil = await abrirFunil(id)
      } catch (err) {
        toast(err.message, 'error')
        return
      }
      const local = workspaceRef.current.funnels.find((f) => f.id === id)
      if (local && statusSistema(local) !== 'salvo') {
        setConfirmacao({
          title: 'Você tem alterações não salvas neste funil',
          message: `A sua cópia de “${local.name}” neste navegador tem mudanças que não estão no sistema. Abrir a versão ${funil.versao} do sistema descarta essas mudanças.`,
          confirmLabel: `Abrir versão ${funil.versao} do sistema`,
          cancelLabel: 'Continuar com a minha cópia',
          onConfirm: () => {
            loadFromSystem(funil)
            setConfirmacao(null)
          },
          onCancel: () => {
            setOpenId(id)
            setConfirmacao(null)
          },
          onDismiss: () => setConfirmacao(null),
        })
        return
      }
      loadFromSystem(funil)
    },
    [loadFromSystem],
  )

  const openVersion = useCallback(
    async (id, versao, versaoAtual) => {
      const funil = await abrirFunil(id, versao)
      loadFromSystem(funil, { versaoBase: versaoAtual, restauradaDe: versao })
      toast(versao === versaoAtual ? `Versão ${versao} aberta` : `Versão ${versao} aberta. Salve para torná-la a atual.`)
    },
    [loadFromSystem],
  )

  const systemSaved = useCallback(
    (id, patch) => {
      if (patch.id && patch.id !== id) {
        persist((ws) => ({
          ...ws,
          funnels: ws.funnels.map((f) => (f.id === id ? { ...f, ...patch, updatedAt: Date.now() } : f)),
        }))
        setOpenId(patch.id)
        setEditorRev((r) => r + 1)
        return
      }
      updateFunnel(id, patch)
    },
    [persist, updateFunnel],
  )

  const openFunnel = workspace.funnels.find((f) => f.id === openId)
  const localById = useMemo(() => new Map(workspace.funnels.map((f) => [f.id, f])), [workspace.funnels])

  return (
    <>
      {openFunnel ? (
        <Editor
          key={`${openFunnel.id}:${editorRev}`}
          funnel={openFunnel}
          theme={theme}
          sessao={sessao}
          onToggleTheme={toggleTheme}
          onBack={() => setOpenId(null)}
          onChange={(patch) => updateFunnel(openFunnel.id, patch)}
          onRename={(name) => renameFunnel(openFunnel.id, name)}
          onRequestLogin={requestLogin}
          onLogout={logout}
          onSystemSaved={(patch) => systemSaved(openFunnel.id, patch)}
          onLoadFromSystem={loadFromSystem}
          onOpenVersion={(versao, atual) => openVersion(openFunnel.id, versao, atual)}
        />
      ) : (
        <Dashboard
          funnels={workspace.funnels}
          localById={localById}
          theme={theme}
          sessao={sessao}
          onToggleTheme={toggleTheme}
          onOpen={setOpenId}
          onCreate={createFunnel}
          onDuplicate={duplicateFunnel}
          onRename={renameFunnel}
          onDelete={deleteFunnel}
          onImport={importFunnel}
          onLogin={requestLogin}
          onLogout={logout}
          onOpenFromSystem={openFromSystem}
          onHistory={(f) => setHistorico(f)}
        />
      )}
      {historico && (
        <HistoryModal
          funilId={historico.id}
          nome={historico.nome}
          temPendencias={(() => {
            const local = localById.get(historico.id)
            return !!local && statusSistema(local) !== 'salvo'
          })()}
          onOpenVersion={async (versao, atual) => {
            await openVersion(historico.id, versao, atual)
            setHistorico(null)
          }}
          onClose={() => setHistorico(null)}
        />
      )}
      {login && (
        <LoginModal
          motivo={login.motivo}
          onClose={() => setLogin(null)}
          onSuccess={(s) => {
            setSessao(s)
            const depois = login.depois
            setLogin(null)
            toast(`Olá, ${s.pessoa?.nome?.split(' ')[0] || s.pessoa?.email}! Você está no Funnel Control.`)
            depois?.(s)
          }}
        />
      )}
      {confirmacao && <ConfirmModal {...confirmacao} />}
      <Toasts />
    </>
  )
}
