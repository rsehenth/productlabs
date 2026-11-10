# Workspace — Revalidação de integração (Etapa 4A.3a)

Data: 06/11/2026. Etapa somente de teste e diagnóstico. Nenhum código de produção, teste, schema, regra de validação ou dependência foi alterado. Sem commit, push ou deploy.

Legenda das evidências (não são equivalentes):
- **Correção verificada (V):** comportamento reproduzido e aprovado no navegador nesta etapa.
- **Cobertura automatizada (T):** teste de regressão efetivamente executado nesta etapa.
- **Inspeção (I):** conclusão baseada só na leitura do código ou dos relatórios.

## 1. Status geral

**APPROVED WITH LIMITATIONS.**

WFA-01, WFA-02 e WFA-03 funcionam em conjunto no Chromium. Nenhuma perda de dados, falso sucesso ou substituição parcial foi observada. Foi confirmado um achado novo de severidade P2: o sistema exporta backups que depois recusa na restauração (secção 8). A validação cobre apenas Chromium.

## 2. Baseline

Comandos executados nesta etapa, todos com saída 0:

| Gate | Resultado |
| --- | --- |
| `npm run typecheck` | aprovado |
| `npm run lint` | aprovado |
| `npm test` | **380/380** aprovados, 24 arquivos |
| `npm run build` | aprovado; aviso preexistente de chunk de 810 kB (> 500 kB) |

Sem divergência em relação aos relatórios WFA-01/02/03. Os docs mencionam um chunk > 500 kB sem valor; medido agora: 810,42 kB (236 kB gzip).

## 3. WFA-01 — Concorrência entre abas

**Resultado: V, com ressalva de interface.** Duas páginas no mesmo BrowserContext, build servido por `vite preview`, dados fictícios.

| Passo | Observado |
| --- | --- |
| Aba B abre "Novo feedback" antes de A gravar | ok |
| A cria "Indicador A" | "Indicador criado."; storage com 1 indicador |
| B salva feedback sem atualizar | **recusado**; aviso de conflito no diálogo; nenhuma mensagem de sucesso; storage manteve só o indicador |
| Indicador de A | permaneceu salvo |
| B usa "Atualizar dados" | texto digitado preservado; lista de indicadores atualizada |
| B salva de novo | "Feedback criado."; storage com indicador + feedback |
| Duas gravações simultâneas (A e B criam indicador no mesmo instante) | A gravou "Simult A"; B recebeu o conflito, sem sucesso falso; nenhum registro anterior se perdeu |
| Recuperação do perdedor (Atualizar dados e reenviar) | storage final com os dois indicadores simultâneos mais os anteriores; reload confirmou |

Erros de console: zero.

**Problemas de interface (P3):**
- Na primeira recusa o diálogo mostra o texto de conflito **duas vezes** (aviso do topo e erro do formulário).
- Depois de "Atualizar dados", o aviso some mas o erro de conflito continua no formulário até o próximo envio. Pode sugerir que o problema persiste.

**Limite da evidência:** o aviso de conflito chega pelo evento `storage`, então a jornada de navegador não isola a verificação de revisão sob o lock. Essa verificação está coberta por T (`multitab.test.ts`) e I.

## 4. WFA-02 — Validação de decisões importadas

**Resultado: V + T.**

- V: backup com decisão `validated` sem critério de sucesso foi recusado no diálogo real. Mensagem exibida (verificada pela primeira vez no navegador): "O backup contém uma decisão incompatível com as regras do Workspace. Verifique os campos obrigatórios para o status informado." Seguida de: `Decisão "…" (id, status validated): Adicione ao menos um critério de sucesso para o status Validada.`
- V: botão "Substituir workspace" desabilitado; `localStorage` idêntico byte a byte antes e depois (workspace pré-existente com um indicador).
- T: 380 testes, incluindo `wfa02-decision-validation.test.ts` (37).
- Mensagem compreensível, com título, ID, status e regra. Não orienta o que fazer a seguir (ver secção 9, P2-01).

## 5. WFA-03 — Concorrência na leitura de backups

**Resultado: V + T.** `File.prototype.text` instrumentado para liberar cada leitura manualmente; `Storage.prototype.setItem` instrumentado para contar e falhar gravações da chave do Workspace.

