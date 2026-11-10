# Etapa 4B.5b — Validação funcional do Interactive Product Case

**Status final: APPROVED WITH LIMITATIONS**

Legenda: **[N]** verificado no navegador (Playwright, contexto isolado) · **[T]** coberto por teste automatizado · **[C]** apenas inspeção do código.

## 1. Baseline
389 testes / 25 arquivos aprovados antes e depois. WFA-01/02/03 e P2-01 não tocados.

## 2. Controles interativos
8 checkboxes de evidência, botão "Limpar seleção" e "Remover" por evidência, filtro de feedbacks, seletor de indicador, textarea de hipótese, 3 radios de alternativa, botão "Ver síntese". Todos nativos. [C][N]

## 3. Três seções
`CaseProgress` é estático: sem foco, sem links, sem `aria-current`, sem estado concluído. [N][T] Nenhuma progressão funcional existe nem foi criada.

## 4. Evidências
Seleção por mouse e por Espaço; desmarcar funciona; sem duplicatas; resumo reflete o conjunto; dados do cenário inalterados. [N] Lógica de toggle/remoção: [T] (`case-feedback-view.test.ts`).

## 5. Hipótese
Texto curto, longo, multilinha, acentos, aspas, "%" e "/" digitados e exibidos corretamente na síntese (quebra de linha preservada). Edição atualiza a síntese. [N] Hipótese rotulada "não verificada". [N]

## 6. Alternativas
Seleção por mouse, Espaço e setas (radio group nativo); troca atualiza a escolha vigente. Nenhuma marcada como vencedora/pontuada. [N]

## 7. Consistência da síntese
Após alterar hipótese, evidência e alternativa, a síntese reflete o estado atual e não mantém texto antigo. Aviso de simulação presente. [N] Regras de montagem: [T] (`case-decision-view.test.tsx`).

## 8. Estados incompletos
Sem nada: lista os 3 requisitos faltantes; só falta alternativa: lista 1; "Seus dados preenchidos foram mantidos". Comportamento existente preservado. [N][T]

## 9. Navegação e recarregamento
O estado é `useState` local: reinicia ao sair da rota e ao recarregar; nada é persistido. Comportamento preservado. [N]

## 10. Teclado / foco
Tab, Espaço, setas funcionam em checkboxes, radios, textarea e botão; sem armadilha de foco. Foco visível: outline sólido 2px (regra global `:focus-visible`). Estado selecionado tem texto ("Evidência selecionada", badge "Selecionada") além de cor. [N]

## 11. Responsividade
1440×900, 1280×800, 768×1024 e 390×844: sem overflow horizontal (scrollWidth = clientWidth), síntese com texto longo sem corte. [N] Não foi feita inspeção visual por captura nesta etapa.

## 12. Isolamento do Workspace
- Workspace preenchido (perfil do navegador com 1 decisão, 3 indicadores, 30 feedbacks): `Storage.setItem/removeItem` instrumentado durante a jornada completa, incluindo trocas e navegação: **0 gravações**; `savedAt` e conteúdo idênticos; nenhuma chave nova em local/sessionStorage. [N]
- Workspace vazio (contexto novo): nenhuma chave criada antes ou depois da jornada completa e do reload; 0 gravações. [N]
- Ausência de escrita no código: [C].
- Limitação: o primeiro teste usou um perfil que já tinha dados de teste (não criado por mim); o conteúdo não foi alterado.

## 13. Problemas encontrados e corrigidos
1. `CaseProgress` usava `<nav>` sem links, anunciado como landmark de navegação. Agora `<div>` + `<ol aria-label>`. (`case-progress.tsx`)
2. Rótulo do checkbox de evidência com < 24px de altura (8 itens, todas as larguras). Agora `min-h-10`. (`case-feedback-card.tsx`)
3. Rótulo do radio com < 24px em 768px. Agora `py-1`. (`case-decision-options.tsx`)
Reverificado em 390px: 0 rótulos < 24px, 0 `nav` de etapas, foco em botão visível. [N]

## 14. Testes adicionados
Nenhum. Os testes existentes usam renderização estática; a interação foi coberta no navegador. Sem biblioteca de componentes instalada, não adicionei testes de clique (lacuna registrada).

## 15. Quality gates
Typecheck, ESLint, build aprovados; **389/389 testes** (25 arquivos).

## 16. Limitações
- Interações (clique, teclado) sem teste automatizado versionado; evidência só do navegador.
- "Disponível" repetido nas 3 etapas e numeração "01/02/03" duplicada com os marcadores seguem como redundância leve (testes exigem o texto).
- Contraste não medido numericamente. Arquivo `dist` regenerado pelo build.
- Dev server Vite iniciado por mim para os testes; sem tela em branco ou erro de console observado.

## 17. Possíveis regressões
Altura mínima maior do rótulo de evidência aumenta levemente o card; não verificado visualmente em capturas.

## 18. Preparação para a 4B.6
Pendências globais anteriores (`PageHeader` com títulos longos, `Dialog`) continuam fora do escopo. Nenhum commit, push ou deploy feito.
