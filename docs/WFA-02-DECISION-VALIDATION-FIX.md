# WFA-02 — Consistência das regras de decisão entre formulário e backup

## 1. Status
**APPROVED WITH LIMITATIONS.** Apenas WFA-02 foi tratado. WFA-03 permanece pendente; a auditoria não está integralmente resolvida.

## 2. Causa raiz
As exigências por status viviam só em `normalizeDecisionInput` (`src/lib/domain/operations.ts`). `validateWorkspace` (estrutura) e `collectIntegrityIssues` (IDs/relações) só checavam tipos (`hypothesis`/`decision` = `string`, listas = `string[]`), então um backup com `validated` e campos vazios passava.

## 3. Regras efetivas (lidas do código)
| Status | Obrigatório além de título e problema |
| --- | --- |
| draft | nada |
| investigating | hipótese |
| decided | hipótese, decisão registrada |
| validated | hipótese, decisão registrada, ≥ 1 critério de sucesso |
| abandoned | nada |

Alternativas, próximos passos, indicadores e feedbacks são opcionais em todos os status. "Validada" continua sendo um status manual, sem certificação estatística.

## 4. Diferença encontrada
Formulário: aplicava a tabela acima. Backup: nenhuma das três regras. Limites de tamanho de texto do formulário também não são aplicados ao backup (não é regra de status; fora do escopo, ver limitações).

## 5. Estratégia
Nova função `decisionStatusErrors` em `src/lib/domain/decision-rules.ts`, usada por `operations.ts` (formulário, mesmas mensagens de antes) e por `parseBackupValue` (`backup.ts`). Qualquer decisão inválida recusa o arquivo inteiro, antes de `replaceWorkspace`; nada é normalizado, removido ou preenchido. A mensagem inclui título, id, status e a regra violada.
Fluxo: `ImportBackupDialog` → `parseBackup` (agora com a regra) → só então `replaceWorkspace` → `session.replace` (caminho protegido do WFA-01, intocado).

## 6. Arquivos
- novo: `src/lib/domain/decision-rules.ts`
- alterados: `src/lib/domain/operations.ts` (usa a função compartilhada), `src/lib/backup.ts`
- novo teste: `src/lib/wfa02-decision-validation.test.ts`
- Não modificados: `write-lock.ts`, `workspace-session.ts`, `workspace-storage.ts`, UI.

## 7. Testes adicionados (37, em `wfa02-decision-validation.test.ts`)
A–F (rascunho, investigação inválida/válida, decidida inválida/válida, validada incompleta), validada completa/abandonada, texto só com espaços, G (backup misto recusado por inteiro, sem alterar o objeto), H (storage idêntico após importação inválida), I (roundtrip com IDs e relações), J (`replace` com sessão desatualizada retorna conflito e preserva dados recentes), K (25 combinações status × preenchimento: resultado do formulário = resultado do backup).

## 8–11. Gates
- Testes: **370 aprovados** (333 anteriores + 37), 23 arquivos.
- Typecheck: aprovado. Lint: aprovado. Build: aprovado (aviso preexistente de chunk > 500 kB).
- Baseline antes da mudança: 333/333.

## 12. Jornadas no navegador
**Não executadas.** O fluxo completo é coberto pelos testes (parse → replace sobre storage em memória), mas não houve verificação visual da mensagem no diálogo. O diálogo já exibe `error` e `issues` de `parseBackup`, sem alteração de UI.

## 13. Preservação após importação inválida
Teste H: `localStorage` em memória comparado byte a byte antes/depois; igual. Teste G: coleções do arquivo permanecem intactas.

## 14. Compatibilidade com backups anteriores
Backups produzidos pelo formulário continuam válidos (teste K, I). Backups antigos já inconsistentes (como o da auditoria) passam a ser recusados na importação — é o comportamento pretendido.

## 15. WFA-01
`workspace-session.ts`, `write-lock.ts` e `workspace-storage.ts` intocados; `multitab.test.ts` e demais testes do WFA-01 passam; teste J cobre a importação sobre estado desatualizado.

## 16. Limitações
- **Dados já persistidos** em LocalStorage com decisões incompatíveis continuam carregando normalmente: a regra foi aplicada só à importação, para não bloquear leitura/gravação de workspaces existentes nem exigir migração destrutiva. Esses registros podem ser exportados, mas o backup resultante será recusado até a decisão ser editada. Decisão de produto pendente.
- Limites de tamanho de campos do formulário não são verificados na importação.
- Jornadas de navegador não executadas.

## 17. Preparação para WFA-03
Nenhuma mudança feita. A importação continua lendo o arquivo e gerando o resumo em `ImportBackupDialog`; a correção do WFA-03 (leituras fora de ordem) é independente desta.
