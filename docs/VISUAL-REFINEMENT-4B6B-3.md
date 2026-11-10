# Etapa 4B.6b.3 — Controles, contraste e diálogos

**Classificação: APPROVED WITH LIMITATIONS.** Auditoria por amostragem, não certificação WCAG da aplicação inteira.

## Baseline e método

Antes de editar: typecheck, lint, build e 392 testes em 26 arquivos passaram. Foram lidos os relatórios 4B.2b, 4B.3b, 4B.4b, 4B.4c e 4B.6a e `.impeccable/config.json`. A auditoria usou Chromium/Playwright, servidor local e contextos isolados com dados fictícios. Os componentes compartilhados de botão, campo, aviso e diálogo e as implementações das telas foram inspecionados.

O detector Impeccable, com a configuração do projeto, assinalou um `side-tab` em `case-evidence-summary.tsx`. É o filete de evidência intencional mencionado no pedido; foi preservado, assim como as exceções existentes. A varredura de código não mede contraste renderizado.

## Problemas reproduzidos e correções

Com o Web Lock de escrita retido artificialmente:

1. A exclusão de indicador permitia confirmar novamente, cancelar e fechar o diálogo enquanto pendente. A exclusão de observação tinha o mesmo fluxo sem proteção. Ambas agora bloqueiam ações concorrentes, repetição e fechamento, e exibem “Excluindo…”. A exclusão ocorre após o lock ser liberado.
2. O formulário de indicador podia fechar por Esc enquanto salvava; Cancelar também permanecia ativo. Agora preserva o formulário até a resposta e impede novo envio.
3. O editor de observação podia ser cancelado ou fechado por Esc durante a gravação. Agora mantém o diálogo e o rascunho, bloqueia Cancelar e ações concorrentes e conclui após liberar o lock.
4. A importação em andamento podia ser fechada por Esc ou Cancelar enquanto a substituição aguardava o lock. Agora o diálogo e suas ações ficam protegidos durante a operação; o formato e a lógica de backup não foram alterados.

Os quatro cenários foram novamente exercitados após a alteração. A confirmação de indicador e de observação ficou desabilitada, Esc não fechou o diálogo, e a operação concluiu após a liberação. Nos dois salvamentos, o texto digitado permaneceu. Na importação, Cancelar ficou desabilitado e a operação concluiu.

## Áreas de toque

Em 390 × 844, CSS pixels, medidos por `getBoundingClientRect`:

| Controle | Área medida | Observação |
| --- | --- | --- |
| Editar e excluir observação | 44 × 44 cada | 4 px entre caixas; antes relatados como 32 px, já estavam corrigidos no baseline. Edição e exclusão executadas. |
| Editar / excluir feedback | 59 × 44 / 62 × 44 | Ações individuais acionadas. |
| Novo feedback | 152 × 36 | Maior que 24 × 24; não foi ampliado apenas para atingir a referência de 44 px. |
| Seletores de feedback | 332 × 36 | Separados verticalmente; controles nativos. |
| Editar / excluir indicador | 135,8 × 36 / 141,3 × 36 | Espaço horizontal de 8 px; não foi observada sobreposição. |
| Fechar diálogo (X) | 44 × 44 | Dentro do diálogo. |
| Checkbox de evidência | input 16 × 16; label 134,6 × 44 | A label associada também aciona o checkbox. |
| Radio de alternativa | input 13–15 × 16; label 289–291 × 53,5 | A label associada amplia o alvo; teclado testado. |

44 × 44 é referência de usabilidade e o tamanho do critério AAA [2.5.5](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html), sujeito às exceções do critério. O [2.5.8 AA](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) usa 24 × 24 CSS px ou suas exceções, inclusive espaçamento. As medidas não comprovam conformidade de todos os alvos da aplicação. O toque físico e a precisão motora não foram testados.

## Contraste

Valores de estilos computados foram convertidos pelo canvas do Chromium para sRGB; fundos translúcidos foram compostos sobre os ancestrais e a razão calculada pela luminância relativa. Valores RGB arredondados; amostras de texto não usam pixels de borda com antialiasing. A referência para texto normal é 4,5:1 e, quando aplicável, para identificação visual de componentes e estados, 3:1: [contraste de texto](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) e [contraste não textual](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).

