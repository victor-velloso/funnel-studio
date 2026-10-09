// Ponte entre o funil local (localStorage) e o documento guardado no Funnel Control.
import { findElement } from '../data/elements.js'

export const ESPECIALISTAS = [
  { id: 'ezenete', nome: 'Ezenete' },
  { id: 'estancia', nome: 'Estancia' },
  { id: 'bruno', nome: 'Bruno' },
  { id: 'dani', nome: 'Dani' },
  { id: 'lara', nome: 'Lara' },
  { id: 'kamila', nome: 'Kamila' },
  { id: 'sede', nome: 'Sede' },
]

export const TIPOS_PRECO = [
  { id: 'front', nome: 'Front' },
  { id: 'order_bump', nome: 'Order bump' },
  { id: 'upsell', nome: 'Upsell' },
  { id: 'downsell', nome: 'Downsell' },
  { id: 'backend', nome: 'Backend' },
  { id: 'outro', nome: 'Outro' },
]

export function nomeEspecialista(id) {
  return ESPECIALISTAS.find((e) => e.id === id)?.nome ?? id ?? '—'
}

/* ---------- Documento ---------- */

// Estado de interface do React Flow que não faz parte do desenho.
function limparNo(node) {
  const { selected, dragging, resizing, measured, ...rest } = node
  if (rest.data?.editRequested !== undefined) {
    const { editRequested, ...data } = rest.data
    rest.data = data
  }
  return rest
}

function limparLigacao(edge) {
  const { selected, ...rest } = edge
  if (rest.data?.editing !== undefined) {
    const { editing, ...data } = rest.data
    rest.data = data
  }
  return rest
}

// O JSON do "Exportar JSON", que é também o `documento` do Funnel Control.
export function toDocumento(funnel) {
  const doc = {
    id: funnel.id,
    name: funnel.name,
    createdAt: funnel.createdAt,
    updatedAt: funnel.updatedAt,
    nodes: (funnel.nodes ?? []).map(limparNo),
    edges: (funnel.edges ?? []).map(limparLigacao),
    viewport: funnel.viewport ?? null,
  }
  if (funnel.especialista) doc.especialista = funnel.especialista
  if (funnel.precos?.length) doc.precos = funnel.precos
  if (funnel.sistema?.versao) doc.versao = funnel.sistema.versao
  return doc
}

