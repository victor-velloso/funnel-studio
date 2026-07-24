import { uid } from '../lib/storage.js'
import { EDGE_OPTIONS } from '../lib/flow.js'
import { findElement } from './elements.js'

// Nó de template: chave interna, tipo de elemento, posição e rótulo opcional
const T = (key, type, x, y, label) => ({ key, type, x, y, label })

export const TEMPLATES = [
  {
    id: 'blank',
    name: 'Em branco',
    description: 'Comece do zero num quadro vazio.',
    nodes: [],
    edges: [],
  },
  {
    id: 'vsl',
    name: 'Funil de VSL',
    description: 'Tráfego → captura → VSL → checkout, com upsell e follow-up.',
    nodes: [
      T('t1', 'meta-ads', 0, 20),
      T('t2', 'instagram', 0, 230),
      T('p1', 'optin', 260, 115, 'Página de Captura'),
      T('m1', 'lead', 510, -80),
      T('p2', 'vsl', 510, 115, 'VSL'),
      T('p3', 'checkout', 760, 115),
      T('p4', 'upsell', 1010, 115, 'Upsell 1-Click'),
      T('p5', 'thank-you', 1260, 115, 'Obrigado'),
      T('a1', 'sequence', 510, 330, 'Follow-up de E-mails'),
      T('m2', 'customer', 1010, -80, 'Cliente'),
    ],
    edges: [
      ['t1', 'p1'],
      ['t2', 'p1'],
      ['p1', 'm1'],
      ['p1', 'p2'],
      ['p1', 'a1'],
      ['a1', 'p2'],
      ['p2', 'p3'],
      ['p3', 'p4'],
      ['p4', 'p5'],
      ['p3', 'm2'],
    ],
  },
  {
    id: 'webinar',
    name: 'Funil de Webinar',
    description: 'Inscrição, lembretes, webinar ao vivo e oferta.',
    nodes: [
      T('t1', 'meta-ads', 0, 20),
      T('t2', 'youtube', 0, 230),
      T('p1', 'optin', 260, 115, 'Inscrição no Webinar'),
      T('a1', 'sequence', 510, -80, 'Lembretes por E-mail'),
      T('a2', 'whatsapp', 510, 330, 'Grupo de WhatsApp'),
      T('p2', 'webinar', 510, 115, 'Webinar Ao Vivo'),
      T('p3', 'sales-page', 760, 115, 'Página de Vendas'),
      T('p4', 'checkout', 1010, 115),
      T('m1', 'customer', 1010, -80, 'Cliente'),
      T('p5', 'thank-you', 1260, 115, 'Obrigado'),
    ],
    edges: [
      ['t1', 'p1'],
      ['t2', 'p1'],
      ['p1', 'a1'],
      ['p1', 'a2'],
      ['p1', 'p2'],
      ['a1', 'p2'],
      ['a2', 'p2'],
      ['p2', 'p3'],
      ['p3', 'p4'],
      ['p4', 'p5'],
      ['p4', 'm1'],
    ],
  },
  {
    id: 'launch',
    name: 'Funil de Lançamento',
    description: 'Captura, aquecimento, CPLs e carrinho aberto.',
    nodes: [
      T('t1', 'instagram', 0, 20),
      T('t2', 'meta-ads', 0, 230),
      T('p1', 'optin', 260, 115, 'Captura do Lançamento'),
      T('a1', 'whatsapp', 510, -80, 'Grupo do Lançamento'),
      T('a2', 'sequence', 510, 330, 'Aquecimento por E-mail'),
      T('p2', 'vsl', 510, 115, 'CPL 1'),
      T('p3', 'vsl', 760, 115, 'CPL 2'),
      T('p4', 'vsl', 1010, 115, 'CPL 3'),
      T('p5', 'sales-page', 1260, 115, 'Carrinho Aberto'),
      T('p6', 'checkout', 1510, 115),
      T('m1', 'customer', 1760, 115, 'Cliente'),
    ],
    edges: [
      ['t1', 'p1'],
      ['t2', 'p1'],
      ['p1', 'a1'],
      ['p1', 'a2'],
      ['p1', 'p2'],
      ['p2', 'p3'],
      ['p3', 'p4'],
      ['p4', 'p5'],
      ['p5', 'p6'],
      ['p6', 'm1'],
    ],
  },
  {
    id: 'nurture',
    name: 'Isca + Nutrição',
    description: 'Isca digital, nutrição por e-mail e oferta front-end.',
    nodes: [
      T('t1', 'seo', 0, 20),
      T('t2', 'instagram', 0, 230),
      T('p1', 'optin', 260, 115, 'Página da Isca'),
      T('m2', 'lead', 260, -80),
      T('c1', 'lead-magnet', 510, -80, 'Entrega da Isca'),
      T('p2', 'thank-you', 510, 115, 'Obrigado'),
      T('a1', 'sequence', 760, 115, 'Nutrição — 7 E-mails'),
      T('p3', 'sales-page', 1010, 115, 'Oferta Front-end'),
      T('p4', 'checkout', 1260, 115),
      T('m1', 'customer', 1510, 115, 'Cliente'),
    ],
    edges: [
      ['t1', 'p1'],
      ['t2', 'p1'],
      ['p1', 'm2'],
      ['p1', 'p2'],
      ['p2', 'c1'],
      ['p2', 'a1'],
      ['a1', 'p3'],
      ['p3', 'p4'],
      ['p4', 'm1'],
    ],
  },
]

// Instancia um template com ids novos (chame a cada uso)
export function buildTemplate(spec) {
  const ids = {}
  const nodes = spec.nodes.map((n) => {
    ids[n.key] = uid()
    return {
      id: ids[n.key],
      type: 'funnel',
      position: { x: n.x, y: n.y },
      data: { label: n.label ?? findElement(n.type)?.label ?? n.type, icon: n.type },
    }
  })
  const edges = spec.edges.map(([a, b]) => ({
    id: uid(),
    source: ids[a],
    target: ids[b],
    sourceHandle: 'right',
    targetHandle: 'left',
    ...EDGE_OPTIONS,
  }))
  return { nodes, edges }
}