| Caso | Observado |
| --- | --- |
| 1. A e depois B; B termina antes de A | Botão desabilitado enquanto lia. Após B: resumo de B (2 indicadores, 4 observações, 2 feedbacks, 1 decisão). Após A terminar atrasado: nome e resumo continuam de B. Confirmar gravou B (2 indicadores) |
| 2. Válido e depois inválido; válido termina por último | Erro "O arquivo não contém JSON válido."; botão desabilitado; clique forçado não gravou nada; storage idêntico |
| 3. Duplo clique (dois `click()` síncronos no mesmo tick) | **Uma única** gravação da chave do Workspace (contada em `setItem`) |
| 4. Falha de persistência simulada | Erro exibido ("Não foi possível gravar no armazenamento local (cota ou permissão)."); nenhum sucesso; dados intactos; botão e seletor de arquivo reabilitados |
| 4b. Nova tentativa após remover a falha | Gravou; diálogo fechou; "Backup importado: 2 indicadores, 4 observações, 2 feedbacks e 1 decisões." |

O duplo clique foi comprovado pela contagem de gravações, não pelo estado visual do botão. O estado `failed` e o clique duplo, que o WFA-03 só cobria por teste unitário, agora têm V.

## 6. Jornadas realmente executadas

| Jornada | Executada | Evidência |
| --- | --- | --- |
| A — integridade entre abas | sim | V |
| B — criação pelos formulários, export, restauração em outro contexto, Markdown, backup inválido | sim | V |
| C — casos 1 a 4 | sim | V |
| D — backup legado | sim | V |

Jornada B: 2 indicadores, 4 observações (2 por indicador), 2 feedbacks vinculados e 1 decisão `validated` com os 2 indicadores e os 2 feedbacks vinculados, tudo criado pelos formulários. A primeira tentativa com 120% foi recusada pela validação (percentual 0–100), o que confirma a regra; os dados foram trocados por 80 e 90. Ajustes de script do auditor, não defeitos.

## 7. Evidências da preservação de dados

- Roundtrip: `data` do Workspace restaurado é idêntico (`JSON.stringify`) ao original, com IDs e relacionamentos. O Markdown da decisão restaurada é idêntico ao do original.
- Importação inválida (decisão incompatível, JSON truncado): `localStorage` byte a byte igual ao anterior.
- Falha de gravação simulada: dados intactos e nenhum sucesso exibido.
- Conflito entre abas: nenhum registro confirmado desapareceu (storage inspecionado após cada passo).
- Regularização de decisão legada: demais campos, IDs, vínculos e `createdAt` preservados; outras decisões intocadas.

## 8. Resultado da investigação dos backups legados (Jornada D)

Cenário: contexto isolado com Workspace estruturalmente válido, contendo uma decisão `validated` sem critérios de sucesso (com alternativa, próximo passo e vínculos a 2 indicadores e 2 feedbacks) e uma `decided` sem texto de decisão. Dados fictícios injetados só no contexto de teste.

| Passo | Observado |
| --- | --- |
| Carregar | Carrega normalmente, sem aviso. Contadores corretos |
| Visualizar | Lista e detalhe exibem tudo; critérios aparecem como "Nenhum critério registrado." |
| Exportar | Arquivo gerado com as duas decisões; mensagem "Backup JSON exportado."; **sem aviso** |
| Restaurar em outro contexto | **Recusado** por inteiro; botão desabilitado; storage anterior intacto |
| Mensagem | Lista cada decisão com título, ID, status e regra violada |
| Corrigir pelo formulário | Formulário abre pré-preenchido com todos os dados. Salvar sem alterar é recusado com erro específico |
| Regularizar | Com um critério de sucesso (decisão 1) e um texto de decisão (decisão 2), salvou. Demais campos, ID, vínculos e `createdAt` idênticos; `updatedAt` mudou |
| Restaurável depois? | Exportar após corrigir só a decisão 1 ainda foi recusado pela decisão 2. Corrigidas as duas, a restauração funcionou (2 decisões, 4 observações) |

**Perguntas obrigatórias**

| Pergunta | Resposta |
| --- | --- |
| Exporta um backup que não consegue restaurar? | **Sim** (V) |
| Há aviso antes da exportação? | **Não** (V) |
| A importação explica o problema? | **Parcialmente.** Aponta decisão, ID, status e regra. Não diz que o arquivo veio de um Workspace com dados legados nem que a correção deve ser feita no navegador de origem (V) |
| A decisão pode ser corrigida pelo formulário? | **Sim.** Exige que o usuário forneça a informação faltante; não há como regularizar sem digitar conteúdo novo (V) |
| A regularização preserva as informações anteriores? | **Sim** (V) |
| Depois dela, o backup é restaurável? | **Sim**, quando todas as decisões incompatíveis forem corrigidas (V) |
| Risco de perda permanente? | **Condicional.** Os dados continuam no LocalStorage e a correção é possível enquanto o navegador original existir. Se o usuário perder esse navegador e só tiver o arquivo, o app recusa a restauração e não oferece alternativa. O JSON permanece legível, mas editá-lo à mão está fora do fluxo suportado |

