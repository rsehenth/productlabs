/**
 * Traduções para inglês. As chaves são o texto-fonte em português, então qualquer
 * string ainda não traduzida continua aparecendo em português em vez de vazio.
 */
const shared: Record<string, string> = {
  'Carregando página…': 'Loading page…',
  'Carregando gráfico…': 'Loading chart…',
  'Carregando prévia…': 'Loading preview…',
  'Abrir navegação': 'Open navigation',
  'Fechar navegação': 'Close navigation',
  'Como funciona': 'How it works',
  'Alternar idioma': 'Switch language',
  'Idioma da interface': 'Interface language',
  'Navegação principal': 'Main navigation',
  'Alterne entre as áreas do Product Decision Lab.':
    'Switch between the areas of Product Decision Lab.',
  'Product Decision Lab — ir para o Overview': 'Product Decision Lab — go to Overview',
  'Evidência → decisão': 'Evidence → decision',
  'Métricas': 'Metrics',
  'Decisões': 'Decisions',
  'Workspace local: os registros ficam só neste navegador.':
    'Local workspace: records stay in this browser only.',
  'Salvo neste navegador': 'Saved in this browser',
  'Salvo às {time}': 'Saved at {time}',
  'Armazenamento local': 'Local storage',
  'Dados desatualizados': 'Outdated data',
  'Workspace vazio': 'Empty workspace',
  'Sem armazenamento': 'No storage',
  'Dados bloqueados': 'Blocked data',
  'Product Decision Lab · workspace local, sem backend ou integrações externas':
    'Product Decision Lab · local workspace, no backend or external integrations',
  'Abrir Feedbacks': 'Open Feedbacks',
  'Abrir Decisions': 'Open Decisions',
  'Fechar': 'Close',
  'Cancelar': 'Cancel',
  'Salvar alterações': 'Save changes',
  'Salvando…': 'Saving…',
  'Excluindo…': 'Deleting…',
  'Importando…': 'Importing…',
  'Obrigatório': 'Required',
  'Dispensar aviso': 'Dismiss notice',
  'Atualizar dados': 'Refresh data',
  'Workspace desatualizado': 'Workspace out of date',
  'Outra aba alterou os dados. Tentativas de gravação recusadas não salvam alterações.':
    'Another tab changed the data. Rejected save attempts do not keep your changes.',
  'Atualize os dados e revise o que digitou antes de tentar salvar novamente.':
    'Refresh the data and review what you typed before trying to save again.',
  'Dados locais inconsistentes': 'Inconsistent local data',
  'O workspace salvo não pôde ser validado e foi iniciado vazio. O conteúdo original permanece no navegador e não foi apagado. Exporte-o para análise ou descarte-o explicitamente.':
    'The saved workspace could not be validated and was started empty. The original content remains in the browser and was not deleted. Export it for analysis or discard it explicitly.',
  'Versão de dados não suportada': 'Unsupported data version',
  'Os dados salvos usam uma versão mais recente que esta aplicação. O workspace foi iniciado vazio para evitar leitura incorreta. Nada foi apagado.':
    'The saved data uses a newer version than this application. The workspace was started empty to avoid misreading it. Nothing was deleted.',
  'Armazenamento local indisponível': 'Local storage unavailable',
  'O navegador bloqueou o LocalStorage. A navegação continua funcionando, mas nada será salvo nesta sessão.':
    'The browser blocked LocalStorage. Navigation still works, but nothing will be saved in this session.',
  'Não há conteúdo bruto disponível para exportar.':
    'There is no raw content available to export.',
  'Exportar conteúdo bruto': 'Export raw content',
  'Descartar dados e iniciar vazio': 'Discard data and start empty',
  'Descartar dados locais inválidos': 'Discard invalid local data',
  'Isto remove o envelope salvo neste navegador. Exporte o conteúdo bruto antes se quiser analisá-lo. A ação não pode ser desfeita.':
    'This removes the saved envelope in this browser. Export the raw content first if you want to analyze it. This action cannot be undone.',
  'Descartar dados': 'Discard data',
}

const navigation: Record<string, string> = {
  'Indicadores e observações': 'Metrics and observations',
  'Voz do usuário': 'Voice of the user',
  'Hipóteses e decisões': 'Hypotheses and decisions',
  'Estudo de caso guiado': 'Guided case study',
}

