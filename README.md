# Funnel Studio — Elyon Studios™

Quadro branco visual para desenhar funis de venda (estilo Funnelytics, sem tracking).
Funciona offline — os funis ficam salvos no `localStorage` do navegador — e, com login,
salva e abre os funis no **Funnel Control** com histórico de versões.

## Rodar

```bash
npm install
npm run dev        # http://localhost:5199
```

Build de produção: `npm run build` (sai em `dist/`, deployável em qualquer host estático).

### Testes

```bash
npm test           # Vitest + Testing Library (unidade e componentes)
npm run test:e2e   # Playwright no navegador, contra o mock da API (não toca na produção)
```

O e2e sobe sozinho o mock (`npm run mock`, porta 5299) e o Studio em 5199 apontando para ele.
Sem o Chromium do Playwright instalado, use o Chrome do sistema: `PW_CHROME=/caminho/do/chrome npm run test:e2e`.
`SHOTS_DIR=pasta` salva prints das telas principais.

Para desenvolver contra o mock: `npm run mock` e `VITE_FC_API_URL=http://127.0.0.1:5299 npm run dev`
(login `victor@elyon.test` / `senha-certa`; `leitor@elyon.test` é só leitura).

## Funnel Control

API `/api/studio` do Funnel Control (contrato em `funnel-control/docs/funnel-studio-api.md`).
Base padrão `https://funnel-control.vercel.app`; troque com `VITE_FC_API_URL`.

- **Entrar / sair** com e-mail e senha do Funnel Control. O token `fs_…` fica no navegador (30 dias); 401 pede login de novo.
- **Aba "No sistema"** no painel — filtro por especialista, busca, abrir, histórico e baixar JSON.
- **Salvar no sistema** (botão ou ⌘S) — nome, especialista, nota e preços. Preços escritos no rótulo dos elementos ("Checkout R$ 47") entram sozinhos; dá para editar.
- **Conflito** — se outra pessoa salvou antes, escolha entre recarregar a versão do sistema ou salvar por cima (a versão dela fica no histórico).
- **Histórico** — abre qualquer versão no quadro; salvar a partir dela cria uma versão nova.
- **Indicador** "Salvo no sistema · vN" / "Alterações não salvas no sistema" no editor e nos cards.
- Abrir um funil do sistema guarda uma cópia local (mesmo id); tudo continua funcionando offline.

## Funcionalidades

- **Dashboard multi-funil** — criar, renomear, duplicar e excluir funis; cards com mini-preview do desenho, busca e ordenação por recência.
- **Templates prontos** — novo funil pode partir de estruturas completas: Funil de VSL, Webinar, Lançamento ou Isca + Nutrição.
- **Undo/Redo** — ⌘Z / ⌘⇧Z (ou botões na toolbar), com histórico de até 60 passos.
- **Rótulos nas conexões** — duplo clique numa seta para anotar ("32% assistem", "e-mail D+1"…).
- **Duplicar seleção** — ⌘D ou botão na barra flutuante; preserva conexões internas.
- **Auto-layout sob demanda** — botão na toolbar organiza o funil da esquerda para a direita (dagre); nunca roda sozinho e ⌘Z desfaz.
- **Canvas** (React Flow) — zoom, pan, minimapa, seleção múltipla (Shift + arrastar), snap ao grid, indicador de zoom (clique = ajustar à tela) e painel de atalhos (botão "?").
- **35 elementos** em 5 categorias: Tráfego, Páginas, Marcos (Lead, Cliente, Venda Perdida — losangos), Ações e Conteúdo — arraste para o quadro ou duplo clique para adicionar ao centro.
- **Páginas como mini-navegadores** — cada tipo de página renderiza como uma janelinha de browser com wireframe próprio (captura, VSL, checkout, webinar…), estilo Funnelytics.
- **Conexões** — arraste a partir das bordas de um elemento; setas tracejadas animadas, accent ao selecionar.
- **Editar texto do elemento** — clique no rótulo (com o elemento selecionado) ou duplo clique.
- **Texto livre** — escrita direta no quadro (transparente, sem card), com quatro tamanhos (P/M/G/GG) na toolbar flutuante.
- **Cor por elemento** — paleta de 6 cores na toolbar flutuante de qualquer elemento selecionado (ícone/borda nos blocos, CTA no wireframe das páginas, fundo nas notas, cor no texto livre); "auto" volta à cor da categoria.
- **Notas de texto** — redimensionáveis, para anotações no quadro.
- **Retângulo / Região** — engloba áreas do funil; fica atrás dos demais elementos, com título opcional (placeholder discreto), cor e redimensionamento.
- **Modo desenho** — botão de lápis: desenhe à mão livre por cima do quadro (ótimo para apresentações). Dois modos: **Livre** (traço natural) e **Formas** (o traço vira retas com snap, círculos, triângulos e retângulos limpos). Três espessuras de pincel, 6 cores, **borracha** (apaga o traço tocado por inteiro) e "Limpar desenhos". Traços persistem e são selecionáveis.
- **Menu de contexto** — botão direito em elementos e conexões: renomear/editar, duplicar, rotular e excluir.
- **Sidebar recolhível** — botão no canto do quadro esconde/mostra a barra de elementos.
- **Excluir** — selecione elementos/conexões e use o botão "Excluir" na barra flutuante, ou pressione Delete/Backspace.
- **Tema claro/escuro** — toggle no topo (dashboard e editor); preferência salva no navegador.
- **Auto-save** — salva sozinho no navegador a cada alteração (indicador "Salvo no navegador às HH:MM").
- **Exportar/Importar JSON** — backup e troca de funis entre máquinas (mesmo formato do documento do Funnel Control).
- **Exportar PNG** — imagem 2x do funil completo com fundo dark.

## Stack

Vite + React 18 + @xyflow/react (React Flow 12) + html-to-image.
Fontes self-hosted via @fontsource (Geist, Inter, Fragment Mono) — necessário para o
export PNG funcionar (Google Fonts via `<link>` quebra o html-to-image por CORS).

Design tokens derivados de `../../DESIGN.md` (fonte de verdade visual da Elyon Studios).
