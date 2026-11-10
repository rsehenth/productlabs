# Etapa 4B.3b — Refinamento dos formulários e interações do Feedback Discovery

## 1. Status final
**APPROVED WITH LIMITATIONS** (ver seção 18). Não é uma declaração de que a aplicação está pronta para publicação.

## 2. Problemas identificados
- O formulário não tinha estado de salvamento: envio duplo possível e diálogo fechável durante a gravação.
- Erro de campo aparecia duplicado (aviso geral + mensagem no campo).
- Data com rótulo longo quebrava o alinhamento do grid; conteúdo sem prioridade visual.
- Seleção de indicadores sem contagem, sem aviso de que a associação não é causal e com alvo de toque pequeno.
- Confirmação de exclusão não identificava o registro e podia ser acionada duas vezes.

## 3. Melhorias realizadas
Formulário: estado `saving` local (mesma abordagem de `MetricFormDialog`/`ObservationForm`), botão "Salvando…", Cancelar e fechamento (Esc/X) bloqueados durante a gravação, dados mantidos em caso de falha. Aviso geral só aparece quando não há erro de campo (padrão do Analytics); erros de persistência e de conflito continuam visíveis. Textarea maior com dica; categoria, fonte e data em uma linha no desktop; indicadores com contagem, texto "associação manual, não prova causa", linhas de 44 px+, destaque do selecionado, foco visível e quebra de nomes longos.
Exclusão: o diálogo mostra categoria · data · trecho de até 120 caracteres do conteúdo, `pending` impede duplo clique e mostra "Excluindo…".

## 4. Arquivos modificados
- `src/features/feedbacks/feedback-form-dialog.tsx`
- `src/features/feedbacks/feedbacks-page.tsx`
- `src/components/ui/confirm-dialog.tsx` (prop opcional `pending`, compatível com o uso existente em `workspace-banners.tsx`)
- Nenhum teste alterado ou removido.

## 5–6. Criação e edição
Mesmo componente (arquitetura preservada). Na edição, conteúdo, categoria, fonte, data e indicadores vieram corretamente preenchidos; o ID foi preservado após salvar.

## 7. Categorias e fontes
`<select>` nativos, opções do domínio inalteradas, sem cores semânticas. Navegação por teclado nativa.

## 8. Indicadores
Verificados no navegador: 0 selecionados, 1 e 2 selecionados, nome longo (indicador do onboarding). Sem associação automática; seleção opcional. Cenário "nenhum indicador cadastrado" mantido no código, não exercitado no navegador.

## 9. Confirmação de exclusão
Foco inicial no botão "Fechar" (seguro). Cancelar mantém o registro; confirmar remove. Bloqueio por decisões vinculadas inalterado (agora também exibe o trecho do feedback); não testado no navegador nesta etapa.

## 10. Erros e salvamento
Campo obrigatório vazio validado no navegador. Falha de gravação/conflito: o diálogo permanece aberto, o texto digitado é mantido e a mensagem é exibida. O estado "Salvando…" é visual e curto (gravação local); não foi capturado em tela.

## 11. Responsividade
Desktop e mobile (390×844) inspecionados: diálogo com 358 px, sem rolagem horizontal, rolagem vertical interna, ações fixas no rodapé, linhas de indicador com 52 px. Tablet (768) e 1280 não inspecionados separadamente; o grid usa o mesmo breakpoint `sm`.

## 12. Acessibilidade
Labels associados, `aria-invalid`/`aria-describedby` nos campos, checkboxes com rótulo envolvente, anel de foco no item selecionado, Esc fecha (exceto durante gravação). Nada dependente só de cor (texto "N selecionado(s)").

## 13. Jornada CRUD (navegador, workspace demo local com dados fictícios)
Criar (categoria Defeito, fonte Ticket, 2 indicadores) → aparece na lista → editar (texto, categoria → Usabilidade, remover 1 indicador) → ID idêntico, 16 registros → busca por texto, filtros de categoria, fonte e indicador (inclusive resultado vazio) → recarregar: persistiu → excluir/cancelar: registro mantido (16) → excluir/confirmar: 15 → recarregar: continua excluído. Campo obrigatório vazio exibiu erro junto ao campo.
Não executado separadamente: edição cancelada e verificação explícita de que os demais registros ficaram idênticos (contagem 15/16 conferida).

## 14. Teste entre abas
Duas abas no mesmo contexto: B abriu a edição, A criou um feedback, B tentou salvar. A gravação foi recusada, a alteração de A foi preservada, a mensagem "Os dados deste Workspace foram alterados em outra aba…" apareceu e "Atualizar dados" recarregou o estado mantendo o diálogo aberto com o texto digitado.

## 15–17. Testes e gates
`npm run typecheck`, `npm run lint`, `npm run build`: aprovados. `npm test`: **389 de 389 aprovados** (25 arquivos). Nenhum teste novo (mudanças só de apresentação/estado local).

## 18. Limitações restantes
- Após cancelar/confirmar exclusão, o foco volta ao `body`, não ao botão "Excluir" (o diálogo não usa `Trigger` do Radix). Correção é no `Dialog` compartilhado → registrar para a 4B.6.
- Erro de campo não some ao digitar (só no próximo envio); o texto "Salvando…" e o bloqueio duplo não foram exercitados com latência artificial.
- O formulário é um diálogo único; em alturas pequenas o bloco de indicadores exige rolagem interna.

## 19. Possíveis regressões
Baixas: `ConfirmDialog` ganhou prop opcional; ao `pending`, o fechamento é ignorado. Listagem da 4B.3a não foi tocada.

## 20. Preparação para a 4B.4
Sem pendências bloqueantes. Registrar o retorno de foco dos diálogos para a 4B.6.