// JSON com chaves ordenadas: o Postgres (jsonb) devolve as chaves em outra ordem.
export function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map((v) => (v === undefined ? 'null' : stableStringify(v))).join(',')}]`
  if (value && typeof value === 'object') {
    const keys = Object.keys(value)
      .filter((k) => value[k] !== undefined)
      .sort()
    return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`).join(',')}}`
  }
  return JSON.stringify(value) ?? 'null'
}

// Impressão digital do que importa no funil. Viewport (zoom/pan) fica de fora.
export function assinatura(funnel) {
  return stableStringify({
    name: funnel.name ?? '',
    nodes: (funnel.nodes ?? []).map(limparNo),
    edges: (funnel.edges ?? []).map(limparLigacao),
    especialista: funnel.especialista ?? null,
    precos: funnel.precos ?? [],
  })
}

// 'local' = nunca foi ao sistema · 'salvo' = igual à versão do sistema · 'pendente' = mudou
export function statusSistema(funnel, ao = funnel) {
  if (!funnel.sistema) return 'local'
  if (!funnel.sistema.assinatura) return 'pendente'
  return assinatura(ao) === funnel.sistema.assinatura ? 'salvo' : 'pendente'
}

// Converte o `funil` da API (resumo + documento) num funil local.
// `versaoBase` permite abrir uma versão antiga mantendo a atual como base de conflito.
export function fromFunilSistema(funil, { versaoBase, restauradaDe } = {}) {
  const doc = funil.documento ?? {}
  const base = {
    id: funil.id ?? doc.id,
    name: funil.nome ?? doc.name ?? 'Funil sem título',
    createdAt: doc.createdAt ?? (Date.parse(funil.criado_em) || Date.now()),
    updatedAt: Date.now(),
    nodes: Array.isArray(doc.nodes) ? doc.nodes : [],
    edges: Array.isArray(doc.edges) ? doc.edges : [],
    viewport: doc.viewport ?? null,
    especialista: funil.especialista ?? doc.especialista ?? null,
    precos: Array.isArray(funil.precos) ? funil.precos : Array.isArray(doc.precos) ? doc.precos : [],
  }
  const versao = funil.versao ?? doc.versao ?? 0
  const antiga = restauradaDe && versaoBase && restauradaDe < versaoBase
  return {
    ...base,
    sistema: {
      versao: antiga ? versaoBase : versao,
      assinatura: antiga ? null : assinatura(base),
      restauradaDe: antiga ? restauradaDe : undefined,
      sincronizadoEm: Date.now(),
      atualizadoEm: funil.atualizado_em,
      atualizadoPor: funil.atualizado_por,
    },
  }
}

/* ---------- Preços ---------- */

// Só valor monetário explícito: "R$" + número. Aceita espaço normal e NBSP
// (os funis do Alex usam R$ 47 com espaço não-quebrável).
const PRECO_RE = /R\$[\s\u00a0\u202f]*(\d{1,3}(?:\.\d{3})+|\d+)(?:[,](\d{1,2}))?/i

function centavosDoCampo(data) {
  for (const chave of ['preco_centavos', 'valor_centavos']) {
    const v = data?.[chave]
    if (Number.isInteger(v) && v >= 0) return v
  }
  return null
}

// Extrai "R$ 47" / "R$ 1.997,90" de um texto. Sem "R$" → null (não inventa preço).
export function precoExplicitoNoTexto(texto) {
  const m = PRECO_RE.exec(String(texto ?? ''))
  if (!m) return null
  return reaisParaCentavos(`${m[1]}${m[2] != null ? `,${m[2]}` : ''}`)
}

// "497" · "497,00" · "1.997,90" · "R$ 47" → centavos (inteiro) ou null
export function reaisParaCentavos(texto) {
  if (typeof texto === 'number') return Number.isFinite(texto) ? Math.round(texto * 100) : null
  const bruto = String(texto ?? '').replace(/\u00a0|\u202f/g, ' ')
  const limpo = bruto.replace(/R\$/i, '').trim()
  const m = /^(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d{1,2}))?$/.exec(limpo)
  if (!m) return null
  const inteiro = Number(m[1].replace(/\./g, ''))
  const cent = m[2] ? Number(m[2].padEnd(2, '0')) : 0
  return inteiro * 100 + cent
}

export function centavosParaReais(centavos) {
  if (!Number.isInteger(centavos)) return ''
  return (centavos / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function formatBRL(centavos) {
  return Number.isInteger(centavos) ? `R$ ${centavosParaReais(centavos)}` : '—'
}

function tipoDoNo(node, rotulo) {
  if (/bump/i.test(rotulo)) return 'order_bump'
  if (/back.?end/i.test(rotulo)) return 'backend'
  const icon = node.data?.icon
  if (icon === 'upsell' || /upsell/i.test(rotulo)) return 'upsell'
  if (icon === 'downsell' || /downsell/i.test(rotulo)) return 'downsell'
  if (icon === 'checkout' || icon === 'sales-page' || /front/i.test(rotulo)) return 'front'
  return 'outro'
}

function limparRotulo(texto) {
  return texto
    .replace(/[\s—–\-:|·•()[\]]+$/g, '')
    .replace(/^[\s—–\-:|·•()[\]]+/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

// Preços do desenho. Ordem: campo do nó (preco_centavos / valor_centavos) e,
// só se não houver campo, um "R$ …" explícito no rótulo.
// Textos sem valor monetário ("Webinário", "Quiz", "20h") nunca viram preço.
export function precosDosNos(nodes = []) {
  const out = []
  for (const node of nodes) {
    if (node.type === 'note' || node.type === 'draw' || node.type === 'rect') continue
    const texto = String(node.data?.label ?? node.data?.text ?? '')
    const doCampo = centavosDoCampo(node.data)
    let valor = doCampo
    let rotulo = texto
    if (valor === null) {
      const m = PRECO_RE.exec(texto)
      if (!m) continue
      valor = reaisParaCentavos(`${m[1]}${m[2] != null ? `,${m[2]}` : ''}`)
      rotulo = texto.replace(m[0], ' ')
    } else {
      // Campo manda; tira um R$ do rótulo só para não duplicar o nome.
      rotulo = texto.replace(PRECO_RE, ' ')
    }
    if (valor === null) continue
    rotulo = limparRotulo(rotulo) || findElement(node.data?.icon)?.label || 'Preço'
    out.push({ rotulo, valor_centavos: valor, tipo: tipoDoNo(node, rotulo), no_id: node.id })
  }
  return out
}

// Junta os preços que o sistema já tem com os que estão no desenho.
// O valor do nó vence; rótulo e tipo editados à mão são mantidos.
export function montarPrecos(nodes = [], existentes = []) {
  const ids = new Set(nodes.map((n) => n.id))
  const dosNos = precosDosNos(nodes)
  const precos = existentes
    .filter((p) => !p.no_id || ids.has(p.no_id))
    .map((p) => {
      const doNo = p.no_id && dosNos.find((d) => d.no_id === p.no_id)
      return doNo ? { ...p, valor_centavos: doNo.valor_centavos } : { ...p }
    })
  for (const d of dosNos) {
    if (!precos.some((p) => p.no_id === d.no_id)) precos.push(d)
  }
  return { precos, encontrados: dosNos.length }
}

/* ---------- Exibição ---------- */

export function quemSalvou(autor) {
  if (!autor) return '—'
  if (autor.startsWith('bot:')) {
    const nome = autor.slice(4)
    return `${nome.charAt(0).toUpperCase()}${nome.slice(1)} (robô)`
  }
  return autor.replace(/^pessoa:/, '')
}

export function formatDataHora(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function baixarArquivo(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
