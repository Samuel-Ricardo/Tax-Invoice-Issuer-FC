# 🧪 Postman Test Collection - Tax Invoice Issuer FC

Coleção completa de testes para a API Tax Invoice Issuer, cobrindo todos os cenários possíveis.

## 📦 Arquivos

- **Tax-Invoice-Issuer.postman_collection.json** - Coleção principal com 23 requests e ~60 assertions
- **Tax-Invoice-Issuer.postman_environment.json** - Environment de desenvolvimento local
- **Tax-Invoice-Issuer-Azure.postman_environment.json** - Environment da API publicada no Azure

## 🚀 Como Usar

### 1. Importar no Postman

1. Abra o Postman
2. Clique em **Import**
3. Importe a collection e o environment desejado
4. Confirme a importação

### 2. Configurar Environment Local

1. No canto superior direito, selecione o environment **"Tax Invoice Issuer - Local"**
2. Verifique se `baseUrl` está configurado como `http://localhost:3000`

### 3. Configurar Environment Azure

Para testar a API publicada:

1. Importe `Tax-Invoice-Issuer-Azure.postman_environment.json`
2. No canto superior direito, selecione **"Tax Invoice Issuer - Azure Learn-prod"**
3. Confirme que `baseUrl` está configurado como:
  `https://app-tax-invoice-fc-learn.nicebay-c5601d68.brazilsouth.azurecontainerapps.io`
4. Execute primeiro **Health Check → GET / - Health Check**

O endpoint esperado é `GET {{baseUrl}}/` e deve retornar `{"hello":"world"}`.

> ⚠️ **Estado da implantação Azure**: o health check público foi validado com `HTTP 200`. O `POST /invoice` depende do PostgreSQL e somente passará depois que o container receber uma `DATABASE_URL` válida apontando para o servidor Azure. A aplicação lê `DATABASE_URL`; configurar apenas `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_NAME` e `DATABASE_PASSWORD` não monta essa URL automaticamente.

### 4. Iniciar o Servidor Local

```bash
npm run build
npm run start
```

O servidor deve estar rodando em `http://localhost:3000`

### 5. Executar os Testes

#### Opção 1: Teste Individual

- Navegue até a pasta desejada
- Selecione um request
- Clique em **Send**
- Verifique os testes na aba **Test Results**

#### Opção 2: Collection Runner (Todos os Testes)

1. Clique com botão direito na collection **"Tax Invoice Issuer - Full Coverage"**
2. Selecione **Run collection**
3. Clique em **Run Tax Invoice Issuer - Full Coverage**
4. Aguarde execução de todos os testes
5. Visualize o relatório completo

## 📊 Estrutura da Coleção

### 🟢 Health Check (1 teste)