const overview: Record<string, string> = {
  'Sem descrição registrada.': 'No description recorded.',
  'Último período: {period}': 'Latest period: {period}',
  'Nenhuma observação': 'No observations',
  'Variação absoluta: ': 'Absolute change: ',
  'em termos relativos': 'in relative terms',
  'Sem variação em relação ao período anterior.': 'No change from the previous period.',
  'Antes: {value} em {period}': 'Before: {value} in {period}',
  'Sem comparação': 'No comparison',
  'Histórico insuficiente para comparação.': 'Not enough history for comparison.',
  'Registre ao menos duas observações.': 'Record at least two observations.',
  'Direção desejada: {direction}': 'Desired direction: {direction}',
  '{observations} obs. · {feedbacks} feedbacks · {decisions} decisões':
    '{observations} obs. · {feedbacks} feedbacks · {decisions} decisions',
  'Abrir indicador {name}': 'Open metric {name}',
  'Abrir indicador': 'Open metric',
  'Estável': 'Stable',
  'Favorável': 'Favorable',
  'Desfavorável': 'Unfavorable',
  'Observação excluída.': 'Observation deleted.',
  'Observação salva.': 'Observation saved.',
  'Situação atual': 'Current situation',
  '{count} observações': '{count} observations',
  'Último valor registrado': 'Latest recorded value',
  'O aplicativo não determina a causa da variação.':
    'The application does not determine the cause of the change.',
  'Histórico insuficiente para comparação. Registre ao menos duas observações.':
    'Not enough history for comparison. Record at least two observations.',
  'Histórico de observações': 'Observation history',
  'Adicionar observação': 'Add observation',
  'Nenhuma observação registrada para este indicador.':
    'No observations recorded for this metric.',
  'Período': 'Period',
  'Valor': 'Value',
  'Ações': 'Actions',
  'Editar observação de {period}': 'Edit observation from {period}',
  'Excluir observação de {period}': 'Delete observation from {period}',
  'Editar': 'Edit',
  'Excluir': 'Delete',
  'Confirmar exclusão da observação': 'Confirm observation deletion',
  'Excluir a observação de {period} ({value})? Esta ação não pode ser desfeita.':
    'Delete the observation from {period} ({value})? This action cannot be undone.',
  'Confirmar exclusão': 'Confirm deletion',
  'Evidências vinculadas': 'Linked evidence',
  'Nenhum feedback vinculado a este indicador.': 'No feedback linked to this metric.',
  'Nenhuma decisão vinculada a este indicador.': 'No decision linked to this metric.',
  'Gerenciar indicador': 'Manage metric',
  'Editar indicador': 'Edit metric',
  'Excluir indicador': 'Delete metric',
  'Este indicador está vinculado a {decisions} decisão(ões) e {feedbacks} feedback(s). Remova os vínculos antes de excluir.':
    'This metric is linked to {decisions} decision(s) and {feedbacks} feedback(s). Remove the links before deleting.',
  'Decisão: {title}': 'Decision: {title}',
  'Feedback: {content}': 'Feedback: {content}',
  'Confirmar exclusão do indicador': 'Confirm metric deletion',
  'Excluir este indicador também removerá {count} observação(ões). Esta ação não pode ser desfeita.':
    'Deleting this metric will also remove {count} observation(s). This action cannot be undone.',
  'Novo indicador': 'New metric',
  'Indicadores representam medidas do produto. A direção desejada é uma configuração sua, não uma inferência automática.':
    'Metrics are measures of the product. The desired direction is your own setting, not an automatic inference.',
  'Criar indicador': 'Create metric',
  'Nome do indicador': 'Metric name',
  'Ex.: Conversão Free → Premium. Até {max} caracteres.':
    'E.g. Free → Premium conversion. Up to {max} characters.',
  'Até {max} caracteres.': 'Up to {max} characters.',
  'Descrição': 'Description',
  'Opcional. Explique o que o indicador mede.': 'Optional. Explain what the metric measures.',
  'Unidade': 'Unit',
  'Valores maiores contam como favoráveis.': 'Higher values count as favorable.',
  'Valores menores contam como favoráveis.': 'Lower values count as favorable.',
  'direção': 'direction',
  'Informe um número válido.': 'Enter a valid number.',
  'Nova observação': 'New observation',
  'Mês de referência.': 'Reference month.',
  'Valor · {unit}': 'Value · {unit}',
  'Ex.: {value}. Aceita vírgula decimal.': 'E.g. {value}. Accepts a decimal point.',
  'Aceita vírgula decimal.': 'Accepts a decimal point.',
  'Salvar observação': 'Save observation',
  'Exportar backup': 'Export backup',
  'Importar backup': 'Import backup',
  'Conecte métricas e feedbacks para formular hipóteses, comparar alternativas e documentar decisões de produto fundamentadas em evidências.':
    'Connect metrics and feedback to form hypotheses, compare alternatives and document product decisions grounded in evidence.',
  'Seus dados no workspace': 'Your data in the workspace',
  'Os registros ficam neste navegador, sem sincronização em nuvem com outros dispositivos ou perfis. Limpar os dados do site pode apagá-los definitivamente; a aplicação não faz recuperação automática. Exporte um backup manualmente pelos botões acima. Ao importar, todo o workspace atual é substituído.':
    'Records stay in this browser, with no cloud sync across other devices or profiles. Clearing the site data can delete them permanently; the application does not recover them automatically. Export a backup manually with the buttons above. On import, the entire current workspace is replaced.',
  'Comece pelo seu primeiro indicador': 'Start with your first metric',
  'Cadastre uma métrica de produto e acompanhe sua evolução ao longo do tempo. Os dados ficam apenas neste navegador.':
    'Register a product metric and track how it evolves over time. The data stays in this browser only.',
  'Explore o laboratório': 'Explore the lab',
  'Registre feedbacks': 'Log feedback',
  'e': 'and',
  'documente decisões': 'document decisions',
  'com suas hipóteses e alternativas. Você também pode':
    'with your hypotheses and alternatives. You can also',
  'experimentar o Interactive Case': 'try the Interactive Case',
  ', um cenário simulado separado do workspace.':
    ', a simulated scenario separate from the workspace.',
  'Prévia demonstrativa': 'Demo preview',
  'Esta prévia usa um produto fictício e não é gravada no workspace. Seus registros permanecem separados.':
    'This preview uses a fictional product and is not saved to the workspace. Your records stay separate.',
  'Resumo do workspace': 'Workspace summary',
  'Indicadores': 'Metrics',
  'Observações': 'Observations',
  '{count} cadastrado(s)': '{count} registered',
  'Indicador criado.': 'Metric created.',
  'Indicador atualizado.': 'Metric updated.',
  'Indicador excluído.': 'Metric deleted.',
  'Backup importado: {metrics} indicadores, {observations} observações, {feedbacks} feedbacks e {decisions} decisões.':
    'Backup imported: {metrics} metrics, {observations} observations, {feedbacks} feedbacks and {decisions} decisions.',
  'Dataset demonstrativo': 'Demo dataset',
  'Simulado': 'Simulated',
  'Produto fictício: {product}': 'Fictional product: {product}',
  'feedback simulado': 'simulated feedback',
  '{metrics} métricas e {feedbacks} feedbacks relacionados':
    '{metrics} related metrics and {feedbacks} related feedbacks',
  'Este dataset não é gravado no workspace e permanece separado dos seus registros.':
    'This dataset is not saved to the workspace and stays separate from your records.',
  'Ledgerly (fictício)': 'Ledgerly (fictional)',
  'Dataset simulado, criado para exercitar os modelos nesta etapa. Não representa dados reais do ProfResolve nem de qualquer produto.':
    'Simulated dataset, created to exercise the models at this stage. It does not represent real data from ProfResolve or any other product.',
  'Levei três dias para importar o plano de contas do meu cliente. Tive que lançar tudo à mão porque o importador não reconheceu o arquivo do meu sistema antigo.':
    'It took me three days to import my client’s chart of accounts. I had to enter everything by hand because the importer did not recognize the file from my old system.',
  'Templates de configuração por segmento': 'Configuration templates by segment',
  'A ativação no primeiro dia caiu de 64% em maio para 49% em outubro, enquanto o tempo até o primeiro valor subiu de 2,8 h para 4,8 h e os tickets de onboarding por 100 contas passaram de 6,1 para 11,2.':
    'First-day activation fell from 64% in May to 49% in October, while time to first value rose from 2.8 h to 4.8 h and onboarding tickets per 100 accounts went from 6.1 to 11.2.',
  '% das contas novas': '% of new accounts',
  'Série simulada: {first} em {from} e {last} em {to}.':
    'Simulated series: {first} in {from} and {last} in {to}.',
  'Ativação no primeiro dia': 'First-day activation',
  'Substituir workspace': 'Replace workspace',
  'Selecione um arquivo JSON exportado pelo Product Decision Lab. A importação substitui todo o workspace deste navegador.':
    'Select a JSON file exported by Product Decision Lab. Importing replaces the entire workspace in this browser.',
  'Arquivo de backup (JSON)': 'Backup file (JSON)',
  'Até 5 MB. O conteúdo é validado antes de qualquer substituição.':
    'Up to 5 MB. The content is validated before any replacement.',
  'Lendo {file}…': 'Reading {file}…',
  'Arquivo selecionado: {file}': 'Selected file: {file}',
  'Resumo do backup': 'Backup summary',
  '{count} indicadores': '{count} metrics',
  '{count} feedbacks': '{count} feedbacks',
  '{count} decisões': '{count} decisions',
  'Data do backup: {date}': 'Backup date: {date}',
  'não informada': 'not provided',
  'A importação substituirá os dados atuais deste navegador. Não há mesclagem de backups nesta etapa.':
    'Importing will replace the current data in this browser. There is no backup merging at this stage.',
  'Exportar dados atuais antes de importar': 'Export current data before importing',
  'Backup JSON exportado.': 'JSON backup exported.',
  'Cópia JSON exportada. Este arquivo contém decisões incompatíveis e ainda não é restaurável pelo fluxo normal. Regularize os registros indicados e gere um novo backup.':
    'JSON copy exported. This file contains incompatible decisions and cannot yet be restored through the normal flow. Fix the indicated records and generate a new backup.',
  'Atenção: este backup contém decisões que precisam ser regularizadas':
    'Warning: this backup contains decisions that need to be fixed',
  'Encontramos decisões que não atendem aos requisitos atuais de seus respectivos status. Você ainda pode baixar uma cópia dos seus dados, mas este arquivo não poderá ser restaurado normalmente nesta versão até que as inconsistências sejam corrigidas.':
    'We found decisions that do not meet the current requirements for their statuses. You can still download a copy of your data, but this file cannot be restored normally in this version until the inconsistencies are fixed.',
  'Revisar decisões': 'Review decisions',
  'Baixar cópia mesmo assim': 'Download a copy anyway',
  '{count} decisão(ões) incompatível(is)': '{count} incompatible decision(s)',
  'Decisão:': 'Decision:',
  'Status:': 'Status:',
  'Pendência:': 'Issue:',
  'Evolução de {name} com {count} observação(ões){range}.':
    'Evolution of {name} with {count} observation(s){range}.',
  ', de {firstValue} em {firstPeriod} a {lastValue} em {lastPeriod}':
    ', from {firstValue} in {firstPeriod} to {lastValue} in {lastPeriod}',
  'Uma observação: {value} em {period}.': 'One observation: {value} in {period}.',
  '{firstValue} em {firstPeriod} → {lastValue} em {lastPeriod}.':
    '{firstValue} in {firstPeriod} → {lastValue} in {lastPeriod}.',
  'p.p.': 'pp',
  'Variação relativa indisponível.': 'Relative change unavailable.',
}

