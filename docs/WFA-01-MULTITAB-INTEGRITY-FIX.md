# WFA-01 — Correção da perda de dados entre abas (Etapa 4A.2a)

**Classificação final: APPROVED WITH LIMITATIONS** (ver seção 15). Somente o WFA-01 foi tratado. WFA-02 e WFA-03 permanecem pendentes.

## 1. Causa raiz confirmada
`WorkspaceProvider` carregava o Workspace uma vez e mantinha uma cópia local. `commit()` chamava `saveWorkspace()`, que reescrevia o envelope inteiro com `setItem`, sem comparar com o que já estava no storage. Uma aba desatualizada apagava registros gravados por outra e exibia sucesso. Não havia listener de `storage`.

## 2. Arquivos modificados
- `src/lib/storage/workspace-storage.ts`: `raw` no resultado de load; `saveWorkspace`/`clearWorkspace` aceitam `expectedRaw` e recusam com `conflict`; `CONFLICT_MESSAGE`.
- `src/lib/storage/write-lock.ts` (novo): `withWriteLock` sobre `navigator.locks`.
- `src/lib/storage/workspace-session.ts` (novo): lógica de uma "aba" (revisão, lock, estado `stale`, refresh), independente de React.
- `src/hooks/workspace-provider.tsx`, `src/hooks/use-workspace.ts`: delegam à sessão; operações passam a ser assíncronas; `stale` e `refreshWorkspace` no contexto; listener `storage`.
- `src/components/layout/stale-notice.tsx` (novo), `workspace-banners.tsx`, `ui/dialog.tsx`: aviso com ação de atualizar (também dentro de diálogos modais).
- Chamadores (`await`): `metric-form-dialog`, `metric-detail-dialog`, `observation-form`, `feedback-form-dialog`, `feedbacks-page`, `decision-form`, `decision-detail`, `import-backup-dialog`.
- `src/lib/storage/multitab.test.ts` (novo).

## 3. Estratégia técnica
Revisão otimista + exclusão mútua. A "versão" é o próprio conteúdo bruto do envelope (`savedAt` com milissegundos muda a cada gravação). **Schema inalterado** (`schemaVersion` 1), sem migração.

## 4. Coordenação entre abas
Toda gravação (criar/editar/excluir de indicador, observação, feedback e decisão; importação; descarte de dados inválidos) passa por `guarded()` em `workspace-session.ts`: `navigator.locks.request('product-decision-lab:workspace-write', exclusive)` → lê o storage → compara com a revisão esperada → recusa se diferir → senão valida e faz `setItem` → guarda a nova revisão → libera. Operações da mesma aba também são serializadas pelo lock. O evento `storage` só marca a aba como desatualizada antecipadamente; não substitui a verificação.

## 5. Navegadores sem Web Locks
Sem `navigator.locks` (ex.: contexto não seguro, HTTP fora de localhost) **todas as gravações são recusadas** com mensagem explicando que nada foi salvo. Não há fallback que simule segurança. Leitura e exportação continuam funcionando. Verificado no navegador.

## 6. Identificação da versão desatualizada
Sob o lock, `storage.getItem(KEY) !== revisão da aba` ⇒ conflito. A aba atualiza a revisão ao carregar, gravar ou atualizar.

## 7. Recuperação pelo usuário
Aviso (na página e dentro de diálogos) com a mensagem sugerida e o botão **Atualizar dados**. O texto informa que o que foi digitado em formulários abertos permanece na tela mas deve ser revisado, e que fechar o formulário o descarta. Nada é descartado sem aviso; sem mesclagem automática.

## 8. Testes adicionados (11, em `multitab.test.ts`)
A (obsoleto recusado), B/C (recuperação e persistência após reload), D (exclusão), E (importação), E2 (descartar dados), F (falha de armazenamento), G (duas operações simultâneas entre abas), G2 (simultâneas na mesma aba), evento `storage`, ausência de Web Locks, H (dado gravado antes da correção segue legível/editável).

## 9–12. Quality gates
- Baseline: 322 testes aprovados (confirmado antes da mudança).
- `npm test`: **333 aprovados** (322 + 11), 22 arquivos.
- `npm run typecheck`: aprovado. `npm run lint`: aprovado. `npm run build`: aprovado (aviso de chunk > 500 kB já existente).

## 13. Jornadas no navegador (Playwright/Chromium, build em `vite preview`, duas páginas no mesmo BrowserContext)
1. Abas A e B abertas com storage vazio; B com diálogo "Novo feedback" aberto.
2. A criou métrica; salvamento confirmado e presente no storage.
3. B tentou criar feedback: recusado, aviso de conflito exibido no diálogo, sem sucesso; storage manteve só a métrica (captura em `docs/wfa01-conflict.png`).
4. Recarregar A: métrica permaneceu.
5. B clicou em Atualizar dados: texto digitado preservado; nova tentativa salvou; storage ficou com métrica + feedback.
6. Concorrência: ambas as abas enviaram "Criar indicador" ao mesmo tempo; storage ficou com os registros anteriores + exatamente um novo ("Simult B"); a outra aba exibiu o aviso de conflito.
7. Sem Web Locks (`navigator.locks` removido): gravação recusada com mensagem; `localStorage` permaneceu vazio.

## 14. Evidência de que o WFA-01 não foi reproduzido
Na jornada original (métrica na A, feedback na B) a métrica nunca desapareceu; em nenhuma tentativa houve sucesso exibido para uma gravação descartada.

## 15. Limitações restantes
- Depende de Web Locks (Chromium, Firefox, Safari modernos; exige contexto seguro). Sem ele, o app fica somente leitura para gravações.
- Testes automatizados usam um lock falso FIFO; a exclusão mútua real do navegador foi validada apenas por jornada manual em Chromium (não em Firefox/Safari).
- Dados já reconhecidos como "stale" só são recuperados manualmente; sem mesclagem.
- Mensagem de conflito aparece duplicada em diálogos (aviso + erro do formulário).
- Envio duplo rápido de um formulário agora é assíncrono; um segundo clique antes da conclusão não é bloqueado por botão desabilitado.
- Dados editados por outra aba em um registro aberto no formulário podem ser sobrescritos se o usuário atualizar e reenviar conscientemente.
- Escrita manual no DevTools ou por extensões fora do app não passa pelo lock (a verificação de revisão ainda detecta divergência, mas sem atomicidade).

## 16. Riscos de regressão
Operações do contexto agora retornam `Promise`; novos chamadores devem usar `await`. Qualquer gravação nova deve passar por `workspace-session`.

## 17. Preparação para WFA-02
Sem sobreposição: WFA-02/03 atuam em `validation.ts`/`backup.ts`. A importação já usa `replace()` protegido, então a correção de validação pode ser feita sem tocar na concorrência.
