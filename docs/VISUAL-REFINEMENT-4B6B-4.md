# Etapa 4B.6b.4 — Regressão integrada final

## Status e recomendação

**APPROVED WITH LIMITATIONS.** A jornada integrada principal, a restauração e os cenários de maior risco exercitados passaram, sem perda de dados ou regressão funcional observada. Recomenda-se encerrar a fase 4B dentro deste escopo e iniciar a preparação da 4C, mantendo as limitações abaixo. Isto não declara prontidão para produção ou conformidade integral com WCAG.

## Baseline e método

Em 09/11/2026, antes da auditoria: 392 testes em 26 arquivos, typecheck, ESLint e build aprovados. Foram consultados os relatórios 4B.1 a 4B.6a e 4B.6b.1–3, o roteiro `tests/browser/refinement-4b6b.cjs` e componentes e fluxos compartilhados pertinentes. Não há metadados Git neste diretório.

As jornadas desta etapa foram **automatizadas pela interface**, em Chromium headless, servidor Vite local e BrowserContexts novos, com dados fictícios. Nenhuma jornada foi executada manualmente por uma pessoa nesta etapa. As asserções de dados inspecionaram também o localStorage; os downloads reais foram lidos pelo Playwright. Verificações históricas não foram tratadas como reexecutadas. Scripts adicionais foram temporários; o roteiro existente permanece no projeto.

## Quality gates

| Comando | Resultado |
| --- | --- |
| `npm run typecheck` | Aprovado |
| `npm run lint` | Aprovado |
| `npm test -- --run` | 392/392 em 26 arquivos |
| `npm run build` | Aprovado, com aviso de chunk superior a 500 kB |
| `tests/browser/refinement-4b6b.cjs` | 12/12 aprovados, separado do `npm test` |

Build: `index-DLec6w7b.js` 829,53 kB (gzip 241,53 kB); CSS 44,17 kB (gzip 8,33 kB); gráfico 2,51 kB (gzip 1,15 kB); prévia 11,33 kB (gzip 3,97 kB); HTML 0,70 kB (gzip 0,42 kB). Não houve otimização de bundle.

O primeiro lançamento do roteiro falhou antes dos testes porque o Playwright disponível procurava uma revisão de Chromium ausente. Foi reexecutado com o executável headless já instalado, por wrapper temporário, sem instalação ou alteração do roteiro. Os 12 cenários passaram nessa execução.

## Product Analytics

Pela interface, criado indicador percentual de conversão com direção aumentar e observações de jan/2026 (4,5%) e fev/2026 (3,8%). Detalhe, histórico e gráfico apresentaram -0,7 p.p., -15,6% e Desfavorável. Editado fevereiro para 5,4%: após recarga, nome, dois períodos e valores permaneceram; a interface mostrou +0,9 p.p., +20% e Favorável. O gráfico foi inspecionado inicialmente; após recarga foi observado o estado de carregamento, sem nova inspeção visual do gráfico final. Fórmulas não foram alteradas.

## Feedback Discovery

Criados dois relatos, um vinculado ao indicador e outro sem vínculo. Busca por conteúdo e filtro pelo indicador excluíram o relato sem correspondência; o filtro foi limpo. O relato vinculado foi editado e, após recarga, havia exatamente dois feedbacks, conteúdo editado e ID do indicador preservado. Não foram exercitadas todas as opções dos filtros.

## Decision Workspace

Criada decisão com título, problema, hipótese, duas alternativas, decisão registrada, critério, próximo passo e vínculos ao indicador e ao feedback. O detalhe inicial mostrou campos e evidências. Os estados foram salvos na sequência Rascunho → Em investigação → Decidida → Validada. Após cada avanço houve recarga e asserções dos campos, status e vínculos armazenados; o detalhe foi aberto após salvar. Não foram alteradas regras de status.

## Exportação Markdown

O arquivo realmente baixado `decisao-conversao-teste.md` foi lido e continha todos os campos solicitados, status Validada, indicador com último valor e período, feedback vinculado, acentos, travessão e `&`. A estrutura tinha seções, listas e metadados. O gerador interpola texto do usuário diretamente: caracteres de sintaxe Markdown, como `*`, `#` ou colchetes, podem ser interpretados pelo leitor como marcação. Essa limitação do contrato foi identificada por inspeção de código; não foi testada exaustivamente nem alterada.

## Backup e restauração

Exportado o JSON real com `schemaVersion`, `exportedAt` e `data`. Importado em segundo BrowserContext isolado e recarregado: comparação profunda dos dados confirmou 1 indicador, 2 observações, 2 feedbacks e 1 decisão, incluindo IDs e relacionamentos. Backup substitui o workspace, não mescla.

Um JSON malformado foi recusado com “O arquivo não contém JSON válido. Falha ao interpretar o conteúdo.”; substituição desabilitada e armazenamento bruto idêntico antes e após tentativa e recarga. Outras classes de arquivo inválido não foram reexecutadas nesta jornada.

## Isolamento do Interactive Case