const feedbacks: Record<string, string> = {
  'Informe uma data válida.': 'Enter a valid date.',
  'Editar feedback': 'Edit feedback',
  'Novo feedback': 'New feedback',
  'Registre a fala do usuário, uma observação de pesquisa ou um relato de suporte. A classificação é manual.':
    'Record the user’s own words, a research observation or a support report. Classification is manual.',
  'Criar feedback': 'Create feedback',
  'Conteúdo': 'Content',
  'Registre o relato nas palavras do usuário. Até {max} caracteres.':
    'Record the report in the user’s words. Up to {max} characters.',
  'Categoria': 'Category',
  'Fonte': 'Source',
  'Data': 'Date',
  'Indicadores relacionados': 'Related metrics',
  '(opcional)': '(optional)',
  'Marque os indicadores que este relato ajuda a investigar. É uma associação manual, não prova causa.':
    'Select the metrics this report helps investigate. It is a manual association, not proof of cause.',
  '{count} selecionado(s).': '{count} selected.',
  'Nenhum indicador cadastrado. Você pode salvar o feedback sem associação.':
    'No metrics registered. You can save the feedback without an association.',
  'MVP funcional': 'Functional MVP',
  'Organize a voz dos usuários e conecte informações qualitativas aos problemas identificados nas métricas.':
    'Organize the voice of users and connect qualitative information to the problems identified in the metrics.',
  'Resumo de feedbacks': 'Feedback summary',
  '{count} feedback(s) no workspace.': '{count} feedback(s) in the workspace.',
  'Nenhum feedback no workspace': 'No feedback in the workspace',
  'Registre relatos de entrevistas, tickets, pesquisas e avaliações para conectá-los aos indicadores e às decisões.':
    'Record reports from interviews, tickets, surveys and reviews to connect them to metrics and decisions.',
  'Pesquisa e filtros': 'Search and filters',
  'Pesquisar feedbacks': 'Search feedback',
  'Pesquisar por conteúdo, categoria ou fonte': 'Search by content, category or source',
  'Filtrar por categoria': 'Filter by category',
  'Todas as categorias': 'All categories',
  'Filtrar por fonte': 'Filter by source',
  'Todas as fontes': 'All sources',
  'Filtrar por indicador': 'Filter by metric',
  'Todos os indicadores': 'All metrics',
  'Limpar filtros': 'Clear filters',
  'Nenhum feedback encontrado': 'No feedback found',
  'Nenhum registro corresponde à busca e aos filtros atuais. Ajuste os critérios para ver mais resultados.':
    'No record matches the current search and filters. Adjust the criteria to see more results.',
  'Limpar busca e filtros': 'Clear search and filters',
  'Lista de feedbacks': 'Feedback list',
  'Exibindo {shown} de {total} feedback(s).': 'Showing {shown} of {total} feedback(s).',
  '{category} de {date}': '{category} from {date}',
  'Fonte: ': 'Source: ',
  'Sem indicador associado.': 'No associated metric.',
  'Associado a 1 indicador:': 'Associated with 1 metric:',
  'Associado a {count} indicadores:': 'Associated with {count} metrics:',
  'Citado como evidência em:': 'Cited as evidence in:',
  'Editar feedback: {label}': 'Edit feedback: {label}',
  'Excluir feedback: {label}': 'Delete feedback: {label}',
  'Feedback atualizado.': 'Feedback updated.',
  'Feedback criado.': 'Feedback created.',
  'Feedback excluído.': 'Feedback deleted.',
  'Excluir feedback': 'Delete feedback',
  'Este feedback é evidência de decisões registradas e não pode ser excluído diretamente.':
    'This feedback is evidence for recorded decisions and cannot be deleted directly.',
  'Esta ação remove o feedback do workspace e não pode ser desfeita.':
    'This action removes the feedback from the workspace and cannot be undone.',
  'Abra a decisão, remova este feedback das evidências e tente novamente.':
    'Open the decision, remove this feedback from its evidence and try again.',
}

const decisions: Record<string, string> = {
  'Editar decisão': 'Edit decision',
  'Nova decisão': 'New decision',
  'Documente o problema, as evidências, a hipótese, as alternativas e a decisão registrada.':
    'Document the problem, the evidence, the hypothesis, the alternatives and the recorded decision.',
  'Decisão atualizada.': 'Decision updated.',
  'Decisão criada.': 'Decision created.',
  'Decisão excluída.': 'Decision deleted.',
  'Transforme problemas, métricas e feedbacks em hipóteses e decisões fundamentadas.':
    'Turn problems, metrics and feedback into grounded hypotheses and decisions.',
  'Resumo de decisões': 'Decision summary',
  '{count} registro(s) no workspace.': '{count} record(s) in the workspace.',
  'Nenhuma decisão documentada': 'No documented decisions',
  'Crie um Decision Record para conectar um problema às evidências quantitativas e qualitativas e registrar a direção escolhida.':
    'Create a Decision Record to connect a problem to quantitative and qualitative evidence and record the chosen direction.',
  'Criar decisão': 'Create decision',
  'Pesquisa e filtros de decisões': 'Decision search and filters',
  'Pesquisar decisões': 'Search decisions',
  'Pesquisar por título ou problema': 'Search by title or problem',
  'Filtrar por status': 'Filter by status',
  'Todos os status': 'All statuses',
  'Nenhuma decisão encontrada': 'No decisions found',
  'Nenhum registro corresponde à busca e ao filtro atuais. Ajuste os critérios para ver mais resultados.':
    'No record matches the current search and filter. Adjust the criteria to see more results.',
  'Lista de decisões': 'Decision list',
  'Exibindo {shown} de {total} registro(s).': 'Showing {shown} of {total} record(s).',
  'Decisão registrada': 'Recorded decision',
  'Atualizado em {date}': 'Updated on {date}',
  'Sem evidências vinculadas': 'No linked evidence',
  'Evidências: {metrics} {metricWord} · {feedbacks} {feedbackWord}':
    'Evidence: {metrics} {metricWord} · {feedbacks} {feedbackWord}',
  'indicador': 'metric',
  'indicadores': 'metrics',
  'Alternativas consideradas: {count}': 'Alternatives considered: {count}',
  'Abrir registro: {title}': 'Open record: {title}',
  'Abrir registro': 'Open record',
  'Nada foi salvo. O que você digitou continua neste formulário.':
    'Nothing was saved. What you typed is still in this form.',
  'Contexto': 'Context',
  'Um registro começa pelo problema que você está tentando resolver.':
    'A record starts with the problem you are trying to solve.',
  'Título da decisão': 'Decision title',
  'Ex.: Melhorar compreensão dos planos Premium. Até {max} caracteres.':
    'E.g. Improve understanding of the Premium plans. Up to {max} characters.',
  'Ex.: Melhorar compreensão dos planos Premium.':
    'E.g. Improve understanding of the Premium plans.',
  'Problema investigado': 'Problem investigated',
  'Descreva o problema observado. Uma variação de métrica não comprova a causa.':
    'Describe the observed problem. A metric change does not prove the cause.',
  'Descreva o problema observado.': 'Describe the observed problem.',
  'Uma hipótese é uma aposta a ser investigada, não uma conclusão validada.':
    'A hypothesis is a bet to be investigated, not a validated conclusion.',
  'Hipótese de produto': 'Product hypothesis',
  'Ex.: Uma apresentação mais clara dos benefícios Premium pode reduzir dúvidas na assinatura.':
    'E.g. A clearer presentation of Premium benefits may reduce doubts at checkout.',
  'Descreva a aposta a ser investigada.': 'Describe the bet to be investigated.',
  'Opções de ação avaliadas antes da escolha. Não são evidências.':
    'Action options evaluated before the choice. They are not evidence.',
  'Descreva uma alternativa': 'Describe an alternative',
  'Adicionar alternativa': 'Add alternative',
  'Descreva a direção escolhida com base nas evidências disponíveis.':
    'Describe the chosen direction based on the available evidence.',
  'Obrigatório para o status Validada: registre ao menos um critério.':
    'Required for the Validated status: record at least one criterion.',
  'Como você saberá se a decisão funcionou. Evite metas automáticas: registre seus próprios critérios.':
    'How you will know whether the decision worked. Avoid automatic targets: record your own criteria.',
  'Ex.: Ativação acima de 58% até dezembro': 'E.g. Activation above 58% by December',
  'Adicionar critério': 'Add criterion',
  'Evidências relacionadas': 'Related evidence',
  'Registros do workspace relacionados ao problema. Um vínculo não estabelece causalidade.':
    'Workspace records related to the problem. A link does not establish causality.',
  'Nenhum indicador cadastrado. Você pode registrar a decisão sem evidências quantitativas.':
    'No metrics registered. You can record the decision without quantitative evidence.',
  '{unit} · {value} em {period}': '{unit} · {value} in {period}',
  '{unit} · sem observações': '{unit} · no observations',
  'Feedbacks relacionados': 'Related feedback',
  '(opcional · {count} selecionado(s))': '(optional · {count} selected)',
  'Nenhum feedback cadastrado. Registre relatos na área Feedbacks para usá-los como evidência.':
    'No feedback registered. Record reports in the Feedback area to use them as evidence.',
  'Pesquisar feedbacks por conteúdo ou categoria':
    'Search feedback by content or category',
  'Nenhum feedback corresponde à pesquisa.': 'No feedback matches the search.',
  'Próximos passos': 'Next steps',
  'Lista simples de ações. Não é um gerenciador de tarefas.':
    'A simple action list. It is not a task manager.',
  'Ex.: Revisar a apresentação dos planos': 'E.g. Review the plan presentation',
  'Adicionar próximo passo': 'Add next step',
  'Status do registro': 'Record status',
  'O status é uma classificação registrada por você. O sistema não valida hipóteses automaticamente.':
    'The status is a classification you record. The system does not validate hypotheses automatically.',
  'Salvar decisão': 'Save decision',
  'Nenhum item adicionado.': 'No items added.',
  '{title} — item {index}': '{title} — item {index}',
  'Remover {title} item {index}': 'Remove {title} item {index}',
  'Remover': 'Remove',
  'Voltar': 'Back',
  'Exportar Markdown': 'Export Markdown',
  'Markdown gerado: {file}.': 'Markdown generated: {file}.',
  '{error} Nada foi excluído.': '{error} Nothing was deleted.',
  'Excluir este registro?': 'Delete this record?',
  '“{title}” será removido permanentemente do workspace. Esta ação não pode ser desfeita.':
    '“{title}” will be permanently removed from the workspace. This action cannot be undone.',
  'Indicadores e feedbacks vinculados não são excluídos; apenas o vínculo com este registro deixa de existir.':
    'Linked metrics and feedback are not deleted; only the link to this record stops existing.',
  'Problema': 'Problem',
  'O que motivou a investigação.': 'What motivated the investigation.',
  'Uma aposta a investigar; não é um fato comprovado.':
    'A bet to investigate; it is not a proven fact.',
  'Nenhuma hipótese registrada.': 'No hypothesis recorded.',
  'Opções de ação avaliadas; não são evidências.':
    'Action options evaluated; they are not evidence.',
  'Nenhuma alternativa registrada.': 'No alternative recorded.',
  'A escolha documentada; não implica resultado positivo.':
    'The documented choice; it does not imply a positive outcome.',
  'Nenhuma decisão registrada.': 'No decision recorded.',
  'Registros do workspace relacionados a este problema. Um vínculo não estabelece causalidade.':
    'Workspace records related to this problem. A link does not establish causality.',
  'Nenhum indicador vinculado.': 'No linked metrics.',
  'Último valor: {value} · {period}': 'Latest value: {value} · {period}',
  'Sem observações registradas.': 'No observations recorded.',
  'Nenhum feedback vinculado.': 'No linked feedback.',
  'Feedback {index}': 'Feedback {index}',
  'Algumas referências não estão mais disponíveis no workspace.':
    'Some references are no longer available in the workspace.',
  'Condições definidas por você para avaliar o resultado.':
    'Conditions you defined to evaluate the outcome.',
  'Nenhum critério registrado.': 'No criterion recorded.',
  'Nenhum próximo passo registrado.': 'No next step recorded.',
  'Metadados': 'Metadata',
  'Criado em {date}': 'Created on {date}',
}

