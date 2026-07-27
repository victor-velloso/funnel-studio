export default function MiniPreview({ nodes, edges }) {
  if (!nodes.length) {
    return (
      <div className="card-preview card-preview--empty">
        <span>Quadro vazio</span>
      </div>
    )
  }
  const xs = nodes.map((n) => n.position.x)
  const ys = nodes.map((n) => n.position.y)
  const minX = Math.min(...xs)
  const minY = Math.min(...ys)
  const w = Math.max(...xs) - minX + 1
  const h = Math.max(...ys) - minY + 1
  const scale = Math.min(180 / Math.max(w, 1), 84 / Math.max(h, 1))
  const px = (x) => 10 + (x - minX) * scale
  const py = (y) => 10 + (y - minY) * scale
  const pos = Object.fromEntries(nodes.map((n) => [n.id, [px(n.position.x), py(n.position.y)]]))
  return (
    <svg className="card-preview" viewBox="0 0 200 104" aria-hidden="true">
      {edges.map(
        (e) =>
          pos[e.source] &&
          pos[e.target] && (
            <line
              key={e.id}
              x1={pos[e.source][0]}
              y1={pos[e.source][1]}
              x2={pos[e.target][0]}
              y2={pos[e.target][1]}
              style={{ stroke: 'var(--border)' }}
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
          ),
      )}
      {nodes.map((n) => (
        <rect
          key={n.id}
          x={pos[n.id][0] - 5}
          y={pos[n.id][1] - 5}
          width="10"
          height="10"
          rx="3"
          style={{
            fill: 'var(--bg-surface-alt)',
            stroke: n.data?.color ?? (n.type === 'funnel' ? 'var(--accent)' : 'var(--border)'),
          }}
          strokeWidth="1.5"
        />
      ))}
    </svg>
  )
}
