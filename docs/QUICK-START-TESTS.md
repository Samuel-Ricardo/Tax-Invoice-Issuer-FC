# 🚀 Quick Start - Testing Guide

## ⚡ Quick Start (5 minutes)

### 1. Project Setup

```bash
# Install dependencies (if not done yet)
npm install

# Build project
npm run build

# Start database (Docker required)
docker-compose up -d postgres
```

**PostgreSQL running at**: `localhost:5432` (user: postgres, pass: postgres, db: invoicesdb)

### 2. Run E2E Tests (Jest + Supertest)

```bash
# Run only E2E tests
npm run test -- test/E2E/ --runInBand

# Run all tests with coverage
npm run test

# Complete pipeline (format + lint + tests)
npm run code:ci
```

**Expected result**:

```
Test Suites: 4 passed, 4 total
Tests:       54 passed, 54 total
```

### 3. Tests via Postman (Optional)

1. Start the application: `npm run start:dev`
2. Open Postman
3. **Import** → **Folder** → Select `postman/` (imports collection + both environments)
4. Select the environment in the upper-right corner:
   - **"Tax Invoice Issuer - Local"** → API at `http://localhost:3000` (server must be running: `npm run start:dev`)
   - **"Tax Invoice Issuer - Azure Learn-prod"** → deployed API at `https://app-tax-invoice-fc-learn.nicebay-c5601d68.brazilsouth.azurecontainerapps.io`
5. ⚠️ Collection variable `baseUrl` defaults to Azure — pick an environment to override. On Azure, `POST /invoice` only works once the container has a valid `DATABASE_URL` (see `postman/README.md` troubleshooting)
6. Select environment **"Tax Invoice Issuer - Local"**

### 4. First Manual Test

```bash
curl http://localhost:3000/
# Expected: {"hello":"world"}

curl -X POST http://localhost:3000/invoice \
  -H "Content-Type: application/json" \
  -d '{"month": 1, "year": 2024, "type": "cash"}'
# Expected: array of invoices JSON
```

---

## 🧪 Implemented E2E Tests

| File                        | Test             | Validates                                                 |
| --------------------------- | ---------------- | --------------------------------------------------------- |
| `test/E2E/server.spec.ts`   | HEALTH CHECK     | `GET /` → status 200, body `{ hello: "world" }`           |
| `test/E2E/invoice.spec.ts`  | GENERATE INVOICE | `POST /invoice` → status 200, array with date             |
| `test/E2E/strategy.spec.ts` | STRATEGY PATTERN | Cash vs Accrual comparison, idempotence, isolation        |
| `test/E2E/http.spec.ts`     | HTTP PROTOCOL    | Routing, headers, resilience, response format consistency |

### Prerequisites

- **Docker with PostgreSQL running** on port 5432
- Credentials: use the local environment configuration for tests; do not publish usernames, passwords, or connection strings in documentation
- The `test/setup-env.ts` sets `DATABASE_URL` automatically

### Troubleshooting

| Error                                    | Cause                            | Solution                                        |
| ---------------------------------------- | -------------------------------- | ----------------------------------------------- |
| `password authentication failed`         | DB not running or wrong password | `docker-compose up -d postgres`                 |
| `connect ECONNREFUSED`                   | PostgreSQL not accessible        | Check `docker ps`                               |
| `relation "sam.contract" does not exist` | Schema not created               | Migration: `migration/create.sql` run by Docker |
| `Jest did not exit`                      | DB pool not closed               | Check `afterAll` with `shutdownDatabase()`      |

---

## 🎯 Priority Tests

### 1️⃣ Smoke Test (MANDATORY)

```
✓ GET / - Health Check
✓ POST /invoice - Cash Basis Success
```

**Time**: 30 seconds  
**Goal**: Verify API is functional

### 2️⃣ Core Functionality (RECOMMENDED)

```
✓ POST /invoice - Cash Basis Success
✓ POST /invoice - Accrual Basis Success
✓ POST /invoice - With Optional Format
```

**Tempo**: 2 minutos  
**Objetivo**: Validar cenários principais

### 3️⃣ Validation Suite (IMPORTANTE)