const interactiveCase: Record<string, string> = {
  'Investigar': 'Investigate',
  'Indicadores e contexto': 'Metrics and context',
  'Analisar': 'Analyze',
  'Feedbacks e evidências': 'Feedback and evidence',
  'Decidir': 'Decide',
  'Hipótese e alternativa': 'Hypothesis and alternative',
  'Etapas disponíveis no Interactive Case': 'Steps available in the Interactive Case',
  'Disponível': 'Available',
  'Investigação visual': 'Visual investigation',
  'Selecione um indicador para explorar sua evolução nos quatro períodos simulados.':
    'Select a metric to explore its evolution across the four simulated periods.',
  'Selecionar indicador': 'Select metric',
  'Variação no intervalo:': 'Change over the interval:',
  'Os indicadores podem apresentar tendências simultâneas sem que isso comprove relação causal.':
    'Metrics can show simultaneous trends without that proving a causal relationship.',
  'Nenhum indicador disponível para investigação.': 'No metrics available to investigate.',
  'Inicial': 'Initial',
  'Final': 'Final',
  'Variação: {value} entre {from} e {to}.': 'Change: {value} between {from} and {to}.',
  'Tendência de aumento': 'Upward trend',
  'Tendência de queda': 'Downward trend',
  'Sem variação no intervalo': 'No change over the interval',
  ', alinhada à direção desejada': ', aligned with the desired direction',
  ', oposta à direção desejada': ', opposite to the desired direction',
  '{name}: aumento de {firstValue} em {from} para {lastValue} em {to}, ao longo de {periods}.':
    '{name}: increase from {firstValue} in {from} to {lastValue} in {to}, over {periods}.',
  '{name}: queda de {firstValue} em {from} para {lastValue} em {to}, ao longo de {periods}.':
    '{name}: decrease from {firstValue} in {from} to {lastValue} in {to}, over {periods}.',
  '{name}: estável em {firstValue} entre {from} e {to}, ao longo de {periods}.':
    '{name}: stable at {firstValue} between {from} and {to}, over {periods}.',
  '{count} períodos': '{count} periods',
  'Unidade: {unit}': 'Unit: {unit}',
  'Primeira observação': 'First observation',
  'Última observação': 'Last observation',
  '{trend} Períodos observados: {periods}.': '{trend} Observed periods: {periods}.',
  '02 — Analisar a voz dos usuários': '02 — Analyze the voice of users',
  'Explore os feedbacks disponíveis e identifique quais relatos podem ajudar a formular hipóteses sobre o problema.':
    'Explore the available feedback and identify which reports can help form hypotheses about the problem.',
  'Visualizar': 'View',
  'Todos os feedbacks': 'All feedback',
  'Relacionados ao indicador selecionado': 'Related to the selected metric',
  'Nenhum feedback relacionado ao indicador selecionado. Altere o filtro para visualizar todos os relatos.':
    'No feedback related to the selected metric. Change the filter to view all reports.',
  'Observação: a variação registrada em um indicador. Evidência qualitativa: o relato de um usuário. Hipótese: uma explicação possível, ainda não verificada.':
    'Observation: the recorded change in a metric. Qualitative evidence: a user report. Hypothesis: a possible explanation, not yet verified.',
  'relato fictício': 'fictional report',
  'Dado simulado': 'Simulated data',
  'Nenhum indicador relacionado.': 'No related metrics.',
  'Evidência selecionada': 'Evidence selected',
  'Selecionar evidência': 'Select evidence',
  'sua seleção': 'your selection',
  'Evidências selecionadas': 'Selected evidence',
  'Você ainda não selecionou evidências. Analise os feedbacks e escolha os relatos que considera relevantes para a investigação.':
    'You have not selected evidence yet. Analyze the feedback and choose the reports you consider relevant to the investigation.',
  'Limpar seleção': 'Clear selection',
  'Remover evidência: {content}': 'Remove evidence: {content}',
  'explicação ainda não verificada': 'explanation not yet verified',
  '03 — Formular uma hipótese e decidir': '03 — Form a hypothesis and decide',
  'Com base nos indicadores e feedbacks analisados, formule uma explicação possível para o problema e escolha qual direção de produto investigaria primeiro.':
    'Based on the metrics and feedback analyzed, form a possible explanation for the problem and choose which product direction you would investigate first.',
  'Sua hipótese de produto': 'Your product hypothesis',
  '{count} de {max} caracteres.': '{count} of {max} characters.',
  'Exemplo: a queda na conversão pode estar relacionada à dificuldade de compreender o valor do Premium antes de concluir a primeira experiência com o produto.':
    'Example: the drop in conversion may be related to difficulty understanding Premium’s value before completing the first product experience.',
  'Uma hipótese é uma explicação que ainda precisa ser validada. Não é necessário encontrar uma resposta definitiva.':
    'A hypothesis is an explanation that still needs validation. You do not need to find a definitive answer.',
  'possibilidades de ação, não evidências': 'action possibilities, not evidence',
  'Alternativas de decisão': 'Decision alternatives',
  'Examine as três direções possíveis e escolha uma para investigar primeiro.':
    'Examine the three possible directions and choose one to investigate first.',
  'Selecionar uma alternativa de decisão': 'Select a decision alternative',
  'Selecionar alternativa: {title}': 'Select alternative: {title}',
  'Selecionada': 'Selected',
  'Benefícios potenciais': 'Potential benefits',
  'Riscos': 'Risks',
  'Informações adicionais necessárias': 'Additional information needed',
  'Evidências selecionadas relacionadas a esta alternativa':
    'Selected evidence related to this alternative',
  'Nenhuma das evidências selecionadas está relacionada a esta alternativa no cenário.':
    'None of the selected evidence is related to this alternative in the scenario.',
  'Outras evidências selecionadas': 'Other selected evidence',
  'Nenhuma outra evidência selecionada.': 'No other evidence selected.',
  'Esta separação é apenas informativa: a quantidade de evidências relacionadas não comprova a causa do problema nem a efetividade da alternativa.':
    'This separation is informational only: the amount of related evidence proves neither the cause of the problem nor the effectiveness of the alternative.',
  'Selecione uma alternativa para ver como as evidências escolhidas se relacionam com ela.':
    'Select an alternative to see how the chosen evidence relates to it.',
  'As três alternativas são hipotéticas e não indicam qual delas é superior. A escolha representa a direção que você considera mais apropriada para investigar neste momento.':
    'The three alternatives are hypothetical and do not indicate which one is superior. The choice represents the direction you consider most appropriate to investigate at this moment.',
  'Sua decisão de produto': 'Your product decision',
  'Ainda faltam requisitos para visualizar a síntese.':
    'Some requirements are still missing to view the summary.',
  'Seus dados preenchidos foram mantidos.': 'The data you filled in was kept.',
  'dentro do cenário demonstrativo': 'within the demo scenario',
  'Problema investigado': 'Problem investigated',
  'Indicador em análise': 'Metric under analysis',
  'Nenhum indicador selecionado.': 'No metric selected.',
  'Evidências escolhidas (relatos fictícios)': 'Chosen evidence (fictional reports)',
  'Sua hipótese (não verificada)': 'Your hypothesis (not verified)',
  'Direção escolhida': 'Chosen direction',
  'Riscos e limitações': 'Risks and limitations',
  'Informações que ainda seriam necessárias': 'Information that would still be needed',
  'Próximo raciocínio': 'Next reasoning',
  'Uma decisão de produto envolve benefícios, riscos, restrições e evidências incompletas. Escolher uma direção não significa comprovar sua efetividade.':
    'A product decision involves benefits, risks, constraints and incomplete evidence. Choosing a direction does not prove its effectiveness.',
  'A próxima etapa de uma investigação real seria validar a hipótese, definir critérios de sucesso e acompanhar os resultados após uma intervenção.':
    'The next step in a real investigation would be to validate the hypothesis, define success criteria and track the results after an intervention.',
  'Esta é uma síntese do seu raciocínio dentro do cenário demonstrativo. Ela não representa uma decisão implementada no ProfResolve nem comprova a efetividade de qualquer intervenção.':
    'This is a summary of your reasoning within the demo scenario. It does not represent a decision implemented at ProfResolve nor prove the effectiveness of any intervention.',
  'Cenário simulado': 'Simulated scenario',
  'Problema apresentado': 'Presented problem',
  'Pergunta principal': 'Main question',
  'Observe os indicadores simulados antes de explicar o que aconteceu.':
    'Observe the simulated metrics before explaining what happened.',
  'Painel de métricas': 'Metrics dashboard',
  'Indicadores simulados de {from} a {to}. As variações comparam a primeira e a última observação de cada série.':
    'Simulated metrics from {from} to {to}. Changes compare the first and last observation of each series.',
  'Indicadores simulados calculados a partir do cenário demonstrativo.':
    'Simulated metrics calculated from the demo scenario.',
  'Relatos fictícios ajudam a formular hipóteses; não comprovam causas.':
    'Fictional reports help form hypotheses; they do not prove causes.',
  'Registre uma hipótese e escolha uma direção dentro do cenário.':
    'Record a hypothesis and choose a direction within the scenario.',
  'Ver síntese da minha decisão': 'View my decision summary',
  'A síntese exige uma hipótese com pelo menos 15 caracteres, uma evidência selecionada e uma alternativa escolhida.':
    'The summary requires a hypothesis with at least 15 characters, one selected piece of evidence and one chosen alternative.',
  'Escreva uma hipótese para continuar.': 'Write a hypothesis to continue.',
  'Selecione pelo menos uma evidência.': 'Select at least one piece of evidence.',
  'Escolha uma alternativa de decisão.': 'Choose a decision alternative.',
  '{count} evidência selecionada': '{count} evidence selected',
  '{count} evidências selecionadas': '{count} evidence items selected',
  'Explore os indicadores de um cenário demonstrativo inspirado no ProfResolve e identifique os sinais que merecem investigação.':
    'Explore the metrics of a demo scenario inspired by ProfResolve and identify the signals that deserve investigation.',
  'Cenário simulado: os indicadores apresentados não representam dados reais de produção do ProfResolve.':
    'Simulated scenario: the metrics shown do not represent real production data from ProfResolve.',
  'Todos os comentários apresentados neste cenário são fictícios e foram criados exclusivamente para demonstração.':
    'All comments shown in this scenario are fictional and were created exclusively for demonstration.',
  'Feedbacks ajudam a formular hipóteses, mas não comprovam, isoladamente, a causa de uma variação nos indicadores.':
    'Feedback helps form hypotheses, but does not by itself prove the cause of a change in the metrics.',
  'Períodos observados': 'Observed periods',
  'O ProfResolve é um SaaS educacional voltado a professores. Neste exercício, ele aparece apenas como contexto de produto: os indicadores, feedbacks e alternativas foram criados para demonstrar uma investigação de Product Management.':
    'ProfResolve is an education SaaS aimed at teachers. In this exercise it appears only as product context: the metrics, feedback and alternatives were created to demonstrate a Product Management investigation.',
  'A conversão simulada de usuários gratuitos para o Premium caiu de 5,2% para 3,4% ao longo de quatro períodos, enquanto as visitas à página de planos aumentaram. A causa não está estabelecida.':
    'Simulated conversion from free users to Premium fell from 5.2% to 3.4% over four periods, while visits to the plans page increased. The cause is not established.',
  'A conversão de usuários gratuitos para Premium apresentou uma queda. Como um Product Manager deveria investigar o problema antes de decidir?':
    'Conversion from free users to Premium has fallen. How should a Product Manager investigate the problem before deciding?',
  'Conversão de usuários gratuitos para Premium': 'Free-to-Premium conversion',
  'Conclusão do onboarding gratuito': 'Free onboarding completion',
  'Visitas à página de planos Premium': 'Premium plans page visits',
  'Percentual de usuários gratuitos elegíveis que passam para o plano Premium no período.':
    'Percentage of eligible free users who move to the Premium plan in the period.',
  'Percentual de professores que concluem a configuração da primeira turma durante o onboarding.':
    'Percentage of teachers who complete setting up their first class during onboarding.',
  'Número de visitas à página de planos Premium no período.':
    'Number of visits to the Premium plans page in the period.',
  'A página de planos lista os recursos do Premium ao lado do gratuito, mas não explica o que muda na rotina do professor. Saí sem entender se o Premium resolve meu problema de correção.':
    'The plans page lists Premium features next to the free ones, but it does not explain what changes in the teacher’s routine. I left without understanding whether Premium solves my grading problem.',
  'O preço é por professor, mas a página não deixa claro se coordenadores e estagiários também contam. Preferi continuar no gratuito até entender o custo real.':
    'The price is per teacher, but the page does not make it clear whether coordinators and interns also count. I preferred to stay on the free plan until I understood the real cost.',
  'Descobri que existia um plano Premium porque perguntei ao suporte. Dentro do produto, nunca vi um convite para conhecer os recursos pagos.':
    'I found out there was a Premium plan because I asked support. Inside the product, I never saw an invitation to learn about the paid features.',
  'Tentei configurar minha primeira turma, mas o onboarding pediu informações da escola que eu não tinha em mãos. Deixei para depois e não voltei.':
    'I tried to set up my first class, but onboarding asked for school information I did not have at hand. I left it for later and never came back.',
  'A importação da lista de alunos demorou e alguns nomes vieram sem turma. Refiz tudo à mão antes de conseguir usar o produto.':
    'Importing the student list took a long time and some names came without a class. I redid everything by hand before I could use the product.',
  'Uso o plano gratuito com duas turmas e ele atende. Não sinto necessidade de pagar porque nunca cheguei no limite de alunos.':
    'I use the free plan with two classes and it is enough. I do not feel the need to pay because I never reached the student limit.',
  'Na minha escola, a compra precisa passar pela coordenação e pelo setor financeiro. O processo de virar Premium no cartão pessoal não funciona para mim.':
    'At my school, purchases must go through coordination and finance. The process of becoming Premium with a personal card does not work for me.',
  'Consegui entrar, mas não encontrei um modelo de atividade para começar. Passei a primeira semana explorando e ainda não tinha usado nada que justificasse o Premium.':
    'I managed to sign in, but I could not find an activity template to start with. I spent the first week exploring and still had not used anything that justified Premium.',
  'Esclarecer a proposta e a comparação dos planos': 'Clarify the offer and the plan comparison',
  'Reescrever a página de planos para explicar, na rotina do professor, o que muda com o Premium, como o preço por professor funciona e quais limites do plano gratuito deixam de ser suficientes.':
    'Rewrite the plans page to explain, in the teacher’s routine, what changes with Premium, how per-teacher pricing works and which free-plan limits stop being enough.',
  'Pode reduzir mal-entendidos sobre preço e escopo sem alterar o modelo de cobrança.':
    'May reduce misunderstandings about price and scope without changing the billing model.',
  'É uma mudança de menor esforço técnico e pode ser medida na própria página de planos.':
    'It is a lower technical effort change and can be measured on the plans page itself.',
  'Aproveita o aumento simulado de visitas à página de planos como oportunidade de comunicação.':
    'Uses the simulated increase in plans page visits as a communication opportunity.',
  'Pode não resolver a conversão se a barreira principal for ativação ou valor percebido.':
    'May not fix conversion if the main barrier is activation or perceived value.',
  'Não altera os limites do plano gratuito nem o processo de compra escolar.':
    'Does not change the free-plan limits or the school purchase process.',
  'Mensagens mais claras podem aumentar o interesse sem gerar conversão.':
    'Clearer messaging may increase interest without generating conversion.',
  'Entrevistas com professores que visitaram a página de planos e não assinaram.':
    'Interviews with teachers who visited the plans page and did not subscribe.',
  'Dados de interação na página de planos por segmento de usuário.':
    'Plans page interaction data by user segment.',
  'Critérios que os professores usam para comparar os planos.':
    'Criteria teachers use to compare plans.',
  'Reduzir o esforço de ativação até a primeira turma configurada':
    'Reduce activation effort up to the first configured class',
  'Simplificar o onboarding, adiar dados que podem ser preenchidos depois e garantir que o professor chegue a uma primeira turma funcional antes de explorar recursos avançados.':
    'Simplify onboarding, defer data that can be filled in later and ensure the teacher reaches a working first class before exploring advanced features.',
  'Ataca diretamente os relatos de abandono durante a configuração inicial.':
    'Directly targets reports of abandonment during initial setup.',
  'Pode aumentar a parcela de usuários que experimenta o valor do produto.':
    'May increase the share of users who experience the product’s value.',
  'Cria uma base mais sólida para que a comunicação do Premium faça sentido.':
    'Creates a stronger basis for Premium messaging to make sense.',
  'Pode exigir mais esforço de produto e engenharia do que a revisão da comunicação.':
    'May require more product and engineering effort than revising messaging.',
  'Pode melhorar a ativação sem aumentar a conversão paga.':
    'May improve activation without increasing paid conversion.',
  'Não endereça a percepção de preço nem a compra institucional.':
    'Does not address price perception or institutional purchase.',
  'Dados de abandono por etapa do onboarding.': 'Abandonment data by onboarding step.',
  'Entrevistas com professores que iniciaram e não concluíram a configuração.':
    'Interviews with teachers who started but did not complete setup.',
  'Definição do momento em que o professor percebe o primeiro valor.':
    'Definition of the moment when the teacher perceives first value.',
  'Testar um modelo de acesso mais flexível para escolas':
    'Test a more flexible access model for schools',
  'Investigar planos por escola ou por coordenação, com um processo de compra adequado a instituições, em vez de manter apenas a assinatura individual por professor.':
    'Investigate per-school or per-department plans, with a purchase process suited to institutions, instead of keeping only individual per-teacher subscriptions.',
  'Endereça relatos sobre compra institucional e necessidade de nota fiscal.':
    'Addresses reports about institutional purchase and invoice needs.',
  'Pode destravar o uso em escolas em que o professor não decide a compra.':
    'May unlock usage in schools where the teacher does not decide the purchase.',
  'Pode reduzir a percepção de que o plano gratuito já é suficiente.':
    'May reduce the perception that the free plan is already enough.',
  'Muda o empacotamento e a cobrança, com impacto potencial na receita.':
    'Changes packaging and billing, with a potential revenue impact.',
  'Aumenta a complexidade operacional, financeira e de suporte.':
    'Increases operational, financial and support complexity.',
  'A demanda por esse modelo ainda não foi medida.':
    'Demand for this model has not been measured yet.',
  'Mapear como escolas decidem e pagam por ferramentas educacionais.':
    'Map how schools decide on and pay for educational tools.',
  'Pesquisa de disposição a pagar por segmento.':
    'Willingness-to-pay research by segment.',
  'Comparar uso e conversão de professores individuais e vinculados a escolas.':
    'Compare usage and conversion of individual teachers and school-linked teachers.',
}

