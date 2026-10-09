// Cliente da API do Funnel Control (/api/studio). Contrato em
// victor-velloso/funnel-control → docs/funnel-studio-api.md.

const SESSION_KEY = 'elyon-funnel-studio:sessao'

export const API_BASE = (import.meta.env.VITE_FC_API_URL || 'https://funnel-control.vercel.app').replace(
  /\/+$/,
  '',
)

export class ApiError extends Error {
  constructor(status, code, message, body = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.body = body
  }
}

const MENSAGENS = {
  credenciais: 'E-mail ou senha incorretos.',
  acesso_desativado: 'Seu acesso ao Funnel Control está desativado.',
  muitas_tentativas: 'Muitas tentativas seguidas. Espere alguns minutos e tente de novo.',
  sem_sessao: 'Sua sessão expirou. Entre de novo.',
  sessao_expirada: 'Sua sessão expirou. Entre de novo.',
  sem_permissao: 'Sua conta pode abrir funis, mas só administradores gravam no sistema.',
  origem: 'O Funnel Control não aceita pedidos deste endereço.',
  nao_encontrado: 'Funil não encontrado no sistema.',
  conflito: 'Outra pessoa salvou este funil antes de você.',
  grande_demais: 'O funil passou do limite do sistema (2000 elementos, 4000 ligações ou 3,5 MB).',
  studio_inativo: 'A integração com o Studio está desligada no Funnel Control agora.',
}

function mensagemDoErro(status, data) {
  if (data.error === 'invalido') {
    return data.message ? `Dados inválidos: ${data.message}` : 'Dados inválidos.'
  }
  if (MENSAGENS[data.error]) return MENSAGENS[data.error]
  if (status === 400) return 'Preencha e-mail e senha.'
  return data.message || `O Funnel Control respondeu com erro ${status}.`
}

/* ---------- Sessão (token no localStorage) ---------- */

export function lerSessao() {
  try {
    const sessao = JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null')
    if (!sessao?.token) return null
    if (sessao.expira_em && Date.parse(sessao.expira_em) <= Date.now()) {
      localStorage.removeItem(SESSION_KEY)
      return null
    }
    return sessao
  } catch {
    return null
  }
}

function gravarSessao(sessao) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessao))
}

export function limparSessao() {
  localStorage.removeItem(SESSION_KEY)
}

const expiredListeners = new Set()

// Avisado quando o servidor responde 401 a uma chamada autenticada.
export function onSessaoExpirada(fn) {
  expiredListeners.add(fn)
  return () => expiredListeners.delete(fn)
}

function avisarSessaoExpirada() {
  for (const fn of expiredListeners) fn()
}

/* ---------- HTTP ---------- */

async function request(path, { method = 'GET', body, auth = true, raw = false } = {}) {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (auth) {
    const sessao = lerSessao()
    if (!sessao) {
      avisarSessaoExpirada()
      throw new ApiError(401, 'sem_sessao', MENSAGENS.sem_sessao)
    }
    headers.Authorization = `Bearer ${sessao.token}`
  }

  let res
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(
      0,
      'rede',
      'Não foi possível falar com o Funnel Control. Verifique a internet e tente de novo.',
    )
  }

  if (res.ok) {
    if (raw) return res
    if (res.status === 204) return null
    return res.json()
  }

  let data = {}
  try {
    data = await res.json()
  } catch {
    /* corpo vazio ou não-JSON */
  }
  if (res.status === 401 && auth) {
    limparSessao()
    avisarSessaoExpirada()
  }
  throw new ApiError(res.status, data.error ?? `http_${res.status}`, mensagemDoErro(res.status, data), data)
}

function query(params) {
  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') qs.set(k, String(v))
  }
  const s = qs.toString()
  return s ? `?${s}` : ''
}

const funilPath = (id) => `/api/studio/funis/${encodeURIComponent(id)}`

/* ---------- Endpoints ---------- */

export async function entrar(email, senha) {
  const data = await request('/api/studio/sessao', {
    method: 'POST',
    body: { email: email.trim(), senha },
    auth: false,
  })
  const sessao = { token: data.token, expira_em: data.expira_em, pessoa: data.pessoa }
  gravarSessao(sessao)
  return sessao
}

export async function quemSou() {
  const { pessoa } = await request('/api/studio/sessao')
  const sessao = lerSessao()
  if (sessao) gravarSessao({ ...sessao, pessoa })
  return pessoa
}

export async function sair() {
  try {
    if (lerSessao()) await request('/api/studio/sessao', { method: 'DELETE' })
  } catch {
    /* sair localmente mesmo se o servidor não responder */
  } finally {
    limparSessao()
  }
}

export async function listarFunis({ especialista, busca } = {}) {
  const data = await request(`/api/studio/funis${query({ especialista, busca: busca?.trim() })}`)
  return data.funis ?? []
}

export async function abrirFunil(id, versao) {
  const data = await request(`${funilPath(id)}${query({ versao })}`)
  return data.funil
}

export async function listarVersoes(id) {
  const data = await request(`${funilPath(id)}/versoes`)
  return data.versoes ?? []
}

export async function salvarFunil({ documento, especialista, nome, precos, versao_base, nota }) {
  return request('/api/studio/funis', {
    method: 'POST',
    body: { documento, especialista, nome, precos, versao_base, nota: nota?.trim() || undefined },
  })
}

export async function exportarFunil(id, versao) {
  const res = await request(`${funilPath(id)}/exportar${query({ versao })}`, { raw: true })
  const blob = await res.blob()
  const disposition = res.headers.get('Content-Disposition') ?? ''
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition)
  const filename = match ? decodeURIComponent(match[1]) : `${id}.funnel.json`
  return { blob, filename }
}
