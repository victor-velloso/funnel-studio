import dagre from '@dagrejs/dagre'

// Auto-layout com dagre, esquerda → direita (estilo Funnelytics).
// Ação explícita do usuário — nunca roda automaticamente.
const FALLBACK = { width: 100, height: 124 }

export function layoutNodes(nodes, edges) {
  const g = new dagre.graphlib.Graph()
  g.setGraph({ rankdir: 'LR', nodesep: 56, ranksep: 110, marginx: 40, marginy: 40 })
  g.setDefaultEdgeLabel(() => ({}))

  // Só elementos de funil entram no layout — anotações espaciais
  // (retângulos, desenhos, textos e notas) ficam onde estão.
  const flowNodes = nodes.filter((n) => n.type === 'funnel')
  const flowIds = new Set(flowNodes.map((n) => n.id))

  for (const node of flowNodes) {
    g.setNode(node.id, {
      width: node.measured?.width ?? node.style?.width ?? FALLBACK.width,
      height: node.measured?.height ?? node.style?.height ?? FALLBACK.height,
    })
  }
  for (const edge of edges) {
    if (flowIds.has(edge.source) && flowIds.has(edge.target)) {
      g.setEdge(edge.source, edge.target)
    }
  }

  dagre.layout(g)

  return nodes.map((node) => {
    const pos = g.node(node.id)
    if (!pos) return node
    return {
      ...node,
      // dagre devolve o centro; React Flow usa o canto superior esquerdo
      position: { x: pos.x - pos.width / 2, y: pos.y - pos.height / 2 },
    }
  })
}
