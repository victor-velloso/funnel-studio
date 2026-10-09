import { describe, it, expect } from 'vitest'
import {
  toDocumento,
  assinatura,
  statusSistema,
  fromFunilSistema,
  stableStringify,
  reaisParaCentavos,
  centavosParaReais,
  precoExplicitoNoTexto,
  precosDosNos,
  montarPrecos,
  quemSalvou,
} from './sistema.js'

const no = (id, icon, label, extra = {}) => ({ id, type: 'funnel', position: { x: 0, y: 0 }, data: { label, icon }, ...extra })

describe('documento', () => {
  it('tira estado de interface e o vínculo local', () => {
    const funnel = {
      id: 'abc',
      name: 'Funil',
      createdAt: 1,
      updatedAt: 2,
      nodes: [no('n1', 'vsl', 'VSL', { selected: true, dragging: false, measured: { width: 1 }, data: { label: 'VSL', editRequested: true } })],
      edges: [{ id: 'e1', source: 'n1', target: 'n1', selected: true, data: { label: 'x', editing: true } }],
      viewport: { x: 1, y: 2, zoom: 1 },
      especialista: 'bruno',
      precos: [{ rotulo: 'Front', valor_centavos: 4700 }],
      sistema: { versao: 3, assinatura: 'x' },
    }
    const doc = toDocumento(funnel)
    expect(doc.nodes[0]).toEqual({ id: 'n1', type: 'funnel', position: { x: 0, y: 0 }, data: { label: 'VSL' } })
    expect(doc.edges[0]).toEqual({ id: 'e1', source: 'n1', target: 'n1', data: { label: 'x' } })
    expect(doc.sistema).toBeUndefined()
    expect(doc).toMatchObject({ id: 'abc', especialista: 'bruno', versao: 3, viewport: { x: 1, y: 2, zoom: 1 } })
  })

  it('assinatura não muda com ordem de chaves, seleção ou zoom', () => {
    const a = { name: 'F', nodes: [{ id: 'n', type: 't', position: { x: 1, y: 2 }, data: { a: 1, b: 2 } }], edges: [], viewport: { zoom: 1 } }
    const b = { name: 'F', nodes: [{ data: { b: 2, a: 1 }, position: { y: 2, x: 1 }, type: 't', id: 'n', selected: true }], edges: [], viewport: { zoom: 2 } }
    expect(assinatura(a)).toBe(assinatura(b))
    expect(assinatura({ ...a, name: 'G' })).not.toBe(assinatura(a))
  })

  it('stableStringify ordena chaves e ignora undefined', () => {
    expect(stableStringify({ b: 1, a: { d: undefined, c: [1, { z: 1, y: 2 }] } })).toBe('{"a":{"c":[1,{"y":2,"z":1}]},"b":1}')
  })

  it('statusSistema: local, salvo e pendente', () => {
    const base = { id: 'a', name: 'F', nodes: [], edges: [] }
    expect(statusSistema(base)).toBe('local')
    const salvo = { ...base, sistema: { versao: 1, assinatura: assinatura(base) } }
    expect(statusSistema(salvo)).toBe('salvo')
    expect(statusSistema({ ...salvo, name: 'Outro' })).toBe('pendente')
    expect(statusSistema({ ...salvo, sistema: { versao: 1, assinatura: null } })).toBe('pendente')
  })

  it('fromFunilSistema monta o funil local já sincronizado', () => {
    const funil = {
      id: 'k3j9',
      nome: 'Funil de VSL',
      especialista: 'estancia',
      versao: 3,
      precos: [{ rotulo: 'Front', valor_centavos: 4700 }],
      atualizado_em: '2026-10-09T12:00:00Z',
      atualizado_por: 'bot:alex',
      documento: { id: 'k3j9', name: 'Funil de VSL', nodes: [no('n1', 'vsl', 'VSL')], edges: [], viewport: null, versao: 3 },
    }
    const local = fromFunilSistema(funil)
    expect(local).toMatchObject({ id: 'k3j9', name: 'Funil de VSL', especialista: 'estancia', sistema: { versao: 3 } })
    expect(local.versao).toBeUndefined()
    expect(statusSistema(local)).toBe('salvo')
  })

  it('versão antiga aberta fica pendente e com a atual como base', () => {
    const funil = { id: 'a', nome: 'F', versao: 2, documento: { nodes: [], edges: [] } }
    const local = fromFunilSistema(funil, { versaoBase: 5, restauradaDe: 2 })
    expect(local.sistema).toMatchObject({ versao: 5, restauradaDe: 2, assinatura: null })
    expect(statusSistema(local)).toBe('pendente')
  })
})

