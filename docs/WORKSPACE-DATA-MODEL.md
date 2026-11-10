# Workspace Data Model — Product Decision Lab

Documento curto das entidades, relações, políticas de exclusão e decisões técnicas da Etapa 2.

## 1. Entidades

| Entidade | Campos principais | Observações |
|---|---|---|
| `ProductMetric` | `id`, `name`, `description`, `unit`, `desiredDirection`, `createdAt`, `simulated?` | Unidade: `percent`, `count`, `currency`, `hours`, `score`. Direção: `increase` ou `decrease`. |
| `MetricObservation` | `id`, `metricId`, `period`, `value`, `createdAt`, `simulated?` | `period` usa `AAAA-MM`. Um valor por indicador e período. |
| `UserFeedback` | `id`, `content`, `category`, `source`, `receivedAt`, `metricIds`, `simulated?` | `receivedAt` é ISO 8601; a interface exibe em `DD/MM/AAAA`. |
| `DecisionRecord` | `id`, `title`, `problem`, `hypothesis`, `metricIds`, `feedbackIds`, `alternatives`, `decision`, `successCriteria`, `nextSteps`, `status`, `createdAt`, `updatedAt`, `simulated?` | Evidências são referências por ID; os dados completos são resolvidos na leitura. |

O workspace é `{ metrics, observations, feedbacks, decisions }`. O dataset demonstrativo fica em
`src/data/demo/` e nunca é gravado nessa estrutura.

## 2. Relacionamentos

```text
ProductMetric 1 ── N MetricObservation
ProductMetric 1 ── N UserFeedback.metricIds
ProductMetric 1 ── N DecisionRecord.metricIds

UserFeedback 1 ── N DecisionRecord.feedbackIds
```

Regras verificadas nas operações e na importação:

- toda observação, feedback ou decisão referencia apenas IDs existentes;
- não há IDs duplicados dentro da mesma coleção;
- não há IDs repetidos dentro do mesmo `metricIds`/`feedbackIds`;
- não há duas observações para o mesmo indicador e período;
- percentuais ficam entre 0 e 100; contagens e horas não podem ser negativas; moeda aceita
  valores negativos; pontuação aceita qualquer valor finito dentro do limite de magnitude;
- valores não finitos, períodos inválidos e datas inválidas são rejeitados.

## 3. Política de exclusão

| Operação | Dependências | Comportamento |
|---|---|---|
| Excluir indicador | Decisões ou feedbacks que o referenciam | **Bloqueado** com a lista de dependências. O usuário remove os vínculos pela edição do feedback ou da decisão. |
| Excluir indicador | Apenas observações próprias | Permitido após confirmação explícita que informa quantas observações serão removidas em cascata. |
| Excluir feedback | Decisões que o usam como evidência | **Bloqueado** com a lista de decisões. |
| Excluir decisão | Nenhuma | Permitido após confirmação. As evidências permanecem no workspace. |
| Excluir observação | Nenhuma | Permitido com confirmação na interface. |

Nenhuma exclusão em cascata atinge decisões. A interface sempre mostra o efeito antes de
confirmar.

## 4. Status do Decision Record

O status é uma classificação registrada pelo usuário, não uma validação automática.

| Status | Campos mínimos |
|---|---|
| `draft` | título e problema |
| `investigating` | título, problema e hipótese |
| `decided` | título, problema, hipótese e decisão |
| `validated` | título, problema, hipótese, decisão e ao menos um critério de sucesso |
| `abandoned` | título e problema |

O sistema não marca uma decisão como validada por preenchimento de campos nem afirma que uma
hipótese foi comprovada.

## 5. Persistência, versão e migrações

- Chave: `product-decision-lab:workspace`.
- Envelope: `{ schemaVersion, savedAt, data }`.
- `SCHEMA_VERSION = 1` permanece. Os modelos não mudaram de formato nesta etapa; apenas a
  validação foi flexibilizada para aceitar descrição vazia em indicadores e hipótese/decisão
  vazias em rascunhos. Dados da Etapa 1 continuam válidos.
