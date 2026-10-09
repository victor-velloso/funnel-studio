import { describe, it, expect } from 'vitest'
import { caminhoDaLigacao } from '../lib/flow.js'

describe('traçado das ligações', () => {
  const base = {
    sourceX: 0,
    sourceY: 40,
    targetX: 200,
    targetY: 40,
    sourcePosition: 'right',
    targetPosition: 'left',
  }

  it('step reto fica ortogonal; bezier curva', () => {
    const [step] = caminhoDaLigacao({ ...base, type: 'step', pathOptions: { offset: 20, borderRadius: 0 } })
    const [bezier] = caminhoDaLigacao({ ...base, type: 'default' })
    expect(step).toContain('L')
    expect(bezier).toMatch(/C/)
    expect(step).not.toEqual(bezier)
  })

  it('straight é segmento único', () => {
    const [d] = caminhoDaLigacao({ ...base, type: 'straight' })
    expect(d.replace(/\s/g, '')).toBe('M0,40L200,40')
  })

  it('respeita offset e stepPosition do documento salvo', () => {
    const [d] = caminhoDaLigacao({
      sourceX: 100,
      sourceY: 0,
      targetX: 200,
      targetY: 100,
      sourcePosition: 'right',
      targetPosition: 'left',
      type: 'step',
      pathOptions: { offset: 10, borderRadius: 0, stepPosition: 0.5 },
    })
    expect(d.length).toBeGreaterThan(10)
    expect(d.startsWith('M')).toBe(true)
  })
})
