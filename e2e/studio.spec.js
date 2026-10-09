import { test, expect } from '@playwright/test'
import fs from 'node:fs'

const MOCK = 'http://127.0.0.1:5299'
const SHOTS = process.env.SHOTS_DIR
const EMAIL = 'victor@elyon.test'

async function shot(page, name) {
  if (!SHOTS) return
  fs.mkdirSync(SHOTS, { recursive: true })
  await page.waitForTimeout(300)
  await page.screenshot({ path: `${SHOTS}/${name}.png`, animations: 'disabled' })
}

async function mockLog(request) {
  return (await (await request.get(`${MOCK}/__mock/log`)).json()).log
}

async function entrar(page, senha = 'senha-certa') {
  await page.getByLabel('E-mail').fill(EMAIL)
  await page.getByLabel('Senha').fill(senha)
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
}

async function irParaSistemaLogado(page) {
  await page.goto('/')
  await page.getByRole('tab', { name: /No sistema/ }).click()
  await page.getByRole('button', { name: 'Entrar no sistema' }).first().click()
  await entrar(page)
  await expect(page.getByLabel('Conta do Funnel Control')).toBeVisible()
}

async function renomear(page, nome) {
  await page.locator('.toolbar__name').click()
  await page.locator('.toolbar__name--input').fill(nome)
  await page.locator('.toolbar__name--input').press('Enter')
}

test.beforeEach(async ({ request }) => {
  await request.post(`${MOCK}/__mock/reset`)
})

test('modo offline: criar, autosave, exportar JSON e PNG sem login', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: '+ Novo funil' }).click()
  await page.getByRole('button', { name: /Funil de VSL/ }).click()
  await expect(page.locator('.react-flow__node')).toHaveCount(10)
  await renomear(page, 'Funil offline')
  await expect(page.getByText(/Salvo no navegador às/)).toBeVisible()

  await page.getByRole('button', { name: 'Exportar' }).click()
  const [json] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Arquivo JSON' }).click()])
  expect(json.suggestedFilename()).toBe('funil-offline.funnel.json')
  const doc = JSON.parse(fs.readFileSync(await json.path(), 'utf8'))
  expect(doc.name).toBe('Funil offline')
  expect(doc.nodes).toHaveLength(10)
  expect(doc.sistema).toBeUndefined()

  await page.getByRole('button', { name: 'Exportar' }).click()
  const [png] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Imagem PNG' }).click()])
  expect(png.suggestedFilename()).toBe('funil-offline.png')
  expect(fs.statSync(await png.path()).size).toBeGreaterThan(10_000)

  await page.reload()
  await expect(page.getByRole('heading', { name: 'Funil offline' })).toBeVisible()

  // Importar o JSON exportado cria outra cópia local
  await page.locator('input[type=file]').first().setInputFiles(await json.path())
  await expect(page.locator('.toolbar__name')).toHaveText('Funil offline')
  await page.getByLabel('Voltar ao painel').click()
  await expect(page.getByRole('heading', { name: 'Funil offline' })).toHaveCount(2)
})

test('login: erro de senha, entrar, quem está logado e sair', async ({ page, request }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Entrar no sistema' }).click()
  await page.getByLabel('E-mail').fill(EMAIL)
  await page.getByLabel('Senha').fill('errada')
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await expect(page.getByRole('alert')).toHaveText('E-mail ou senha incorretos.')
  await page.getByLabel('Senha').fill('senha-certa')
  await shot(page, '01-login')
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()

  await page.getByLabel('Conta do Funnel Control').click()
  await expect(page.getByText('administrador · pode gravar')).toBeVisible()
  const token = await page.evaluate(() => JSON.parse(localStorage.getItem('elyon-funnel-studio:sessao')).token)
  expect(token).toMatch(/^fs_/)

  await page.reload()
  await expect(page.getByLabel('Conta do Funnel Control')).toBeVisible()

  await page.getByLabel('Conta do Funnel Control').click()
  await page.getByRole('button', { name: 'Sair do Funnel Control' }).click()
  await expect(page.getByRole('button', { name: 'Entrar no sistema' })).toBeVisible()
  expect(await page.evaluate(() => localStorage.getItem('elyon-funnel-studio:sessao'))).toBeNull()
  const log = await mockLog(request)
  expect(log.some((l) => l.method === 'DELETE' && l.path === '/api/studio/sessao' && l.auth === `Bearer ${token}`)).toBe(true)
})

