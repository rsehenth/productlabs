# Product Decision Lab — Etapa 4A.1

## 1. Resumo executivo

**Status: BLOCKED para publicação e uso confiável com dados reais.**

Auditoria executada em 06/11/2026, fuso America/Sao_Paulo, no workspace local. A jornada principal em uma aba e a restauração de backup válido funcionaram. Foram confirmados três defeitos: perda silenciosa de gravações entre abas (P1), importação de decisões incompatíveis com as regras do formulário (P2) e corrida entre leituras de arquivos de backup (P2).

O bloqueio decorre principalmente de **WFA-01: uma operação comum pode apagar registros já confirmados como salvos**. A ausência deliberada de colaboração ou sincronização entre dispositivos não justifica sobrescrita silenciosa entre duas abas do mesmo navegador.

Nenhuma correção, funcionalidade, refatoração ou alteração de código de produção foi realizada. Nenhum teste foi criado ou modificado. As alterações autorizadas são este relatório e, por solicitação adicional do usuário, `.gitignore` e os artefatos de `graphify-out/`. Não houve instalação de dependências, commit, push ou deploy.

## 2. Baseline e ambiente

| Comando executado antes das verificações funcionais | Resultado |
| --- | --- |
| `npm run typecheck` | Aprovado, saída 0 |
| `npm run lint` | Aprovado, saída 0 |
| `npm test` | **322/322 testes aprovados, 21 arquivos**, saída 0 |
| `npm run build` | Aprovado, saída 0 |

O build Vite 8.3.6 emitiu aviso de chunk acima de 500 kB: `index-DvEhJXdR.js`, 806,57 kB, gzip 234,66 kB. Não foi medido desempenho, nem alterado o bundle. Esse aviso, isoladamente, não foi classificado como defeito funcional.

