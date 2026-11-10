# WFA-03 — Correção da condição de corrida na leitura de backups

## 1. Status final

**APPROVED WITH LIMITATIONS.** O WFA-03 está corrigido e coberto por testes e por jornadas em Chromium. A aplicação não é declarada pronta para publicação: falta a revalidação final de integração e compatibilidade.

## 2. Causa raiz confirmada

Em `src/features/overview/import-backup-dialog.tsx` (versão anterior), `handleFile` era assíncrona e não tinha identidade de solicitação. O problema ia além do `FileReader`:

- Depois de `await file.text()`, a leitura aplicava `setParsed`, `setError` e `setIssues` sem verificar se ainda era a seleção vigente.
- O `finally` chamava `setReading(false)` mesmo quando outra leitura estava pendente. O botão podia ser liberado durante uma leitura nova.
- `fileName` era atualizado de forma síncrona e `parsed` de forma assíncrona. Nome e conteúdo podiam divergir.
- `handleConfirm` importava o `parsed` do estado React, que podia pertencer a outra seleção.
- Nada impedia trocar o arquivo durante a gravação, nem invalidava leituras ao fechar o diálogo.

## 3. Arquivos modificados

- `src/lib/backup-selection.ts` (novo): controlador da seleção, sem React.
- `src/features/overview/import-backup-dialog.tsx`: passa a usar o controlador.
- `src/lib/backup-selection.test.ts` (novo): 10 testes.
- `docs/WFA-03-BACKUP-READ-RACE-FIX.md` (este relatório).

`backup.ts`, `replaceWorkspace`, `decisionStatusErrors` e o provider não foram alterados.

## 4. Estratégia adotada

`createBackupSelection(replaceWorkspace)` mantém um contador monotônico `seq`, o estado visível e o workspace validado. O diálogo lê o estado por `useSyncExternalStore` e guarda o controlador em `useState`.

Fases: `idle`, `reading`, `ready`, `invalid`, `importing`, `imported`, `failed`. Mensagens e componentes existentes foram reaproveitados. Foi acrescentada apenas a linha "Lendo arquivo…" e o rótulo "Importando…" no botão.

## 5. Como leituras antigas são invalidadas

Cada `select` faz `++seq`, descarta o validado anterior e entra em `reading`. Após cada `await`, a leitura compara `mine !== seq` e se descarta se não for a vigente. Isso vale para sucesso, erro de parse e rejeição de `file.text()`.

Ao desmontar o diálogo, `invalidate()` incrementa `seq`. Uma leitura de abertura anterior não altera nada, e uma nova abertura cria um controlador novo.

Não há cancelamento de leitura. A correção não depende dele.

## 6. Vínculo entre prévia e conteúdo validado

O resumo exibido e o `WorkspaceState` validado saem do mesmo `BackupParseResult`. O workspace fica no controlador, com o `seq` da seleção, e não em estado React. O resumo é zerado assim que uma nova seleção começa.

## 7. Proteção da confirmação

`confirm()` só executa em `ready` ou `failed`, com um validado cujo `seq` seja o vigente. Depois:

1. Captura o workspace validado.
2. Passa para `importing` de forma síncrona, o que bloqueia o segundo clique.
3. Chama o `replaceWorkspace` existente (sessão protegida por Web Locks, WFA-01).
4. Informa sucesso (`onImported`) somente após `ok`.

Durante `importing` e `imported`, `select` é ignorado e o `<input>` fica desabilitado. Se a gravação falhar, a fase vira `failed` com a mensagem de erro, e o usuário pode tentar de novo com o mesmo conteúdo validado.

## 8. Testes adicionados (10)

- A: B termina antes de A.
- B: A inválido termina depois de B válido.
- C: A válido termina depois de B inválido.
- Rejeição de leitura antiga.
- D: confirmação bloqueada durante leitura pendente.
- E: fechamento e reabertura.
- F: mesmo nome com conteúdos diferentes.
- G: o importado é igual (`toEqual`) ao validado, verificado em A e F.
- H: arquivo inválido não chama a substituição, verificado em C e J-WFA-02.
- I: clique duplicado e troca de arquivo durante a gravação.
- J-WFA-01: conflito de gravação não informa sucesso e permite nova tentativa.
- J-WFA-02: decisão `validated` sem campos mínimos continua recusada.

As leituras são controladas por Promises, sem atrasos arbitrários. Como verificação de mutação, remover a guarda `mine !== seq` fez 6 dos testes falharem.

## 9. Testes

**380/380 aprovados** em 24 arquivos: os 370 anteriores mais 10 novos.

## 10. Typecheck, lint e build

Typecheck, lint e build aprovados. O build mantém o aviso de chunk acima de 500 kB, que já existia e não foi alterado.

## 11. Jornadas em Chromium (Playwright, servidor Vite local)

O `File.prototype.text` foi instrumentado para que a conclusão de cada leitura fosse liberada manualmente, em ordem inversa:

- **S1:** A e depois B, com B terminando primeiro. B permaneceu (2 indicadores) e o botão ficou habilitado. O botão estava desabilitado durante a leitura.
- **S2:** válido seguido de inválido, com o válido terminando por último. O inválido prevaleceu e o botão ficou desabilitado.
- **S3:** inválido seguido de válido, com o inválido terminando por último. O válido prevaleceu, sem erro.
- **S5:** fechar durante a leitura e reabrir. O diálogo ficou limpo, sem resumo e com o botão desabilitado, mesmo depois de a leitura antiga terminar.
- **S6:** confirmação. O `localStorage` ficou com exatamente os indicadores de B.
- Console: zero erros.

Não foram executadas no navegador a importação de um arquivo grande, a falha de gravação (`failed`) nem o clique duplo. Esses dois últimos estão cobertos apenas por teste unitário.

## 12. Regressões WFA-01 e WFA-02

Os testes existentes de `workspace-session`, `backup` e `decision-rules` continuam passando. Os novos testes J cobrem o conflito de gravação e a recusa de decisão incompatível. `decisionStatusErrors` e `replaceWorkspace` não foram tocados.

## 13. Limitações restantes

- Não há teste de componente React (o projeto não tem jsdom nem Testing Library, e não foram adicionados). O diálogo foi validado apenas no navegador.
- O estado `failed` e o clique duplo da interface não foram exercitados no navegador.
- A recuperação de decisões legadas incompatíveis (WFA-02) permanece fora de escopo.
- O arquivo selecionado fica referenciado pelo `<input>` até o diálogo fechar. A leitura é feita uma única vez.

## 14. Riscos de publicação ainda existentes

- Falta a revalidação final de integração e compatibilidade, incluindo outros navegadores (só Chromium foi usado).
- O aviso de bundle acima de 500 kB continua presente.
- Os limites herdados do WFA-01 e do WFA-02, descritos em seus relatórios, continuam valendo.
