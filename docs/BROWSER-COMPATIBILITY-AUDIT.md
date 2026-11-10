# Etapa 4A.3c — Auditoria de compatibilidade de navegadores

Auditoria somente de leitura: nenhum código de produção, teste, schema ou dependência foi alterado. Nenhum commit, push ou deploy. O único arquivo criado no projeto é este relatório. O `npm run build` regenerou `dist/`, como faz sempre.

## 1. Status geral

**Chromium: COMPATIBLE. Firefox: NOT TESTED. WebKit: NOT TESTED.** Nenhum defeito encontrado em Chromium. A cobertura de outros navegadores é nula por falta de infraestrutura.

## 2. Navegadores efetivamente testados

| Navegador | Situação |
|---|---|
| Chromium (Playwright MCP) | Testado |
| Firefox | Não executado. Não há Firefox no cache do Playwright (`%LOCALAPPDATA%\ms-playwright` só tem chromium, chromium_headless_shell e ffmpeg). Não foi instalado, conforme a regra da etapa |
| WebKit | Não executado, pelo mesmo motivo |

O projeto não tem `playwright` em `node_modules`. Os testes rodaram pelo Playwright MCP da sessão, que só oferece Chromium.

## 3. Versões

Chromium **157.0.8103.39**, Windows 11, build de produção servido por `vite preview` em `http://localhost:4173`. Os dados de teste eram fictícios, em BrowserContexts novos.

## 4. Web Locks e contexto seguro

| Contexto | `window.isSecureContext` | `navigator.locks` |
|---|---|---|
| `http://localhost:4173` | true | disponível |
| `http://pdl.test` (HTTP real, não seguro) | false | **undefined** |
| localhost com `navigator.locks` removido (simulado) | true | undefined |

## 5. Teste A — persistência (Chromium)

Criados 1 indicador, 1 observação, 1 feedback e 1 decisão. Depois de recarregar, o `localStorage` manteve 1/1/1/1 e a interface mostrou indicador, feedback e decisão. Zero erros de console.

## 6. Teste B — duas abas no mesmo BrowserContext (Chromium)

| Passo | Resultado |
|---|---|
| Aba A cria indicador, aba B (formulário de feedback aberto, desatualizada) tenta salvar | Recusado. Aviso "Os dados deste Workspace foram alterados em outra aba…" com botão "Atualizar dados". Nenhuma mensagem de sucesso. Storage ficou sem feedback |
| B clica em "Atualizar dados" | Texto digitado preservado; nova tentativa salvou. Storage com indicador + feedback |
| Duas criações de indicador simultâneas (A e B) | Gravou só uma ("Simult B"); a outra aba (A) mostrou o aviso de conflito e não mostrou sucesso; registros anteriores intactos (2 indicadores, 1 feedback). Recarregar manteve os dados |

Limite da evidência: a recusa na etapa 1 vem do evento `storage` e da verificação de revisão juntos. A verificação sob o lock é coberta pelos testes unitários (com lock falso). A exclusão mútua real do navegador foi exercitada somente pela corrida simultânea acima, em uma execução.

## 7. Teste C — sem Web Locks

Dois cenários, que devem ser lidos separadamente:

- **Simulado:** `navigator.locks` removido por script de inicialização do contexto (a aplicação não foi modificada).
- **Real:** contexto HTTP não seguro. Foi montado servindo o build em `http://pdl.test` por interceptação de rota do Playwright, sem expor porta nem mudar a rede. O Chromium reportou `isSecureContext=false` e `navigator.locks` indefinido, o mesmo estado que um navegador sem a API teria.

Em ambos: o Workspace continuou legível (no simulado, com dados semeados), a exportação baixou o arquivo, a criação de indicador e a de feedback foram recusadas, o `localStorage` ficou idêntico ao anterior (ou vazio, no HTTP real), e não apareceu mensagem de sucesso. A interface exibiu: "Este navegador ou contexto não oferece a Web Locks API, necessária para gravar com segurança entre abas. Nada foi salvo. Use um navegador atual em HTTPS ou localhost."

Nada disso substitui um Firefox ou Safari reais sem Web Locks.

