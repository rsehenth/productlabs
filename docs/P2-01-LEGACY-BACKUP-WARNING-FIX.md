# P2-01 — Aviso de backups incompatíveis e orientação de recuperação

## 1. Status final
**APPROVED WITH LIMITATIONS** (ver seção 15). Nenhum deploy, commit ou push realizado.

## 2. Causa raiz
A exportação serializava o Workspace sem verificar as regras de status que a importação (WFA-02) aplica. Decisões legadas incompatíveis geravam um arquivo confirmado como "Backup JSON exportado." que seria recusado na restauração.

## 3. Estratégia
- Função pura `findIncompatibleDecisions(workspace)` em `src/lib/backup.ts`, calculada a cada render a partir do Workspace atual (nada armazenado).
- Componente `ExportBackupButton` concentra o fluxo de exportação (antes duplicado em dois lugares). Sem incompatibilidades: baixa direto. Com incompatibilidades: `Dialog` existente com aviso, lista e duas ações (**Revisar decisões** → navega para Decisions; **Baixar cópia mesmo assim**).
- Importação: a mensagem de erro específica de decisão incompatível recebe a orientação contextual (`DECISION_IMPORT_GUIDANCE`).

## 4. Arquivos modificados
- `src/lib/backup.ts` (detector, constante de orientação, uso do detector na importação)
- `src/features/overview/export-backup-button.tsx` (novo)
- `src/features/overview/overview-page.tsx` (usa o componente; tom do aviso)
- `src/features/overview/import-backup-dialog.tsx` (botão "Exportar dados atuais antes de importar" usa o mesmo componente)
- `src/lib/p201-legacy-backup-warning.test.ts` (novo)

## 5. Reutilização das regras do WFA-02
`findIncompatibleDecisions` apenas chama `decisionStatusErrors` (fonte única). A importação passou a usar o mesmo detector; as mensagens de pendência exibidas são as próprias mensagens da regra. Nenhuma regra duplicada ou alterada.

## 6. Exportação válida
Inalterada: download direto, aviso "Backup JSON exportado." (tom sucesso), mesmo formato JSON, sem etapa extra.

## 7. Exportação incompatível
Diálogo com texto sugerido, quantidade, e por decisão: título, status (rótulo em português) e pendência. Após o download: "Cópia JSON exportada. Este arquivo contém decisões incompatíveis e ainda não é restaurável pelo fluxo normal. Regularize os registros indicados e gere um novo backup." em tom informativo (não de sucesso).

## 8. Preservação dos dados
O mesmo `serializeBackup` é usado; nada é removido, normalizado ou corrigido. Verificado em teste e no navegador (`data` do arquivo idêntico ao Workspace semeado).

## 9. Orientação na importação
Acrescentada à mensagem principal apenas no erro de decisão incompatível; as linhas detalhadas por decisão permanecem. JSON malformado e versão incompatível não recebem a orientação (testado). A validação não foi enfraquecida.

## 10. Testes adicionados (9)
`src/lib/p201-legacy-backup-warning.test.ts`: A, B, C, D/E, F, G, H (duas), I.

## 11. Total de testes
389 aprovados (380 anteriores + 9), 25 arquivos.

## 12. Gates
`npm run typecheck`, `npm run lint`, `npm test`, `npm run build`: todos aprovados (build com o aviso preexistente de chunk > 500 kB).

## 13. Jornadas no navegador (Chromium, Playwright, Workspace isolado, dados fictícios)
- **Jornada 2 (legado):** Workspace semeado com decisão Validada sem critério + rascunho vazio. Aviso exibido listando só "Revisar onboarding / Validada / Pendência: critério de sucesso"; rascunho não listado. Download realizado; `data` idêntico ao original; mensagem pós-download correta.
- **Jornada 3 (regularização):** "Revisar decisões" levou a Decisions; decisão editada pelo formulário existente (critério adicionado); nova exportação sem diálogo; restauração em contexto isolado importou 2 decisões; arquivo legado equivalente foi recusado com orientação.
- **Jornada 1 (exportação válida):** coberta pelo fluxo final da Jornada 3 (export normal, "Backup JSON exportado.", restauração em outro contexto). Não houve execução separada começando de Workspace vazio.

## 14. Regressões
Todos os 380 testes anteriores (WFA-01/02/03) passam sem alteração. O controlador de seleção (`backup-selection`), Web Locks, schema e formato JSON não foram tocados.

## 15. Limitações
- Sem testes de componente (o projeto não tem ambiente DOM); o diálogo foi validado só no navegador.
- A orientação de importação aparece concatenada à mensagem principal (não como bloco separado) para não alterar o controlador do WFA-03.
- "Revisar decisões" leva à lista de Decisions; não destaca quais registros corrigir.
- O botão "Exportar dados atuais antes de importar" também mostra o aviso e, com "Revisar decisões", fecha o diálogo de importação.

## 16. Riscos de publicação
Usuários com dados legados dependem de corrigir manualmente cada decisão. Não há recuperação automática. Esta correção não declara a aplicação pronta para publicação.
