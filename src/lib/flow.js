import { MarkerType, getBezierPath, getSmoothStepPath, getStraightPath } from '@xyflow/react'

// Opções padrão de conexão — compartilhadas entre o editor e os templates,
// para que edges criadas por qualquer caminho tenham o mesmo visual.
// Step com canto em ângulo reto: linha principal e desvios sem curvas.
export const EDGE_OPTIONS = {
  type: 'step',
  pathOptions: { offset: 20, borderRadius: 0 },
  markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18, color: '#8a8a8a' },
  style: { stroke: '#6b6b6b', strokeWidth: 1.8, strokeDasharray: '7 5' },
}

export function caminhoDaLigacao({
  type,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  pathOptions,
}) {
  const base = { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition }
  if (type === 'straight') {
    return getStraightPath(base)
  }
  if (type === 'step' || type === 'smoothstep') {
    return getSmoothStepPath({
      ...base,
      borderRadius: type === 'step' ? 0 : pathOptions?.borderRadius ?? 5,
      offset: pathOptions?.offset ?? 20,
      stepPosition: pathOptions?.stepPosition,
    })
  }
  return getBezierPath({ ...base, curvature: pathOptions?.curvature })
}
