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

### 🚀 Começar Agora

- **[Quick Start - Testing Guide](./docs/QUICK-START-TESTS.md)** - Setup em 5 minutos e primeiros testes

### 📊 Para Gestores & Tech Leads

- **[Relatório Executivo](./docs/RELATORIO-EXECUTIVO.md)** - Status, problemas críticos e recomendações

### 🔍 Para Desenvolvedores & Arquitetos

- **[Análise Profunda](./docs/ANALISE-PROFUNDA.md)** - Arquitetura detalhada, padrões e análise técnica

### 🧪 Para QA & Testers

- **[Coleção Postman](./postman/README.md)** - 23 requests com 60+ assertions
- **[Importar Coleção](./postman/Tax-Invoice-Issuer.postman_collection.json)** - Arquivo JSON

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
  "format": "pdf"       // Optional
}
```

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

**23 requests** organizados em 6 categorias:

- ✅ Health Check (1)
- ✅ Happy Path (3)
- ✅ Validation - Required Fields (4)
- ✅ Validation - Data Types (4)
- ✅ Edge Cases (7)
- ✅ Security (4)

**Importar**:

1. Abra o Postman
2. Import → Folder → Selecione `postman/`
3. Selecione environment "Tax Invoice Issuer - Local"
4. Run Collection

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

- **API Testing**: Postman Collection (23 requests)
- **Unit Testing**: Jest (estrutura criada)
- **E2E Testing**: Estrutura criada

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
├── postman/                        # 🧪 Coleção de testes
│   ├── README.md                  # Guia da coleção
│   ├── *.postman_collection.json  # 23 requests
│   └── *.postman_environment.json # Environment local
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
