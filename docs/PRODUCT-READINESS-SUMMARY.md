# Product Decision Lab — prontidão da versão atual

Consolidação em **13/11/2026**, com execuções entre 10 e 12/11; atualização editorial em **14/11/2026**. Versão commitada localmente na branch `main` em `7547d1fd0d368f3d685dd268cba2b2f56c52e973` (`fix: finalize ProductDecisionLab demo readiness`, 25 arquivos). Nenhum push ou publicação remota foi realizado no fechamento local.

O Product Decision Lab é um portfólio funcional de Product Management em React, TypeScript e Vite. Conecta métricas, feedbacks, hipóteses e decisões num workspace local, com datasets fictícios. Não possui backend, autenticação ou sincronização.

| Decisão | Classificação |
| --- | --- |
| Apresentação profissional / portfólio PM, PO e Technical PM | **READY WITH LIMITATIONS** |
| Publicação ou compartilhamento do repositório | **READY WITH LIMITATIONS — pronto para decisão de publicação** |
| Produção comercial | **NOT READY** |

**Achados abertos: 0 P0, 0 P1, 1 P2, 2 P3** — estado após a 4C.5e.1 (a auditoria 4C.5d.3 registrava 2 P2 e 3 P3). **AUD-P2-01 segue aberto, mitigado:** o coletor de performance foi corrigido e autoverificado, mas o encerramento exige execução integrada nova que valide a saída corrigida; o JSON histórico não foi reprocessado. **AUD-P3-02** (UX menor do tour) e **AUD-P3-03** (`m[1])`) permanecem abertos por decisão. **AUD-P2-02** (reprodutibilidade documentada no guia de testes de navegador) e **AUD-P3-01** (documentação pública atualizada) foram encerrados na 4C.5e.1. Afetam evidência, reprodução, UX menor do tour e organização. Ausência de defeito observado não garante ausência de defeitos.

## O que está implementado

- **Product Analytics:** indicadores, observações, variações, direção desejada, gráficos, evidências e CRUD protegido por vínculos.
- **Feedback Discovery:** cadastro, categorias/fontes, busca, filtros, associações e edição/exclusão.
- **Decision Workspace:** problema, hipótese, alternativas, critérios, status, evidências, próximos passos e Markdown. “Validada” é manual, sem validação estatística.
- **Interactive Product Case:** investigação simulada, evidências, hipótese, alternativas e síntese; estado em memória, isolado do Workspace.
- **Como funciona:** tour manual de 15 etapas/cinco blocos, quatro módulos, destaques, progresso, teclado e foco. [Guia permanente](PRODUCT-GUIDED-TOUR.md) revisado: roteiro sem alterações necessárias.
- **Persistência:** schema, backup JSON, importação por substituição e conflitos entre abas protegidos por Web Locks.

## Principais resultados de validação

Execuções históricas distintas; não constituem uma bateria atual acumulada.

- **403 testes/28 arquivos**, TypeScript, lint e build aprovados em 11/11 após correções responsivas; build/lint também em 12/11. Nenhuma mudança posterior de produção identificada; resultados reutilizados.
- CRUD prioritário, vínculos, status, Markdown, backup/restauração, conflitos e falhas simuladas de gravação aprovados com limitações em Chromium.
- Teclado, foco e contraste amostral verificados; correções revalidadas. Viewports **320–1920 px**, reflow 320×256 e zoom real **200%/400%** exercitados.
- **Chromium PASS nos cenários executados; Firefox e WebKit BLOCKED** por ausência de binários. Safari/dispositivos físicos não validados.
- Performance **PASS WITH LIMITATIONS**: FCP mediano 96–128 ms/LCP 384–408 ms nas cargas normais; ações comuns <100 ms, exceto aberturas com download. CPU 4×/Fast 3G: interativa ≈3,5 s. Dados de laboratório.

## Limitações e cuidados de apresentação

Use Chromium em localhost/contexto seguro validado, com Web Locks e armazenamento disponíveis. Mantenha origem/porta/perfil estáveis e dados fictícios. Backup é manual, sem criptografia; importar substitui tudo. Limpar dados do navegador pode apagá-los, sem recuperação automática.

Cancelar o aviso do tour preserva rascunhos; confirmar pode descartá-los ao navegar. No Case vazio, há confirmação desnecessária. Em 320 px, alguns destaques ficam cobertos; prefira desktop. Sair/recarregar o Case perde o progresso.

Não declarar WCAG integral, suporte amplo a Firefox/Safari ou métricas de campo. Faltam leitor de tela real e cobertura física. O detalhe de decisão exibe feedback, sem link direto até ele.

Transferências são **parciais**: os números acima vêm do coletor das execuções históricas de 10–12/11, que excluía `/fonts/` e agregava CLS com uma casa decimal. Na 4C.5e.1 (AUD-P2-01) o coletor foi corrigido: o script atual inclui fontes da mesma origem (`/fonts/`) além de `/assets/` e do documento, agrega CLS com três casas e passou na autoverificação dos helpers, sem navegador e sem servidor. Isso não produz evidência nova: **AUD-P2-01 segue aberto** até uma execução integrada validar a saída corrigida (“fontes em voo” e cache), o JSON histórico (`docs/evidence-4c5d2/results.json`) permanece parcial e não foi reprocessado. Os 152.196 B em disco não determinam a rede completa; no JSON antigo, o agregado arredonda CLS de 0,041 para zero — usar valores brutos (0,002–0,049). Não há gargalo bloqueante demonstrado.

## Ações restantes

**Correções obrigatórias antes de demonstrar: nenhuma comprovada.** Respeitar os limites acima.

Ações já concluídas na 4C.5e.1 (antes listadas como pendentes): README, nota de zoom do guia e atribuição de Testing Library corrigidos; Playwright e binários externos documentados em [BROWSER-TESTING-GUIDE.md](BROWSER-TESTING-GUIDE.md), fora das dependências e de `npm test`; exceções no `.gitignore` permitiram versionar este resumo, o tour e o guia. **Os três documentos públicos já constam no commit local `7547d1f`, concluído na 4C.5e.2b.**

**Fechamento Git concluído na 4C.5e.2b:** os 25 candidatos, incluindo os três documentos públicos e os sete scripts de navegador, foram commitados localmente; a revisão dos quatro artefatos Graphify e os quality gates direcionados foram aprovados. Publicação remota continua sujeita a decisão e autorização separadas.

Antes do compartilhamento profissional do repositório, recomenda-se:

1. Decidir sobre a publicação remota, considerando os limites e os metadados de autoria/coautoria do commit local; publicar exige autorização específica.
2. Encerrar AUD-P2-01 com execução integrada do coletor corrigido (fontes em voo e cache); até lá, preservar as ressalvas WOFF2/CLS e os JSON históricos sem reescrita.
3. Manter relatórios, evidências, caches e `m[1])` locais, fora de qualquer seleção futura para publicação. `m[1])` permanece não rastreado (AUD-P3-03); a revisão Graphify já foi concluída.

Esta atualização é exclusivamente editorial, após o commit local da 4C.5e.2b; não altera código nem acrescenta evidência funcional. Sem instalação, push ou deploy. Não foram reexecutados os gates históricos nem validados outros motores, leitor de tela, dispositivos físicos ou operação comercial.