test('lista do sistema: filtro por especialista e busca', async ({ page, request }) => {
  await irParaSistemaLogado(page)
  await expect(page.locator('.system__row:not(.system__row--head)')).toHaveCount(4)
  await shot(page, '02-lista-sistema')

  await page.getByRole('tab', { name: 'Bruno' }).click()
  await expect(page.locator('.system__row:not(.system__row--head)')).toHaveCount(1)
  await expect(page.getByText('Webinar Bruno — Lançamento')).toBeVisible()

  await page.getByRole('tab', { name: 'Todos' }).click()
  await expect(page.locator('.system__row:not(.system__row--head)')).toHaveCount(4)
  await page.getByLabel('Buscar no sistema').fill('quiz')
  await expect(page.getByText('Funil Raízes — VSL')).toHaveCount(0)
  await expect(page.locator('.system__row:not(.system__row--head)')).toHaveCount(1)
  await expect(page.getByText('Família Restaurada — Quiz')).toBeVisible()

  const log = await mockLog(request)
  expect(log.some((l) => l.query.especialista === 'bruno')).toBe(true)
  expect(log.some((l) => l.query.busca === 'quiz')).toBe(true)
  expect(log.filter((l) => l.path === '/api/studio/funis').every((l) => l.auth?.startsWith('Bearer fs_'))).toBe(true)
})

test('abrir do sistema, editar, salvar, conflito (salvar por cima e recarregar)', async ({ page, request }) => {
  await irParaSistemaLogado(page)
  await page.getByRole('button', { name: 'Funil Raízes — VSL' }).click()
  await expect(page.locator('.react-flow__node')).toHaveCount(5)
  await expect(page.getByRole('status')).toHaveText('Salvo no sistema · v3')
  await shot(page, '03-editor-salvo-no-sistema')

  await renomear(page, 'Funil Raízes — VSL 2')
  await expect(page.getByRole('status')).toHaveText('Alterações não salvas no sistema')

  await page.getByRole('button', { name: 'Salvar no sistema' }).click()
  const modal = page.getByRole('dialog', { name: 'Salvar no sistema' })
  await expect(modal.getByLabel('Especialista')).toHaveValue('estancia')
  await expect(modal.getByLabel('Valor do preço 1')).toHaveValue('47,00')
  await expect(modal.getByLabel('Valor do preço 2')).toHaveValue('197,00')
  await modal.getByPlaceholder(/troquei o upsell/).fill('Novo nome')
  await shot(page, '04-salvar')
  await modal.getByRole('button', { name: 'Salvar no sistema' }).click()
  await expect(page.getByRole('status')).toHaveText('Salvo no sistema · v4')

  let log = await mockLog(request)
  let post = log.filter((l) => l.method === 'POST' && l.path === '/api/studio/funis').at(-1)
  expect(post.body).toMatchObject({ versao_base: 3, especialista: 'estancia', nome: 'Funil Raízes — VSL 2', nota: 'Novo nome' })
  expect(post.body.precos).toEqual([
    { rotulo: 'Checkout', valor_centavos: 4700, tipo: 'front', no_id: 'n3' },
    { rotulo: 'Upsell', valor_centavos: 19700, tipo: 'upsell', no_id: 'n4' },
  ])
  expect(post.body.documento.nodes[0].selected).toBeUndefined()

  // Alex salva por fora (v5) enquanto o Victor edita
  await request.post(`${MOCK}/__mock/salvar-como-alex`, { data: { id: 'raizesvsl001' } })
  await renomear(page, 'Funil Raízes — VSL 3')
  await page.keyboard.press('Control+s')
  await page.getByRole('dialog', { name: 'Salvar no sistema' }).getByRole('button', { name: 'Salvar no sistema' }).click()
  await expect(page.getByText('Alguém salvou antes de você')).toBeVisible()
  await expect(page.getByText(/Você partiu da versão 4/)).toBeVisible()
  await shot(page, '05-conflito')
  await page.getByRole('button', { name: 'Salvar por cima mesmo assim' }).click()
  await expect(page.getByRole('status')).toHaveText('Salvo no sistema · v6')
  log = await mockLog(request)
  post = log.filter((l) => l.method === 'POST' && l.path === '/api/studio/funis').at(-1)
  expect(post.body.versao_base).toBe(5)

  // De novo, agora escolhendo recarregar: a nota do Alex aparece no quadro
  await request.post(`${MOCK}/__mock/salvar-como-alex`, { data: { id: 'raizesvsl001' } })
  await renomear(page, 'Mudança que vai ser descartada')
  await page.getByRole('button', { name: 'Salvar no sistema' }).click()
  await page.getByRole('dialog', { name: 'Salvar no sistema' }).getByRole('button', { name: 'Salvar no sistema' }).click()
  await page.getByRole('button', { name: 'Recarregar versão 7' }).click()
  await expect(page.getByRole('status')).toHaveText('Salvo no sistema · v7')
  await expect(page.locator('.toolbar__name')).toHaveText('Funil Raízes — VSL 3')
  await expect(page.locator('.react-flow__node-note')).toHaveCount(1)

  // A cópia recarregada sobrevive a recarregar a página
  await page.reload()
  await page.getByRole('tab', { name: /Neste navegador/ }).click()
  await expect(page.getByRole('heading', { name: 'Funil Raízes — VSL 3' })).toBeVisible()
  await expect(page.locator('.sync-tag')).toHaveText('No sistema · v7')
})

