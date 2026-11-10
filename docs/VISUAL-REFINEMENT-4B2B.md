# Etapa 4B.2b — Refinamento visual dos detalhes e formulários do Product Analytics

## 1. Status final

**APPROVED WITH LIMITATIONS.** Diálogo de detalhes, histórico, formulário de observação, formulário de
indicador e confirmações de exclusão foram refinados, inspecionados em 4 larguras e a jornada CRUD completa
foi executada no navegador em workspace isolado. As limitações (seção 16) vêm de componentes globais que
esta etapa não podia tocar.

## 2. Problemas identificados (inspeção com dados de teste)

- Título do indicador pequeno e três blocos competindo no topo: selos (unidade/direção/contagem), cartão
  "Último valor" e cartão "Variação", com rótulos em caixa-alta.
- Aviso vermelho de variação desfavorável repetia o selo "Desfavorável" logo acima.
- Todos os `h2` com o mesmo peso (14 px) — nenhuma seção se destacava.
- Estado vazio dizia duas vezes "Nenhuma observação registrada".
- Tabela do histórico: período em cinza, valor alinhado à esquerda, sem fonte mono, botões "Editar/Excluir"
  sem nome por observação (leitor de tela ouvia "Editar" repetido).
- Confirmações de exclusão sem foco inicial e sem o valor/consequência claros; "Excluir indicador" em
  vermelho sólido competia com a ação segura.
- Formulário de observação: rótulo "Valor (currency)/(hours)" com o identificador interno da unidade;
  botão Cancelar fantasma; mensagem de erro repetida (aviso no topo + erro no campo); nenhum estado
  "salvando"; campo inválido sem borda de erro.
- Formulário de indicador: dica de direção genérica ("Se subir ou cair…"); mesma duplicação de erro.
- Gráfico no diálogo (390 px): rótulos de moeda do eixo Y cortados no lado esquerdo.
- Tabela do histórico com moeda estourava a largura do diálogo em 390 px (rolagem interna, "Excluir" cortado).

## 3. Melhorias implementadas

- Hierarquia do diálogo: nome → linha mono (unidade · direção desejada · nº de observações) → painel único
  com valor atual e variação → gráfico → histórico → evidências → gerenciar.
- Valor atual aparece uma vez (mono 4xl); variação com ícone de tendência, selo textual, relativa rotulada e
  "Antes: valor em período", como nos cartões da 4B.2a.
- Seções em fonte de display (`text-xl`); contagens e valores em mono; rótulos em caixa-alta removidos.
- Histórico: período em `th scope="row"` (semântica preservada), valores alinhados à direita em mono,
  ações com `aria-label` por período; no celular as ações viram ícones (Editar/Excluir permanecem no nome acessível).
- Confirmações: grupo com rótulo, valor e período da observação, "Esta ação não pode ser desfeita", foco
  inicial em Cancelar, botão destrutivo sólido só dentro da confirmação; gatilho de excluir indicador agora é outline vermelho.
- Formulários: erro de campo sem aviso duplicado no topo, borda/anel de erro nos campos inválidos,
  estado "Salvando…" com botão desabilitado (evita duplo envio), rótulo "Valor · Moeda/Horas/…", dica de
  direção que descreve a consequência ("Valores menores contam como favoráveis"), Cancelar como outline.
- Gráfico no diálogo: rótulos de moeda do eixo Y em notação compacta (tooltip e legenda mantêm valor exato).

## 4. Arquivos modificados

- `src/features/overview/metric-detail-dialog.tsx`
- `src/features/overview/observation-form.tsx`
- `src/features/overview/metric-form-dialog.tsx`
- `src/features/overview/metric-chart.tsx` (apenas formatação/largura do eixo Y)

Nenhum teste, componente global, token, domínio, storage, rota ou backup foi alterado.

## 5–7. Diálogo, histórico e formulários

Ver seção 3. Regras de validação, limites, duplicatas e formatação numérica permanecem as do domínio; o
formulário continua chamando `createMetric/updateMetric/createObservation/updateObservation` sem mudança.

## 8. Confirmações de exclusão

Mantidas e obrigatórias (observação e indicador). Indicador vinculado a decisões/feedbacks continua sem botão
de excluir, com o aviso de dependências existente. A exclusão do indicador remove suas observações (regra
existente), agora dito com a consequência na confirmação.

## 9. Estados de erro

Erro de campo (`role="alert"` do `Field`), erro geral (`Notice`) só quando não há erro de campo, falha de
gravação/conflito continuam chegando via `result.error` (não alterado). O fluxo de conflito entre abas não foi
exercitado nesta etapa (exigiria duas abas); permanece como estava (ver P3 documentado).

## 10. Responsividade

1440, 1280, 768 e 390: sem rolagem horizontal da página nem do conteúdo do diálogo; diálogo cabe na altura
com rolagem interna; título de 80+ caracteres quebra em 3 linhas; formulário de observação aberto com erro,
tabela com moeda e confirmação de exclusão verificados em 390.

## 11. Acessibilidade

Labels/IDs e `aria-describedby` preservados; `aria-label` por observação nas ações; confirmações com
`role="group"` + foco inicial; estado por texto + ícone + cor; ícones decorativos `aria-hidden`.
Foco volta ao `body` ao fechar um detalhe aberto por URL (`?metric=`) — comportamento do `Dialog` global,
não alterado. Contraste não medido com ferramenta automática.

## 12–14. Testes e gates

- `npm test`: **389 aprovados** (25 arquivos), nenhum alterado ou adicionado.
- `npm run typecheck`, `npm run lint`, `npm run build`: sem erros.

## 15. Jornadas realizadas no navegador (perfil isolado, dados apagados ao final)

Indicador com direção "diminuir" (horas): criado → duas observações (10 h, 8,5 h) → detalhe mostra
**Favorável** para a redução → editar indicador (nome mudou, **ID preservado**) → editar observação (8,5→6,5,
gráfico/valor atualizados) → excluir observação com confirmação → recarga (persistiu, detalhe reabriu) →
excluir indicador com confirmação → estado vazio. Também: validação inválida ("abc", nome vazio),
indicador com nome longo e moeda em 4 larguras.

## 16. Limitações restantes

- `Field` (global) mostra "OBRIGATÓRIO" em caixa-alta 10 px além do asterisco e some a dica quando há erro; o
  `Dialog` global usa título `text-base` e foco fecha no `body` quando aberto por URL. Ficam para o acabamento
  dos componentes compartilhados.
- Ações da tabela viram ícones no celular (alvo 32 px, abaixo de 44 px).
- Conflito entre abas e falha de gravação não foram simulados visualmente.
- Tooltip do gráfico no hover e contraste automatizado não verificados.
- Caso de indicador vinculado a decisões não exercitado no navegador (não há decisões no workspace de teste).

## 17. Possíveis regressões

- Rótulo do campo de valor mudou de "Valor (%)" para "Valor · Percentual".
- Mensagem geral do formulário não aparece mais quando há erro de campo (o erro do campo permanece).
- Eixo Y de moeda agora compacto ("R$ 1,35 mi").

## 18. Preparação para a próxima etapa

Restam: componentes compartilhados (`Field`, `Dialog`, `Notice`), diálogos de backup/importação, formulários e
detalhes de Feedbacks/Decisões, prévia demonstrativa. O padrão painel-de-valor + variação e a confirmação
destrutiva agrupada podem ser reaproveitados.
