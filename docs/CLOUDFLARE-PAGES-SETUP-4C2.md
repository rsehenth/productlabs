# Cloudflare Pages — preparação e homologação 4C.2

Data: 09/11/2026. **Status: BLOCKED — acesso Cloudflare e deploy de preview pendentes.** Configuração foi preparada documentalmente; nenhuma configuração na conta, deploy ou validação hospedada foi executada. A escolha entre os perfis de login disponíveis depende do usuário. A autorização para preview está no pedido; o bloqueio é identificar/acessar a conta adequada, não falta de autorização genérica.

## 1. Estado inicial

O diretório não possui metadados Git; não se inicializou Git. Integração GitHub disponível e com conta instalada; busca por `ProductDecisionLab` nos repositórios acessíveis não retornou resultados, o que não prova inexistência de repositório sob outro nome. Não há conexão comprovada entre este diretório e repositório remoto. Dashboard Cloudflare abriu tela de login com mais de um perfil; não se escolheu conta por suposição. Não há ferramenta Cloudflare dedicada disponível nesta sessão nem Wrangler localizado no projeto ou PATH. Não se acessaram arquivos `.env`.

`package.json` define React/Vite e scripts npm; `package-lock.json` é lockfile v3, com 295 entradas. Não foram identificados `.nvmrc`, `.node-version`, `wrangler.toml/json/jsonc`, `public/_redirects` ou `public/_headers`. Grafo existente foi consultado. Auditoria 4C.1 descreve aplicação estática, rota hash e armazenamento local.

## 2. Configuração selecionada

Preparação recomendada: Vite, raiz do projeto, npm, `npm run build`, saída `dist`, hospedagem na raiz de um domínio `pages.dev`. Não há variável de aplicação identificada. Para um futuro build integrado ao Pages, selecionar `NODE_VERSION=24.22.1` no ambiente de build; trata-se de configuração do build, não de segredo ou variável da aplicação. Não foi aplicada à conta.

`.nvmrc` ou `.node-version` poderiam definir a versão, mas não são necessários se o dashboard fixar `NODE_VERSION`; não foram criados. Não há necessidade demonstrada de `_redirects` para fragmentos, de `_headers` para funcionamento básico ou de Wrangler para build. Não se criaram arquivos de configuração nem se mudaram caminhos de assets.

## 3. Versão Node utilizada