## 8. Teste D — backup (Chromium)

Exportação gerou `product-decision-lab-backup-2026-11-06.json` (1400 bytes). Restauração em contexto isolado: prévia com 1/1/1/1, botão "Substituir workspace", contagens iguais às da origem e dados idênticos (comparação do JSON de `data`, o que cobre os relacionamentos). Dois arquivos inválidos foram recusados: JSON malformado ("O arquivo não contém JSON válido.") e envelope sem `schemaVersion` ("Versão de schema ausente ou inválida."). Em ambos o botão de confirmação ficou desabilitado e o `localStorage` não mudou.

## 9. Teste E — interface básica (Chromium)

Navegação entre Overview, Feedbacks, Decisions e Interactive Case funcionou. O Interactive Case abriu com seus controles. Formulários abriram e fecharam por Cancelar e por Esc; campos aceitaram entrada; o envio vazio mostrou validação; os diálogos de backup funcionaram. O envio de arquivo foi feito por `setInputFiles`, que não exercita o seletor de arquivos nativo do sistema.

## 10. Erros de console

Zero erros de console e zero exceções de página em todas as jornadas em Chromium (mais as de HTTP não seguro).

## 11. Problemas encontrados

Nenhum defeito de integridade ou funcional em Chromium. Observação não classificada como defeito: o aviso de conflito pode aparecer duplicado dentro de diálogos (já registrado no WFA-01).

## 12. Classificação

| Navegador | Classificação |
|---|---|
| Chromium 157 | **COMPATIBLE** (jornadas essenciais A–E aprovadas) |
| Firefox | **NOT TESTED** |
| WebKit / Safari | **NOT TESTED** |

Ausência de Web Locks, por qualquer causa, resulta em **COMPATIBLE WITH LIMITATIONS** para o contexto afetado: leitura e exportação funcionam, toda gravação é recusada com explicação, sem perda de dados.

## 13. Testes automatizados e quality gates

- `npm test`: **389 aprovados** em 25 arquivos (baseline confirmado).
- `npm run typecheck`: aprovado.
- `npm run lint`: aprovado.
- `npm run build`: aprovado, com o aviso preexistente de chunk acima de 500 kB (`index-*.js` 812,89 kB, 236,76 kB gzip).

## 14. Limitações não verificadas

- Firefox e WebKit, em qualquer sistema. Playwright WebKit também não equivale ao Safari real em macOS ou iOS.
- Safari em iOS (Web Locks, cotas e limpeza de `localStorage` pelo sistema).
- Comportamento real do `navigator.locks` em Firefox e Safari. A afirmação de suporte nos relatórios anteriores vem da documentação, não de execução.
- Seletor de arquivos nativo, arquivos próximos de 5 MB, modo privado, cota de armazenamento cheia, mais de duas abas.
- Windows e Chromium apenas; sem Chrome estável, Edge nem Android.
- Cada jornada de abas foi executada uma vez, sem repetição para detectar intermitência.

## 15. Navegadores que podem ser considerados suportados

Somente o **Chromium** (versão 157, Windows) tem evidência. Firefox e Safari não devem ser declarados oficialmente suportados até serem executados.

## 16. Riscos para publicação

- Sem evidência em Firefox e Safari, onde a gravação depende de Web Locks. Se a API faltar, o usuário só lê e exporta, e a mensagem diz isso.
- Uso por HTTP não seguro (fora de localhost) deixa o aplicativo somente leitura para gravações. A publicação deve ser em HTTPS.
- Aviso de bundle acima de 500 kB.
- Riscos herdados do WFA-01 a WFA-03 e do P2-01 (backups legados com decisão incompatível, envio duplo de formulário, edições fora do app).

## 17. Recomendação final

**B — APPROVED WITH LIMITATIONS.** A Etapa 4B pode começar: não há defeito de integridade em Chromium e o comportamento sem Web Locks é conservador e seguro, inclusive em contexto HTTP não seguro real. Firefox e WebKit seguem não verificados e não devem ser declarados suportados. Recomenda-se repetir esta bateria em Firefox e WebKit quando houver infraestrutura, antes da publicação.
