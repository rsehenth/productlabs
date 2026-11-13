# Guia de testes de navegador

Como executar os scripts de regressão de navegador do Product Decision Lab. Eles são independentes da suíte Vitest e exigem uma instalação externa do Playwright, que **não é dependência do projeto**. Nenhum comando deste guia instala pacotes ou navegadores.

## 1. Vitest × Playwright

| | Vitest | Playwright (`tests/browser/*.cjs`) |
| --- | --- | --- |
| O que testa | Unidades e regras de domínio em Node, sem navegador | A aplicação real em Chromium headless |
| Como executa | `npm test` (ou `npm run test:watch`) | `node --test tests/browser/<script>.cjs` contra um build de produção |
| Infraestrutura | Dependências declaradas no `package.json` | Módulo Playwright externo + binários de navegador no cache local |
| Cobertura de código | Não executada | Não executada |

`npm test` **não** executa os testes de navegador. Os dois conjuntos cobrem coisas diferentes e um não substitui o outro.

## 2. Scripts de navegador existentes

| Script | Objetivo |
| --- | --- |
| `tests/browser/4c5b3a-integrity.cjs` | Integridade de dados: backup, restauração e concorrência entre abas |
| `tests/browser/4c5b3b-interactive-tour.cjs` | Regressão funcional do Interactive Product Case e do tour de 15 etapas |
| `tests/browser/4c5c1-accessibility.cjs` | Teclado, foco, contraste medido e descoberta da síntese |
| `tests/browser/4c5c2-responsive.cjs` | Overflow, reflow, diálogos e fluxo do caso em seis viewports |
| `tests/browser/4c5c2-zoom.cjs` | Zoom real do navegador (200%/400%) por perfil temporário; mede por DOM |
| `tests/browser/4c5d1-compatibility.cjs` | Matriz de motores: Chromium, Firefox e WebKit |
| `tests/browser/4c5d2-performance.cjs` | Carregamento, interações e performance com coleta de recursos |

Todos usam exclusivamente dados fictícios e contextos isolados do navegador.

## 3. Pré-requisitos

1. Node.js `^20.19.0` ou `>=22.12.0` e `npm install` concluído.
2. Um módulo Playwright instalado fora do projeto (por exemplo, em um diretório próprio de ferramentas), com os binários de navegador do seu cache. O projeto não declara Playwright no `package.json` e não o instala.

## 4. Build de produção e preview

Os scripts exercitam o build de produção (não o dev server):

```bash
npm run build
npx vite preview --host 127.0.0.1 --port 4731 --strictPort
```

A origem resultante é `http://127.0.0.1:4731` (contexto seguro; Web Locks disponíveis) e é o padrão de todos os scripts. Se usar outra porta/host, configure `PDL_BASE_URL` (seção 6). Mantenha a origem estável durante a execução: o armazenamento local é por origem.

## 5. Executando um script

```bash
set PLAYWRIGHT_MODULE=C:\caminho\para\node_modules\playwright
node --test tests/browser/4c5b3a-integrity.cjs
```

`PLAYWRIGHT_MODULE` recebe o **caminho do diretório do pacote Playwright** na sua máquina (o exemplo acima é um marcador, não um requisito). Sem essa variável, os scripts tentam `require('playwright')` normal, que só funciona se o módulo estiver resolvível a partir do projeto.

Exceção: `4c5c2-zoom.cjs` roda sem o runner de testes e imprime o JSON no stdout:

```bash
node tests/browser/4c5c2-zoom.cjs
```

O script de performance também tem um modo de autoverificação, sem navegador nem servidor, que valida os helpers de coleta e agregação:

```bash
set PDL_SELF_CHECK=1&& node tests/browser/4c5d2-performance.cjs
```

## 6. Variáveis de ambiente por script

| Variável | Scripts | Função |
| --- | --- | --- |
| `PLAYWRIGHT_MODULE` | todos | Caminho do módulo Playwright externo |
| `PDL_BASE_URL` | todos | Origem do preview (padrão `http://127.0.0.1:4731`) |
| `PDL_RESULTS` | 4c5d2-performance, 4c5d1-compatibility, 4c5c2-responsive | Arquivo JSON de saída (padrões: `docs/evidence-4c5d2/results.json`, temporário do usuário, temporário do usuário) |
| `PDL_ONLY` | 4c5d2-performance (cenários A–T), 4c5d1-compatibility (`chromium\|firefox\|webkit`), 4c5c2-responsive (perfil) | Executa apenas parte da suíte |
| `PDL_REPETITIONS` | 4c5d2-performance | Repetições por carga (padrão 3) |
| `PDL_THROTTLE` | 4c5d2-performance | `0` desativa a amostragem CPU 4×/Fast 3G (padrão 1) |
| `PDL_SHOTS_DIR` | 4c5c2-responsive, 4c5c2-zoom | Diretório de capturas |
| `PDL_ZOOM` | 4c5c2-zoom | Fator de zoom (`2` = 200%, `4` = 400%) |
| `PDL_DEBUG` | 4c5d1-compatibility | Saída detalhada de diagnóstico |

## 7. Verificando a disponibilidade dos binários

Os scripts não instalam nem baixam navegadores. Para conferir quais binários o módulo Playwright consegue usar:

```bash
node -e "const fs=require('fs');const p=require(process.env.PLAYWRIGHT_MODULE||'playwright');for(const n of ['chromium','firefox','webkit']){let path='';try{path=p[n].executablePath()}catch{console.log(n+': módulo não reporta caminho esperado (BLOCKED)');continue}console.log(fs.existsSync(path)?n+': binário presente em disco: '+path:n+': binário ausente no caminho esperado (BLOCKED): '+path)}"
```

