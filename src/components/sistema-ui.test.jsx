import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginModal from './LoginModal.jsx'
import SystemFunnels from './SystemFunnels.jsx'
import HistoryModal from './HistoryModal.jsx'
import SessionMenu from './SessionMenu.jsx'
import { mockFetch, jsonResponse, chamada, logar } from '../test/fetchMock.js'
import { lerSessao } from '../lib/api.js'

const resumo = (id, nome, especialista, versao) => ({
  id,
  nome,
  especialista,
  versao,
  n_nos: 4,
  n_ligacoes: 3,
  precos: [],
  criado_em: '2026-10-01T12:00:00Z',
  criado_por: 'pessoa:victor@elyon.test',
  atualizado_em: '2026-10-09T12:00:00Z',
  atualizado_por: 'bot:alex',
})

describe('LoginModal', () => {
  it('entra e devolve a sessão', async () => {
    mockFetch(
      jsonResponse(200, {
        token: 'fs_x',
        expira_em: '2099-01-01T00:00:00Z',
        pessoa: { nome: 'Victor', email: 'v@e.c', pode_gravar: true },
      }),
    )
    const onSuccess = vi.fn()
    const user = userEvent.setup()
    render(<LoginModal onSuccess={onSuccess} onClose={() => {}} />)
    await user.type(screen.getByLabelText('E-mail'), 'v@e.c')
    await user.type(screen.getByLabelText('Senha'), 'segredo')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))
    await waitFor(() => expect(onSuccess).toHaveBeenCalled())
    expect(lerSessao().token).toBe('fs_x')
  })

  it('mostra erro de credenciais e deixa tentar de novo', async () => {
    mockFetch(jsonResponse(401, { error: 'credenciais', message: 'x' }))
    const user = userEvent.setup()
    render(<LoginModal onSuccess={() => {}} onClose={() => {}} />)
    await user.type(screen.getByLabelText('E-mail'), 'v@e.c')
    await user.type(screen.getByLabelText('Senha'), 'errada')
    await user.click(screen.getByRole('button', { name: 'Entrar' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('E-mail ou senha incorretos.')
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeEnabled()
  })

  it('mostra o motivo quando a sessão expirou', () => {
    render(<LoginModal motivo="Sua sessão expirou. Entre de novo para continuar." onSuccess={() => {}} onClose={() => {}} />)
    expect(screen.getByText(/Sua sessão expirou/)).toBeInTheDocument()
  })
})

describe('SystemFunnels', () => {
  it('sem login convida a entrar', async () => {
    const onLogin = vi.fn()
    render(<SystemFunnels sessao={null} onLogin={onLogin} onOpen={() => {}} onHistory={() => {}} />)
    await userEvent.setup().click(screen.getByRole('button', { name: 'Entrar no sistema' }))
    expect(onLogin).toHaveBeenCalled()
  })

  it('lista, filtra por especialista e abre', async () => {
    logar()
    const f = mockFetch(
      jsonResponse(200, { funis: [resumo('a', 'Funil Raízes', 'estancia', 3), resumo('b', 'Webinar', 'bruno', 1)] }),
      jsonResponse(200, { funis: [resumo('b', 'Webinar', 'bruno', 1)] }),
    )
    const onOpen = vi.fn(async () => {})
    const onHistory = vi.fn()
    const user = userEvent.setup()
    render(<SystemFunnels sessao={{ token: 'fs_teste' }} onLogin={() => {}} onOpen={onOpen} onHistory={onHistory} />)

    expect(await screen.findByText('Funil Raízes')).toBeInTheDocument()
    expect(screen.getByText('v3')).toBeInTheDocument()
    expect(screen.getAllByText('Alex (robô)')).toHaveLength(2)

    await user.click(screen.getByRole('tab', { name: 'Bruno' }))
    await waitFor(() => expect(screen.queryByText('Funil Raízes')).not.toBeInTheDocument())
    expect(chamada(f, 1).url).toContain('especialista=bruno')

    await user.click(screen.getAllByRole('button', { name: 'Histórico' })[0])
    expect(onHistory).toHaveBeenCalledWith(expect.objectContaining({ id: 'b' }))
    await user.click(screen.getByRole('button', { name: 'Abrir' }))
    expect(onOpen).toHaveBeenCalledWith('b')
  })

  it('busca com debounce', async () => {
    logar()
    const f = mockFetch(jsonResponse(200, { funis: [] }), jsonResponse(200, { funis: [] }))
    const user = userEvent.setup()
    render(<SystemFunnels sessao={{ token: 'fs_teste' }} onLogin={() => {}} onOpen={() => {}} onHistory={() => {}} />)
    await screen.findByText('Nenhum funil encontrado')
    await user.type(screen.getByLabelText('Buscar no sistema'), 'quiz')
    await waitFor(() => expect(f).toHaveBeenCalledTimes(2))
    expect(chamada(f, 1).url).toContain('busca=quiz')
  })

  it('mostra erro e permite tentar de novo', async () => {
    logar()
    mockFetch(jsonResponse(503, { error: 'studio_inativo', message: 'x' }), jsonResponse(200, { funis: [] }))
    const user = userEvent.setup()
    render(<SystemFunnels sessao={{ token: 'fs_teste' }} onLogin={() => {}} onOpen={() => {}} onHistory={() => {}} />)
    expect(await screen.findByText(/integração com o Studio está desligada/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Tentar de novo' }))
    expect(await screen.findByText('Nenhum funil encontrado')).toBeInTheDocument()
  })
})

describe('HistoryModal', () => {
  const versoes = [
    { versao: 1, nome: 'F', especialista: 'sede', salvo_em: '2026-10-01T12:00:00Z', salvo_por: 'pessoa:victor@elyon.test', nota: 'Primeira' },
    { versao: 3, nome: 'F', especialista: 'sede', salvo_em: '2026-10-03T12:00:00Z', salvo_por: 'bot:alex', nota: null },
    { versao: 2, nome: 'F', especialista: 'sede', salvo_em: '2026-10-02T12:00:00Z', salvo_por: 'pessoa:victor@elyon.test', nota: 'Upsell' },
  ]

  it('ordena da mais nova para a mais antiga e marca a atual', async () => {
    logar()
    mockFetch(jsonResponse(200, { id: 'a', versoes }))
    render(<HistoryModal funilId="a" onOpenVersion={() => {}} onClose={() => {}} />)
    const itens = await screen.findAllByRole('listitem')
    expect(itens[0]).toHaveTextContent('v3')
    expect(itens[0]).toHaveTextContent('atual')
    expect(itens[2]).toHaveTextContent('Primeira')
  })

  it('abre direto quando não há alterações pendentes', async () => {
    logar()
    mockFetch(jsonResponse(200, { id: 'a', versoes }))
    const onOpenVersion = vi.fn(async () => {})
    const user = userEvent.setup()
    render(<HistoryModal funilId="a" onOpenVersion={onOpenVersion} onClose={() => {}} />)
    const itens = await screen.findAllByRole('listitem')
    await user.click(itens[2].querySelector('.btn--primary'))
    expect(onOpenVersion).toHaveBeenCalledWith(1, 3)
  })

  it('pede confirmação quando há alterações não salvas', async () => {
    logar()
    mockFetch(jsonResponse(200, { id: 'a', versoes }))
    const onOpenVersion = vi.fn(async () => {})
    const user = userEvent.setup()
    render(<HistoryModal funilId="a" temPendencias onOpenVersion={onOpenVersion} onClose={() => {}} />)
    const itens = await screen.findAllByRole('listitem')
    await user.click(itens[1].querySelector('.btn--primary'))
    expect(onOpenVersion).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent('Abrir a versão 2 substitui o que está no quadro')
    await user.click(screen.getByRole('button', { name: 'Abrir a versão 2 mesmo assim' }))
    expect(onOpenVersion).toHaveBeenCalledWith(2, 3)
  })
})

describe('SessionMenu', () => {
  it('mostra quem está logado e sai', async () => {
    const onLogout = vi.fn()
    const user = userEvent.setup()
    render(
      <SessionMenu
        sessao={{ pessoa: { nome: 'Victor Velloso', email: 'v@e.c', papel: 'administrador', pode_gravar: true } }}
        onLogin={() => {}}
        onLogout={onLogout}
      />,
    )
    expect(screen.getByText('VV')).toBeInTheDocument()
    await user.click(screen.getByLabelText('Conta do Funnel Control'))
    expect(screen.getByText('administrador · pode gravar')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Sair do Funnel Control' }))
    expect(onLogout).toHaveBeenCalled()
  })
})