test('histórico: ver versões, abrir versão antiga e restaurar', async ({ page, request }) => {
  await irParaSistemaLogado(page)
  await page.getByRole('button', { name: 'Funil Raízes — VSL' }).click()
  await page.getByLabel('Histórico de versões').click()
  const dialog = page.getByRole('dialog', { name: 'Histórico de versões' })
  await expect(dialog.getByRole('listitem')).toHaveCount(3)
  await expect(dialog.getByRole('listitem').first()).toContainText('atual')
  await expect(dialog.getByRole('listitem').nth(1)).toContainText('Alex (robô)')
  await shot(page, '06-historico')

  const [json] = await Promise.all([page.waitForEvent('download'), dialog.getByRole('listitem').nth(2).getByRole('button', { name: 'JSON' }).click()])
  expect(json.suggestedFilename()).toBe('raizesvsl001-v1.funnel.json')

  await dialog.getByRole('listitem').nth(2).getByRole('button', { name: 'Abrir' }).click()
  await expect(page.getByRole('status')).toHaveText('Versão 1 aberta · não salva')
  await expect(page.locator('.react-flow__node')).toHaveCount(3)
  await shot(page, '07-versao-antiga-aberta')

  await page.getByRole('button', { name: 'Salvar no sistema' }).click()
  const modal = page.getByRole('dialog', { name: 'Salvar no sistema' })
  await expect(modal.getByPlaceholder(/troquei o upsell/)).toHaveValue('Restaurada da versão 1')
  await modal.getByRole('button', { name: 'Salvar no sistema' }).click()
  await expect(page.getByRole('status')).toHaveText('Salvo no sistema · v4')
  const post = (await mockLog(request)).filter((l) => l.method === 'POST' && l.path === '/api/studio/funis').at(-1)
  expect(post.body.versao_base).toBe(3)
  expect(post.body.documento.nodes).toHaveLength(3)
})

