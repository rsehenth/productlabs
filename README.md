# Product Decision Lab

Ferramenta web para Product Managers conectarem **métricas**, **feedbacks de usuários** e
**decisões de produto** em um único workspace local.

O objetivo é transformar sinais quantitativos e qualitativos em investigações estruturadas e
decisões rastreáveis — sem backend, autenticação, banco remoto ou serviços de IA.

## O que está implementado (Etapa 2 — MVP funcional)

- **Product Analytics**
  - cadastro, edição e exclusão de indicadores;
  - observações por período (`AAAA-MM`) com entrada decimal em português;
  - gráfico de evolução, histórico, variação absoluta (pontos percentuais quando aplicável) e
    variação relativa;
  - interpretação da variação conforme a direção desejada;
  - estados de histórico insuficiente e de variação desfavorável, sem inferência de causa.
- **Feedback Discovery**
  - cadastro, edição e exclusão de feedbacks;
  - classificação por categoria e fonte, data e associação a indicadores;
  - busca sem distinção de caixa/acentos e filtros combináveis por categoria, fonte e indicador.
- **Decision Workspace**
  - Decision Records com problema, evidências quantitativas e qualitativas, hipótese,
    alternativas, decisão, critérios de sucesso, próximos passos e status;
  - vínculos por ID com indicadores e feedbacks existentes;
  - visualização detalhada e exportação em Markdown.
- **Persistência e backup**
  - gravação transacional no LocalStorage (a interface só confirma depois do sucesso);
  - exportação/importação de backup JSON com validação estrutural e referencial;
  - preservação e exportação de dados brutos quando o armazenamento está corrompido.
- **Dataset demonstrativo isolado** (`Ledgerly`), exibido apenas como prévia quando o workspace
  está vazio. Não é gravado nem usado para preencher dados do usuário.

## Stack

React 19 · TypeScript (strict) · Vite · Tailwind CSS v4 · componentes no padrão shadcn/ui ·
Recharts · LocalStorage · Vitest · ESLint. Sem backend, autenticação ou integrações externas.

## Como executar

```bash
npm install
npm run dev
```

## Como testar e gerar build

```bash
npm test           # Vitest
npm run typecheck  # tsc -b
npm run lint       # ESLint
npm run build      # typecheck + build de produção em dist/
```

## Como usar o workspace

1. **Indicadores** (Overview): crie um indicador, escolha unidade e direção desejada e registre
   observações mensais. O detalhe mostra gráfico, variações e evidências vinculadas.
2. **Feedbacks**: registre relatos, classifique-os e associe-os a um ou mais indicadores.
3. **Decisões**: crie um Decision Record, selecione as evidências existentes, registre hipótese,
   alternativas, decisão, critérios e próximos passos.
4. **Exportação**: use “Exportar Markdown” no detalhe da decisão e “Exportar backup” no Overview.

Os atalhos de deep link usam hash, por exemplo `#/overview?metric=<id>` e
`#/decisions?record=<id>`.

## Backup

- **Exportar backup** gera `product-decision-lab-backup-AAAA-MM-DD.json` com versão de schema,
  data de exportação e os quatro conjuntos de registros.
- **Importar backup** valida tamanho (até 5 MB), JSON, versão, estrutura, IDs, relações,
  duplicidades e valores antes de mostrar um resumo.
- A importação **substitui** o workspace atual após confirmação; não há mesclagem.
- O diálogo oferece exportar os dados atuais antes da substituição.
- Backups com registros `simulated: true` são recusados: o dataset demonstrativo não é dado do
  usuário.

## Armazenamento local e limites

- Chave única: `product-decision-lab:workspace`, com envelope
  `{ schemaVersion, savedAt, data }` e `SCHEMA_VERSION = 1`.
- Toda leitura passa por validação estrutural e referencial; JSON corrompido, estrutura inválida,
  referência órfã ou versão futura abre o workspace vazio **sem apagar o conteúdo original**.
- Nesses casos a interface permite exportar o conteúdo bruto ou descartá-lo explicitamente.
- O MVP não tem sincronização, multiusuário, autenticação nem histórico imutável de evidências.
  Limpar os dados do navegador remove o workspace; por isso o backup JSON é o mecanismo de
  recuperação.

## Estrutura

```
src/
  components/layout/   # shell, navegação, banners de armazenamento
  components/ui/       # primitivas reutilizáveis
  data/demo/           # dataset fictício, isolado do workspace
  features/
    overview/          # indicadores, observações, gráfico e backup
    feedbacks/         # formulário, busca e filtros
    decisions/         # formulário, detalhe e exportação Markdown
    interactive-case/  # placeholder preservado para a Etapa 3
  hooks/               # contexto e provider do workspace
  lib/
    domain/            # operações CRUD e regras de integridade
    storage/           # schema, validação e persistência
    analytics.ts       # ordenação, tendência e variações
    backup.ts          # exportação/importação e integridade referencial
    markdown.ts        # geração do Decision Record portátil
    routing.ts         # rotas por hash com parâmetros
  types/               # modelos de domínio
```

Detalhes de entidades, exclusões, status e decisões técnicas estão em
[`docs/WORKSPACE-DATA-MODEL.md`](docs/WORKSPACE-DATA-MODEL.md).

## Etapas

- **Etapa 1** — fundação visual, modelos, persistência e dataset demonstrativo.
- **Etapa 2** — MVP funcional (este estado).
- **Etapa 3** — Interactive Product Case (ProfResolve), ainda não iniciada.
