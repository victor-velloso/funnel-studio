import { describe, it, expect, vi } from 'vitest'
import {
  API_BASE,
  entrar,
  sair,
  lerSessao,
  quemSou,
  listarFunis,
  abrirFunil,
  listarVersoes,
  salvarFunil,
  exportarFunil,
  onSessaoExpirada,
} from './api.js'
import { mockFetch, jsonResponse, chamada, logar } from '../test/fetchMock.js'

const pessoa = { id: 'p1', email: 'victor@elyon.test', nome: 'Victor', papel: 'administrador', pode_gravar: true }

describe('sessão', () => {
  it('entrar guarda token, validade e pessoa no localStorage', async () => {
    const f = mockFetch(jsonResponse(200, { token: 'fs_abc', expira_em: '2099-01-01T00:00:00Z', pessoa }))
    const s = await entrar(' victor@elyon.test ', 'segredo')
    expect(s.token).toBe('fs_abc')
    expect(lerSessao()).toEqual({ token: 'fs_abc', expira_em: '2099-01-01T00:00:00Z', pessoa })
    const c = chamada(f)
    expect(c.url).toBe(`${API_BASE}/api/studio/sessao`)
    expect(c.method).toBe('POST')
    expect(c.body).toEqual({ email: 'victor@elyon.test', senha: 'segredo' })
    expect(c.headers.Authorization).toBeUndefined()
  })

  it('traduz os erros do login para português', async () => {
    mockFetch(jsonResponse(401, { error: 'credenciais', message: 'x' }))
    await expect(entrar('a@b.c', 'errada')).rejects.toMatchObject({ status: 401, message: 'E-mail ou senha incorretos.' })
    mockFetch(jsonResponse(429, { error: 'muitas_tentativas', message: 'x' }))
    await expect(entrar('a@b.c', 'x')).rejects.toMatchObject({ code: 'muitas_tentativas' })
    mockFetch(jsonResponse(403, { error: 'acesso_desativado', message: 'x' }))
    await expect(entrar('a@b.c', 'x')).rejects.toThrow('desativado')
  })

  it('erro 401 no login não dispara "sessão expirada"', async () => {
    const ouvinte = vi.fn()
    const off = onSessaoExpirada(ouvinte)
    mockFetch(jsonResponse(401, { error: 'credenciais' }))
    await expect(entrar('a@b.c', 'x')).rejects.toBeTruthy()
    expect(ouvinte).not.toHaveBeenCalled()
    off()
  })

  it('ignora token vencido', () => {
    localStorage.setItem(
      'elyon-funnel-studio:sessao',
      JSON.stringify({ token: 'fs_velho', expira_em: '2000-01-01T00:00:00Z', pessoa }),
    )
    expect(lerSessao()).toBeNull()
  })

  it('quemSou atualiza a pessoa guardada', async () => {
    logar({ ...pessoa, pode_gravar: false })
    mockFetch(jsonResponse(200, { pessoa }))
    await quemSou()
    expect(lerSessao().pessoa.pode_gravar).toBe(true)
  })

  it('sair chama DELETE e limpa a sessão mesmo se a rede falhar', async () => {
    logar()
    const f = mockFetch(jsonResponse(204))
    await sair()
    expect(chamada(f).method).toBe('DELETE')
    expect(chamada(f).headers.Authorization).toBe('Bearer fs_teste')
    expect(lerSessao()).toBeNull()

    logar()
    mockFetch(new TypeError('offline'))
    await sair()
    expect(lerSessao()).toBeNull()
  })
})