describe('preços', () => {
  it('converte reais em centavos', () => {
    expect(reaisParaCentavos('497')).toBe(49700)
    expect(reaisParaCentavos('497,00')).toBe(49700)
    expect(reaisParaCentavos('R$ 1.997,9')).toBe(199790)
    expect(reaisParaCentavos('47,5')).toBe(4750)
    expect(reaisParaCentavos('abc')).toBeNull()
    expect(reaisParaCentavos('')).toBeNull()
    expect(reaisParaCentavos('49.7')).toBeNull()
  })

  it('formata centavos', () => {
    expect(centavosParaReais(49700)).toBe('497,00')
    expect(centavosParaReais(199790)).toBe('1.997,90')
    expect(centavosParaReais(undefined)).toBe('')
  })

  it('só aceita R$ explícito; texto sem preço não vira preço', () => {
    expect(precoExplicitoNoTexto('Webinário')).toBeNull()
    expect(precoExplicitoNoTexto('WEBINÁRIO 20h')).toBeNull()
    expect(precoExplicitoNoTexto('Quiz')).toBeNull()
    expect(precoExplicitoNoTexto('ORDER BUMP 3 — 30 Versículos')).toBeNull()
    expect(precoExplicitoNoTexto('Checkout R$ 47')).toBe(4700)
    expect(precoExplicitoNoTexto('FRONT R$\u00a0297 — Jornada')).toBe(29700)
  })

  it('tira preços dos rótulos dos elementos', () => {
    const nodes = [
      no('a', 'checkout', 'Checkout R$ 47'),
      no('b', 'upsell', 'Upsell — R$ 197,00'),
      no('c', 'downsell', 'R$ 1.497'),
      no('d', 'vsl', 'VSL sem preço'),
      { id: 'e', type: 'note', position: { x: 0, y: 0 }, data: { text: 'R$ 10 na nota' } },
      no('f', 'sales-page', 'Order bump R$ 27'),
      { id: 'g', type: 'funnel', position: { x: 0, y: 0 }, data: { label: 'Mentoria', icon: 'call', valor_centavos: 300000 } },
      { id: 'h', type: 'funnel', position: { x: 0, y: 0 }, data: { label: 'Webinário', icon: 'webinar' } },
      { id: 'i', type: 'funnel', position: { x: 0, y: 0 }, data: { label: 'WEBINÁRIO 20h', icon: 'webinar' } },
      {
        id: 'j',
        type: 'funnel',
        position: { x: 0, y: 0 },
        data: { label: 'Backend R$ 99', icon: 'webinar', preco_centavos: 59700 },
      },
      no('k', 'checkout', 'FRONT R$\u00a047 — PDF da área'),
    ]
    expect(precosDosNos(nodes)).toEqual([
      { rotulo: 'Checkout', valor_centavos: 4700, tipo: 'front', no_id: 'a' },
      { rotulo: 'Upsell', valor_centavos: 19700, tipo: 'upsell', no_id: 'b' },
      { rotulo: 'Downsell', valor_centavos: 149700, tipo: 'downsell', no_id: 'c' },
      { rotulo: 'Order bump', valor_centavos: 2700, tipo: 'order_bump', no_id: 'f' },
      { rotulo: 'Mentoria', valor_centavos: 300000, tipo: 'outro', no_id: 'g' },
      { rotulo: 'Backend', valor_centavos: 59700, tipo: 'backend', no_id: 'j' },
      { rotulo: 'FRONT — PDF da área', valor_centavos: 4700, tipo: 'front', no_id: 'k' },
    ])
  })

  it('preserva type step, pathOptions e preco_centavos no documento', () => {
    const funnel = {
      id: 'x',
      name: 'F',
      createdAt: 1,
      updatedAt: 2,
      nodes: [
        {
          id: 'ck',
          type: 'funnel',
          position: { x: 0, y: 0 },
          data: { label: 'Front', icon: 'checkout', preco_centavos: 4700 },
          selected: true,
        },
      ],
      edges: [
        {
          id: 'e1',
          type: 'step',
          source: 'ck',
          target: 'ck',
          pathOptions: { offset: 20, borderRadius: 0 },
          selected: true,
          data: { label: 'sim', editing: true },
        },
      ],
    }
    const doc = toDocumento(funnel)
    expect(doc.nodes[0].data).toEqual({ label: 'Front', icon: 'checkout', preco_centavos: 4700 })
    expect(doc.edges[0]).toMatchObject({
      type: 'step',
      pathOptions: { offset: 20, borderRadius: 0 },
      data: { label: 'sim' },
    })
    expect(doc.edges[0].selected).toBeUndefined()
    expect(doc.edges[0].data.editing).toBeUndefined()
  })

  it('junta com os preços do sistema: valor do nó vence, nó apagado sai', () => {
    const nodes = [no('a', 'checkout', 'Checkout R$ 57')]
    const existentes = [
      { rotulo: 'Front principal', valor_centavos: 4700, tipo: 'front', no_id: 'a' },
      { rotulo: 'Upsell', valor_centavos: 19700, tipo: 'upsell', no_id: 'apagado' },
      { rotulo: 'Mentoria', valor_centavos: 300000 },
    ]
    const { precos, encontrados } = montarPrecos(nodes, existentes)
    expect(encontrados).toBe(1)
    expect(precos).toEqual([
      { rotulo: 'Front principal', valor_centavos: 5700, tipo: 'front', no_id: 'a' },
      { rotulo: 'Mentoria', valor_centavos: 300000 },
    ])
  })
})

it('quemSalvou mostra pessoa e robô', () => {
  expect(quemSalvou('pessoa:victor@elyon.test')).toBe('victor@elyon.test')
  expect(quemSalvou('bot:alex')).toBe('Alex (robô)')
  expect(quemSalvou(undefined)).toBe('—')
})