const productTour: Record<string, string> = {
  'Iniciar o tour?': 'Start the tour?',
  'O tour troca de página e pode descartar o que ainda não foi salvo aqui, como um formulário em edição ou o progresso do Interactive Case. Ele não cria, altera nem exclui registros.':
    'The tour changes pages and may discard what has not been saved here, such as a form in progress or Interactive Case progress. It does not create, change or delete records.',
  'Iniciar tour': 'Start tour',
  'Anterior': 'Previous',
  'Concluir': 'Finish',
  'Próximo': 'Next',
  'Pular bloco': 'Skip section',
  'Sair do tour': 'Exit tour',
  'Etapa {progress}: {title}': 'Step {progress}: {title}',
  '{current} de {total}': '{current} of {total}',
  'Para que serve o Product Decision Lab': 'What Product Decision Lab is for',
  'É um laboratório para praticar decisões de produto com base em evidências: você registra indicadores e relatos de usuários, formula hipóteses, compara alternativas e documenta a decisão.':
    'It is a lab for practicing evidence-based product decisions: you record metrics and user reports, form hypotheses, compare alternatives and document the decision.',
  'Este tour mostra como usar cada módulo. Ele só explica: não cria, altera nem exclui registros.':
    'This tour shows how to use each module. It only explains: it does not create, change or delete records.',
  'O fluxo e a navegação': 'The flow and the navigation',
  'O caminho típico é: métricas → feedbacks → hipóteses → alternativas → decisões. Cada módulo cuida de uma parte dele.':
    'The typical path is: metrics → feedback → hypotheses → alternatives → decisions. Each module handles one part of it.',
  'Use o menu para alternar entre Overview, Feedbacks, Decisions e Interactive Case. Em telas pequenas, o menu abre pelo botão no cabeçalho.':
    'Use the menu to switch between Overview, Feedbacks, Decisions and Interactive Case. On small screens, the menu opens from the button in the header.',
  'Seu Workspace e o cenário demonstrativo': 'Your workspace and the demo scenario',
  'O Workspace contém os registros que você cria e fica salvo neste navegador. Já os dados demonstrativos (a prévia da Overview e o Interactive Case) são fictícios, ficam separados e não entram no seu Workspace.':
    'The workspace contains the records you create and is saved in this browser. The demo data (the Overview preview and the Interactive Case) is fictional, stays separate and does not enter your workspace.',
  'A prévia demonstrativa aparece na Overview enquanto você não tiver indicadores.':
    'The demo preview appears in Overview while you have no metrics.',
  'Criar e editar indicadores': 'Create and edit metrics',
  'Um indicador tem nome, unidade (percentual, contagem, moeda, horas ou pontuação) e direção desejada: aumentar ou diminuir.':
    'A metric has a name, a unit (percentage, count, currency, hours or score) and a desired direction: increase or decrease.',
  'A direção define o que é favorável. Para uma taxa de cancelamento, por exemplo, diminuir é bom. Edite um indicador a partir do seu detalhe.':
    'The direction defines what is favorable. For a churn rate, for example, decreasing is good. Edit a metric from its detail.',
  'Observações, gráficos e variação': 'Observations, charts and change',
  'Abra um indicador para registrar observações mensais. Com elas, o detalhe mostra o gráfico histórico e a variação absoluta e relativa em relação ao período anterior.':
    'Open a metric to record monthly observations. With them, the detail shows the historical chart and the absolute and relative change from the previous period.',
  'Essas telas aparecem depois que você cadastra o primeiro indicador.':
    'These screens appear after you register your first metric.',
  'Classificação, vínculos e exclusão': 'Classification, links and deletion',
  'A variação é classificada como favorável ou desfavorável conforme a direção desejada. O aplicativo não diagnostica causas: isso é trabalho seu, com apoio de feedbacks.':
    'The change is classified as favorable or unfavorable according to the desired direction. The application does not diagnose causes: that is your work, supported by feedback.',
  'O detalhe do indicador lista os feedbacks e as decisões vinculados. Excluir um indicador pede confirmação e é bloqueado enquanto houver vínculos.':
    'The metric detail lists linked feedback and decisions. Deleting a metric asks for confirmation and is blocked while links exist.',
  'Registrar feedbacks': 'Record feedback',
  'Registre o relato do usuário com conteúdo, fonte (entrevista, ticket de suporte, survey, avaliação do app, comunidade ou outra), categoria e data.':
    'Record the user report with content, source (interview, support ticket, survey, app review, community or other), category and date.',
  'Você também pode associar o feedback a indicadores, manualmente.':
    'You can also associate the feedback with metrics manually.',
  'Pesquisar e filtrar': 'Search and filter',
  'Com feedbacks cadastrados, a pesquisa textual e os filtros por categoria, fonte e indicador ajudam a encontrar padrões.':
    'With feedback registered, text search and filters by category, source and metric help find patterns.',
  'Cada feedback pode ser editado ou excluído. Excluir pede confirmação.':
    'Each feedback can be edited or deleted. Deleting asks for confirmation.',
  'Feedbacks como evidência': 'Feedback as evidence',
  'Relatos dão contexto qualitativo a uma variação nas métricas e sustentam hipóteses nas decisões.':
    'Reports give qualitative context to a metric change and support hypotheses in decisions.',
  'Associar um feedback a um indicador não comprova causalidade: é um indício que você escolheu relacionar.':
    'Associating feedback with a metric does not prove causality: it is a signal you chose to relate.',
  'Problema, hipótese e alternativas': 'Problem, hypothesis and alternatives',
  'Um registro de decisão começa pelo problema investigado, seguido da hipótese de produto e das alternativas consideradas.':
    'A decision record starts with the problem investigated, followed by the product hypothesis and the alternatives considered.',
  'Escreva a hipótese como algo a ser testado, não como certeza.':
    'Write the hypothesis as something to be tested, not as certainty.',
  'Decisão, critérios e evidências': 'Decision, criteria and evidence',
  'Registre a decisão tomada, os critérios de sucesso e os próximos passos.':
    'Record the decision made, the success criteria and the next steps.',
  'Vincule os indicadores e feedbacks que sustentam a decisão. Excluir uma decisão não exclui esses registros; só remove o vínculo.':
    'Link the metrics and feedback that support the decision. Deleting a decision does not delete those records; it only removes the link.',
  'Status e exportação': 'Status and export',
  'Cada registro tem um dos cinco status:': 'Each record has one of five statuses:',
  'Validated é um status que você define manualmente. O aplicativo não faz validação estatística. No detalhe de uma decisão, é possível editá-la, excluí-la ou exportá-la em Markdown.':
    'Validated is a status you set manually. The application does no statistical validation. In a decision’s detail you can edit it, delete it or export it as Markdown.',
  'Draft (rascunho)': 'Draft',
  'Investigating (em investigação)': 'Investigating',
  'Decided (decidida)': 'Decided',
  'Validated (validada)': 'Validated',
  'Abandoned (abandonada)': 'Abandoned',
  'O caso do ProfResolve': 'The ProfResolve case',
  'É um cenário fictício, inspirado no ProfResolve, com três fases: Investigar os indicadores, Analisar feedbacks e selecionar evidências, e Decidir, formulando uma hipótese e avaliando alternativas até ver a síntese final.':
    'It is a fictional scenario inspired by ProfResolve, with three phases: Investigate the metrics, Analyze feedback and select evidence, and Decide, forming a hypothesis and evaluating alternatives until you see the final summary.',
  'A síntese exige hipótese, ao menos uma evidência e uma alternativa escolhida.':
    'The summary requires a hypothesis, at least one piece of evidence and a chosen alternative.',
  'Um cenário isolado': 'An isolated scenario',
  'O caso roda só em memória: não cria dados no seu Workspace e o progresso se perde ao sair da página.':
    'The case runs only in memory: it does not create data in your workspace and progress is lost when you leave the page.',
  'Não há inteligência artificial nem avaliação automática de acertos. A síntese apenas organiza o que você escolheu.':
    'There is no artificial intelligence or automatic scoring. The summary only organizes what you chose.',
  'Armazenamento, backup e por onde começar': 'Storage, backup and where to start',
  'Seus dados ficam apenas neste navegador, sem sincronização entre dispositivos. Limpar os dados do site pode apagá-los, e não há recuperação automática.':
    'Your data stays only in this browser, with no sync across devices. Clearing site data can delete it, and there is no automatic recovery.',
  'Exporte um backup JSON manualmente. Importar um backup substitui todo o Workspace atual.':
    'Export a JSON backup manually. Importing a backup replaces the entire current workspace.',
  'Para começar, crie um indicador na Overview ou experimente o Interactive Case. Você pode rever este tour quando quiser em "Como funciona".':
    'To start, create a metric in Overview or try the Interactive Case. You can revisit this tour anytime via "How it works".',
}

