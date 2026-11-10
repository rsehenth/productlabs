# Etapa 4B.6b — Acabamento final, acessibilidade e regressão integrada

**APPROVED WITH LIMITATIONS.** O Product Decision Lab pode encerrar o refinamento visual e avançar para a preparação da Fase 4C. As correções e a jornada integrada foram verificadas no Chromium. O bundle ainda emite o aviso de tamanho, e a compatibilidade para publicação fica pendente.

## Baseline e método

- Antes das alterações, `npm run typecheck`, `npm run lint`, `npm test` e `npm run build` passaram. O Vitest registrou **392 testes em 26 arquivos**. Chunk principal de **825,34 kB**, **240,32 kB gzip**.
- Consultei os relatórios [4B.2b](VISUAL-REFINEMENT-4B2B.md), [4B.3b](VISUAL-REFINEMENT-4B3B.md), [4B.4c](VISUAL-REFINEMENT-4B4C.md), [4B.5b](VISUAL-REFINEMENT-4B5B.md) e [4B.6a](VISUAL-REFINEMENT-4B6A.md). Usei o grafo para localizar formulários e componentes compartilhados e conferi os contratos nas fontes.
- Reproduzi os fluxos na prévia do build local com Playwright e Chromium 156.0.8078.4. Cada jornada usou um `BrowserContext` novo com registros fictícios criados pela interface. Os testes entre abas abriram duas páginas no mesmo contexto.

## Defeitos reproduzidos e corrigidos

| Defeito observado | Causa | Correção e verificação |
| --- | --- | --- |
| Envio inválido levava o foco ao `body` em indicador, observação e feedback. Decisão focava um aviso geral que repetia o primeiro erro. | O botão desabilitado durante o salvamento perdia foco. Os formulários não direcionavam o foco aos campos quando os erros eram renderizados. | Cada envio com erro solicita foco após a renderização. O primeiro campo ou grupo inválido recebe foco na ordem do formulário. Falhas gerais, inclusive de gravação, focam o aviso. O diálogo continua aberto e o rascunho permanece disponível. Reenvio inválido verificado. |
| Uma gravação recusada exibiu três cópias da mensagem de conflito. Uma delas permaneceu após **Atualizar dados**. | O mesmo conflito alimentava o aviso da página, o do diálogo e uma mensagem local persistida pelo formulário. | O aviso usa o estado de desatualização do Workspace e aparece na superfície ativa. Recusa leva o foco a **Atualizar dados** e explica que a tentativa não salvou alterações. Atualização bem-sucedida remove o aviso e devolve o foco ao formulário. Falha de leitura exibe o aviso de armazenamento também dentro do modal. |
| Fechar ações inline de observação devolvia o foco ao contêiner do diálogo. | O botão ativo sumia quando o formulário ou a confirmação era desmontado. | Cancelar retorna a Editar ou Excluir. Confirmar a exclusão volta para **Adicionar observação**. Fechar a edição volta à ação que a abriu. |
| **Voltar** em decisão aberta por URL deixou o foco no `body`. | O botão estava no detalhe que a navegação desmontava. | O foco passa ao `<main>` antes do retorno à lista. O detalhe de indicador aberto por URL já usava `<main>` ao fechar, verificado novamente. |
| Editar e Excluir observação mediam 32 × 32 px no smartphone. | A variante compacta também dimensionava os ícones na largura móvel. | Ambos mediram **44 × 44 px** em 390 px. Ampliei alvos móveis em ações de feedback, decisão, caso e confirmações próximas, preservando o arranjo. |
| Nome de indicador de 110 caracteres sem espaços e valor de R$ 1 trilhão estouravam o cartão e o diálogo ou exigiam rolagem horizontal no histórico a 390 px. | Palavras e números longos não podiam quebrar. A tabela calculava a largura pelas células. | Quebra local de texto e números e largura reservada para ações no histórico móvel. O reteste mostrou o valor completo, os botões alcançáveis e a página sem overflow. |
| Texto vermelho sobre a própria tinta vermelha e metadados atenuados do caso abaixo de 4,5:1. | A transparência reduzia o contraste efetivo. | Avisos e selos destrutivos usam texto claro da paleta sobre o fundo vermelho atenuado. Metadados afetados usam opacidade de 80%. Razões medidas abaixo. |

### Recuperação em duas abas

A aba B abriu a edição de um feedback e digitou um rascunho. A aba A gravou outro feedback. O envio em B foi recusado e o conteúdo bruto salvo ficou idêntico ao da aba A. Em B havia um aviso de recuperação visível. Depois de **Atualizar dados**, o aviso saiu, o foco voltou ao conteúdo, o rascunho pôde ser salvo e a recarga confirmou os dois registros.

Um ensaio separado manteve um erro de data visível após atualizar e simulou uma leitura de armazenamento bloqueada. O diálogo mostrou **Armazenamento local indisponível**, com o erro de campo e o rascunho preservados. Uma falha de gravação simulada focou o aviso e deixou o armazenamento intacto. Também verifiquei a remoção concorrente do indicador de uma observação aberta. O rascunho permaneceu disponível e a tentativa seguinte informou que o indicador não foi encontrado.

