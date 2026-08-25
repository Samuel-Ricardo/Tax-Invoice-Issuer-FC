# Tax-Invoice-Issuer-FC 📊

Tax Invoice Issuer to Study Design Patterns in Full Cycle MBA

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-25.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-lightgrey.svg)](https://expressjs.com/)
[![Postman](https://img.shields.io/badge/Postman-Collection-orange.svg)](./postman/)

---

## 🎯 Overview

Sistema de emissão de invoices fiscais com suporte a múltiplas estratégias de cálculo (Cash Basis e Accrual Basis), implementando padrões de design e Clean Architecture.

### 🏗️ Arquitetura

- **Clean Architecture** com separação em camadas (Domain, Application, Infrastructure)
- **7 Design Patterns** implementados (Strategy, Specification, Repository, Factory, Mediator, Decorator, DI)
- **TypeScript** com strict mode
- **Dependency Injection** com InversifyJS
- **Validação** com Zod

---

## 📚 Documentação Completa

> **Estado atual — 2026-08-25:** para a implantação Azure, use o [guia manual de deployment](./docs/deploy/azure/manual/step-by-step-guide.md), a fonte de verdade operacional. O [índice de documentação](./docs/INDEX.md) navega pelos documentos atuais e históricos.

### 🚀 Começar Agora

- **[Quick Start - Testing Guide](./docs/QUICK-START-TESTS.md)** - Setup em 5 minutos e primeiros testes

### 📊 Para Gestores & Tech Leads

- **[Relatório Executivo](./docs/RELATORIO-EXECUTIVO.md)** - Status, problemas críticos e recomendações

### 🔍 Para Desenvolvedores & Arquitetos

- **[Análise Profunda](./docs/ANALISE-PROFUNDA.md)** - Arquitetura detalhada, padrões e análise técnica

### 🧪 Para QA & Testers

- **[Guia Postman](./postman/README.md)** — verificação atual da API, incluindo a expectativa de resposta como array estruturado
- **[Importar Coleção](./postman/Tax-Invoice-Issuer.postman_collection.json)** - Arquivo JSON

### ☁️ Deploy atual na Azure

- **[Guia manual de deployment](./docs/deploy/azure/manual/step-by-step-guide.md)** — runbook principal, do zero ao teste hello-world
- **[Visão geral da arquitetura Azure](./docs/deploy/azure/README.md)** — resumo da topologia, identidades e workflow
- **[Guia de OIDC](./azure-federated-credential-guide.md)** — configuração da credencial federada do GitHub

O [guia manual](./docs/deploy/azure/manual/step-by-step-guide.md) é a fonte de
verdade para os passos, verificações e troubleshooting. A [visão geral Azure](./docs/deploy/azure/README.md)
é o resumo sincronizado. Os nomes da stack de aprendizagem são:

| Recurso                    | Nome                                                |
| -------------------------- | --------------------------------------------------- |
| Resource group             | `rg-tax-invoice-fc-learn`                           |
| Container Apps environment | `env-tax-invoice-fc-learn`                          |
| Container App              | `app-tax-invoice-fc-learn`                          |
| PostgreSQL                 | `psql-tax-invoice-fc-learn`                         |
| Key Vault                  | `kv-tax-invoice-fc-learn`                           |
| Log Analytics              | `law-tax-invoice-fc-learn`                          |
| Imagem GHCR                | `ghcr.io/samuel-ricardo/tax-invoice-issuer-fc:main` |

O Container App usa a VNet `vnet-tax-invoice-fc`, subnet `default`. O PostgreSQL
usa a VNet `rg-tax-invoice-fc-learn-vnet`, subnet `default`; as VNets são ligadas
pelos peerings `peer-to-db-vnet` e `peer-to-app-vnet`. A private DNS zone usada é
`psql-tax-invoice-fc-learn.private.postgres.database.azure.com`, ligada à VNet da
aplicação por `link-app-vnet`, com auto-registration desabilitado. Este é o caminho
de PostgreSQL Flexible Server **private access/VNet integration**.
O Container App tem ingress HTTPS público, com target port `3000`.

O fluxo automatizado é `push` na `main` → build/push das imagens → validação de
digests imutáveis → login Azure por OIDC → execução do migration Job → deploy do
Container App por digest. O deploy só ocorre depois que a migration gate passa.
O build usa `GITHUB_TOKEN` apenas para publicar no GHCR. O deploy e o migration
Job usam os secrets duráveis `GHCR_USERNAME` e `GHCR_READ_TOKEN` para pulls.
Os cinco secrets do ambiente `production` são `AZURE_CLIENT_ID`,
`AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`, `GHCR_USERNAME` e
`GHCR_READ_TOKEN`; o workflow não usa `AZURE_CREDENTIALS`. A variável de
repositório `AZURE_MIGRATION_JOB_NAME` identifica o Job existente.

A credencial federada deve usar o subject exato
`repo:Samuel-Ricardo/Tax-Invoice-Issuer-FC:environment:production`, com issuer
`https://token.actions.githubusercontent.com` e audience
`api://AzureADTokenExchange`. A identidade OIDC tem **Contributor** no resource
group atual; a identidade system-assigned do Container App tem **Key Vault
Secrets User** no Key Vault. São identidades diferentes.

Sempre copie a Application Url atual da página **Overview** do Container App.
O smoke test é `GET /`, que deve retornar HTTP `200` e
`{"hello":"world"}`. `POST /invoice` aceita `month`, `year`, `type` e `format`
opcional; `format: "pdf"` é aceito intencionalmente como no-op. A resposta de
sucesso é um array JSON estruturado, serializado uma vez, e não uma string JSON
escapada. O Postman deve afirmar que o valor parseado é um array. Um resultado
`cash` `[]` para 2024 é inconclusivo contra o fixture de 2022; o caminho accrual
observado retornou 3 invoices do fixture. Não existe `/health`, `/swagger`,
`/api-docs` ou `/swagger.json`; `npm run docs:swagger` gera apenas um arquivo local.

O aplicativo exige uma `DATABASE_URL` completa, armazenada no secret
`database-url` do Key Vault e mapeada por `kv-database-url`. Variáveis separadas
de banco não formam essa URL. O migration Job executa somente
`migration/create.sql` via `Dockerfile.migrations`/`migration/runner.sh`, não
executa `migration/versions/`, e faz `DROP SCHEMA sam CASCADE`, recria schema e
tabelas e semeia o fixture de 2022 em uma transação. Esse reset é intencional:
cada deployment reseta e resemeia o banco. O `uuid-ossp` deve estar na allowlist
do Flexible Server e o principal precisa de `CONNECT`, `CREATE` e privilégios
para apagar/recriar `sam` em `<DATABASE_NAME>`.

O log `[DATABASE] | Connected with PostgreSQL` confirma a conexão observada.
GitHub Actions passou, e deployment/migration/conectividade foram verificados nos
logs. O E2E local foi bloqueado pela ausência de `DATABASE_URL`; não o descreva
como aprovado. Depois de alterar ou recriar o secret, faça Recover/Purge se o nome
estiver soft-deleted e reinicie o Container App ou crie uma nova revision para
reler o valor. Ainda existe um defeito separado: algumas respostas de erro
retornam HTTP `200` com `status: 500` no corpo.

> ⚠️ `infra_public/` e os defaults de documentos antigos são legados/não atuais.
> Nomes como `rg-tax-invoice-fc`, `cae-tax-invoice-fc` e
> `ca-tax-invoice-fc-api` não pertencem ao workflow atual.

### 📑 Índice Geral

- **[INDEX - Toda Documentação](./docs/INDEX.md)** - Navegação completa de todos os recursos

---

## 🚀 Quick Start

### Instalação

```bash
# Clone o repositório
git clone https://github.com/Samuel-Ricardo/Tax-Invoice-Issuer-FC.git
cd Tax-Invoice-Issuer-FC

# Instale as dependências
npm install

# Configure o ambiente
cp .env.example .env

# Build do projeto
npm run build

# Inicie o servidor
npm run start
```

Servidor rodando em: **http://localhost:3000**

### Testar a API

**Opção 1: Postman (Recomendado)**

```bash
# Importe os arquivos da pasta postman/ no Postman
# Selecione o environment "Tax Invoice Issuer - Local"
# Execute "Health Check" → GET /
```

**Opção 2: cURL**

```bash
# Health Check
curl http://localhost:3000/

# Generate Invoice (Cash Basis)
curl -X POST http://localhost:3000/invoice \
  -H "Content-Type: application/json" \
  -d '{
    "month": 1,
    "year": 2024,
    "type": "cash"
  }'
```

---

## 🎯 API Endpoints

### Health Check

```http
GET /
```

**Response**:

```json
{
  "hello": "world"
}
```

### Generate Invoice

```http
POST /invoice
Content-Type: application/json

{
  "month": 1,           // 1-12
  "year": 2024,         // Year
  "type": "cash",       // "cash" | "accrual"
  "format": "pdf"       // Optional; accepted as a no-op
}
```

`format: "pdf"` is intentionally accepted as a no-op. PDF is intentionally not
implemented, so no PDF file or PDF response should be expected.

**Response Success (200)**:

```json
[
  {
    "date": "2024-01-15T00:00:00.000Z",
    "amount": 1500.5
  }
]
```

**Response Error (400)**:

```json
{
  "error": "Validation error message",
  "status": 400
}
```

---

## 🧪 Testes

### Coleção Postman

**23 requests** (~42 assertions) organizados em 6 categorias:

- ✅ Health Check (1)
- ✅ Happy Path (3)
- ✅ Validation - Required Fields (4)
- ✅ Validation - Data Types (4)
- ✅ Edge Cases (7)
- ✅ Security (4)

**Importar**:

1. Abra o Postman
2. Import → Folder → Selecione `postman/` (importa coleção + 2 environments)
3. Selecione o environment (canto superior direito): **Tax Invoice Issuer - Local** (local) ou **Tax Invoice Issuer - Azure Learn-prod** (deploy Azure)
4. Run Collection

### Configurar Postman (Passo a Passo)

1. Abra o Postman → **Import** → **Folder** → selecione `postman/` (importa a coleção e os 2 environments)
2. Escolha o environment no canto superior direito:
   - **Tax Invoice Issuer - Local** → API em `http://localhost:3000` (antes rode `npm run build && npm run start`)
   - **Tax Invoice Issuer - Azure Learn-prod** → URL registrada (confirme a URL atual no **Overview** do Container App)
3. ⚠️ A variável `baseUrl` da coleção tem como padrão a URL do Azure — selecione um environment acima para sobrescrever
4. Execute primeiro o **Health Check → GET /** (esperado: `{"hello":"world"}` com HTTP 200)
5. Para rodar tudo: botão direito na coleção **"Tax Invoice Issuer - Full Coverage"** → **Run collection**
6. No Azure, `POST /invoice` só passará depois que o container tiver `DATABASE_URL` válida configurada (veja Troubleshooting em `postman/README.md`)

**Documentação completa**: [postman/README.md](./postman/README.md)

---

## 🏗️ Arquitetura e Padrões

### Design Patterns Implementados

1. **Strategy Pattern** - Estratégias de cálculo (Cash vs Accrual)
2. **Specification Pattern** - Validação de regras de negócio
3. **Repository Pattern** - Acesso a dados
4. **Factory Pattern** - Criação de objetos
5. **Mediator Pattern** - Comunicação via eventos
6. **Decorator Pattern** - Validação, logging, error handling
7. **Dependency Injection** - IoC com InversifyJS

### Clean Architecture

```
src/
├── @decorators/       # Cross-cutting concerns
├── @modules/
│   ├── application/   # Controllers, Use Cases, Specifications
│   ├── domain/        # Entities, Services, Strategies
│   └── infra/         # Server, Database, Validators
├── @types/            # TypeScript types
└── @utils/            # Utilities
```

**Análise completa**: [docs/ANALISE-PROFUNDA.md](./docs/ANALISE-PROFUNDA.md)

---

## 🚀 Como Rodar o Projeto

### Opção 1: Rodando Localmente (Node.js)

#### Pré-requisitos

- **Node.js**: 25.x LTS ou superior
- **npm**: 10.x ou superior
- **PostgreSQL**: 15+ (opcional, se usar banco local)

#### Passos

```bash
# 1. Clone o repositório
git clone https://github.com/Samuel-Ricardo/Tax-Invoice-Issuer-FC.git
cd Tax-Invoice-Issuer-FC

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas configurações

# 4. Build do projeto
npm run build

# 5. Inicie o servidor
npm run start
```

**Servidor rodando em**: http://localhost:3000

#### Desenvolvimento (com auto-reload)

```bash
npm run dev
```

---

### Opção 2: Rodando com Docker

#### Pré-requisitos

- **Docker**: 20.10+ instalado
- **Docker Compose**: 2.0+ instalado

#### Build da Imagem

```bash
# Build da imagem Docker
docker build -t tax-invoice-issuer-fc:latest .

# Rodar container
docker run -p 3000:3000 --env-file .env tax-invoice-issuer-fc:latest
```

**Servidor rodando em**: http://localhost:3000

---

### Opção 3: Rodando com Docker Compose (Recomendado)

#### Pré-requisitos

- **Docker**: 20.10+
- **Docker Compose**: 2.0+

#### Passos

```bash
# 1. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env se necessário

# 2. Inicie todos os serviços
docker-compose up -d

# 3. Verifique se os containers estão rodando
docker-compose ps
```

**Serviços iniciados**:

- 🌐 **API**: http://localhost:3000
- 🗄️ **PostgreSQL**: localhost:5432
- 🔧 **PgAdmin**: http://localhost:5050 (opcional, se configurado)

#### Comandos úteis

```bash
# Ver logs da aplicação
docker-compose logs -f app

# Ver logs do banco de dados
docker-compose logs -f postgres

# Parar todos os serviços
docker-compose down

# Parar e remover volumes (cuidado!)
docker-compose down -v

# Reconstruir a imagem
docker-compose build --no-cache
```

#### Acessar o Banco de Dados

```bash
# Via psql
psql -h localhost -U postgres -d tax_invoice_db

# Via Docker
docker-compose exec postgres psql -U postgres -d tax_invoice_db
```

---

## 🧪 Executar Testes

```bash
# Testes unitários
npm test

# Testes com cobertura
npm run test:coverage

# Testes em modo watch
npm run test:watch
```

---

## 📊 Stack Tecnológico

### Backend

- **Runtime**: Node.js 25.x
- **Language**: TypeScript 5.x
- **Framework**: Express 4.x
- **DI Container**: InversifyJS
- **Validation**: Zod
- **Database**: PostgreSQL

### DevOps

- **Containerization**: Docker + Docker Compose
- **Build**: TypeScript Compiler (tsc)
- **Linting**: ESLint
- **Formatting**: Prettier

### Testing

- **API Testing**: Postman Collection; consulte o [guia atual](./postman/README.md) para expectativas e limitações
- **Unit Testing**: Jest (estrutura criada)
- **E2E Testing**: estrutura existente; a execução local deve ser reportada somente com evidência atual

---

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Modo desenvolvimento

# Build
npm run build            # Compilar TypeScript

# Produção
npm run start            # Iniciar servidor (após build)

# Testes
npm run test             # Executar testes unitários
npm run test:e2e         # Executar testes E2E

# Documentação
npm run docs:swagger     # Gerar Swagger docs

# Linting
npm run lint             # Executar ESLint
npm run format           # Formatar código com Prettier
```

---

## 📦 Estrutura do Projeto

```
Tax-Invoice-Issuer-FC/
├── docs/                           # 📚 Documentação completa
│   ├── INDEX.md                   # Índice de navegação
│   ├── RELATORIO-EXECUTIVO.md     # Relatório para gestores
│   ├── ANALISE-PROFUNDA.md        # Análise técnica
│   └── QUICK-START-TESTS.md       # Guia rápido
│
├── postman/                                    # 🧪 Coleção de testes
│   ├── README.md                               # Guia da coleção
│   ├── Tax-Invoice-Issuer.postman_collection.json            # 23 requests / ~42 assertions
│   ├── Tax-Invoice-Issuer.postman_environment.json           # Environment Local
│   └── Tax-Invoice-Issuer-Azure.postman_environment.json     # Environment Azure Learn-prod
│
├── src/                            # 💻 Código fonte
│   ├── @decorators/               # Decorators (Validation, Logging)
│   ├── @lib/                      # Bibliotecas compartilhadas
│   ├── @modules/                  # Módulos principais
│   │   ├── application/           # Controllers, Services
│   │   ├── domain/                # Entities, Strategies
│   │   └── infra/                 # Server, Database, Config
│   ├── @types/                    # Tipos TypeScript
│   └── @utils/                    # Utilitários
│
├── test/                           # ✅ Testes automatizados
├── docker-compose.yaml             # 🐳 Docker setup
└── package.json                    # 📦 Dependências
```

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📝 License

Este projeto é licenciado sob a MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 👨‍💻 Autor

**Samuel Ricardo**

- GitHub: [@Samuel-Ricardo](https://github.com/Samuel-Ricardo)
- Repository: [Tax-Invoice-Issuer-FC](https://github.com/Samuel-Ricardo/Tax-Invoice-Issuer-FC)

---

## 🙏 Agradecimentos

- Full Cycle MBA - Metodologia e aprendizado
- Clean Architecture - Robert C. Martin
- Domain-Driven Design - Eric Evans
- Design Patterns - Gang of Four

---

## 📞 Suporte

**Precisa de ajuda?**

- 📖 Veja a [Documentação Completa](./docs/INDEX.md)
- 🐛 Reporte bugs via [Issues](https://github.com/Samuel-Ricardo/Tax-Invoice-Issuer-FC/issues)
- 💬 Discussões no [GitHub Discussions](https://github.com/Samuel-Ricardo/Tax-Invoice-Issuer-FC/discussions)

---

**⭐ Se este projeto foi útil, considere dar uma estrela!**
