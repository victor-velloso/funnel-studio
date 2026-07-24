# Funnel Studio — Elyon Studios™

Quadro branco visual para desenhar funis de venda (estilo Funnelytics, sem tracking).
100% offline — os funis ficam salvos no `localStorage` do navegador.

## Rodar

```bash
npm install
npm run dev        # http://localhost:5199
```

Build de produção: `npm run build` (sai em `dist/`, deployável em qualquer host estático).

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
- **Notas de texto** — redimensionáveis, para anotações no quadro.
- **Excluir** — selecione elementos/conexões e use o botão "Excluir" na barra flutuante, ou pressione Delete/Backspace.
- **Tema claro/escuro** — toggle no topo (dashboard e editor); preferência salva no navegador.
- **Auto-save** — salva sozinho a cada alteração (indicador "Salvo às HH:MM").
- **Exportar/Importar JSON** — backup e troca de funis entre máquinas.
- **Exportar PNG** — imagem 2x do funil completo com fundo dark.

## Stack

Vite + React 18 + @xyflow/react (React Flow 12) + html-to-image.
Fontes self-hosted via @fontsource (Geist, Inter, Fragment Mono) — necessário para o
export PNG funcionar (Google Fonts via `<link>` quebra o html-to-image por CORS).

Design tokens derivados de `../../DESIGN.md` (fonte de verdade visual da Elyon Studios).