Com workspace preenchido, registrou-se o valor bruto. Foram selecionadas evidência e alternativa, preenchida hipótese, aberta síntese e alterada alternativa. Instrumentação de `Storage.prototype.setItem` e `removeItem` não registrou chamadas durante a interação; conteúdo bruto permaneceu igual. Após recarga a hipótese e evidências foram limpas, e o workspace continuou igual. Os dados demonstrativos são independentes dos registros do workspace.

## Conflitos entre abas

O roteiro automatizado reexecutou gravação concorrente e recusa obsoleta: conteúdo bruto preservado, aviso único, atualização, preservação do rascunho e salvamento posterior junto ao registro concorrente. Também passou a limpeza do aviso após descarte recusado, preservação de erro de campo e simulação de falha de leitura. A remoção concorrente de indicador preservou o rascunho da observação e informou que o indicador não existia. Escopo limitado aos cenários do roteiro.

## Operações pendentes

Com Web Lock de escrita retido artificialmente, o roteiro confirmou proteção de salvamento de indicador, salvamento de observação, exclusão de indicador e importação. Uma execução adicional confirmou exclusão de observação: confirmação e Cancelar desabilitados, Esc sem fechar, conclusão após liberação do lock. Não foram modificados Web Locks nem persistência.

## Navegação e acessibilidade

O roteiro passou validação com foco no primeiro campo inválido nos quatro formulários, preservação de rascunhos, foco após ações inline e retorno a ponto estável em detalhes abertos por URL. A gaveta mobile abriu e Esc devolveu foco ao botão de navegação. Diálogo de novo indicador apresentou título e descrição associados nas quatro resoluções. A inspeção é amostral; não houve leitor de tela, varredura completa de Tab, verificação visual integral do foco, teste físico de toque ou auditoria completa de labels e alvos.

Os contrastes amostrais de 4B.6b.3 não foram remedidos: componentes e tokens não foram alterados nesta etapa. A medição anterior não comprova todas as combinações e estados.

## Responsividade

Em 1440 × 900, 1280 × 800, 768 × 1024 e 390 × 844, as quatro rotas com dados fictícios apresentaram `scrollWidth` de página igual à largura da viewport e nenhum botão, input, select ou textarea de `main` fora das bordas horizontais. O diálogo de novo indicador coube na viewport, sem overflow horizontal interno, nos quatro tamanhos. Gaveta mobile foi aberta e fechada.

Essas medições não comprovam ausência de sobreposição, corte vertical ou problemas visuais em todos os conteúdos, formulários, diálogos e confirmações. Não foi feita inspeção visual sistemática de cada combinação nesta etapa; os resultados históricos não substituem essa lacuna.

## Erros encontrados e verificação técnica

Nenhum erro de JavaScript ou console de nível error, nem resposta HTTP local ≥ 400, foi capturado nas jornadas integradas instrumentadas. Isso inclui eventuais mensagens de erro React capturadas no console, mas não garante ausência em fluxos não percorridos. Nenhum defeito funcional foi reproduzido nos cenários executados. A divergência entre Playwright e Chromium era de ambiente de teste, resolvida para execução por wrapper temporário.

## Correções e arquivos modificados

Nenhuma alteração de código ou correção de produto. Não houve mudança de fórmulas, regras, persistência, schemas, arquitetura ou dependências. Nenhum teste foi removido ou enfraquecido.

- `docs/VISUAL-REFINEMENT-4B6B-4.md`: este relatório.

O build gerou os artefatos habituais em `dist`; os scripts de auditoria e o wrapper foram temporários fora do projeto. Sem Git, não é possível certificar uma lista de alterações preexistentes por diff.

## Limitações restantes e riscos para publicação

- Somente Chromium headless e dados fictícios; sem teste manual humano, outros navegadores, dispositivos físicos ou leitores de tela.
- Responsividade medida por geometria horizontal e um diálogo; sobreposições, corte e todos os estados não foram verificados visualmente de forma sistemática.
- Sem revisão integral de teclado, zoom, contraste ou todas as opções de filtros e importações inválidas.
- O roteiro existente depende de Playwright externo ao projeto e de navegador compatível; não integra `npm test`.
- Markdown insere texto sem escapar sintaxe; interpretação depende do leitor.
- O chunk principal acima de 500 kB pode afetar carregamento. Armazenamento é local ao navegador; substituição por backup é integral. Compatibilidade, acessibilidade completa, segurança e condições de publicação não foram certificadas. Sem histórico Git, a comparação formal de alterações também permanece limitada.

## Decisão de encerramento

- **A fase 4B pode ser encerrada?** Sim, com as limitações documentadas.
- **Os quatro módulos estão funcionalmente integrados?** Sim, nos fluxos exercitados: três compartilham dados e o Interactive Case permanece isolado por design.
- **Há perda de dados conhecida?** Nenhuma observada nos cenários executados; isso não prova ausência em todos os ambientes.
- **Há regressões conhecidas?** Nenhuma funcional reproduzida nesta execução. Permanecem a limitação de Markdown e as lacunas de cobertura descritas.
- **O que impede a preparação para publicação?** Nada demonstrado que impeça iniciar a preparação; a própria preparação deve avaliar os riscos e lacunas acima antes de qualquer decisão de publicação.
- **Pronto para iniciar a fase 4C?** Sim, como preparação, sem declarar prontidão para produção.