describe('chamadas autenticadas', () => {
  it('manda Bearer e monta os filtros da lista', async () => {
    logar()
    const f = mockFetch(jsonResponse(200, { funis: [{ id: 'a' }] }))
    const funis = await listarFunis({ especialista: 'bruno', busca: ' vsl ' })
    expect(funis).toEqual([{ id: 'a' }])
    const c = chamada(f)
    expect(c.url).toBe(`${API_BASE}/api/studio/funis?especialista=bruno&busca=vsl`)
    expect(c.headers.Authorization).toBe('Bearer fs_teste')
  })

  it('omite filtros vazios', async () => {
    logar()
    const f = mockFetch(jsonResponse(200, { funis: [] }))
    await listarFunis({ especialista: '', busca: '' })
    expect(chamada(f).url).toBe(`${API_BASE}/api/studio/funis`)
  })

  it('abre funil numa versão e lista versões', async () => {
    logar()
    const f = mockFetch(jsonResponse(200, { funil: { id: 'x', versao: 2 } }), jsonResponse(200, { id: 'x', versoes: [{ versao: 1 }] }))
    expect(await abrirFunil('x', 2)).toEqual({ id: 'x', versao: 2 })
    expect(chamada(f, 0).url).toBe(`${API_BASE}/api/studio/funis/x?versao=2`)
    expect(await listarVersoes('x')).toEqual([{ versao: 1 }])
    expect(chamada(f, 1).url).toBe(`${API_BASE}/api/studio/funis/x/versoes`)
  })

  it('401 limpa a sessão e avisa quem estiver ouvindo', async () => {
    logar()
    const ouvinte = vi.fn()
    const off = onSessaoExpirada(ouvinte)
    mockFetch(jsonResponse(401, { error: 'sessao_expirada', message: 'x' }))
    await expect(listarFunis()).rejects.toMatchObject({ status: 401 })
    expect(ouvinte).toHaveBeenCalledTimes(1)
    expect(lerSessao()).toBeNull()
    off()
  })

  it('sem sessão nem chama a rede', async () => {
    const f = mockFetch()
    await expect(listarFunis()).rejects.toMatchObject({ code: 'sem_sessao' })
    expect(f).not.toHaveBeenCalled()
  })

  it('409 traz versao_atual no corpo do erro', async () => {
    logar()
    mockFetch(jsonResponse(409, { error: 'conflito', message: 'x', versao_atual: 7 }))
    await expect(
      salvarFunil({ documento: { id: 'a', nodes: [], edges: [] }, especialista: 'sede', versao_base: 5 }),
    ).rejects.toMatchObject({ status: 409, code: 'conflito', body: { versao_atual: 7 } })
  })

  it('salvar manda o corpo do contrato', async () => {
    logar()
    const f = mockFetch(jsonResponse(201, { id: 'a', versao: 1, criado: true, alterado: true }))
    await salvarFunil({ documento: { id: 'a' }, especialista: 'sede', nome: 'N', precos: [], versao_base: 0, nota: '  ' })
    expect(chamada(f).body).toEqual({ documento: { id: 'a' }, especialista: 'sede', nome: 'N', precos: [], versao_base: 0 })
    expect(chamada(f).headers['Content-Type']).toBe('application/json')
  })

  it('400 invalido mostra o campo vindo do servidor', async () => {
    logar()
    mockFetch(jsonResponse(400, { error: 'invalido', message: 'precos[0].no_id não existe' }))
    await expect(salvarFunil({ documento: {} })).rejects.toThrow('Dados inválidos: precos[0].no_id não existe')
  })

  it('falha de rede vira mensagem clara', async () => {
    logar()
    mockFetch(new TypeError('Failed to fetch'))
    await expect(listarFunis()).rejects.toMatchObject({ code: 'rede' })
  })

  it('exportar usa o nome do Content-Disposition', async () => {
    logar()
    mockFetch(
      () =>
        new Response('{"id":"a"}', {
          status: 200,
          headers: { 'Content-Disposition': 'attachment; filename="funil-raizes-v3.funnel.json"' },
        }),
    )
    const { blob, filename } = await exportarFunil('a', 3)
    expect(filename).toBe('funil-raizes-v3.funnel.json')
    expect(await blob.text()).toBe('{"id":"a"}')
  })
})
