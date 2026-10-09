// Servidor de mentira da API /api/studio do Funnel Control (contrato em
// funnel-control/docs/funnel-studio-api.md). Usado nos testes e2e e para
// desenvolver sem tocar na produção:  node e2e/mock-fc.mjs  (porta 5299)
import http from 'node:http'
import { randomBytes } from 'node:crypto'

const PORT = Number(process.env.MOCK_FC_PORT ?? 5299)
const ESPECIALISTAS = ['ezenete', 'estancia', 'bruno', 'dani', 'lara', 'kamila', 'sede']

const PESSOAS = [
  { id: 'p1', email: 'victor@elyon.test', senha: 'senha-certa', nome: 'Victor Velloso', papel: 'administrador', pode_gravar: true },
  { id: 'p2', email: 'leitor@elyon.test', senha: 'senha-certa', nome: 'Lia Leitora', papel: 'gestor', pode_gravar: false },
]

let sessoes = new Map()
let funis = new Map()
let log = []

function stable(v) {
  if (Array.isArray(v)) return `[${v.map(stable).join(',')}]`
  if (v && typeof v === 'object') {
    return `{${Object.keys(v)
      .filter((k) => v[k] !== undefined)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${stable(v[k])}`)
      .join(',')}}`
  }
  return JSON.stringify(v) ?? 'null'
}

const no = (id, icon, x, y, label) => ({ id, type: 'funnel', position: { x, y }, data: { label, icon } })
const lig = (id, source, target) => ({ id, source, target, sourceHandle: 'right', targetHandle: 'left', type: 'default', animated: false, style: { strokeDasharray: '7 5' }, data: {} })

function semente() {
  sessoes = new Map()
  funis = new Map()
  log = []
  const base = Date.parse('2026-10-01T12:00:00Z')
  const criar = (id, nome, especialista, versoes) => {
    funis.set(id, {
      id,
      criado_em: new Date(base).toISOString(),
      criado_por: 'pessoa:victor@elyon.test',
      versoes: versoes.map((v, i) => ({
        versao: i + 1,
        nome,
        especialista,
        precos: v.precos ?? [],
        nota: v.nota ?? null,
        salvo_por: v.por ?? 'pessoa:victor@elyon.test',
        salvo_em: new Date(base + (i + 1) * 3600_000 * (id.length + 3)).toISOString(),
        documento: {
          id,
          name: nome,
          nodes: v.nodes,
          edges: v.edges,
          viewport: null,
          especialista,
          precos: v.precos ?? [],
        },
      })),
    })
  }

  const vslNos = [
    no('n1', 'meta-ads', 0, 20, 'Meta Ads'),
    no('n2', 'vsl', 260, 20, 'VSL Raízes'),
    no('n3', 'checkout', 520, 20, 'Checkout R$ 47'),
    no('n4', 'upsell', 780, 20, 'Upsell R$ 197'),
    no('n5', 'thank-you', 1040, 20, 'Obrigado'),
  ]
  const vslLig = [lig('e1', 'n1', 'n2'), lig('e2', 'n2', 'n3'), lig('e3', 'n3', 'n4'), lig('e4', 'n4', 'n5')]
  criar('raizesvsl001', 'Funil Raízes — VSL', 'estancia', [
    { nodes: vslNos.slice(0, 3), edges: vslLig.slice(0, 2), nota: 'Primeira versão', precos: [{ rotulo: 'Checkout', valor_centavos: 4700, tipo: 'front', no_id: 'n3' }] },
    { nodes: vslNos.slice(0, 4), edges: vslLig.slice(0, 3), nota: 'Entrou o upsell', por: 'bot:alex', precos: [{ rotulo: 'Checkout', valor_centavos: 4700, tipo: 'front', no_id: 'n3' }, { rotulo: 'Upsell', valor_centavos: 19700, tipo: 'upsell', no_id: 'n4' }] },
    { nodes: vslNos, edges: vslLig, nota: 'Página de obrigado', precos: [{ rotulo: 'Checkout', valor_centavos: 4700, tipo: 'front', no_id: 'n3' }, { rotulo: 'Upsell', valor_centavos: 19700, tipo: 'upsell', no_id: 'n4' }] },
  ])
  criar('familiaquiz1', 'Família Restaurada — Quiz', 'ezenete', [
    {
      nodes: [no('q1', 'instagram', 0, 0, 'Instagram'), no('q2', 'quiz', 260, 0, 'Quiz'), no('q3', 'sales-page', 520, 0, 'Oferta R$ 97'), no('q4', 'downsell', 780, 0, 'Downsell R$ 67')],
      edges: [lig('f1', 'q1', 'q2'), lig('f2', 'q2', 'q3'), lig('f3', 'q3', 'q4')],
      precos: [{ rotulo: 'Oferta', valor_centavos: 9700, tipo: 'front', no_id: 'q3' }],
    },
  ])
  criar('webinarbru01', 'Webinar Bruno — Lançamento', 'bruno', [
    { nodes: [no('w1', 'youtube', 0, 0, 'YouTube'), no('w2', 'webinar', 260, 0, 'Webinar ao vivo'), no('w3', 'checkout', 520, 0, 'Checkout')], edges: [lig('g1', 'w1', 'w2'), lig('g2', 'w2', 'w3')] },
    { nodes: [no('w1', 'youtube', 0, 0, 'YouTube'), no('w2', 'webinar', 260, 0, 'Webinar ao vivo'), no('w3', 'checkout', 520, 0, 'Checkout R$ 497')], edges: [lig('g1', 'w1', 'w2'), lig('g2', 'w2', 'w3')], nota: 'Preço definido' },
  ])
  criar('sedeisca0001', 'Isca + Nutrição (Sede)', 'sede', [
    { nodes: [no('s1', 'seo', 0, 0, 'Orgânico'), no('s2', 'optin', 260, 0, 'Página da isca'), no('s3', 'sequence', 520, 0, 'Nutrição 7 e-mails')], edges: [lig('h1', 's1', 's2'), lig('h2', 's2', 's3')] },
  ])
}

function atual(f) {
  return f.versoes[f.versoes.length - 1]
}

function resumo(f, v = atual(f)) {
  return {
    id: f.id,
    nome: v.nome,
    especialista: v.especialista,
    versao: v.versao,
    n_nos: v.documento.nodes.length,
    n_ligacoes: v.documento.edges.length,
    precos: v.precos,
    criado_em: f.criado_em,
    criado_por: f.criado_por,
    atualizado_em: v.salvo_em,
    atualizado_por: v.salvo_por,
  }
}

function cors(req, res) {
  const origin = req.headers.origin
  if (origin && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Vary', 'Origin')
  }
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition')
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json', ...headers })
  res.end(body === undefined ? '' : JSON.stringify(body))
}

const erro = (res, status, error, message) => send(res, status, { error, message })

async function lerCorpo(req) {
  let raw = ''
  for await (const chunk of req) raw += chunk
  try {
    return raw ? JSON.parse(raw) : {}
  } catch {
    return null
  }
}

function autenticar(req) {
  const m = /^Bearer (fs_\w+)$/.exec(req.headers.authorization ?? '')
  return m ? sessoes.get(m[1]) : undefined
}

function publica(p) {
  const { senha, ...rest } = p
  return rest
}

function novaVersao(f, { documento, nome, especialista, precos, nota, por }) {
  const anterior = f.versoes.length ? atual(f) : null
  const doc = { ...documento, id: f.id, especialista, precos }
  delete doc.versao
  delete doc.createdAt
  delete doc.updatedAt
  if (anterior) {
    const { documento: d0, nome: n0, especialista: e0, precos: p0 } = anterior
    if (stable(d0) === stable(doc) && n0 === nome && e0 === especialista && stable(p0) === stable(precos)) {
      return { versao: anterior, alterado: false }
    }
  }
  const versao = {
    versao: (anterior?.versao ?? 0) + 1,
    nome,
    especialista,
    precos,
    nota: nota ?? null,
    salvo_por: por,
    salvo_em: new Date().toISOString(),
    documento: doc,
  }
  f.versoes.push(versao)
  return { versao, alterado: true }
}

const server = http.createServer(async (req, res) => {
  cors(req, res)
  const url = new URL(req.url, `http://${req.headers.host}`)
  const path = url.pathname
  if (req.method === 'OPTIONS') return send(res, 204)

  /* ----- controle do mock (só testes) ----- */
  if (path === '/__mock/reset' && req.method === 'POST') {
    semente()
    return send(res, 200, { ok: true })
  }
  if (path === '/__mock/log') return send(res, 200, { log })
  if (path === '/__mock/salvar-como-alex' && req.method === 'POST') {
    const { id } = (await lerCorpo(req)) ?? {}
    const f = funis.get(id)
    if (!f) return erro(res, 404, 'nao_encontrado', 'Funil não encontrado.')
    const a = atual(f)
    const documento = structuredClone(a.documento)
    documento.nodes.push({ id: `alex${f.versoes.length}`, type: 'note', position: { x: 0, y: 260 }, data: { text: 'Nota do Alex' }, style: { width: 220, height: 100 } })
    const { versao } = novaVersao(f, { documento, nome: a.nome, especialista: a.especialista, precos: a.precos, nota: 'Ajuste do Alex', por: 'bot:alex' })
    return send(res, 200, { versao: versao.versao })
  }

  if (!path.startsWith('/api/studio/')) return erro(res, 404, 'nao_encontrado', 'Rota inexistente.')

  const corpo = req.method === 'POST' ? await lerCorpo(req) : undefined
  log.push({ method: req.method, path, query: Object.fromEntries(url.searchParams), body: corpo, auth: req.headers.authorization ?? null })

  /* ----- sessão ----- */
  if (path === '/api/studio/sessao') {
    if (req.method === 'POST') {
      if (!corpo?.email || !corpo?.senha) return erro(res, 400, 'invalido', 'Informe e-mail e senha.')
      const p = PESSOAS.find((x) => x.email === corpo.email && x.senha === corpo.senha)
      if (!p) return erro(res, 401, 'credenciais', 'E-mail ou senha inválidos.')
      const token = `fs_${randomBytes(16).toString('hex')}`
      sessoes.set(token, p)
      return send(res, 200, { token, expira_em: new Date(Date.now() + 30 * 86400_000).toISOString(), pessoa: publica(p) })
    }
    const p = autenticar(req)
    if (!p) return erro(res, 401, 'sem_sessao', 'Entre com o e-mail e a senha do Funnel Control.')
    if (req.method === 'GET') return send(res, 200, { pessoa: publica(p) })
    if (req.method === 'DELETE') {
      sessoes.delete(req.headers.authorization.slice(7))
      return send(res, 204)
    }
  }

  const pessoa = autenticar(req)
  if (!pessoa) return erro(res, 401, 'sem_sessao', 'Entre com o e-mail e a senha do Funnel Control.')

  /* ----- funis ----- */
  if (path === '/api/studio/funis' && req.method === 'GET') {
    const esp = url.searchParams.get('especialista')
    const busca = (url.searchParams.get('busca') ?? '').toLowerCase()
    const lista = [...funis.values()]
      .map((f) => resumo(f))
      .filter((r) => (!esp || r.especialista === esp) && (!busca || r.nome.toLowerCase().includes(busca)))
      .sort((a, b) => b.atualizado_em.localeCompare(a.atualizado_em))
    return send(res, 200, { funis: lista })
  }

  if (path === '/api/studio/funis' && req.method === 'POST') {
    if (!pessoa.pode_gravar) return erro(res, 403, 'sem_permissao', 'Só administrador grava.')
    if (!corpo || typeof corpo.documento !== 'object') return erro(res, 400, 'invalido', 'documento é obrigatório.')
    const { documento } = corpo
    const especialista = corpo.especialista ?? documento.especialista
    if (!ESPECIALISTAS.includes(especialista)) return erro(res, 400, 'invalido', 'especialista inválida.')
    if (!Array.isArray(documento.nodes) || !Array.isArray(documento.edges)) return erro(res, 400, 'invalido', 'nodes e edges precisam ser listas.')
    const precos = corpo.precos ?? documento.precos ?? []
    const ids = new Set(documento.nodes.map((n) => n.id))
    for (const p of precos) {
      if (!Number.isInteger(p.valor_centavos)) return erro(res, 400, 'invalido', 'precos[].valor_centavos precisa ser inteiro.')
      if (p.no_id && !ids.has(p.no_id)) return erro(res, 400, 'invalido', `precos[].no_id ${p.no_id} não é um nó do funil.`)
    }
    const id = documento.id || randomBytes(6).toString('hex')
    let f = funis.get(id)
    const criado = !f
    if (f && Number.isInteger(corpo.versao_base) && corpo.versao_base !== atual(f).versao) {
      return send(res, 409, { error: 'conflito', message: 'Alguém salvou antes.', versao_atual: atual(f).versao })
    }
    if (!f) {
      if (Number.isInteger(corpo.versao_base) && corpo.versao_base !== 0) {
        return send(res, 409, { error: 'conflito', message: 'Funil não existe nessa versão.', versao_atual: 0 })
      }
      f = { id, criado_em: new Date().toISOString(), criado_por: `pessoa:${pessoa.email}`, versoes: [] }
      funis.set(id, f)
    }
    const { versao, alterado } = novaVersao(f, {
      documento,
      nome: corpo.nome || documento.name || 'Funil sem título',
      especialista,
      precos,
      nota: corpo.nota,
      por: `pessoa:${pessoa.email}`,
    })
    return send(res, criado ? 201 : 200, { id, versao: versao.versao, criado, alterado, atualizado_em: versao.salvo_em })
  }

  const m = /^\/api\/studio\/funis\/([^/]+)(\/versoes|\/exportar)?$/.exec(path)
  if (m && req.method === 'GET') {
    const f = funis.get(decodeURIComponent(m[1]))
    if (!f) return erro(res, 404, 'nao_encontrado', 'Funil não encontrado.')
    if (m[2] === '/versoes') {
      return send(res, 200, {
        id: f.id,
        versoes: [...f.versoes].reverse().map(({ versao, nome, especialista, salvo_em, salvo_por, nota }) => ({ versao, nome, especialista, salvo_em, salvo_por, nota })),
      })
    }
    const n = url.searchParams.get('versao')
    const v = n ? f.versoes.find((x) => x.versao === Number(n)) : atual(f)
    if (!v) return erro(res, 404, 'nao_encontrado', 'Versão não encontrada.')
    if (m[2] === '/exportar') {
      const doc = { ...v.documento, versao: v.versao }
      return send(res, 200, doc, { 'Content-Disposition': `attachment; filename="${f.id}-v${v.versao}.funnel.json"` })
    }
    return send(res, 200, { funil: { ...resumo(f, v), documento: { ...v.documento, versao: v.versao } } })
  }

  return erro(res, 404, 'nao_encontrado', 'Rota inexistente.')
})

semente()
server.listen(PORT, '127.0.0.1', () => console.log(`mock Funnel Control em http://127.0.0.1:${PORT}`))