| Amostra | Primeiro plano RGB | Fundo RGB composto | Razão |
| --- | --- | --- | --- |
| Texto principal / label | 242, 240, 231 | 21, 20, 17 | 16,13:1 |
| Texto secundário e dica | 170, 168, 159 | 21, 20, 17 | 7,73:1 |
| Mensagem de erro | 229, 76, 74 | 21, 20, 17 | 4,79:1 |
| Texto do campo | 242, 240, 231 | 16, 15, 12 | 16,78:1 |
| Borda normal do campo contra seu fundo | 107, 105, 97 | 16, 15, 12 | 3,48:1 |
| Borda do campo inválido contra seu fundo | 229, 76, 74 | 16, 15, 12 | 4,99:1 |
| Botão primário | 30, 24, 2 | 249, 224, 63 | 13,28:1 |
| Botão destrutivo | 255, 246, 245 | 201, 47, 51 | 5,02:1 |
| Texto do aviso destrutivo | 242, 240, 231 | 42, 26, 23 | 14,63:1 |
| Texto do aviso informativo de importação | 242, 240, 231 | 29, 28, 25 | 14,93:1 |
| Cor de foco contra fundo do campo | 249, 224, 63 | 16, 15, 12 | 14,38:1 |

O placeholder de alternativa usa `oklch(0.73 0.012 95)`, opacidade 1, mesma cor medida no texto secundário; o fundo do campo é translúcido. Checkbox selecionado usa `accent-color: oklch(0.9 0.17 100)` e estado textual. O anel de foco foi visto no navegador; geometria e contraste em todos os fundos não foram auditados. A cor e a borda do checkbox nativo não foram medidas por pixels. Nenhuma falha de contraste foi comprovada nessas amostras; nenhuma cor foi alterada. Não se conclui a conformidade de todas as combinações ou estados.

## Diálogos e teclado

- Indicador: criação em 390 px, X, foco inicial no nome e retorno ao botão de abertura. Quinze Tabs percorreram campos, Cancelar, Criar e X, permanecendo no modal; saída pelo X funcionou. O estado pendente foi testado com lock retido.
- Observação: criação, edição e exclusão inline dentro do detalhe; Cancelar e Esc durante gravação pendente foram verificados. Confirmação destrutiva e exclusão pendente exercitadas.
- Feedback: criação, edição, exclusão cancelada e confirmada em 390 px; o diálogo de confirmação tinha título associado.
- Decisão: formulário e detalhe são páginas, não diálogos. Criada, aberta pela lista e fechada por Voltar; confirmação de exclusão aberta, cancelada e confirmada. O diálogo tinha título e descrição associados e foco inicial em Fechar.
- Importação: diálogo com título/descrição, largura 358 px em 390 px, Esc e retorno de foco para Importar backup; importação pendente testada. Aviso de exportação de backup incompatível foi inspecionado no código, mas não aberto em navegador nesta execução.
- Gaveta mobile: título acessível, 288 px de largura, foco inicial em Fechar navegação; Esc retornou ao botão Abrir navegação.
- Interactive Case: foco em checkbox e radio, Espaço selecionou cada um, seta para baixo mudou a alternativa. Não foi percorrida toda a ordem de Tab da página.

## Responsividade e jornadas

Nas quatro resoluções solicitadas, as quatro rotas foram medidas sem overflow horizontal de página e sem controles de `main` fora das bordas horizontais. Também foram medidas listas de feedback e decisões com um registro fictício, Interactive Case e detalhe de indicador com observação. O diálogo de histórico coube na viewport e teve rolagem interna: larguras externas de 896, 896, 736 e 358 px, respectivamente; no mobile o conteúdo interno tinha 1328 px de altura para 589 px visíveis. Ações do histórico foram acionadas após rolagem.

Jornadas A, B, C, E, F, G e H foram executadas nos limites acima. Na D, o detalhe real de decisão é uma página: abrir e voltar foram testados. A auditoria não testou todas as combinações de conteúdo longo, todos os controles em cada resolução ou todos os diálogos em todas as resoluções.

## Arquivos, testes e gates

- `src/features/overview/metric-detail-dialog.tsx`, `observation-form.tsx`, `metric-form-dialog.tsx` e `import-backup-dialog.tsx`: proteção dos estados pendentes.
- `tests/browser/refinement-4b6b.cjs`: regressões para salvamento de indicador e observação, exclusão pendente e importação pendente. As sequências equivalentes foram executadas em Chromium pela ferramenta Playwright; o roteiro não integra `npm test` e Playwright não é dependência local.
- Nenhum teste existente foi removido ou enfraquecido. Formato de backup, domínio, persistência, rotas e cores permanecem inalterados.

Depois das alterações: typecheck, lint, **392 testes** e build passaram. O build mantém o aviso anterior de chunk superior a 500 kB. Graphify foi atualizado.

## Limitações e próxima etapa

Sem leitores de tela, dispositivo físico, outros navegadores, teste completo de zoom, verificação integral de foco ou auditoria exaustiva de todos os estados de contraste. O aviso de exportação incompatível e todos os estados de erro de persistência não foram exercitados nesta etapa. O diretório não tem metadados Git para revisão por diff. Recomenda-se levar essas limitações à regressão integrada final da fase 4B, sem presumir conformidade integral de acessibilidade.