Build local executado com Node **26.13.0** e npm **11.20.0**. Recomenda-se Node **24.22.1** para eventual build hospedado: linha LTS conforme [Node.js](https://nodejs.org/en/about/previous-releases), e o Pages aceita selecionar versões por `NODE_VERSION` ou arquivo ([build image](https://developers.cloudflare.com/pages/configuration/build-image/)). A escolha é uma recomendação pendente, não versão executada aqui. Vite instalado exige `^20.19.0 || >=22.12.0`. Comparação estática via `semver` das restrições `engines.node` presentes nas 295 entradas do lockfile encontrou zero incompatibilidades com 24.22.1; entradas sem campo não garantem compatibilidade. Não se executou instalação ou build real sob Node 24; ainda precisa ser comprovado no ambiente escolhido. No Direct Upload, Cloudflare serve o build pré-compilado e não executa esse Node.

## 4. Método de publicação

Para homologação imediata sem repositório, **Direct Upload em projeto dedicado** é o candidato, enviando somente `dist` já construído, com branch de preview distinta da branch de produção explicitamente configurada. A documentação permite deploy de preview usando `wrangler pages deploy <diretório> --branch=<branch>` ([Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/)). Antes de qualquer envio, confirmar no painel/CLI que o destino é realmente **Preview**, que a branch difere da branch de produção e que nenhum site existente será afetado. Não presumir que um primeiro upload pelo assistente de arrastar e soltar seja preview: o fluxo inicial documentado publica em `<projeto>.pages.dev`; a seleção explícita de preview é documentada para um novo deployment posterior.

Um projeto Direct Upload não pode ser convertido posteriormente para integração Git; para automação Git futura será necessário projeto novo ([Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/)). Git integrado pode ser mais adequado para fluxo de longo prazo, mas exige repositório e ligação explícita; não se criaram repositório, commit ou push. Wrangler não está instalado; não se instalou nem executou `npx` que o baixaria automaticamente. Se a conta oferecer fluxo sem instalar ferramentas e com preview verificável, preferi-lo. A escolha definitiva depende do estado da conta e da confirmação do ambiente de destino.

## 5. Arquivos modificados

Criado este relatório. `npm run build` regenerou `dist` e TypeScript pode atualizar cache incremental em `node_modules/.tmp`. Não houve mudança intencional em código, testes, dependências, lockfile ou configuração. Sem metadados Git, não há diff para certificar estado anterior.

## 6. Configurações Cloudflare Pages

| Item | Preparado / recomendado | Aplicado |
|---|---|---|
| Framework / build | Vite / `npm run build` | Não |
| Output / root | `dist` / raiz do projeto | Não |
| Node no build integrado | `NODE_VERSION=24.22.1`, sujeito a validação | Não |
| Branch preview | Nome distinto de produção, a confirmar na conta | Não |
| Aplicação | Sem variáveis obrigatórias identificadas | Não |
| Domínio / DNS | Apenas URL de preview `pages.dev`; sem domínio próprio | Não |

URLs de preview são públicas por padrão; `noindex` não é controle de acesso. Conferir projeto, ambiente e conteúdo antes do upload. Não usar dados reais.

## 7. URL de homologação

Não criada. Nenhuma alteração foi feita na conta Cloudflare, em produção, em DNS ou em domínio.

## 8. Resultado do build

`npm run build` passou em ambiente local: 2.570 módulos; JS principal 829,53 kB (gzip 241,53 kB); CSS 44,17 kB (gzip 8,33 kB); chunk de gráfico 2,51 kB (gzip 1,15 kB); prévia 11,33 kB (gzip 3,97 kB). Aviso de chunk superior a 500 kB permanece. Não houve build no Pages. O conteúdo de `dist` é o artefato local, não evidência de deploy.

## 9. Smoke tests hospedados

Não executados: sem URL. Permanecem abertura direta e reload das quatro rotas, navegação, voltar, gráficos, favicon, CSS, JS, fontes, console e respostas HTTP. O smoke local da 4C.1 é histórico e não comprova Pages.

## 10. HTTPS e Web Locks

Não verificados no ambiente hospedado. Ao obter URL HTTPS real, verificar `window.isSecureContext`, `navigator.locks`, aquisição de lock e gravação fictícia. Não alterar proteção se API indisponível.

## 11. Persistência local

Nenhum dado real utilizado. Pendente: criar indicador fictício em contexto isolado, recarregar e confirmar permanência; abrir outro contexto isolado e confirmar ausência de sincronização. Persistência é por origem e perfil. Teste em localhost na 4C.1 não comprova origem hospedada.

## 12. Headers HTTP

Não inspecionados: sem URL. Validar HTTPS, Content-Type de HTML/JS/CSS/fontes, cache de HTML e assets com hash, `X-Content-Type-Options`, `Referrer-Policy` e `Content-Security-Policy` observando respostas reais. Headers adicionais são recomendações a avaliar, não condição técnica demonstrada para servir a aplicação. Não configurar CSP sem teste dos recursos. Cloudflare documenta `X-Robots-Tag: noindex` por padrão em previews, mas deve ser verificado na resposta real ([preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/)).

## 13. Responsividade

Pendente em ambiente hospedado: 1440×900, 1280×800, 768×1024 e 390×844, incluindo overflow horizontal, navegação e diálogos. Não se declara cobertura com base na 4B.

## 14. Quality gates

| Comando | Resultado local |
|---|---|
| `npm run typecheck` | aprovado |
| `npm run lint` | aprovado |
| `npm test` | 392 testes em 26 arquivos aprovados |
| `npm run build` | aprovado; aviso de chunk > 500 kB |

Nenhum teste foi enfraquecido; nenhuma dependência foi instalada ou atualizada. Esses resultados usam Node 26 e não comprovam build no Cloudflare ou no Node 24 recomendado.

## 15. Limitações

Acesso Cloudflare e seleção de conta estão pendentes. Não há evidência de projeto Pages existente, URL, ambiente de build, headers, Web Locks por HTTPS ou testes reais de hospedagem. Verificação de engines é estática; não comprova compatibilidade de todos os pacotes ou binários com Node 24. Sem Git não se pode associar o artefato a commit ou atestar diff. Auditoria de vulnerabilidades não foi executada. Previews podem ser públicos; não se deve incluir informação privada.

## 16. Procedimento de rollback e remoção

Quando houver preview, registrar nome do projeto, ambiente, branch, ID, URL única, data e origem do artefato/hash; conservar artefato anterior de forma segura. Para voltar visualmente a um preview anterior, usar a URL única anterior ou criar novo deployment de preview com artefato anterior na mesma branch, após verificar ambiente e branch. Não acionar o botão de rollback de produção: Cloudflare documenta que ele altera produção e que previews não são alvos válidos ([rollbacks](https://developers.cloudflare.com/pages/configuration/rollbacks/)).

Para remover preview, identificar individualmente ID, projeto e consequências, então usar o fluxo de exclusão permitido pelo Pages, somente com autorização apropriada. A documentação diz que o último deployment de uma branch não pode ser excluído ([preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/)); não presumir que remoção individual sempre esteja disponível. Proteger ou retirar acesso exige analisar configuração da conta; não apagar projetos existentes nem alterar produção. Não se executou exclusão ou rollback.

## 17. Próximas etapas e decisão

1. Usuário identifica a conta correta ou entra nela; não enviar credenciais pelo chat.
2. Inspecionar projetos e ambiente em modo leitura. Definir projeto dedicado e branch de preview, assegurando que nenhum upload inicial publique produção; se o fluxo só permitir primeiro deploy de produção, interromper essa via e usar método oficial que permita preview explícito.
3. Publicar somente `dist` em preview, confirmar ID, ambiente e URL; sem associar domínio ou mudar DNS.
4. Executar o checklist hospedado das seções 9–13 e registrar evidências e limitações antes de decidir sobre 4C.3.

**Respostas objetivas:** Pages configurado: não. Build no provedor: não verificado. URL: não. HTTPS, Web Locks, módulos, persistência e headers hospedados: não verificados. Prontidão para 4C.3: condicionada à conclusão da homologação; não iniciada. Ação necessária do usuário: selecionar/entrar na conta Cloudflare correta; acesso e existência de um destino seguro ainda precisam ser confirmados. Não é necessário autorizar novamente o preview já solicitado, desde que o destino e o método respeitem as restrições do pedido.
