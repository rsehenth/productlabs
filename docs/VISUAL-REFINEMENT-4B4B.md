# Etapa 4B.4b — Detalhes, formulário e exportação Markdown

## 1. Status final

**APPROVED WITH LIMITATIONS** (limitações na seção 21).

## 2. Problemas identificados

- Formulário: sem estado "Salvando…" (envio duplo possível); aviso geral no topo, longe do botão de salvar; seção "Evidências" antes de hipótese e critérios; nome de indicador/feedback sem quebra causava rolagem horizontal no mobile.
- Detalhe: evidências antes da hipótese; textos "Não registrada." sem distinção; exclusão com confirmação inline sem estado pendente; linha de metadados duplicava contagens de evidências; listas como bullets simples.
- Listagem (registrado para a etapa de acabamento da 4B.4a, não alterado): `Indicadores N · Feedbacks N · Alternativas N` aparece agrupado com evidências; alternativas não são evidências.
- Diálogo compartilhado: não foi inspecionado a fundo; detalhe e formulário são páginas, não diálogos. Só a confirmação de exclusão usa `Dialog`.

## 3. Melhorias implementadas

- Formulário reordenado: Contexto → Hipótese → Alternativas → Decisão → Critérios → Evidências relacionadas → Próximos passos → Status.
- Aviso geral recebe foco ao falhar e informa que nada foi salvo e que o conteúdo permanece.
- Botões desabilitados e "Salvando…" durante a gravação; envio duplo bloqueado.
- Aviso "Obrigatório para o status Validada" na seção de critérios.
- Erros de lista ligados aos inputs por `aria-describedby`/`aria-invalid`.
- Detalhe reorganizado como registro de raciocínio: Problema → Hipótese → Alternativas → Decisão registrada → Evidências vinculadas (Indicadores / Feedbacks) → Critérios → Próximos passos → Metadados.
- Cada seção tem uma dica conceitual (hipótese não é fato, alternativa não é evidência, decisão não implica sucesso, vínculo não implica causalidade).
- Excluir usa `ConfirmDialog` compartilhado (sem alteração) com `pending`; falha informa "Nada foi excluído."

## 4. Arquivos modificados

- `src/features/decisions/decision-form.tsx`
- `src/features/decisions/decision-detail.tsx`
- `docs/VISUAL-REFINEMENT-4B4B.md` (este relatório)

Nenhum teste foi adicionado ou removido. Nenhuma regra de domínio, schema, persistência, Provider, Web Locks, backup ou lógica de Markdown foi tocada.

## 5–11. Formulário, detalhe, status, hipótese/decisão, alternativas, evidências, critérios

- Regras de status confirmadas em `decision-rules.ts` (draft/abandoned: nada; investigating: hipótese; decided: + decisão; validated: + critério). `decisionStatusErrors` intacto.
- Mudar o status não apaga nem oculta campos.
- Detalhe mostra os campos realmente preenchidos em qualquer status (abandonada incluída); campos vazios mostram uma linha discreta, sem blocos pesados.
- Hipótese (barra lateral de destaque) e decisão (borda) têm tratamentos distintos; alternativas ficam em lista numerada própria, fora de "Evidências".
- Evidências: subseções Indicadores e Feedbacks com contagem; texto longo quebra (`break-words`).

## 12. Exclusão

Confirmação em diálogo identifica o registro, explica que é irreversível e que indicadores/feedbacks permanecem. Cancelar preserva. Verificado no navegador (cancelar manteve 3 registros).

## 13. Exportação Markdown

Botão "Exportar Markdown" mantido no cabeçalho; mensagem "Markdown gerado: <arquivo>.md" confirmada no navegador. `markdown.ts` não foi alterado. **O conteúdo do arquivo baixado não foi reinspecionado nesta execução**; os testes existentes de Markdown continuam passando.

## 14. Estados assíncronos

Salvamento pendente e exclusão pendente bloqueiam repetição. Erro de campo fica junto ao campo; erro geral fica no topo do formulário e recebe foco. O erro geral repete a primeira mensagem de campo (comportamento existente, mantido).

## 15. Responsividade

Verificado por script (sem rolagem horizontal): detalhe em 375 px, diálogo de exclusão em 375 px, formulário em 375 px (após corrigir `min-w-0`/`grid-cols-1`); detalhe em 1280 px. **1440, 768 e 390 px não foram medidos separadamente** (usado 375 px como proxy de smartphone).

## 16. Acessibilidade

Labels, `aria-invalid`/`aria-describedby` nas listas, foco no aviso de erro, ordem de títulos h1 → h2 → h3. Retorno de foco e contraste não foram auditados formalmente. Nenhum problema estrutural no `Dialog` compartilhado foi investigado; fica para a 4B.6.

## 17. Jornadas funcionais (dados fictícios, localStorage semeado)

- A (evolução com mesmo ID): **parcial** — rascunho → validada em uma única edição, ID `d2` preservado; passos intermediários (investigando, decidida) foram testados apenas como tentativas de salvar inválidas.
- B (validação): investigando sem hipótese, decidida sem decisão e validada sem critério foram recusados; rascunho incompleto é aceito (seed).
- C (evidências): detalhe mostra indicadores/feedbacks vinculados; **edição de vínculos e recarga não foram exercitadas**.
- D (Markdown): exportação acionada e mensagem verificada; conteúdo não inspecionado.
- E (exclusão): cancelar verificado; confirmar exclusão **não** foi executado no navegador.
- F (abas): ver seção 18.

## 18. Teste entre abas

Aba B abriu a edição; aba A salvou outra decisão; B tentou salvar → recusado, nada gravado, texto preservado, mensagem de conflito + "Nada foi salvo" + botão "Atualizar dados". Após atualizar, o formulário manteve o texto e o salvamento funcionou.

## 19–20. Quality gates

- Testes: **389 aprovados** (25 arquivos).
- Typecheck, ESLint e build: aprovados.

## 21. Limitações restantes

- Jornadas A, C, D e E apenas parcialmente exercitadas (acima); conteúdo do `.md` não conferido.
- Tablet e 1440 px sem medição; sem captura visual do formulário completo.
- Nenhum teste automatizado novo para pending/ordem das seções.
- Agrupamento semântico da listagem (4B.4a) pendente.

## 22. Possíveis regressões

Textos alterados em rótulos do formulário ("Contexto", "Evidências relacionadas", "Decisão registrada" no detalhe); nenhum teste existente dependia deles. Confirmação de exclusão agora é modal em vez de inline.

## 23. Preparação para a 4B.5

Nenhuma dependência nova. Pendências para registrar: semântica "Evidências" na listagem e auditoria do `Dialog` compartilhado (4B.6).