const system: Record<string, string> = {
  'Não foi possível concluir a operação.': 'Could not complete the operation.',
  '{label} é obrigatório.': '{label} is required.',
  '{label} deve ter no máximo {max} caracteres.': '{label} must have at most {max} characters.',
  '{label} deve ter no máximo {max} itens.': '{label} must have at most {max} items.',
  'O item {index} de {label} é muito longo.': 'Item {index} of {label} is too long.',
  '{label} não podem se repetir.': '{label} cannot repeat.',
  'Selecione no máximo {max} {label}.': 'Select at most {max} {label}.',
  'Um dos registros selecionados em {label} não existe mais.':
    'One of the records selected in {label} no longer exists.',
  'Selecione uma unidade válida.': 'Select a valid unit.',
  'Selecione a direção desejada.': 'Select the desired direction.',
  'Já existe um indicador com este identificador.': 'A metric with this identifier already exists.',
  'Indicador não encontrado.': 'Metric not found.',
  'Já existe uma observação para este indicador neste período.':
    'An observation already exists for this metric in this period.',
  'Use o formato AAAA-MM.': 'Use the YYYY-MM format.',
  'Já existe uma observação com este identificador.':
    'An observation with this identifier already exists.',
  'Observação não encontrada.': 'Observation not found.',
  'Selecione uma categoria válida.': 'Select a valid category.',
  'Selecione uma fonte válida.': 'Select a valid source.',
  'Já existe um feedback com este identificador.':
    'A feedback with this identifier already exists.',
  'Feedback não encontrado.': 'Feedback not found.',
  'Este feedback é evidência de {count} decisão(ões). Remova o vínculo antes de excluir.':
    'This feedback is evidence for {count} decision(s). Remove the link before deleting.',
  'Selecione um status válido.': 'Select a valid status.',
  'Já existe uma decisão com este identificador.':
    'A decision with this identifier already exists.',
  'Decisão não encontrada.': 'Decision not found.',
  'A hipótese é obrigatória neste status.': 'The hypothesis is required for this status.',
  'A decisão registrada é obrigatória neste status.':
    'The recorded decision is required for this status.',
  'Adicione ao menos um critério de sucesso para o status Validada.':
    'Add at least one success criterion for the Validated status.',
  'Conteúdo do feedback': 'Feedback content',
  'Alternativas': 'Alternatives',
  'Valor fora do intervalo suportado.': 'Value outside the supported range.',
  'Percentuais devem ficar entre 0 e 100.': 'Percentages must be between 0 and 100.',
  'Contagens não podem ser negativas.': 'Counts cannot be negative.',
  'Horas não podem ser negativas.': 'Hours cannot be negative.',
  'Não foi possível ler o armazenamento local para verificar conflitos.':
    'Could not read local storage to check for conflicts.',
  'LocalStorage indisponível neste navegador.': 'LocalStorage is unavailable in this browser.',
  'Workspace inválido: nada foi gravado.': 'Invalid workspace: nothing was saved.',
  'Workspace inconsistente: nada foi gravado.': 'Inconsistent workspace: nothing was saved.',
  'Não foi possível gravar no armazenamento local (cota ou permissão).':
    'Could not write to local storage (quota or permission).',
  'Não foi possível limpar o armazenamento local.': 'Could not clear local storage.',
  'Os dados deste Workspace foram alterados em outra aba. Atualize as informações antes de continuar para evitar perda de dados.':
    'The data in this workspace was changed in another tab. Refresh the information before continuing to avoid data loss.',
  'O arquivo não é um backup válido.': 'The file is not a valid backup.',
  'Envelope inválido.': 'Invalid envelope.',
  'Versão de schema ausente ou inválida.': 'Missing or invalid schema version.',
  'schemaVersion deve ser um inteiro positivo.': 'schemaVersion must be a positive integer.',
  'Backup criado por uma versão mais nova da aplicação.':
    'Backup created by a newer version of the application.',
  'Versão {version}, suportada até {supported}.':
    'Version {version}, supported up to {supported}.',
  'Não há migração disponível para este backup.': 'No migration is available for this backup.',
  'Nenhuma migração da versão {version}.': 'No migration from version {version}.',
  'A estrutura do backup é inválida.': 'The backup structure is invalid.',
  'O backup contém registros simulados e não foi importado.':
    'The backup contains simulated records and was not imported.',
  'O dataset demonstrativo não pode ser importado como dados do usuário.':
    'The demo dataset cannot be imported as user data.',
  'O backup contém inconsistências e não foi importado.':
    'The backup contains inconsistencies and was not imported.',
  'Decisão': 'Decision',
  'status': 'status',
  'O backup contém uma decisão incompatível com as regras do Workspace. Verifique os campos obrigatórios para o status informado. {guidance}':
    'The backup contains a decision incompatible with the workspace rules. Check the required fields for the informed status. {guidance}',
  'Se você ainda possui acesso ao Workspace de origem, abra as decisões indicadas, preencha os campos obrigatórios para seus status e exporte um novo backup. Se você possui apenas este arquivo JSON, mantenha uma cópia segura. Esta versão não oferece regularização automática de decisões durante a restauração.':
    'If you still have access to the source workspace, open the indicated decisions, fill in the required fields for their statuses and export a new backup. If you only have this JSON file, keep a safe copy. This version does not offer automatic decision fixing during restore.',
  'O arquivo excede o limite de 5 MB.': 'The file exceeds the 5 MB limit.',
  'Tamanho recebido: {bytes} bytes.': 'Received size: {bytes} bytes.',
  'O arquivo não contém JSON válido.': 'The file does not contain valid JSON.',
  'Falha ao interpretar o conteúdo.': 'Failed to parse the content.',
  '{label}: identificador duplicado ({id}).': '{label}: duplicate identifier ({id}).',
  'Observação {id}: indicador inexistente.': 'Observation {id}: metric does not exist.',
  'Observação {id}: {error}': 'Observation {id}: {error}',
  'Indicador {metricId}: mais de uma observação no período {period}.':
    'Metric {metricId}: more than one observation in period {period}.',
  'Feedback {id}: indicadores relacionados duplicados.': 'Feedback {id}: duplicate related metrics.',
  'Feedback {feedbackId}: indicador inexistente ({id}).':
    'Feedback {feedbackId}: metric does not exist ({id}).',
  'Decisão {id}: indicadores relacionados duplicados.':
    'Decision {id}: duplicate related metrics.',
  'Decisão {id}: feedbacks relacionados duplicados.':
    'Decision {id}: duplicate related feedback.',
  'Decisão {decisionId}: indicador inexistente ({id}).':
    'Decision {decisionId}: metric does not exist ({id}).',
  'Decisão {decisionId}: feedback inexistente ({id}).':
    'Decision {decisionId}: feedback does not exist ({id}).',
  'Nenhum indicador relacionado.': 'No related metrics.',
  'Último valor: {value}': 'Latest value: {value}',
  'Período: {period}': 'Period: {period}',
  'Nenhum feedback relacionado.': 'No related feedback.',
  'Categoria: {label}': 'Category: {label}',
  'Fonte: {label}': 'Source: {label}',
  'Data: {date}': 'Date: {date}',
  'Conteúdo: {content}': 'Content: {content}',
  'Título': 'Title',
  'Não registrada.': 'Not recorded.',
  'Gerado pelo Product Decision Lab.': 'Generated by Product Decision Lab.',
  'Este documento registra uma decisão de produto e suas evidências. Uma hipótese registrada não é um resultado validado automaticamente.':
    'This document records a product decision and its evidence. A recorded hypothesis is not an automatically validated result.',
  'Criado em: {date}': 'Created on: {date}',
  'Atualizado em: {date}': 'Updated on: {date}',
  'Registro de raciocínio: problema, hipótese, alternativas, decisão, evidências e critérios de sucesso.':
    'Reasoning record: problem, hypothesis, alternatives, decision, evidence and success criteria.',
  'Hipótese': 'Hypothesis',
  'Alternativas consideradas': 'Alternatives considered',
  'Critérios de sucesso': 'Success criteria',
  'Direção desejada': 'Desired direction',
  'Etapa {index} · {label}': 'Step {index} · {label}',
}

export const EN_MESSAGES: Record<string, string> = {
  ...shared,
  ...navigation,
  ...overview,
  ...feedbacks,
  ...decisions,
  ...interactiveCase,
  ...productTour,
  ...system,
}