test('funil local vai para o sistema pela primeira vez', async ({ page, request }) => {
  await page.goto('/')
  await page.getByRole('button', { name: '+ Novo funil' }).click()
  await page.getByRole('button', { name: /Em branco/ }).click()
  await expect(page.getByText('Só neste navegador')).toBeVisible()

  // Sem login, salvar pede login e depois abre o formulário
  await page.getByRole('button', { name: 'Salvar no sistema' }).click()
  await expect(page.getByText('Entre com sua conta do Funnel Control para salvar este funil no sistema.')).toBeVisible()
  await entrar(page)
  const modal = page.getByRole('dialog', { name: 'Salvar no sistema' })
  await expect(modal).toBeVisible()
  await expect(modal.getByText('Primeira vez deste funil no Funnel Control.')).toBeVisible()
  await modal.getByRole('button', { name: 'Salvar no sistema' }).click()
  await expect(modal.getByRole('alert')).toHaveText('Escolha o especialista.')
  await modal.getByLabel('Especialista').selectOption('sede')
  await modal.getByRole('button', { name: 'Salvar no sistema' }).click()
  await expect(page.getByRole('status')).toHaveText('Salvo no sistema · v1')
  const post = (await mockLog(request)).filter((l) => l.method === 'POST' && l.path === '/api/studio/funis').at(-1)
  expect(post.body.versao_base).toBe(0)

  await page.getByLabel('Voltar ao painel').click()
  await page.getByRole('tab', { name: /No sistema/ }).click()
  await expect(page.locator('.system__row:not(.system__row--head)')).toHaveCount(5)
})

test('sessão expirada pede login de novo; conta só leitura não grava', async ({ page, request }) => {
  await irParaSistemaLogado(page)
  await request.post(`${MOCK}/__mock/reset`)
  await page.getByRole('tab', { name: 'Lara' }).click()
  await expect(page.getByText('Sua sessão expirou. Entre de novo para continuar.')).toBeVisible()
  await page.getByLabel('E-mail').fill('leitor@elyon.test')
  await page.getByLabel('Senha').fill('senha-certa')
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()
  await page.getByRole('tab', { name: 'Todos' }).click()
  await page.getByRole('button', { name: 'Funil Raízes — VSL' }).click()
  await expect(page.getByRole('status')).toHaveText('Salvo no sistema · v3')
  await page.getByRole('button', { name: 'Salvar no sistema' }).click()
  await expect(page.getByText(/Sua conta só pode abrir funis/)).toBeVisible()
  await expect(page.getByRole('dialog', { name: 'Salvar no sistema' })).toHaveCount(0)
})

test('abrir do sistema com alterações locais pede confirmação', async ({ page }) => {
  await irParaSistemaLogado(page)
  await page.getByRole('button', { name: 'Família Restaurada — Quiz' }).click()
  await renomear(page, 'Quiz mexido')
  await expect(page.getByRole('status')).toHaveText('Alterações não salvas no sistema')
  await page.getByLabel('Voltar ao painel').click()
  await page.getByRole('tab', { name: /Neste navegador/ }).click()
  await expect(page.locator('.sync-tag')).toHaveText('Não salvo no sistema')

  await page.getByRole('tab', { name: /No sistema/ }).click()
  await page.getByRole('button', { name: 'Família Restaurada — Quiz' }).click()
  await expect(page.getByText('Você tem alterações não salvas neste funil')).toBeVisible()
  await page.getByRole('button', { name: 'Continuar com a minha cópia' }).click()
  await expect(page.locator('.toolbar__name')).toHaveText('Quiz mexido')

  await page.getByLabel('Voltar ao painel').click()
  await page.getByRole('button', { name: 'Família Restaurada — Quiz' }).click()
  await page.getByRole('button', { name: 'Abrir versão 1 do sistema' }).click()
  await expect(page.locator('.toolbar__name')).toHaveText('Família Restaurada — Quiz')
  await expect(page.getByRole('status')).toHaveText('Salvo no sistema · v1')

  await page.getByLabel('Voltar ao painel').click()
  await page.getByRole('tab', { name: /Neste navegador/ }).click()
  await expect(page.locator('.sync-tag')).toHaveText('No sistema · v1')
  await shot(page, '08-painel-local')
})