### Retorno de foco e teclado

- **Disparador preservado.** Cancelar, Esc e X devolveram o foco ao botão **Novo feedback**. Cancelar exclusão voltou à ação **Excluir** correspondente, inclusive no detalhe de decisão.
- **Disparador removido.** Excluir um feedback de teste ou confirmar exclusão da decisão levou ao `<main>`. Os registros vinculados à decisão continuaram presentes.
- **URL direta.** Fechar o detalhe de indicador com Esc e voltar do detalhe de decisão após recarregar a URL levaram ao `<main>`.
- **Gaveta móvel.** Esc devolveu o foco ao botão de menu. Escolher um destino fechou a gaveta, mudou a rota e também devolveu o foco ao menu.
- **Listener global.** O `focusin` da aplicação é registrado na avaliação do módulo, ignora descendentes de `[role="dialog"]` e verifica se o disparador ainda está conectado e habilitado. No CDP havia um listener no documento antes e depois de passar pelas quatro rotas. Com modal aberto havia três, voltando a um após fechar. A lógica de retorno de foco do Radix e o listener da aplicação foram mantidos. [Radix Dialog](https://www.radix-ui.com/primitives/docs/components/dialog)
- **Percurso.** Usei Tab, Shift+Tab, Enter, Espaço e setas nos fluxos de criação, pesquisa e filtros de feedback, detalhe, exportação, confirmações, evidências, hipótese e alternativas. O foco dos controles alcançados por Tab tinha contorno sólido de 2 px. A navegação dentro dos diálogos e a saída por Esc funcionaram nos percursos testados.

## Contraste e mensagens

Usei `getComputedStyle` no Chromium e o canvas sRGB para converter OKLCH/OKLab e compor fundos translúcidos. Calculei as razões pela luminância relativa. A tabela usa cores sRGB efetivas aproximadas e registra os pares amostrados. Usei 4,5:1 para texto normal, 3:1 para texto grande e 3:1 para informação visual necessária ao controle. [Contraste de texto](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) · [Contraste não textual](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)

| Amostra | Frente / fundo em sRGB | Razão |
| --- | --- | ---: |
| Texto principal / fundo | `#f2f0e7` / `#0c0b09` | 17,23:1 |
| Texto secundário / fundo | `#aaa89f` / `#0c0b09` | 8,25:1 |
| Rótulo e dica de feedback / card | `#f2f0e7`, `#aaa89f` / `#151411` | 16,13:1 / 7,73:1 |
| Placeholder de busca / campo | `#aaa89f` / `#0d0d0a` | 8,17:1 |
| Borda de campo / preenchimento e card | `#6b6961` / `#0f0f0b`, `#151411` | 3,49:1 / 3,35:1 |
| Anel de foco / card adjacente | `#f9e03f` / `#151411` | 13,83:1 |
| Texto de botão primário e indicador selecionado | `#1e1802` / `#f9e03f` | 13,28:1 |
| Botão destrutivo normal e hover | `#fff6f5` / `#c92f33`, `#b72c2f` | 5,02:1 / 5,79:1 |
| Erro junto ao campo | `#e54c4a` / `#151411` | 4,79:1 |
| Aviso de erro e selo desfavorável sobre card, antes e depois | `#e54c4a` → `#fff6f5` / `#291917` | 4,39:1 → 15,86:1 |
| Metadados do caso sobre card, antes e depois | `#7d7c75` → `#8c8a82` / `#151411` | 4,40:1 → 5,33:1 |
| Sucesso de feedback | `#50d2a7` / `#121e19` | 9,07:1 |
| Informação na síntese e título do aviso de conflito | `#f2f0e7` / `#1d1c19` | 14,93:1 |
| Título do aviso de armazenamento indisponível | `#f2f0e7` / `#211110` | 15,96:1 |
| Selo de alternativa selecionada | `#f9e03f` / `#2b2815` | 11,12:1 |
| Selo de cenário simulado | `#f99549` / `#23180f` | 7,79:1 |

Sucesso tem confirmação textual e ícone de sucesso. Validação aponta o campo, e falha de gravação usa aviso de erro. O conflito tem título, triângulo e ação de recuperação. O aviso de armazenamento informa a falha de leitura ou a condição dos dados. Informação e simulação mantêm rótulos próprios. O amarelo marca as ações primárias, foco e seleção. A amostragem cobre os pares acima e não estabelece conformidade integral com a WCAG.

## Responsividade final

Verifiquei **61 estados** nas larguras de **1440 × 900**, **1280 × 800**, **768 × 1024** e **390 × 844**. Incluí o App Shell, os quatro módulos, detalhes, formulários, erros, confirmações e a gaveta em 390 px. Conferi capturas das quatro larguras e medidas do DOM para overflow horizontal, títulos, ações fora da área visível e sobreposição de botões em rodapés de diálogos. A matriz final não indicou esses problemas nos estados examinados.

Em 390 px, os botões de observação passaram de 32 × 32 para 44 × 44 px sem ocultar ações. No tablet e no desktop ficaram com aproximadamente 57 × 32 e 62 × 32 px, com texto visível. O alvo de 44 px é a referência de conforto adotada para ações móveis próximas. O critério AA considera 24 × 24 px e suas exceções. [WCAG 2.2, tamanho mínimo do alvo](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)

## Jornada integrada

| Módulo | Resultado observado |
| --- | --- |
| Product Analytics | Indicador criado pela interface, observação adicionada e editada no detalhe. Recarga confirmou a observação de 1.234.568,90 e o identificador do indicador associado. |
| Feedback Discovery | Relato criado, vinculado ao indicador, localizado por busca e editado. Recarga confirmou o texto editado e o vínculo. |
| Decision Workspace | Decisão criada com problema, hipótese, indicador e feedback. Detalhe e estado persistido confirmaram ambos os vínculos. O download `.md` foi aberto e continha os registros e a hipótese esperados. |
| Interactive Product Case | Selecionei indicador e evidência, preenchi hipótese, troquei a alternativa pelo teclado e conferi a síntese. Após voltar ao Workspace, `localStorage` e `sessionStorage` ficaram idênticos ao estado anterior. A instrumentação de `setItem`, `removeItem` e `clear` registrou **zero escritas**. |

A jornada não registrou exceções nem `console.error`. Os contextos de teste foram fechados após as verificações.

## Bundle e carregamento

- Chunk principal final de **828,91 kB minificados / 241,33 kB gzip**. O aviso de 500 kB permanece. O CSS ficou em **44,17 kB / 8,33 kB gzip**.
- O mapa de fontes gerado em diretório temporário atribuiu aproximadamente **232 kB ao Recharts**, **207 kB ao React DOM** e **163 kB ao código do app** no chunk principal. Os valores são estimativas de trechos mapeados, sem atribuição do gzip. `d3-shape`, `d3-scale` e `tailwind-merge` também aparecem entre as maiores contribuições.
- Em uma abertura fria por rota, no preview local, o `DOMContentLoaded` ocorreu entre **79 e 98 ms**. As quatro rotas renderizaram o título e não tiveram requisições com falha. São observações locais, sem simular rede de publicação.
- Para a Fase 4C, vale medir em rede e CPU representativas e avaliar se carregar o Interactive Case e seus gráficos sob demanda reduz o custo inicial.

## Testes e arquivos

| Verificação | Resultado |
| --- | --- |
| `npm run typecheck` | Aprovado |
| `npm run lint` | Aprovado |
| `npm test` | **392 aprovados** em 26 arquivos |
| `npm run build` | Aprovado com aviso de chunk |
| `node --test tests/browser/refinement-4b6b.cjs` | **7 aprovados** no Chromium |

Os novos testes de navegador cobrem foco de validação nos quatro formulários, conflito entre abas, preservação do rascunho e dos erros de campo, falhas de leitura e gravação, remoção concorrente, foco de ações inline e detalhes por URL. Para executar, sirva o build com `npm run preview -- --host 127.0.0.1 --port 4816`. Use o Playwright disponível no ambiente e, se estiver fora do projeto, informe seu caminho em `PLAYWRIGHT_MODULE`. A porta pode ser substituída com `PDL_BASE_URL`.

- Compartilhados — `src/hooks/use-form-errors.ts`, `src/components/ui/dialog.tsx`, `notice.tsx`, `badge.tsx`, `src/components/layout/stale-notice.tsx`, `workspace-banners.tsx`, `mobile-nav.tsx` e `src/index.css`.
- Analytics — `src/features/overview/metric-form-dialog.tsx`, `observation-form.tsx`, `metric-detail-dialog.tsx`, `metric-card.tsx`, `overview-page.tsx` e `demo-dataset-preview.tsx`.
- Feedback Discovery — `src/features/feedbacks/feedback-form-dialog.tsx` e `feedbacks-page.tsx`.
- Decision Workspace — `src/features/decisions/decision-form.tsx`, `decision-detail.tsx` e `decisions-page.tsx`.
- Interactive Case — `src/features/interactive-case/case-decision-options.tsx`, `case-decision-summary.tsx`, `case-evidence-summary.tsx`, `case-feedback-card.tsx`, `case-investigation.tsx`, `case-metric-card.tsx`, `case-progress.tsx` e `interactive-case-page.tsx`.
- Testes e documentação — `tests/browser/refinement-4b6b.cjs` e este relatório.

## Limitações e decisão

O aviso de bundle é a pendência técnica observada. Os testes de interação e as medidas de layout usaram Chromium emulado em quatro resoluções, sem aparelho físico, Safari, Firefox ou leitor de tela. Não foram verificadas as combinações de zoom, tecnologias assistivas, rede lenta ou ambiente publicado. A auditoria de contraste foi amostral. Não foi repetida a auditoria funcional completa de backup.

**Avançar para a preparação da Fase 4C.** Validar compatibilidade real, configuração de produção, publicação e documentação de portfólio nessa fase. Este resultado encerra o refinamento visual com as limitações acima.
