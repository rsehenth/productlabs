# Etapa 4B.1 — Identidade visual, layout global e navegação

## 1. Status

**APPROVED WITH LIMITATIONS.** Identidade, shell, navegação e cabeçalho compartilhado foram refinados e
inspecionados no navegador. As páginas individuais **não** foram redesenhadas (ver seção 15).

## 2. Problemas visuais identificados

- Paleta azul-violeta sobre cinza-azulado: o visual padrão de "dashboard escuro", sem identidade.
- Fonte do sistema (`Segoe UI` etc.): tipografia sem voz própria, título de página e corpo com o mesmo peso visual.
- Dois rótulos em caixa-alta ("WORKSPACE") repetidos na sidebar e no header; o header repetia o `h1` da página.
- Badge "Etapa 2" e "Etapa 2 · MVP funcional" desatualizados e sem função para o usuário.
- Degradê radial decorativo no topo da área principal.
- Abaixo de `lg` a sidebar sumia por completo: em tablet o usuário só tinha o botão hambúrguer.
- Botão de menu móvel com 36 px (alvo de toque pequeno); foco não voltava ao botão ao fechar a gaveta.
- Favicon era o logo padrão do Vite.

## 3. Direção visual adotada

Segunda rodada (pedido: "ainda comum, cara de IA"), com as skills design-taste-frontend, impeccable,
ui-ux-pro-max e no-slop-ui. A direção "bancada de laboratório" em ciano foi trocada por
**"caderno de laboratório"**:

- **Cor:** tinta quase preta com leve matiz de papel (95) e um único acento **amarelo marca-texto**
  (`oklch(0.90 0.17 100)`), a cor que sublinha a evidência (a 1ª versão da rodada era verde-limão, trocada por
  parecer neon sobre o fundo quente). Sucesso é verde-azulado
  (168); "simulado" passou de âmbar para laranja (55) para não colidir com o amarelo; vermelho (erro) igual. Gráficos:
  amarelo, azul-céu e orquídea.
- **Tipografia:** Bricolage Grotesque em títulos (agora até 3rem, tracking apertado), IBM Plex Sans na
  interface e **IBM Plex Mono para figuras e metadados** (valores dos cards, badges, estado do
  armazenamento). O mono é a "voz de dado" do produto, não enfeite.
- **Elemento próprio do produto:** a navegação é um **pipeline evidência → decisão**: quatro nós ligados
  por uma linha que fica acesa até a página atual. O rodapé da sidebar mostra a contagem real de
  métricas, feedbacks e decisões do workspace.
- **Superfícies:** cards planos com 1 px de borda e um realce interno de 1 px no topo; botão primário
  em amarelo com texto escuro; estados vazios sem "azulejo" de ícone.
- **Fontes locais** em `public/fonts` (sem requisição externa nem dependência npm); `font-display: swap`.

Dos guias consultados, apliquei: cor só em ação, página ativa e dados; KPI como tipo, não ícone em
círculo colorido; sem degradês, sem sombras dramáticas, sem rótulos em caixa-alta.

## 4. Arquivos modificados

- `src/index.css` — tokens, `@font-face`, base (scrollbar, seleção, `text-wrap: balance`, numerais tabulares).
- `src/components/layout/brand-mark.tsx`, `sidebar.tsx`, `app-header.tsx`, `app-shell.tsx`, `mobile-nav.tsx`.
- `src/components/ui/page-header.tsx`, `badge.tsx`, `button.tsx`, `card.tsx`, `stat-card.tsx`, `empty-state.tsx`
  (escopo ampliado na 2ª rodada: são as primitivas que definem a aparência em todas as páginas).
- `public/favicon.svg`, `index.html` (`theme-color`).
- Novos: `public/fonts/{bricolage-grotesque,plex-sans,plex-mono-400,plex-mono-500}.woff2`.
- Ferramenta local: `.claude/launch.json` (servidor de preview; pode ser removido).

Nenhum arquivo de domínio, storage, rotas ou página de módulo foi alterado.

## 5. Componentes compartilhados refinados

`BrandMark`, `Sidebar`/`SidebarNav`/`SidebarBrand`/`SidebarFooter`, `MobileNav`, `AppHeader`, `AppShell`,
`PageHeader`, `Badge`.

## 6. Comportamento da navegação

- Página ativa: nó preenchido em amarelo no pipeline e rótulo em negrito, com `aria-current="page"`;
  nós anteriores ficam com contorno amarelo e a linha acesa.