- A aplicação aplica migrações do mapa `lib/storage/schema.ts` quando a versão salva é menor.
  Não há migração pendente na versão 1.
- Versão futura, JSON corrompido, estrutura inválida ou inconsistência referencial resultam em
  workspace vazio com aviso. O conteúdo original **não** é apagado; pode ser exportado como texto
  bruto ou descartado explicitamente.
- Gravação é transacional e rejeita workspace inconsistente: o estado em memória só muda depois de
  `saveWorkspace` retornar sucesso. Falha de cota/permissão mantém o estado anterior e os valores
  do formulário.

## 6. Backup e importação

- Formato de exportação: `{ schemaVersion, exportedAt, data }`, UTF-8.
- Limite de 5 MB, medido em bytes antes do parse.
- A importação aceita `exportedAt` ou, por compatibilidade, `savedAt` como data do backup.
- Valida versão, migra se necessário, valida estrutura, IDs únicos, períodos únicos, referências
  existentes, valores por unidade e referências duplicadas.
- Registros com `simulated: true` são recusados. A marca é informação de origem, não mecanismo de
  segurança; a política é manter o dataset demonstrativo fora do workspace do usuário.
- A substituição é explícita e só ocorre após confirmação. Não há mesclagem. Se o save falhar, o
  workspace anterior permanece.
- A interface oferece exportar os dados atuais antes de importar.

## 7. Cálculos de métricas

Funções puras em `src/lib/analytics.ts`:

- observações são ordenadas por período e, em empate, por criação;
- a mais recente e a anterior vêm dessa ordenação;
- variação absoluta = `atual - anterior`;
- variação relativa = `(atual - anterior) / |anterior| × 100`; quando `anterior = 0`, o valor é
  `null` e a interface mostra “Variação relativa indisponível”;
- para unidade `percent`, a variação absoluta é exibida em **pontos percentuais** (`p.p.`),
  separada da variação relativa em `%`;
- a interpretação usa `desiredDirection`: subir é favorável para `increase`, cair é favorável para
  `decrease`;
- variação igual a zero é neutra (“Sem variação”), sem favorabilidade;
- com menos de duas observações não há tendência.

A aplicação não infere causalidade a partir de variações.

## 8. Decisões técnicas

- **Estado**: um único `WorkspaceProvider` com o workspace carregado uma vez, operações de
  domínio puras e `commit` transacional. Não há store paralelo nem duplicação por página.
- **Operações**: `src/lib/domain/operations.ts` centraliza validação, dependências e alterações de
  estado. Componentes não recalculam regras de integridade.
- **IDs**: `crypto.randomUUID()` com prefixo por entidade, fallback apenas se indisponível.
- **Datas**: períodos mensais permanecem `AAAA-MM`; datas de formulário são convertidas para ISO
  ao meio-dia UTC para evitar deslocamento de dia; a exibição usa o calendário local em `pt-BR`.
- **Números**: parser aceita `4,5`, `4.5`, `1.234,56` e `1.234.567` sem confundir decimal com
  milhar. O armazenamento sempre recebe `number`.
- **Busca**: normalização NFD remove acentos e diferenças de caixa; filtros são aplicados em
  memória e combinados.
- **Gráficos**: Recharts é carregado por `React.lazy`, mantendo o chunk inicial sem a biblioteca.
- **Segurança**: nenhum HTML importado é renderizado; feedbacks usam texto do React; backups não
  executam conteúdo; não há chamadas externas.

## 9. Limitações conhecidas

- Sem versionamento histórico imutável: editar uma evidência atualiza o conteúdo resolvido nas
  decisões, mantendo o vínculo por ID. Datas de criação/atualização são preservadas, mas não há
  auditoria temporal completa.
- Sem mesclagem de backups; importar substitui o workspace.
- Sem multiusuário, autenticação ou sincronização.
- LocalStorage é limitado ao navegador e sujeito a cota, modo privado e limpeza manual.
- A validação de importação é estrutural e referencial; não há verificação estatística dos dados.
