import { MarkerType } from '@xyflow/react'

// Opções padrão de conexão — compartilhadas entre o editor e os templates,
// para que edges criadas por qualquer caminho tenham o mesmo visual.
export const EDGE_OPTIONS = {
  type: 'default',
  markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18, color: '#8a8a8a' },
  style: { stroke: '#6b6b6b', strokeWidth: 1.8, strokeDasharray: '7 5' },
}