**Classificação: P2 — não bloqueia a publicação, mas deve ser corrigido antes de uma publicação confiável.**

Justificativa: o fluxo normal produz backups restauráveis (Jornada B, V). Dados incompatíveis só surgem de importações anteriores ao WFA-02 ou de edição externa; o formulário nunca os cria (T, I). A população afetada é pequena, e há recuperação viável na origem. Não é P1 porque falta o requisito de "fluxo normal de backup" sem recuperação: a recuperação existe. Seria P1 se a aplicação já estivesse publicada com dados legados em uso.

## 9. Problemas encontrados e severidade

| ID | Severidade | Descrição | Bloqueia publicação |
| --- | --- | --- | --- |
| P2-01 | **P2** | Backups legados podem ser exportados sem aviso e recusados na restauração. Mensagem de importação não orienta a correção | Não, mas recomendado corrigir antes de publicar |
| P3-01 | P3 | Mensagem de conflito duplicada no diálogo na primeira recusa | Não |
| P3-02 | P3 | Erro de conflito persiste no formulário depois de "Atualizar dados" | Não |
| P3-03 | P3 | Chunk principal de 810 kB (preexistente) | Não |

Nenhum P0 ou P1.

## 10. Testes aprovados

380/380 em 24 arquivos (cobertura automatizada, T). Nenhum teste foi alterado ou adicionado. Remoção da guarda `mine !== seq`, citada no WFA-03, não foi reexecutada nesta etapa (I).

## 11. Typecheck, lint e build

Todos aprovados nesta etapa, saída 0 (secção 2).

## 12. Verificação por tipo de evidência

| Item | V | T | I |
| --- | --- | --- | --- |
| Gravação desatualizada entre abas recusada | sim | sim | sim |
| Gravações simultâneas, recuperação | sim | sim (lock falso FIFO) | |
| Exclusão mútua real do lock | indireta (simultâneo) | não | sim |
| Sem Web Locks recusa gravar | não repetido | sim | sim |
| Decisão incompatível recusada na importação | sim | sim | |
| Leituras fora de ordem | sim | sim | |
| Clique duplo, falha de gravação | sim | sim | |
| Backups legados | sim | parcial | |

## 13. Limitações não verificadas

Pendências separadas, para uma etapa curta de compatibilidade:
- Firefox.
- Safari/WebKit.
- Ausência de Web Locks (verificada pelo WFA-01 e por teste, não repetida aqui).
- Contextos inseguros (HTTP fora de localhost).
- Compatibilidade dos controles assíncronos em outros navegadores.

Também não verificados: arquivo de backup grande (próximo de 5 MB), escrita externa fora do app, limites de tamanho de campo na importação (limitação já registrada no WFA-02), e o efeito de mais de duas abas. Não se afirma compatibilidade universal.

## 14. Bloqueios para publicação

Nenhum bloqueio funcional de integridade nos testes feitos em Chromium. Antes de publicar falta tratar P2-01 e fechar a pendência de compatibilidade entre navegadores.

## 15. Recomendação para a próxima etapa

Uma correção pontual de P2-01 (aviso na exportação quando houver decisão incompatível e orientação na mensagem de importação), sem mudar a regra de validação. Depois, a etapa curta de compatibilidade (Firefox, WebKit, sem Web Locks).

## Recomendação obrigatória

**O Product Decision Lab está funcionalmente seguro para avançar ao refinamento visual?**

**B — Correção pontual antes da 4B.**

Os três defeitos originais estão corrigidos e verificados em conjunto no Chromium, sem perda de dados. Resta um defeito relevante de escopo delimitado (P2-01), com recuperação viável. Não há risco grave de perda, corrupção ou irrecuperabilidade que justifique a recomendação C, e o defeito não é um bloqueio da 4B por si só. Quem decidir iniciar a 4B antes da correção deve registrar P2-01 como risco aceito. A publicação continua condicionada a P2-01 e à compatibilidade entre navegadores.

## Artefatos temporários

Scripts e arquivos de teste ficaram apenas na pasta temporária da sessão, fora do projeto. Nenhum arquivo do projeto foi criado além deste relatório; `dist/` foi regenerado pelo `npm run build`.
