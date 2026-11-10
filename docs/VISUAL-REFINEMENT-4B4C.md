# Etapa 4B.4c — Fechamento funcional do Decision Workspace

## 1. Status final

**APPROVED WITH LIMITATIONS** (seção 16). As jornadas A–D foram executadas por completo no navegador; limitações são de escopo (acessibilidade global, título sem espaços).

## 2. Baseline confirmado

389 testes aprovados (25 arquivos), typecheck, ESLint e build aprovados antes de qualquer alteração.

## 3. Método

Script Playwright (Chromium) fora do projeto, contra o servidor de desenvolvimento, com um `BrowserContext` novo por jornada. Todas as decisões foram criadas e editadas pelo formulário da interface. Só indicadores e feedbacks fictícios (pré-requisito das jornadas B/C/D) foram semeados no `localStorage`. Persistência conferida lendo o `localStorage` após recarregar a página. 48 verificações, 48 aprovadas.

## 4. Evolução dos status (Jornada A) — aprovada

Rascunho → Em investigação (hipótese) → Decidida (decisão registrada) → Validada (critério) → Abandonada, cada passo salvo pelo formulário e seguido de recarga. Status conferido em cada etapa.

## 5. IDs e campos

- Mesmo ID (`decision-5e3cf3ca-…`) em todas as transições; sem duplicatas.
- Na decisão abandonada: hipótese, decisão registrada e critério de sucesso permanecem; o detalhe os exibe.
- Uma segunda decisão de controle ficou byte a byte idêntica.

## 6. Vínculos (Jornada B) — aprovada

m1+f1 → detalhe mostra só esses → adicionados m2+f2 → recarga: 4 vínculos → removidos m2 e f1 → recarga: `metricIds=[m1]`, `feedbackIds=[f2]`. Sem duplicados; indicadores e feedbacks inalterados; o detalhe final coincide com o estado salvo.

## 7. Persistência após recarga

Verificada em A, B e D (leitura do `localStorage` depois de `reload`).

## 8. Markdown real (Jornada C) — aprovada

Arquivo baixado `decisao-completa-aspas-acentuacao-cao-u-n.md` e lido. Contém título, status (Validada), problema, 2 indicadores, 2 feedbacks (categoria, fonte, data, conteúdo), hipótese, 2 alternativas numeradas, decisão, 2 critérios, 2 próximos passos, metadados e nota final. Caracteres especiais preservados (`“ ” & < > ü ñ ç ã → ≥ ≤ | \``). `localStorage` idêntico antes e depois da exportação.

Observações sobre o contrato atual (não são defeitos):
- O arquivo **não inclui IDs** de decisão, indicador ou feedback.
- Feedbacks são rotulados "Feedback 1", "Feedback 2" (numeração, não o ID).
- Texto com `|` ou crases entra sem escape; o `.md` renderizado pode se comportar de forma inesperada. Baixa gravidade; gerador não modificado.

## 9. Exclusão (Jornada D) — aprovada

Duas decisões temporárias. Cancelar manteve ambas e fechou o diálogo. Confirmar removeu só a primeira; a tela voltou à listagem com "Decisão excluída." e sem diálogo aberto. Após recarga a primeira continua ausente e a segunda está idêntica ao snapshot.

## 10. Responsividade

1440×900, 768×1024 e 390×844 com 8 decisões, 12 indicadores, 12 feedbacks, listas de 6 itens e textos longos, nas telas de listagem, detalhe, diálogo de exclusão e formulário completo: sem overflow horizontal (`scrollWidth == clientWidth`); botões de ação e "Salvar alterações" dentro da viewport; diálogo inteiramente visível; rolagem vertical normal.

## 11. Correção semântica da listagem

Antes: `Evidências vinculadas: Indicadores N · Feedbacks N · Alternativas N`.
Agora, em duas linhas:
- `Evidências: N indicador(es) · N feedback(s)` (ou `Sem evidências vinculadas`).
- `Alternativas consideradas: N`, só quando N > 0 (sem alerta nem linha para rascunhos sem alternativas).

Contagens inalteradas (`metricIds.length`, `feedbackIds.length`, `alternatives.length`). Verificado com quatro combinações (tudo, nada, só alternativas, só evidência).

## 12. Arquivos modificados

- `src/features/decisions/decisions-page.tsx` (apenas o bloco de contagens da listagem)
- `docs/VISUAL-REFINEMENT-4B4C.md`

## 13. Testes e gates

`npm run typecheck`, `npm run lint`, `npm test` e `npm run build`: todos aprovados. **389 testes aprovados**, nenhum removido ou adicionado. O build emite apenas o aviso já existente de chunk > 500 kB.

## 14. Defeitos encontrados

| # | Gravidade | Descrição |
|---|---|---|
| 1 | Baixa | Título de decisão de ~140 caracteres **sem nenhum espaço** gera overflow horizontal no detalhe (o `h1` do `PageHeader`, componente global, não quebra palavra). Com títulos normais (com espaços) não ocorre. Não corrigido: componente global fora do escopo. |
| 2 | Informativa | O Markdown não escapa `|` e crases (ver seção 8). |

## 15. Não executado

Teste entre abas (já feito no WFA-01 / 4B.4b). Foco e acessibilidade global (4B.6). Não houve captura visual formal; as imagens ficaram no diretório temporário da sessão.

## 16. Limitações restantes

- Defeito 1 pendente (correção em `PageHeader`: `break-words`).
- Indicadores e feedbacks de apoio foram semeados, não criados pela interface.
- Verificação feita em Chromium apenas.
- Sem teste automatizado novo para a separação da listagem.

## 17. Recomendação para a 4B.5

Seguir para a 4B.5. Incluir o `break-words` no título do `PageHeader` junto com a revisão de componentes globais, e tratar escape de Markdown apenas se for decidido que os arquivos serão renderizados em ferramentas externas.