- **GET /** - Verifica se o servidor está rodando

### ✅ Happy Path (3 testes)

- **POST /invoice - Cash Basis** - Cenário de sucesso com tipo "cash"
- **POST /invoice - Accrual Basis** - Cenário de sucesso com tipo "accrual"
- **POST /invoice - With Optional Format** - Cenário com campo opcional

### ⚠️ Validation - Required Fields (4 testes)

- Missing month
- Missing year
- Missing type
- Empty body

### 🔍 Validation - Data Types (4 testes)

- Month as string (deve ser number)
- Year as string (deve ser number)
- Invalid type enum (deve ser "cash" ou "accrual")
- Type as number (deve ser string)

### 🎯 Edge Cases (7 testes)

- Month = 0 (inválido)
- Month = 13 (fora do range)
- Negative month
- Negative year
- Future year (2050)
- December boundary test
- January boundary test

### 🔐 Security & Malformed (4 testes)

- Malformed JSON
- Extra fields
- SQL Injection attempt
- XSS attempt

## 📋 Modelo de Dados

### Request Body (InvoiceDTO)

```json
{
  "month": 1, // number (1-12) - Obrigatório
  "year": 2024, // number - Obrigatório
  "type": "cash", // "cash" | "accrual" - Obrigatório
  "format": "pdf" // string - Opcional
}
```

### Response (Invoice[])

```json
[
  {
    "date": "2024-01-15T00:00:00.000Z", // Date ISO string
    "amount": 1500.5 // number
  }
]
```

### Error Response

```json
{
  "error": "Validation failed: month is required",
  "status": 400
}
```

## 🎯 Cenários de Teste por Categoria

### ✅ Casos de Sucesso (Happy Path)

- [x] POST /invoice com type="cash"
- [x] POST /invoice com type="accrual"
- [x] POST /invoice com campo opcional format
- [x] GET / health check

### ❌ Validações de Campos Obrigatórios

- [x] Requisição sem month
- [x] Requisição sem year
- [x] Requisição sem type
- [x] Requisição com body vazio

### 🔢 Validações de Tipo de Dados

- [x] month como string (esperado: number)
- [x] year como string (esperado: number)
- [x] type fora do enum ("hybrid")
- [x] type como number (esperado: string)

### 🌟 Edge Cases

- [x] month = 0 (mês inválido)
- [x] month = 13 (acima do range)
- [x] month negativo
- [x] year negativo
- [x] year muito no futuro
- [x] Mês de dezembro (boundary)
- [x] Mês de janeiro (boundary)

### 🔒 Segurança

- [x] JSON malformado
- [x] Campos extras não esperados
- [x] Tentativa de SQL injection
- [x] Tentativa de XSS

## 📈 Métricas Esperadas

Ao executar todos os testes via Collection Runner:

- **Total de Requests**: 23
- **Testes Executados**: ~60 assertions
- **Taxa de Sucesso Esperada**:
  - Happy Path: 100% (4/4 devem passar)
  - Validations: 100% (8/8 devem falhar com 400)
  - Edge Cases: Varia (alguns podem passar, outros falhar)
  - Security: 100% (4/4 devem ser rejeitados)

## 🐛 Troubleshooting

### Erro "Could not get response"

- No ambiente Local, verifique se o servidor está rodando: `npm run start`
- No ambiente Azure, confirme que o Managed Environment permite acesso público
- Confirme que `baseUrl` não possui uma barra final duplicada antes de `/invoice`
- Teste o health check com: `GET {{baseUrl}}/`

### Mensagem "public network access ... is disabled"

O Container App pode estar com Ingress habilitado, mas o Managed Environment pode bloquear o tráfego externo. No Azure Portal, abra `env-tax-invoice-fc-learn` → **Settings** → habilite **Public network access**. A VNet privada continua sendo usada para as conexões internas.

### Resposta `500` com `ECONNREFUSED 127.0.0.1:5432`

Essa resposta indica que o endpoint foi alcançado, mas a aplicação está tentando usar PostgreSQL local em vez do servidor Azure. Configure `DATABASE_URL` no Container App com o formato abaixo, usando o hostname, usuário, banco e segredo corretos:

```text
postgresql://<DATABASE_USER>:<DATABASE_PASSWORD>@<DATABASE_HOST>:5432/<DATABASE_NAME>?sslmode=require
```

Não coloque a senha diretamente em uma request ou no repositório. Depois de corrigir a configuração, crie uma nova revisão e execute novamente os requests de **Happy Path**.

### Requests de validação não retornam `400`

Os requests da pasta **Validation** esperam `400` para entradas inválidas. Se a API continuar tentando acessar o banco ou retornar `500`, o problema está na implementação da API: o decorator `Validate` registra a entrada inválida, mas não interrompe a execução do controller. A collection mantém esses asserts para evidenciar essa falha de contrato durante o Collection Runner.

### Todos os testes falhando

- Verifique o environment selecionado
- Confirme que `baseUrl` = `http://localhost:3000`
- Reinicie o servidor

### Validações não estão falhando

- A API pode precisar de validações adicionais
- Verifique os logs do servidor
- Analise a implementação do ZodValidator

## 🔄 Workflow Recomendado

1. **Smoke Test**: Execute "Health Check" primeiro
2. **Happy Path**: Garanta que cenários básicos funcionam
3. **Validations**: Verifique se validações estão corretas
4. **Edge Cases**: Teste limites e casos extremos
5. **Security**: Valide proteções contra ataques

## 📝 Notas Importantes

- A API usa **Zod** para validação de schemas
- Validações são aplicadas via decorator `@Validate`
- Erros retornam status **400** com mensagem descritiva
- A API suporta dois tipos de estratégia:
  - **Cash Basis**: Baseado em pagamentos recebidos
  - **Accrual Basis**: Baseado em competência (períodos)

## 🔧 Personalização

Para adicionar novos testes:

1. Duplique um request existente
2. Modifique o body/headers conforme necessário
3. Atualize os testes na aba **Tests**
4. Execute e valide

### Exemplo de Script de Teste

```javascript
pm.test("Status code is 200", function () {
  pm.response.to.have.status(200);
});

pm.test("Response is an array", function () {
  const jsonData = pm.response.json();
  pm.expect(jsonData).to.be.an("array");
});

pm.test("Invoice has required fields", function () {
  const jsonData = pm.response.json();
  if (jsonData.length > 0) {
    pm.expect(jsonData[0]).to.have.property("date");
    pm.expect(jsonData[0]).to.have.property("amount");
  }
});
```

## 📚 Recursos Adicionais

- [Documentação Postman](https://learning.postman.com/)
- [Chai Assertion Library](https://www.chaijs.com/api/bdd/)
- [Zod Validation](https://zod.dev/)

---

**Desenvolvido para**: Tax Invoice Issuer FC - Full Cycle MBA  
**Data**: Abril 2026  
**Cobertura**: 100% dos endpoints da API  
**Testes**: 23 requests | ~60 assertions