test('atalhos: ? abre a ajuda, Esc fecha ajuda e histórico', async ({ page }) => {
  await irParaSistemaLogado(page)
  await page.getByRole('button', { name: 'Isca + Nutrição (Sede)' }).click()
  await page.locator('.react-flow__pane').click()
  await page.keyboard.press('?')
  await expect(page.getByRole('heading', { name: 'Atalhos' })).toBeVisible()
  await expect(page.getByText('Salvar no sistema (Funnel Control)')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('heading', { name: 'Atalhos' })).toHaveCount(0)
  await page.getByLabel('Histórico de versões').click()
  await expect(page.getByRole('dialog', { name: 'Histórico de versões' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog', { name: 'Histórico de versões' })).toHaveCount(0)
})

test('funil compacto: ligações step retas, setas visíveis, preço só com R$', async ({ page }) => {
  await page.goto('/')
  await page.locator('input[type=file]').first().setInputFiles('e2e/fixtures/funil-compacto.json')
  await expect(page.locator('.toolbar__name')).toHaveText('Família Restaurada (cópia local QA)')
  await expect(page.locator('.react-flow__node')).toHaveCount(11)
  // Espera a animação de entrada + updateNodeInternals
  await page.waitForTimeout(400)

  const paths = await page.locator('.react-flow__edge-path').evaluateAll((ps) =>
    ps.map((p) => p.getAttribute('d') || ''),
  )
  expect(paths.length).toBe(11)
  // Step reto: sem curva cúbica (C). Q degenerado (raio 0) pode aparecer.
  for (const d of paths) {
    expect(d).not.toMatch(/C/)
    expect(d).toMatch(/^M/)
  }
  await expect(page.locator('svg.react-flow__marker').first()).toBeAttached()
  // Fecha o toast de importação para o print ficar limpo
  await page.keyboard.press('Escape')
  await page.waitForTimeout(200)
  await shot(page, '11-linhas-depois')

  const salvo = await page.evaluate(() => {
    const raw = localStorage.getItem('elyon-funnel-studio:v1')
    return JSON.parse(raw).funnels.find((f) => f.name.includes('cópia local QA'))
  })
  expect(salvo.edges.every((e) => e.type === 'step')).toBe(true)
  expect(salvo.edges[0].pathOptions).toMatchObject({ offset: 20, borderRadius: 0 })

  await page.getByLabel('Voltar ao painel').click()
  const doc = JSON.parse(fs.readFileSync('e2e/fixtures/funil-compacto.json', 'utf8'))
  doc.id = `qa-preco-${Date.now()}`
  doc.name = 'QA preços'
  doc.nodes = [
    ...doc.nodes,
    { id: 'web', type: 'funnel', position: { x: 1200, y: 0 }, data: { icon: 'webinar', label: 'Webinário' } },
    {
      id: 'ment',
      type: 'funnel',
      position: { x: 1200, y: 200 },
      data: { icon: 'call', label: 'Mentoria sem R$ no rótulo', preco_centavos: 300000 },
    },
  ]
  const tmp = `/tmp/qa-preco-${Date.now()}.json`
  fs.writeFileSync(tmp, JSON.stringify(doc))
  await page.locator('input[type=file]').first().setInputFiles(tmp)
  await expect(page.locator('.toolbar__name')).toHaveText('QA preços')
  await page.getByRole('button', { name: 'Salvar no sistema' }).click()
  await entrar(page)
  const modal = page.getByRole('dialog', { name: 'Salvar no sistema' })
  await expect(modal).toBeVisible()
  const rotulos = await modal.locator('input[aria-label^="Rótulo do preço"]').evaluateAll((els) =>
    els.map((e) => e.value),
  )
  expect(rotulos.some((r) => /webin[aá]rio/i.test(r))).toBe(false)
  expect(rotulos.some((r) => /Mentoria/i.test(r))).toBe(true)
  const valores = await modal.locator('input[aria-label^="Valor do preço"]').evaluateAll((els) =>
    els.map((e) => e.value),
  )
  expect(valores).toContain('47,00')
  expect(valores).toContain('3.000,00')
  await shot(page, '12-precos-so-com-rs')
  await modal.getByRole('button', { name: 'Cancelar' }).click()
})
