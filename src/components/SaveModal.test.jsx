import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SaveModal from './SaveModal.jsx'
import { mockFetch, jsonResponse, chamada, logar } from '../test/fetchMock.js'

const nodes = [
  { id: 'n1', type: 'funnel', position: { x: 0, y: 0 }, data: { label: 'Meta Ads', icon: 'meta-ads' } },
  { id: 'n2', type: 'funnel', position: { x: 200, y: 0 }, data: { label: 'Checkout R$ 47', icon: 'checkout' } },
  { id: 'n3', type: 'funnel', position: { x: 400, y: 0 }, data: { label: 'Upsell R$ 197,00', icon: 'upsell' } },
]

function setup(funnelExtra = {}, props = {}) {
  logar()
  const funnel = { id: 'f1', name: 'Funil VSL', nodes, edges: [], ...funnelExtra }
  const onSaved = vi.fn()
  const onReload = vi.fn(async () => {})
  const onClose = vi.fn()
  const getDocumento = () => ({ id: 'f1', name: 'Funil VSL', nodes, edges: [], viewport: null })
  render(
    <SaveModal
      funnel={funnel}
      nodes={nodes}
      getDocumento={getDocumento}
      onSaved={onSaved}
      onReload={onReload}
      onClose={onClose}
      {...props}
    />,
  )
  return { onSaved, onReload, onClose, user: userEvent.setup() }
}

describe('SaveModal', () => {
  it('preenche os preços a partir dos elementos', () => {
    setup()
    expect(screen.getByText(/2 preços encontrados nos elementos/)).toBeInTheDocument()
    expect(screen.getByLabelText('Rótulo do preço 1')).toHaveValue('Checkout')
    expect(screen.getByLabelText('Valor do preço 1')).toHaveValue('47,00')
    expect(screen.getByLabelText('Tipo do preço 2')).toHaveValue('upsell')
  })

  it('exige especialista antes de chamar a API', async () => {
    const f = mockFetch()
    const { user } = setup()
    await user.click(screen.getByRole('button', { name: 'Salvar no sistema' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Escolha o especialista.')
    expect(f).not.toHaveBeenCalled()
  })

  it('funil novo vai com versao_base 0, especialista, nome, preços e nota', async () => {
    const f = mockFetch(jsonResponse(201, { id: 'f1', versao: 1, criado: true, alterado: true, atualizado_em: 'x' }))
    const { user, onSaved } = setup()
    await user.selectOptions(screen.getByLabelText('Especialista'), 'bruno')
    await user.clear(screen.getByLabelText('Nome do funil'))
    await user.type(screen.getByLabelText('Nome do funil'), 'VSL do Bruno')
    await user.type(screen.getByPlaceholderText(/troquei o upsell/), 'primeira versão')
    await user.click(screen.getByRole('button', { name: 'Salvar no sistema' }))

    await waitFor(() => expect(onSaved).toHaveBeenCalled())
    const { body } = chamada(f)
    expect(body.versao_base).toBe(0)
    expect(body.especialista).toBe('bruno')
    expect(body.nome).toBe('VSL do Bruno')
    expect(body.nota).toBe('primeira versão')
    expect(body.precos).toEqual([
      { rotulo: 'Checkout', valor_centavos: 4700, tipo: 'front', no_id: 'n2' },
      { rotulo: 'Upsell', valor_centavos: 19700, tipo: 'upsell', no_id: 'n3' },
    ])
    expect(body.documento).toMatchObject({ id: 'f1', name: 'VSL do Bruno', especialista: 'bruno' })
    expect(onSaved.mock.calls[0][0]).toMatchObject({ nome: 'VSL do Bruno', especialista: 'bruno', res: { versao: 1 } })
  })

  it('valor inválido é barrado com mensagem', async () => {
    mockFetch()
    const { user } = setup({ especialista: 'sede' })
    await user.clear(screen.getByLabelText('Valor do preço 1'))
    await user.type(screen.getByLabelText('Valor do preço 1'), 'quarenta')
    await user.click(screen.getByRole('button', { name: 'Salvar no sistema' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Preço 1: valor inválido')
  })

  it('409: mostra as duas escolhas; "salvar por cima" reenvia com a versão atual', async () => {
    const f = mockFetch(
      jsonResponse(409, { error: 'conflito', message: 'x', versao_atual: 5 }),
      jsonResponse(200, { id: 'f1', versao: 6, criado: false, alterado: true }),
    )
    const { user, onSaved } = setup({ especialista: 'estancia', sistema: { versao: 4, assinatura: 'x' } })
    expect(screen.getByText(/Cria a versão 5/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Salvar no sistema' }))

    expect(await screen.findByText('Alguém salvou antes de você')).toBeInTheDocument()
    expect(screen.getByText(/Você partiu da versão 4/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Recarregar versão 5' })).toBeInTheDocument()
    expect(chamada(f, 0).body.versao_base).toBe(4)

    await user.click(screen.getByRole('button', { name: 'Salvar por cima mesmo assim' }))
    await waitFor(() => expect(onSaved).toHaveBeenCalled())
    expect(chamada(f, 1).body.versao_base).toBe(5)
  })

  it('409: "recarregar" chama onReload sem salvar', async () => {
    const f = mockFetch(jsonResponse(409, { error: 'conflito', versao_atual: 2 }))
    const { user, onReload, onSaved } = setup({ especialista: 'dani', sistema: { versao: 1, assinatura: 'x' } })
    await user.click(screen.getByRole('button', { name: 'Salvar no sistema' }))
    await user.click(await screen.findByRole('button', { name: 'Recarregar versão 2' }))
    expect(onReload).toHaveBeenCalledTimes(1)
    expect(onSaved).not.toHaveBeenCalled()
    expect(f).toHaveBeenCalledTimes(1)
  })

  it('erro de permissão aparece no formulário', async () => {
    mockFetch(jsonResponse(403, { error: 'sem_permissao', message: 'x' }))
    const { user } = setup({ especialista: 'lara' })
    await user.click(screen.getByRole('button', { name: 'Salvar no sistema' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('só administradores gravam')
  })

  it('versão antiga aberta sugere a nota de restauração', () => {
    setup({ especialista: 'sede', sistema: { versao: 5, restauradaDe: 2, assinatura: null } })
    expect(screen.getByPlaceholderText(/troquei o upsell/)).toHaveValue('Restaurada da versão 2')
  })

  it('remove e adiciona linhas de preço', async () => {
    const f = mockFetch(jsonResponse(200, { id: 'f1', versao: 2, alterado: true }))
    const { user } = setup({ especialista: 'kamila', sistema: { versao: 1, assinatura: 'x' } })
    await user.click(screen.getByLabelText('Remover preço 2'))
    await user.click(screen.getByRole('button', { name: '+ Adicionar preço' }))
    await user.type(screen.getByLabelText('Rótulo do preço 2'), 'Mentoria')
    await user.type(screen.getByLabelText('Valor do preço 2'), '1.500')
    await user.selectOptions(screen.getByLabelText('Tipo do preço 2'), 'backend')
    await user.click(screen.getByRole('button', { name: 'Salvar no sistema' }))
    await waitFor(() => expect(f).toHaveBeenCalled())
    expect(chamada(f).body.precos).toEqual([
      { rotulo: 'Checkout', valor_centavos: 4700, tipo: 'front', no_id: 'n2' },
      { rotulo: 'Mentoria', valor_centavos: 150000, tipo: 'backend' },
    ])
  })
})
