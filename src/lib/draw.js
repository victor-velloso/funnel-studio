// Utilidades de desenho à mão livre + reconhecimento de formas.

export function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function pathLength(pts) {
  let L = 0
  for (let i = 1; i < pts.length; i++) L += dist(pts[i - 1], pts[i])
  return L
}

export function pointSegDist(p, a, b) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len2 = dx * dx + dy * dy
  if (!len2) return dist(p, a)
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2
  t = Math.max(0, Math.min(1, t))
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy))
}

// Simplificação Ramer–Douglas–Peucker
export function rdp(pts, eps) {
  if (pts.length < 3) return pts
  let maxD = 0
  let idx = 0
  for (let i = 1; i < pts.length - 1; i++) {
    const d = pointSegDist(pts[i], pts[0], pts[pts.length - 1])
    if (d > maxD) {
      maxD = d
      idx = i
    }
  }
  if (maxD > eps) {
    const left = rdp(pts.slice(0, idx + 1), eps)
    const right = rdp(pts.slice(idx), eps)
    return left.slice(0, -1).concat(right)
  }
  return [pts[0], pts[pts.length - 1]]
}

// Suaviza (média móvel) e reduz pontos mantendo a fidelidade da curva
function smoothResample(pts) {
  const sm = pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)]
    const c = pts[Math.min(pts.length - 1, i + 1)]
    return { x: (a.x + p.x + c.x) / 3, y: (a.y + p.y + c.y) / 3 }
  })
  return rdp(sm, 2.5)
}

// Path SVG suavizado (quadráticas pelos pontos médios)
export function smoothPath(pts) {
  if (!pts || pts.length < 2) return ''
  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i].x + pts[i + 1].x) / 2
    const my = (pts[i].y + pts[i + 1].y) / 2
    d += ` Q ${pts[i].x} ${pts[i].y} ${mx} ${my}`
  }
  const last = pts[pts.length - 1]
  d += ` L ${last.x} ${last.y}`
  return d
}

function sharpPath(pts) {
  if (!pts || pts.length < 2) return ''
  return pts.map((p, i) => `${i ? 'L' : 'M'} ${p.x} ${p.y}`).join(' ')
}

export function buildPath(pts, kind) {
  // 'smooth' = curvas reconhecidas/legadas; todo o resto (free/sharp) é
  // polilinha fiel — com amostragem densa, fica exatamente como desenhado
  return kind === 'smooth' ? smoothPath(pts) : sharpPath(pts)
}

/**
 * Reconhece o traço desenhado e devolve uma versão "limpa":
 * - reta (com snap aos eixos), curva suavizada,
 * - círculo, triângulo, retângulo/quadrilátero, blob fechado suave.
 */
export function recognizeStroke(pts) {
  if (pts.length < 3) return { points: pts, kind: 'sharp' }
  const L = pathLength(pts)
  const first = pts[0]
  const last = pts[pts.length - 1]
  const closed = dist(first, last) < Math.max(0.18 * L, 20)

  if (!closed) {
    // Reta?
    let maxDev = 0
    for (const p of pts) maxDev = Math.max(maxDev, pointSegDist(p, first, last))
    if (maxDev < Math.max(0.06 * L, 8)) {
      const a = { ...first }
      const b = { ...last }
      const deg = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI
      const near = (v, t) => Math.abs(((v - t + 180) % 360) - 180) < 8
      if (near(deg, 0) || near(deg, 180)) b.y = a.y
      else if (near(deg, 90) || near(deg, -90)) b.x = a.x
      return { points: [a, b], kind: 'sharp' }
    }
    // Curva suave
    return { points: smoothResample(pts), kind: 'smooth' }
  }

  // Fechado — círculo?
  const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length
  const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length
  const rs = pts.map((p) => Math.hypot(p.x - cx, p.y - cy))
  const rMean = rs.reduce((a, b) => a + b, 0) / rs.length
  const rStd = Math.sqrt(rs.reduce((s, r) => s + (r - rMean) ** 2, 0) / rs.length)
  if (rMean > 8 && rStd / rMean < 0.16) {
    const N = 40
    const out = []
    for (let i = 0; i <= N; i++) {
      const t = (i / N) * Math.PI * 2
      out.push({ x: cx + rMean * Math.cos(t), y: cy + rMean * Math.sin(t) })
    }
    return { points: out, kind: 'smooth' }
  }

  // Polígono? Conta vértices via RDP
  const corners = rdp(pts, Math.max(0.03 * L, 10))
  const verts = corners.slice(0, -1)
  if (verts.length === 3) {
    return { points: [...verts, { ...verts[0] }], kind: 'sharp' }
  }
  if (verts.length === 4) {
    // Se as arestas forem ~horizontais/verticais, vira retângulo alinhado
    const axisAligned = verts.every((v, i) => {
      const n = verts[(i + 1) % 4]
      const deg = Math.abs((Math.atan2(n.y - v.y, n.x - v.x) * 180) / Math.PI)
      return deg < 18 || Math.abs(deg - 90) < 18 || Math.abs(deg - 180) < 18
    })
    if (axisAligned) {
      const xs = verts.map((v) => v.x)
      const ys = verts.map((v) => v.y)
      const minX = Math.min(...xs)
      const maxX = Math.max(...xs)
      const minY = Math.min(...ys)
      const maxY = Math.max(...ys)
      return {
        points: [
          { x: minX, y: minY },
          { x: maxX, y: minY },
          { x: maxX, y: maxY },
          { x: minX, y: maxY },
          { x: minX, y: minY },
        ],
        kind: 'sharp',
      }
    }
    return { points: [...verts, { ...verts[0] }], kind: 'sharp' }
  }

  // Blob fechado → curva fechada suave
  const sm = smoothResample(pts)
  sm.push({ ...sm[0] })
  return { points: sm, kind: 'smooth' }
}
