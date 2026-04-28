# 🚀 Quick Start - Testing Guide

## ⚡ Início Rápido (5 minutos)

### 1. Setup do Projeto

```bash
# Instalar dependências (se ainda não fez)
npm install

# Build do projeto
npm run build

# Iniciar servidor
npm run start
```

**Servidor rodando em**: http://localhost:3000

### 2. Importar no Postman

1. Abra o Postman
2. **Import** → **Folder** → Selecione `postman/`
3. Selecione environment **"Tax Invoice Issuer - Local"**

### 3. Primeiro Teste

Execute: **Health Check → GET /**

✅ **Esperado**:

```json
{
  "hello": "world"
}
```

### 4. Teste Completo (Happy Path)

Execute: **Happy Path → POST /invoice - Cash Basis Success**

✅ **Esperado**: Array de invoices com status 200

---

## 🎯 Testes Prioritários

### 1️⃣ Smoke Test (OBRIGATÓRIO)

```
✓ GET / - Health Check
✓ POST /invoice - Cash Basis Success
```

**Tempo**: 30 segundos  
**Objetivo**: Verificar se API está funcional

### 2️⃣ Core Functionality (RECOMENDADO)

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

1. Confirme environment: **Tax Invoice Issuer - Local**
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
