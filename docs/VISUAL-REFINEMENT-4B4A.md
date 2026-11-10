# Etapa 4B.4a — Refinamento visual do Decision Workspace (listagem)

## 1. Status final
**APPROVED WITH LIMITATIONS.** Apenas a listagem foi refinada; formulário e detalhe ficam para a 4B.4b. O Decision Workspace não está inteiramente refinado.

## 2. Problemas identificados
- Quatro cards em grade (estilo KPI) para uma lista de documentos de raciocínio; três StatCards repetiam o padrão de Analytics.
- Hipótese e decisão registrada não apareciam na listagem.
- Evidências reduzidas a uma linha de contagens sem rótulo de categoria.
- Status `abandoned` com cor destrutiva e `validated` com cor de sucesso (semântica enganosa).
- Botão "Abrir registro" sem nome acessível distinto por registro.
- Títulos de card como `h2` sem `h2` de seção.

## 3. Direção visual
Lista em linhas separadas por divisórias (documento, não painel), coluna de identificação (status + data) à esquerda e conteúdo à direita, largura de leitura de 68ch, tokens existentes, mono apenas em dados/metadados. Composição distinta da de Feedbacks (sem citação como elemento principal; há bloco de raciocínio rotulado).

## 4. Arquivos modificados
- `src/features/decisions/decisions-page.tsx`
- `src/features/decisions/decision-status-badge.tsx` (apenas cores)
- `docs/VISUAL-REFINEMENT-4B4A.md`

## 5. Organização da página
Cabeçalho → resumo em texto (registros, em investigação, decididas: mesmos dados de antes) → busca/filtro → contagem exibida → lista.

## 6. Registros
Nível 1 título + status; 2 problema (3 linhas, truncado em 240); 3 hipótese ou decisão registrada (2 linhas, truncado em 200); 4 evidências; 5 data e ação. Texto integral permanece no detalhe existente.

## 7. Status
Lista confirmada em `domain.ts`: draft, investigating, decided, validated, abandoned; rótulos em português existentes. Sempre texto; cor neutra, exceto "Em investigação" (acento). `validated` e `decided` usam a mesma variante, `abandoned` usa outline. Sem funil ou progressão. **Nota:** o badge é compartilhado com o detalhe, que também recebe essas cores (impacto visual mínimo, sem mudança de comportamento).

## 8. Hipótese x decisão
Rótulo "Hipótese" para rascunho/investigação/abandonada (cai para a decisão registrada se não houver hipótese). Rótulo "Decisão registrada" para decidida/validada. Rascunho sem texto não mostra bloco nem alerta.

## 9. Evidências
"Evidências vinculadas: Indicadores N · Feedbacks N" (quantitativo x qualitativo), mais "Alternativas N" (já existia). Sem vínculos: "Sem evidências vinculadas", sem alerta. Mantido o nível de detalhe anterior (contagens por ID).

## 10. Busca e filtros
Existentes: busca por título/problema e filtro por status; lógica (`decision-query.ts`) intocada. Só ajuste de layout (campo + select de 14rem).

## 11. Estados vazios
Sem decisões, sem resultados e "Limpar busca e filtros" já existiam e foram preservados sem alteração.

## 12. Responsividade
Verificado programaticamente em 390 (sem overflow horizontal, título e problema longos contidos), 1280 (sem overflow). Em < sm o botão de abrir tem 44 px de altura. 1440 e 768 vistos apenas por screenshot reduzido / sem medição própria.

## 13. Acessibilidade
`h1` → `h2` (sr-only "Lista de decisões") → `h3` por título; `ul`/`li`/`article`; botão com `aria-label="Abrir registro: <título>"`; status por texto. Foco visível vem do botão compartilhado (não verificado visualmente). Contraste dos metadados usa `text-muted-foreground` existente, não medido.

## 14–16. Testes e gates
Nenhum teste novo (alteração apenas de apresentação; não há testes de componente de página no projeto). **389/389 testes aprovados**, typecheck, lint e build aprovados.

## 17. Jornadas no navegador
BrowserContext do painel interno com dados fictícios (removidos ao final): 1 e 6 e 30 registros inspecionados (os conjuntos de 5 e 15 não foram renderizados separadamente), abrir detalhe, abrir edição (campos preenchidos), cancelar, busca com resultado, busca sem resultado, recarregar (30 registros persistiram). Navegação para outro módulo e retorno não foi exercitada separadamente.

## 18. Limitações
- Sem verificação de tablet (768) com medições; capturas no painel são reduzidas.
- Cinco status só visualmente conferidos na amostra de 30 registros.
- Linha de evidências quebra em 390 px de forma aceitável, mas não ideal (separador "·" no fim da linha).
- `StatCard` deixou de ser usado nesta página (continua exportado).

## 19. Possíveis regressões
Cor do badge de status no detalhe (abandonada/validada). Nenhuma lógica alterada.

## 20. Para a 4B.4b
Formulário e diálogo de detalhe não foram analisados. Revisar badge no detalhe, seção de evidências com nomes e consistência dos rótulos "Hipótese" / "Decisão registrada" entre listagem e detalhe.
