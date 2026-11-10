# Etapa 4B.6b.2 — Mensagens e recuperação de conflitos

**Classificação: APPROVED WITH LIMITATIONS.**

## Baseline e diagnóstico

Antes das alterações: 392 testes em 26 arquivos, typecheck, lint e build aprovados. O build já avisava sobre chunk maior que 500 kB. O relatório 4B.6a e o fluxo de sessão, provider, banners, aviso e formulários foram inspecionados.

O baseline já continha tratamento de conflito nos formulários: `useFormErrors` não copia a mensagem de conflito para o erro local e direciona o foco para a atualização. `StaleNotice` explica que a gravação recusada não salva, orienta a revisão e oferece **Atualizar dados**. `WorkspaceBanners` o exibe na página; `Dialog` o exibe no modal e o aviso da página fica oculto enquanto o modal está aberto. A sessão sinaliza `stale`, preserva o armazenamento na recusa e carrega os dados novamente ao atualizar. Os campos e seus erros permanecem no estado do formulário.

Foi reproduzida uma exceção no descarte de dados inválidos: ao recusar o descarte por conflito, `WorkspaceBanners` guardava a mensagem retornada em `actionError`, além do aviso de workspace desatualizado. Após atualizar e fechar o diálogo, a mensagem antiga continuava na página. A alteração nesse componente impede armazenar o erro de conflito como erro local; falhas não relacionadas continuam sendo exibidas. Nenhum mecanismo de concorrência foi alterado.

## Jornadas e integridade

Executadas em Chromium via Playwright, em contextos novos e isolados, com dados fictícios. O conteúdo bruto do workspace foi comparado antes e após as tentativas recusadas.

- **A — Feedback:** edição em B e criação concorrente em A. A recusa manteve o armazenamento byte a byte, mostrou um aviso visível e nenhum texto local duplicado. Após atualizar, o rascunho permaneceu; a nova gravação persistiu junto ao feedback de A.
- **B — Decisão:** criação em B e feedback concorrente em A. A recusa não alterou o armazenamento e houve um aviso visível. Título, problema, hipótese, decisão, alternativa, critério e próximo passo permaneceram após atualizar; a decisão salva e o feedback concorrente permaneceram no armazenamento.
- **C — Indicador:** indicador anterior criado, novo indicador em B e feedback concorrente em A. A recusa não alterou o armazenamento. Nome e descrição permaneceram após atualizar; o indicador anterior, o novo e o feedback concorrente permaneceram após salvar.
- **D — Validação independente:** após recusa por conflito, data inválida submetida no formulário de feedback. Atualizar removeu o aviso de conflito, preservou o erro de data e o rascunho. Em outra execução, após corrigir a data, a gravação persistiu com o feedback concorrente.
- **Descarte recusado:** dados inválidos fictícios mudaram em outra aba; a recusa não alterou o conteúdo bruto. Antes da correção, a mensagem local persistia após atualizar; depois, nenhum texto antigo de conflito permaneceu.

## Tipos de falha

Validação exibe erro do campo. Conflito usa o aviso de workspace desatualizado. Uma falha de escrita simulada por `QuotaExceededError` exibiu mensagem de gravação, preservou o rascunho e não criou registro. Uma falha de leitura simulada ao atualizar exibiu **Armazenamento local indisponível**, preservou o rascunho e manteve o erro local de escrita anterior. Esses testes não modificaram dados reais.

## Testes e gates

Adicionado teste de regressão ao roteiro existente `tests/browser/refinement-4b6b.cjs` para o descarte recusado e a limpeza do aviso. A mesma sequência foi executada via ferramenta Playwright com sucesso. O roteiro de navegador não integra `npm test`: Playwright não é dependência local; nenhuma dependência foi instalada.

Após a alteração: `npm run typecheck`, `npm run lint`, `npm test` (392/392) e `npm run build` passaram. O aviso anterior de chunk grande permanece.

## Limitações

As jornadas foram executadas somente em Chromium; leitores de tela e outros navegadores não foram avaliados. Falhas de leitura e escrita foram simuladas, não provocadas por indisponibilidade real. A atualização malsucedida usa o alerta de armazenamento existente; não foi alterado o contrato da sessão. O diretório não possui metadados Git, impedindo inspeção por `git diff`.