`executablePath()` informa apenas o caminho onde o módulo **esperaria** encontrar o executável; a ausência de exceção não confirma que o arquivo existe. Por isso o diagnóstico resolve o caminho, verifica a existência com `fs.existsSync` e distingue “presente em disco” de “ausente”. Presença em disco também **não garante inicialização bem-sucedida**: revisão incompatível com a versão do módulo, instalação corrompida ou driver ausente só aparecem ao iniciar o navegador — a confirmação final é a execução do próprio script contra o preview (seção 5).

Os binários ficam no cache de navegadores do Playwright (por padrão `%LOCALAPPDATA%\ms-playwright` no Windows, ou o caminho indicado por `PLAYWRIGHT_BROWSERS_PATH`). A versão do binário precisa corresponder à revisão esperada pelo módulo Playwright instalado; módulos de versões diferentes esperam revisões diferentes.

## 8. Navegadores efetivamente testados

- **Chromium headless no Windows**: validado nas execuções registradas entre 10 e 12/11/2026 (rotas, recargas, CRUD, tour, teclado/foco, persistência, performance). PASS se refere apenas a esses cenários e ambiente.
- **Firefox e WebKit**: BLOCKED — nenhuma execução. Safari nativo, Chrome/Edge nativos e dispositivos físicos não foram verificados.

## 9. Por que Firefox e WebKit ficaram BLOCKED

Os binários compatíveis com a versão do Playwright usada (`firefox-1555` e `webkit-2370`) não existiam no cache local. Um Firefox/WebKit instalado no sistema **não** substitui o binário e o driver da revisão exata que o Playwright espera. Motor sem binário produz BLOCKED em toda a matriz — nunca PASS e nunca falha do aplicativo.

## 10. Interpretando PASS, FAIL e BLOCKED

- **PASS** — o cenário executou e as verificações foram atendidas naquele ambiente; não vale para outros ambientes.
- **FAIL** — o cenário executou (ou começou a executar) e uma verificação não foi atendida: tanto defeito da aplicação quanto servidor/origem indisponível. No harness de compatibilidade (`4c5d1-compatibility.cjs`), origem inacessível registra `blocker.kind = 'origin'` e **FAIL** para os cenários daquele motor — não é BLOCKED e não aprova nada que não tenha rodado.
- **BLOCKED** — o cenário **não executou** por indisponibilidade do motor de navegador: binário ausente ou falha ao iniciar (`blocker.kind = 'engine'`). Não conta como aprovação nem como defeito do produto.

Somam-se apenas execuções do mesmo ambiente; resultados de dias ou suítes diferentes não se acumulam.

## 11. Isolamento dos dados

- Os datasets usados são fictícios e ficam embutidos nos scripts ou no bundle (`Ledgerly` e `ProfResolve` são simulados).
- As fixtures são semeadas por `addInitScript` no `localStorage` de **contextos isolados** do Playwright, descartados ao fim; o armazenamento real do usuário não é lido nem alterado.
- Cache frio = contexto novo (cache HTTP vazio); cache quente = mesmo documento/contexto.
- Não execute os scripts contra dados reais: prefira um perfil dedicado, mesmo com o isolamento acima.

## 12. Resultados e evidências

- `4c5d2-performance.cjs` grava JSON em `docs/evidence-4c5d2/results.json` (ajustável por `PDL_RESULTS`).
- `4c5d1-compatibility.cjs` e `4c5c2-responsive.cjs` gravam JSON no temporário do usuário por padrão; as execuções históricas usaram `docs/evidence-4c5d1/` e `docs/evidence-4c5c2/` via `PDL_RESULTS`/`PDL_SHOTS_DIR`.
- `4c5c2-zoom.cjs` imprime o resultado no stdout.
- Os relatórios finais por etapa (`docs/FINAL-*.md`) consolidam interpretações e limitações; são documentos locais, não distribuídos no repositório.
- JSONs e relatórios históricos são preservados sem reescrita: novas execuções geram novos arquivos.

**Nota sobre performance (4C.5d.2):** o coletor da execução histórica excluía os recursos de `/fonts/` e agregava CLS com uma casa decimal, então os totais de transferência daquele JSON são **parciais** e o CLS agregado deve ser lido dos valores brutos. O script atual coleta `/fonts/` da mesma origem e agrega CLS com três casas; novos números completos exigem nova execução.

## 13. Restrições e cuidados

- Execute contra o **build de produção** em preview; o dev server não é o alvo das medições.
- Mantenha `127.0.0.1` (ou outra origem segura estável): Web Locks e `isSecureContext` dependem disso.
- Nenhum script instala dependências ou navegadores nem exclui arquivos fora dos próprios temporários. As escritas em disco são as declaradas por contrato: JSON de resultados (`PDL_RESULTS`), capturas de tela (`PDL_SHOTS_DIR`), fixtures/backups baixados para o temporário pelo teste de integridade e `Preferences` criadas no perfil temporário do teste de zoom. Os dados são fictícios e os ambientes isolados (contextos descartáveis; perfil criado com `mkdtempSync`), mas os scripts não são isentos de escrita no sistema de arquivos.
- O ESLint do projeto cobre apenas TS/TSX e não verifica os scripts `.cjs`.
- Os scripts de zoom usam um perfil temporário do Chromium; não alteram as configurações do navegador nem do sistema.
- Capturas de tela sob zoom real do navegador não são confiáveis; as verificações usam geometria DOM.