```
✓ All tests in "Validation - Required Fields"
✓ All tests in "Validation - Data Types"
```

**Tempo**: 3 minutos  
**Objetivo**: Garantir que validações funcionam

### 4️⃣ Full Coverage (COMPLETO)

```
✓ Run entire collection (23 requests)
```

**Tempo**: 5 minutos  
**Objetivo**: Cobertura completa de testes

---

## 📊 Interpretação de Resultados

### ✅ Sucesso (200)

```json
[
  {
    "date": "2024-01-15T00:00:00.000Z",
    "amount": 1500.5
  }
]
```

**Significado**: Invoice gerado com sucesso

### ❌ Erro de Validação (400)

```json
{
  "error": "Validation error message",
  "status": 400
}
```

**Significado**: Dados inválidos enviados

### 🔴 Erro de Servidor (500)

```json
{
  "error": "Internal server error",
  "status": 500
}
```

**Significado**: Bug no código ou problema no servidor

---

## 🐛 Problemas Conhecidos

### ⚠️ Lógica Invertida nas Strategies

**Sintoma**: Invoices gerados para o mês/ano ERRADO

**Exemplo**:

```
Request: month=1, year=2024
Esperado: Invoices de Janeiro/2024
Atual: Invoices de TODOS os meses EXCETO Janeiro
```

**Causa**: Condição `!==` ao invés de `===` nas strategies

**Workaround**: Não há. Precisa de fix no código.

**Fix Necessário**:

```typescript
// cash.strategy.ts:24 e accrual.strategy.ts:20
// DE:
if (payment.date.getMonth() + 1 !== month || ...)
// PARA:
if (payment.date.getMonth() + 1 === month && ...)
```

---

## 🔍 Debugging Tips

### Servidor não inicia

```bash
# Verificar se porta 3000 está em uso
netstat -ano | findstr :3000

# Matar processo na porta 3000 (Windows)
taskkill /PID <PID> /F

# Ou mudar porta
# No código: ExpressServerAdapter.listen(3001)
```

### Testes sempre falham

1. Confirme environment: **Tax Invoice Issuer - Local** (ou **Tax Invoice Issuer - Azure Learn-prod** para o deploy)
2. Verifique baseUrl: `http://localhost:3000`
3. Teste manual: `curl http://localhost:3000`

### Validações não funcionam

1. Verifique logs do servidor
2. Confirme que Zod está validando
3. Teste com Postman Console aberto

---

## 📋 Checklist Pré-Deploy

- [ ] Todos testes de Happy Path passam
- [ ] Validações de campos obrigatórios funcionam
- [ ] Validações de tipos de dados funcionam
- [ ] Edge cases tratados adequadamente
- [ ] Sem console.errors ou warnings
- [ ] Logs estruturados funcionando
- [ ] Documentação atualizada

---

## 🎓 Aprendizados

### Design Patterns Implementados

1. **Strategy**: Cash vs Accrual
2. **Specification**: Validação de regras
3. **Repository**: Acesso a dados
4. **Factory**: Criação de objetos
5. **Mediator**: Comunicação entre componentes
6. **Decorator**: Validação, logging, error handling

### Clean Architecture

- **Domain**: Entities, Services, Strategies
- **Application**: Use Cases, Controllers, Specifications
- **Infrastructure**: Server, Database, Validators

### Dependency Injection

- **Container**: InversifyJS
- **Decorators**: `@inject`, `@injectable`
- **Modules**: Organizados por domínio

---

<br>

- Test Name Pattern: [TEST_TYPE] | [ENTITY] - [SCOPE] > ACTION

<br>

---

## 📞 Suporte

### Encontrou um Bug?

1. Verifique se não é um dos [problemas conhecidos](#-problemas-conhecidos)
2. Consulte a [análise profunda](./ANALISE-PROFUNDA.md)
3. Abra uma issue no repositório

### Precisa de Ajuda?

- Documentação completa: `postman/README.md`
- Análise técnica: `docs/ANALISE-PROFUNDA.md`
- API Schema: `docs/swagger.json` (quando disponível)

---

**Happy Testing! 🧪**
