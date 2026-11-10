# Etapa 4B.6a — Componentes globais e acessibilidade

**Status: APPROVED WITH LIMITATIONS.** Legenda: [N] verificado no navegador (Playwright); [C] só inspeção de código/cálculo.

## 2. Baseline
389 testes, typecheck, lint e build aprovados antes de qualquer edição. [N]

## 3. Problemas reproduzidos e causas
| # | Problema | Causa |
|---|---|---|
| 1 | Foco ia ao `body` ao fechar qualquer diálogo (Cancelar, X, Esc, confirmar) em Feedbacks. [N] | `Dialog` não usa `Dialog.Trigger`; o `onCloseAutoFocus` do Radix só foca o trigger e cancela o padrão. Além disso, os diálogos são montados já abertos e o `autoFocus` interno move o foco antes de `onOpenAutoFocus`, então capturar o disparador ali não funciona. |
| 2 | Título de 140 caracteres sem espaço no `PageHeader` (relatório 4B.4c). | `h1` sem `min-width:0`/quebra de palavra. Após a correção não houve overflow; não recapturei o overflow antes da correção nesta sessão (a reprodução vem do relatório 4B.4c). |
| 3 | `Field`: "OBRIGATÓRIO" em caixa-alta 10 px com opacidade 60%; dica some quando há erro. [N]/[C] | Estilo e condição `hint && !error`. |
| 4 | Borda de campos 1,57:1; botão destrutivo com texto 3,61:1. [C: cálculo OKLCH dos tokens] | Tokens `--color-input` e `--color-destructive`. |
| 5 | Botão X do diálogo medindo 32×36 px. [N] | Encolhia no flex; `size-9`. |

## 4. Arquivos modificados
- `src/components/ui/dialog.tsx` — retorno de foco; X com `shrink-0 max-sm:size-11`.
- `src/components/layout/app-shell.tsx` — `<main tabIndex={-1} outline-none>` como destino de foco estável.
- `src/components/ui/page-header.tsx` — `min-w-0`, `max-w-full`, `break-words`.
- `src/components/ui/field.tsx`, `src/lib/field-a11y.ts` — dica permanece com o erro; rótulo "Obrigatório" em caixa normal, 12 px, cor `muted-foreground`.
- `src/index.css` — tokens novos `--color-field` e `--color-destructive-solid` (paleta existente intacta).
- `input.tsx`, `select.tsx`, `textarea.tsx` — `border-field`; placeholder sem opacidade reduzida.
- `button.tsx` — variante destrutiva usa `bg-destructive-solid`.
- `src/components/ui/shared-components.test.tsx` — 3 testes novos.
Nada de domínio, persistência, rotas, schemas ou backups foi tocado.

## 5. PageHeader
`break-words` + `min-w-0` no `h1` e no contêiner flex. Sem truncar nem reduzir fonte. Testado [N] com título de 140 caracteres sem espaço, URL longa e texto longo com espaços, nas 4 rotas e em 1440×900, 1280×800, 768×1024 e 390×844: `scrollWidth == clientWidth` e `h1` dentro da viewport em todas as combinações. Observação: o teste trocou o texto do `h1` por JS nas rotas vazias; o detalhe de decisão real usa o mesmo componente. Ações não ficaram ocultas por overflow, mas não medi sobreposição visual com screenshot.

## 6. Retorno de foco
Um listener `focusin` de módulo guarda o último elemento focado fora de `[role=dialog]`. No `onCloseAutoFocus`, se esse elemento ainda está no DOM e habilitado, recebe o foco; senão o foco vai para `<main>`. Sem atrasos arbitrários; fechamento durante operação pendente continua bloqueado pelo `ConfirmDialog`. [N] em Feedbacks:
- Novo feedback: Esc, Cancelar, X → botão "Novo feedback".
- Excluir: Cancelar, Esc → botão "Excluir" da linha. Editar: Cancelar → botão "Editar".
- Disparador removido (excluir confirmado) → `<main>`.
- Gaveta mobile (390 px): foco entra em "Fechar navegação", Esc devolve ao botão do menu, navegar pelo link fecha a gaveta. A gaveta tem implementação própria e não foi alterada.
Observação: o foco é restaurado após o `setTimeout` do Radix; leitura imediata ainda mostra `body`.
Não verificados: diálogo aberto por URL (`?metric=`) e confirmar exclusão no detalhe de decisão (a página de decisões estava vazia e não criei registros); ambos usam o mesmo `Dialog`, e sem disparador focado o destino é `<main>`.
Limite conhecido: diálogos aninhados devolveriam o foco ao disparador externo do primeiro (não existem hoje); em navegadores que não focam botões ao clicar (Safari), o fallback é `<main>`.

## 7. Field
Dica e erro coexistem; `aria-describedby="id-hint id-error"`, erro com `role="alert"`, `aria-invalid="true"` (já existente) [N em Feedbacks]. Obrigatoriedade e validações inalteradas. Campo desabilitado/em salvamento não revisados visualmente.

## 8. Alvos de toque
Botão padrão (36 px) mantido. X dos diálogos agora 44×44 em < 640 px [N]. Selects/inputs com 36 px de altura ficaram como estão (decisão consciente: não aumentar indiscriminadamente; WCAG 2.2 AA 2.5.8 exige 24 px).

## 9. Contraste (cálculo OKLCH→sRGB sobre os tokens) [C]
Texto principal/card 16,2:1; muted/card 7,7:1; destrutivo (texto)/card 4,8:1; anel de foco/card 13,8:1; botão primário 13,3:1. Corrigidos: borda de campo 1,57 → ~3,6:1; botão destrutivo 3,61 → 5,0:1. Falha residual: o canvas do navegador não interpretou OKLCH, então não houve medição por estilos computados. Não afirmo conformidade WCAG integral.

## 10. Teclado
[N] Enter/Esc em diálogos, Tab até o primeiro campo (foco inicial no textarea), foco visível via `:focus-visible` global (anel 2 px). Varredura completa de Tab/Shift+Tab, Selects e Espaço não executada.

## 12–13. Jornadas
- A (Analytics): não executada em navegador. Só confirmei que `Field` em Feedbacks mostra label, dica e erro.
- B (Feedback): executada [N], ver §6.
- C (Decisões): títulos longos [N]; edição, exclusão no detalhe e disparador removido em contexto isolado: só o equivalente em Feedbacks.
- D (Interactive Case): só o teste de overflow de título e os testes automatizados existentes; não percorri os controles.
- E (Mobile): executada [N].

## 14–16. Testes e gates
392 testes aprovados (389 + 3: `Field` dica+erro, `fieldAria`, `PageHeader`). Focus return depende de navegador e não tem teste automatizado (ambiente é `node`, sem jsdom, sem nova dependência). `npm run typecheck`, `lint`, `build` aprovados (build com o aviso de chunk > 500 kB já existente, reservado à 4B.6b).

## 17. Regressões
Nenhuma observada. Efeito visual intencional: bordas de campos e botão destrutivo ficaram mais claros/escuros; "Obrigatório" não é mais caixa-alta.
Observação fora do escopo: após submeter formulário com erro de validação, `document.activeElement` ficou no `body` em Feedbacks (o botão enviar perde o foco); vale tratar na 4B.6b.

## 19. Para a 4B.6b
Jornadas A e D e fluxo de decisão em navegador; botões pequenos do histórico de observações; foco após erro de validação; mensagens duplicadas de conflito; bundle; revisão de campos desabilitados.