- Windows; projeto React 19, TypeScript, LocalStorage; dependências existentes.
- Navegador Chromium disponibilizado pelo Playwright. Contextos criados com `browser.newContext()`, sem perfil persistente e sem leitura de dados pessoais.
- Jornada principal: `http://127.0.0.1:5173/`, servidor Vite local.
- Verificações adicionais no build: `http://127.0.0.1:4173/`, `npm run preview`.
- WFA-01 reproduzido duas vezes no desenvolvimento e novamente no build. WFA-03 e o ensaio de HTML importado foram executados no build.
- Context7 consultado para isolamento de BrowserContext e LocalStorage. Referência: [documentação oficial do Playwright](https://github.com/microsoft/playwright/blob/main/docs/src/browser-contexts.md).
- A pasta não contém repositório Git inicializado: `git status --short` retornou `fatal: not a git repository`. Não é possível afirmar um diff contra um commit. Foram capturados hashes SHA-256 dos arquivos preexistentes de `src/`, `docs/` e da raiz antes da auditoria, para comparação ao final.
- Comparação dos hashes após a auditoria: os **102 arquivos preexistentes de `src/`**, incluindo testes, permaneceram idênticos. Entre os arquivos preexistentes capturados, apenas `.gitignore` mudou; o relatório e os artefatos do grafo são novos.

Os trechos de JavaScript executados pelo Playwright foram verificações pontuais da auditoria, sem arquivos de teste ou infraestrutura nova no projeto. Falhas de seleção de locators durante a exploração foram resolvidas consultando a interface; não foram contabilizadas como defeitos do produto.

## 3. Funcionalidades auditadas

Legenda: **N** = execução no navegador; **T** = teste existente executado no baseline; **I** = inspeção de código. Uma evidência I ou T não equivale, por si só, a uma jornada completa no navegador.

| Área | Verificação e resultado | Evidência |
| --- | --- | --- |
| Analytics | Criar dois indicadores, editar nome preservando ID e remover um terceiro indicador temporário | N; `operations.ts`: `createMetric`, `updateMetric`, `deleteMetric`; T `operations.test.ts` |
| Observações | Criar fora de ordem, editar, excluir com confirmação e recarregar; gráfico e resumo acompanharam alterações | N; `analytics.ts:23`, `metric-detail-dialog.tsx`, `metric-chart.tsx` |
| Cálculos | 4,5% para 3,8%: **−0,7 p.p.**; relativo −15,555…%, exibido **−15,6%** | N + T `analytics.test.ts:64`; `computeVariation`, `domain-labels.ts` |
| Direção desejada | 10 h para 8 h, direção diminuir: favorável, −2 h e −20% | N + T `analytics.test.ts`, `metric-card.tsx` |
| Histórico insuficiente | Sem observação: sem comparação; com uma: não calcula tendência | N para estado vazio; T `analytics.test.ts`, caso de uma observação |
| Validação numérica | 101%, −1%, texto `banana` e período duplicado recusados sem gravação | N; `observation-form.tsx`, `metricValueError`, `operations.test.ts` |
| Zero e negativos | Moeda −10, 0 e 5 aceita; comparação 0 para 5 informa variação relativa indisponível | N; T `number.test.ts`, `analytics.test.ts` |
| Outros limites | NaN/Infinity, contagens/horas negativas e magnitude excessiva recusados; pontuação decimal aceita | T `number.test.ts:42`, `operations.test.ts:216`; não repetidos todos no navegador |
| Feedbacks | Criar três, editar um preservando ID e contagem, recarregar, excluir registro sem dependência | N + T `operations.test.ts:333` |
| Pesquisa e filtros | Busca `CONVERSAO` encontrou conteúdo com acento; categoria, fonte e indicador combinaram corretamente | N + T `feedback-query.test.ts` |
| Filtros e dados | JSON completo do LocalStorage permaneceu idêntico durante busca e filtros | N; `filterFeedbacks`, `feedbacks-page.tsx` |
| Relações de feedback | Um feedback associado aos dois indicadores; nenhum vínculo duplicado criado pela interface | N + T `operations.test.ts:370` |
| Decisões | Rascunho mínimo; edição para investigação e decidida; hipótese, alternativas, decisão, critérios e próximos passos persistiram | N + T `operations.test.ts:420` |
| Regras de status | Formulário recusou investigação sem hipótese e validada incompleta; importação não aplica as mesmas regras | N; **WFA-02** |
| Rastreabilidade | Métrica mostra decisão; feedbacks mostram decisão; decisão resolve os dois indicadores e três relatos | N; `metric-detail-dialog.tsx`, `feedbacks-page.tsx:241`, `decision-detail.tsx:36` |
| Dependências | Métrica vinculada sem ação de exclusão e com lista de dependências; feedback vinculado com diálogo bloqueado | N + T `operations.test.ts:176`, `:186`, `:406` |
| Exclusão segura | Excluir decisão preservou 2 métricas e 3 feedbacks; excluir métrica temporária removeu apenas suas 3 observações, após confirmação | N + T `operations.test.ts`; detalhes abaixo |
| Markdown | Download real com todas as seções, dados atualizados, status e datas; nenhum dado demonstrativo | N + T `markdown.test.ts`; `buildDecisionMarkdown` |
| Persistência | Recarregamento preservou registros; quota e indisponibilidade apresentaram erros sem confirmar salvamento | N + T `workspace-storage.test.ts`; exceção **WFA-01** |
| Recuperação | JSON local corrompido e versão 99 preservados; operações bloqueadas e exportação bruta idêntica ao original | N + T `raw-storage.test.ts`, `stored-integrity.test.ts` |
| Backup | Exportação versionada, importação confirmada em outro contexto, igualdade integral dos dados e do Markdown restaurado | N + T `backup.test.ts`; ressalvas **WFA-02/WFA-03** |
| Importação inválida | JSON inválido, versão futura, ID/relação/período duplicado e referência órfã recusados sem substituir os dados | N + T `backup.test.ts` |
| Limite e origem | Limite de 5 MB e recusa de `simulated: true` cobertos pela suíte existente | T `backup.test.ts`; limite exato não exercitado pela interface |

Arquivos citados sem diretório nessa tabela estão sob `src/lib/` ou `src/lib/domain/`, conforme o módulo. Os achados abaixo fornecem caminhos completos relativos ao projeto e linhas verificadas.

## 4. Jornadas efetivamente executadas

### J1 — Workspace e rastreabilidade

1. Abrir contexto vazio, confirmando ausência da chave do workspace.
2. Criar `Conversão auditoria` (percentual, aumentar). Inserir outubro/2026 = 3,8 e depois setembro/2026 = 4,5.
3. Conferir histórico ordenado setembro/outubro, último valor 3,8%, −0,7 p.p., −15,6% e interpretação desfavorável.
4. Criar `Tempo de atendimento auditoria` (horas, diminuir), setembro = 10 e outubro = 8; conferir interpretação favorável.
5. Criar três feedbacks: dúvida nos planos (usabilidade/entrevista), demora de suporte (desempenho/ticket) e preços (preço/survey). Associar o primeiro aos dois indicadores e os demais à conversão.
6. Exercitar pesquisa e filtros, incluindo combinação sem resultados. Comparar armazenamento antes/depois: idêntico.
7. Criar `Recuperar conversão auditoria` como rascunho, associado aos dois indicadores e três feedbacks.
8. Tentar investigação sem hipótese; formulário recusou. Preencher hipótese e salvar. Editar para decidida, com alternativa, decisão, critério e próximo passo.
9. Recarregar e conferir campos e IDs. Abrir métrica a partir da decisão; conferir backlink para a decisão. Conferir os três backlinks nas fichas de feedback.
10. Renomear indicador para `Conversão revisada auditoria` e acrescentar `— revisado` ao primeiro feedback. A decisão passou a resolver os textos atualizados sem duplicar registros.
11. Conferir bloqueio de exclusão de métrica vinculada e de feedback utilizado pela decisão.
12. Baixar Markdown real. Incluiu os nomes e textos revisados, último valor de cada indicador, três relatos, hipótese, alternativa, decisão, critério, próximo passo, status Decidida e datas.

### J2 — Backup funcional obrigatório

Download: `product-decision-lab-backup-2026-11-06.json`. Envelope observado: `schemaVersion: 1`, `exportedAt: 2026-11-06T15:35:49.695Z`, `data` com as quatro coleções.

| Verificação | Resultado observado |
| --- | --- |
| Antes de confirmar importação em outro contexto | LocalStorage ainda sem workspace |
| Registros recuperados | 2 métricas, 4 observações, 3 feedbacks, 1 decisão |
| Comparação de `data` exportado e restaurado após reload | Igualdade integral por `JSON.stringify`, incluindo IDs, referências, valores e datas |
| Relações da decisão restaurada | 2 métricas e 3 feedbacks válidos |
| Markdown baixado após restauração | Conteúdo exatamente igual ao Markdown anterior |

O arquivo `recuperar-conversao-auditoria.md` tinha todas as seções obrigatórias. Os dados foram criados pela auditoria, sem importar dataset fictício da aplicação.

### J3 — Recusa e preservação

No contexto restaurado, selecionar separadamente arquivos com: referência `missing`, métrica com ID repetido, feedback repetido na decisão, observação repetida por métrica/período, `schemaVersion: 99` e texto `{invalid`.

Todos apresentaram mensagem específica e mantiveram `Substituir workspace` desabilitado. O envelope existente permaneceu exatamente igual em cada tentativa. Não houve substituição parcial.

Em outro contexto, injetar `QuotaExceededError` em `Storage.prototype.setItem` após carregar dados válidos. Tentar importar um backup válido vazio: erro `Não foi possível gravar no armazenamento local (cota ou permissão).`; envelope anterior idêntico e indicador antigo ainda visível depois de cancelar.

### J4 — Falhas locais, edição e exclusões

- Simular quota na criação de métrica: formulário permaneceu preenchido, erro visível e envelope anterior intacto.
- Simular getter de LocalStorage lançando `SecurityError`: aviso de indisponibilidade; criação recusada com mensagem clara; nome digitado preservado.
- Iniciar com `{invalid-json` e, separadamente, envelope versão 99: criação bloqueada; bytes/texto bruto preservados e download bruto idêntico. Abrir confirmação de descarte e cancelar: nada apagado.
- Tentar 101%, −1%, `banana` e outubro duplicado: recusados; armazenamento inalterado.
- Editar outubro de 3,8 para 4 e depois restaurar 3,8: legenda do gráfico mudou para 4% e retornou a 3,8%.
- Criar e excluir observação temporária de novembro: confirmação presente; contagem 5 para 4.
- Criar indicador temporário de moeda com −10, 0 e 5: valores aceitos; base zero sem divisão inválida. Excluir indicador: aviso de 3 observações; coleções passaram de 3 métricas/7 observações para 2/4.
- Em contexto de restauração descartável, excluir decisão após confirmação: 1 para 0 decisões, preservando 2 métricas e 3 feedbacks. Excluir feedback então liberado após confirmação: 3 para 2 feedbacks.

## 5. Achados

| ID | Severidade | Módulo | Bloqueia publicação |
| --- | --- | --- | --- |
| WFA-01 | **P1 — Alto** | Persistência / todos os módulos | **Sim: perda de dados em operação comum** |
| WFA-02 | **P2 — Médio** | Backup / Decision Workspace | Corrigir antes da publicação confiável |
| WFA-03 | **P2 — Médio** | Importação de backup | Corrigir antes da publicação confiável |

Não foi confirmada vulnerabilidade crítica nem corrupção estrutural grave para atribuir P0. WFA-01 foi classificado P1 pela perda reproduzida de uma gravação e potencial de sobrescrita mais ampla, sem afirmar que essa extensão foi reproduzida.

### WFA-01 — Uma aba sobrescreve silenciosamente gravações de outra

**Descrição:** duas abas da mesma origem carregam snapshots independentes. A gravação da aba desatualizada substitui todo o envelope e apaga registros salvos pela outra. Ambas exibem sucesso.

**Evidência:** `src/hooks/workspace-provider.tsx:18` carrega o workspace na inicialização; `:23` mantém `workspaceRef` local; `:53` executa a operação nesse snapshot; `:31` faz commit sem comparação de revisão. `src/lib/storage/workspace-storage.ts:171` monta o envelope completo e `:178` o substitui com `setItem`. Não existe listener de `storage` nem verificação de conflito nesses arquivos. O save retorna sucesso: a hipótese de falha de quota não explica a reprodução.

**Reprodução mínima, sem dados reais:**

1. Em contexto novo, abrir duas abas da **mesma origem e perfil de teste**, ambas antes de cadastrar qualquer métrica.
2. Na aba A, criar `Registro aba A`; aguardar `Indicador criado.`.
3. Sem recarregar B, criar `Registro aba B`; aguardar a mesma confirmação.
4. Inspecionar `JSON.parse(localStorage.getItem('product-decision-lab:workspace')).data.metrics` e recarregar A.

Resultado nas duas execuções em 5173 e na execução em 4173:

```json
{"saved":["Registro aba B"],"firstRecordLost":true}
```

**Impacto:** perda silenciosa de alterações confirmadas; a validação estrutural não detecta perda de registros inteiros. Não é apenas falta de atualização visual.

**Correção recomendada para 4A.2:** detectar revisão divergente e recusar a gravação desatualizada antes da substituição; oferecer recarga/recuperação preservando o formulário. A estratégia deve também tratar competição de gravações, e não depender apenas de listener de `storage`. Não requer colaboração ou backend. Acrescentar regressão de duas abas na etapa de correção.

### WFA-02 — Importação ignora os campos mínimos do status da decisão

**Descrição:** um backup com `status: "validated"`, `hypothesis: ""`, `decision: ""` e `successCriteria: []` é aceito e exibido como Validada. Editar e salvar sem mudanças é recusado pelo formulário.

**Evidência:** `src/lib/storage/validation.ts:195` (`checkDecision`) aceita textos vazios para hipótese/decisão e uma lista vazia de critérios, validando apenas o enum de status. `src/lib/backup.ts:87` e `:106` aplicam estrutura e integridade referencial; `src/lib/workspace-integrity.ts:70` verifica vínculos, não campos mínimos de status. Em contraste, `src/lib/domain/operations.ts:606` até `:618` exige hipótese, decisão e critério conforme o status. O contrato está em `docs/WORKSPACE-DATA-MODEL.md`, seção 4; os testes de operações também exigem esses campos.

**Reprodução:** exportar backup válido; alterar somente os quatro campos acima na primeira decisão; importar e confirmar em contexto isolado. O resumo habilita substituição e o detalhe apresenta `Validada`, `Não registrada.` para hipótese e decisão e `Nenhum critério registrado.`. Abrir Editar e salvar: aparecem os erros de obrigatoriedade.

**Impacto:** arquivo externo introduz um estado que a criação/edição normal não permite. Contagens, filtros e exportação podem apresentar classificação sem os requisitos documentados. Não se trata de comprovação automática de hipótese: o status continua manual, mas deve respeitar seus campos mínimos.

**Correção recomendada para 4A.2:** aplicar as mesmas invariantes de status na validação de importação/persistência, mantendo rascunhos válidos e compatibilidade documentada. Recusar o arquivo inteiro com mensagem clara, sem substituição parcial.

### WFA-03 — Leitura antiga substitui o backup selecionado mais recentemente

**Descrição:** o seletor permite trocar o arquivo durante uma leitura pendente. Se a leitura anterior termina por último, seu resultado substitui `parsed`, mas o nome exibido continua sendo o do último arquivo escolhido. A confirmação importa o conteúdo anterior.

**Evidência:** `src/features/overview/import-backup-dialog.tsx:31` (`handleFile`), `:34` atualiza nome, `:46` aguarda `file.text()`, `:48` aplica resultado sem conferir se ainda pertence à seleção atual, `:56` encerra `reading` independentemente de outra leitura. `:60` (`handleConfirm`) importa o `parsed` vigente.

**Reprodução controlada no build, com atraso injetado somente no contexto de teste:**

1. Preparar `slow.json` válido com 2 métricas, 4 observações, 3 feedbacks e 1 decisão; `fast.json` válido com coleções vazias.
2. Antes de abrir o seletor, executar no console do contexto isolado:

```js
const originalText = File.prototype.text;
File.prototype.text = function () {
  if (this.name !== 'slow.json') return originalText.call(this);
  const file = this;
  return new Promise(resolve => {
    window.releaseSlowAudit = async () => resolve(await originalText.call(file));
  });
};
```

3. Selecionar `slow.json` e depois `fast.json`, sem liberar a primeira leitura. O diálogo mostra `Arquivo selecionado: fast.json` e resumo 0/0/0/0.
4. Executar `await window.releaseSlowAudit()`. O nome permanece `fast.json`, mas o resumo muda para 2/4/3/1.
5. Confirmar substituição: o workspace recebe 2/4/3/1, do arquivo anterior.

**Impacto:** a substituição confirmada pode usar outro arquivo que não o identificado no diálogo. Requer término de leituras fora de ordem; a auditoria demonstrou isso com atraso controlado, sem alegar frequência em uso normal. O resumo oferece uma oportunidade de detectar a divergência, justificando P2.

**Correção recomendada para 4A.2:** impedir troca durante leitura ou associar resultado/erro/finalização à seleção atual, descartando conclusões antigas. A confirmação deve usar o mesmo arquivo identificado e resumido na interface.

## 6. Segurança, privacidade e riscos conhecidos

### Inspeção e ensaio de conteúdo externo

Fronteiras relevantes: formulário, arquivo JSON importado e conteúdo recuperado do LocalStorage. Ativos: dados do workspace e fidelidade de seus relacionamentos/exports. A auditoria examinou alteração indevida de estado, conteúdo executável, envio externo e perda por substituição.

No build, importar texto `<img src=x onerror="window.__auditXss=1"><script>window.__auditXss=2</script>` em nome de métrica, feedback, título e problema de decisão. Navegar por Feedbacks, detalhe da decisão e detalhe da métrica:

- texto literal presente nas três superfícies;
- zero elementos `img[src=x]` ou scripts inline provenientes do payload;
- marcador `window.__auditXss` não definido;
- zero `pageerror` e zero mensagens de console nessa jornada monitorada.

A busca em `src/` não encontrou `dangerouslySetInnerHTML`, `innerHTML`, `eval`, `fetch`, `XMLHttpRequest`, `sendBeacon`, `WebSocket`, `console.*` ou endpoints HTTP. O JSON passa por parse, validação e integridade antes da confirmação; WFA-02 é uma lacuna de regra de domínio, não execução de HTML. Texto é interpolado pelo React nas superfícies examinadas. Não foi executado scanner externo.

### Limitação da observação de rede

Foram observadas requisições GET/POST para **`gc.kis.v2.scr.kaspersky-labs.com`**, incluindo `main.js`, inicialização e eventos de formulário/hash. Não há referência a esse domínio no código de `src/` nem em `dist/index.html`; o padrão é compatível com instrumentação do Kaspersky no ambiente, não com uma integração declarada do produto. Isso é uma inferência de origem, não uma auditoria do antivírus.

Consequentemente, **não se afirma que nenhuma informação sai do dispositivo neste ambiente instrumentado**. Não foi constatada transmissão de conteúdo do workspace por código da aplicação; também não foi comprovada a ausência de leitura por software externo. A arquitetura inspecionada não contém integração externa. A verificação de privacidade de publicação deve ser repetida em navegador/ambiente sem essa instrumentação. URLs com identificadores e parâmetros do agente local não são reproduzidas aqui.

### Limitações deliberadas e cobertura

- LocalStorage por origem, cota do navegador e limpeza manual; backup JSON é a recuperação disponível.
- Sem backend, autenticação, criptografia, colaboração, sincronização entre dispositivos ou IA. Não classificados como bugs.
- Evidências resolvidas pelo estado atual, sem histórico imutável. Editar nome/relato atualiza a decisão; comportamento documentado.
- Importação substitui dados, sem mesclagem, e exige ação explícita após resumo. WFA-03 compromete a associação arquivo/resumo em leituras concorrentes.
- Conteúdo de Markdown é texto exportado com os campos do usuário; a segurança de renderizadores externos não foi auditada.
- Não foram testados Safari, Firefox, dispositivos físicos, capacidade real de quota até o limite, quedas do sistema operacional ou carga de longa duração. Quota/permissão foram simuladas por exceções em contextos isolados.
- A suíte completa inclui Interactive Case; ela foi executada como baseline. Não houve repetição da auditoria funcional integral dessa experiência.
- Não foram auditados CVEs de dependências, infraestrutura de hospedagem, headers de produção ou requisitos jurídicos de privacidade. Esta etapa não é uma revisão de segurança de release completa.

## 7. Preparação para publicação

**Não recomendar publicação neste estado.** WFA-01 satisfaz a condição de bloqueio por perda de dados em operação normal. O roundtrip de backup válido passou, mas não elimina o risco de perda antes da exportação nem as lacunas WFA-02/WFA-03.

A suíte existente não cobre a concorrência entre abas, a leitura de arquivos fora de ordem ou a paridade completa das regras de status na importação. Os 322 testes aprovados não invalidam os defeitos reproduzidos pelo navegador.

## 8. Recomendação

Executar correções pontuais na **Etapa 4A.2**, priorizando WFA-01 e depois WFA-02/WFA-03. Manter a publicação suspensa até verificar ausência de perda entre abas e reexecutar os cenários de importação afetados. Repetir a observação de rede em ambiente sem instrumentação externa antes de sustentar a promessa de privacidade.

O refinamento visual não resolve os bloqueios e não deve ser tratado como aceite funcional. Nenhuma correção foi aplicada nesta auditoria.
