import { describe, it, expect } from 'vitest'
import { EDGE_OPTIONS, caminhoDaLigacao } from './flow.js'

describe('EDGE_OPTIONS', () => {
  it('usa step reto como padrão das novas ligações', () => {
    expect(EDGE_OPTIONS.type).toBe('step')
    expect(EDGE_OPTIONS.pathOptions).toEqual({ offset: 20, borderRadius: 0 })
    expect(EDGE_OPTIONS.markerEnd.type).toBe('arrowclosed')
  })
})

describe('caminhoDaLigacao', () => {
  it('step com borderRadius 0 não usa curva cúbica', () => {
    const [d] = caminhoDaLigacao({
      type: 'step',
      sourceX: 0,
      sourceY: 0,
      targetX: 100,
      targetY: 80,
      sourcePosition: 'right',
      targetPosition: 'top',
      pathOptions: { offset: 20, borderRadius: 0 },
    })
    expect(d).not.toMatch(/C/)
  })
})