- Hover e foco visíveis; alvos de clique com no mínimo 44 px de altura.
- Rótulos e rotas preservados (`#/overview`, `#/feedbacks`, `#/decisions`, `#/interactive-case`); o
  roteamento não foi tocado. A navegação tem 4 destinos: Product Analytics vive em Overview.
- Header: trilha "Product Decision Lab / página" e indicador real do estado do armazenamento
  (`ok`, `empty`, `stale`, bloqueado, indisponível), em vez do badge fixo "Etapa 2".

## 7. Responsividade

| Largura | Navegação |
| --- | --- |
| ≥ 1024 px | Sidebar de 256 px com rótulos, descrições e nota de workspace local |
| 768–1023 px | Trilho de 64 px só com ícones (nome acessível mantido via `sr-only`, `title` como dica) |
| < 768 px | Gaveta (Radix Dialog) aberta por botão de 44 px; cabeçalho de 56 px com marca e página atual |

`PageHeader` empilha as ações abaixo de `xl` para o título não ser espremido.

## 8. Acessibilidade

`<nav aria-label>`, `aria-current`, foco com anel de 2 px, alvos ≥ 44 px. Gaveta: foco entra no botão
Fechar, Esc fecha e o foco **volta ao botão do menu** (antes ia para o `body`, pois a gaveta é
controlada e não tem `Dialog.Trigger`). Contraste de texto secundário ≈ 7:1 sobre o fundo; o texto do botão
destrutivo manteve `oklch(0.63)` para preservar a razão anterior.

## 9. a 13. Testes e gates

- Testes: `npm test` — **389 aprovados** (25 arquivos), nenhum teste alterado, adicionado ou removido.
- `npm run typecheck`: sem erros.
- `npm run lint`: sem erros.
- `npm run build`: concluído; aviso de chunk > 500 kB já existente (Recharts), não relacionado.

## 14. Validações no navegador (painel embutido, viewport emulado)

- Rodada 2: capturas reais em 1440, 768 e 390 (Playwright) de Overview, Decisions e Interactive Case, mais
  a gaveta mobile; gaveta abre com foco dentro e sem rolagem horizontal.
- Rodada 1 — 1440 × 900 e 1280 × 800: sidebar completa, header, `PageHeader` e conteúdo das 4 rotas, sem rolagem horizontal.
- 768 × 1024: trilho de ícones (64 px), conteúdo em 694 px, sem rolagem horizontal.
- 390 × 844: sem rolagem horizontal; gaveta abre, foco entra nela, Esc fecha e devolve o foco, clicar em
  "Decisions" navega e fecha a gaveta.
- Troca entre as 4 rotas: `h1` correto e item ativo correto em todas.

## 15. Limitações restantes

- Os screenshots cobrem Overview, Decisions e Interactive Case; Feedbacks foi verificada só por DOM
  (título, rota ativa, overflow).
- Navegação por Tab percorrida apenas parcialmente (foco programático verificado); não foi feita varredura
  completa de ordem de tabulação.
- Contraste medido por estimativa e cálculo, sem ferramenta automática (axe).
- Nenhuma captura "antes/depois" arquivada (não solicitado).
- Fontes locais somam ≈ 150 KB; sem subconjunto além de `latin`.

## 16. Possíveis regressões

- O aviso `info` (Notice) agora é neutro, com só o ícone no acento, para não parecer alerta amarelo.
  Badges `default` (`bg-primary/10`) continuam em amarelo: conferir se alguma lembra um aviso.
- "Simulado" passou a laranja; conferir o contraste em outras telas que usem `simulated`.
- Valores em mono (StatCard) ficam maiores (text-5xl) e podem ocupar mais altura nos cards.
- Troca de matiz dos tokens afeta **todas** as páginas: botões, gráficos (`chart-1` agora ciano, `chart-2`
  orquídea) e badges. Conferir gráficos com dados reais na 4B.2.
- Badges deixaram de ser pílula (`rounded-md`) em todo o app.
- Textos "MVP funcional" nas páginas (fora de escopo) agora destoam do header, que não mostra mais "Etapa 2".

## 17. Preparação para a Etapa 4B.2

Registrar, por módulo, problemas específicos já vistos: cartões de métrica com rótulos em caixa-alta e
ícone decorativo (Decisions), estepe numerado do Interactive Case pouco legível, badge "MVP funcional"
redundante, formulários e diálogos ainda com a aparência anterior. Os tokens (`--font-display`,
`--color-primary`, escala de raio e cinzas quentes) já estão disponíveis para esses refinamentos.
