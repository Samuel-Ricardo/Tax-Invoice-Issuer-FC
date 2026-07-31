# 🔐 SECURITY.md - Tax-Invoice-Issuer-FC

Guia de boas práticas de segurança para este repositório público.

## ⚠️ POLÍTICAS OBRIGATÓRIAS

### 1. **NUNCA Commitar Secrets**

❌ **PROIBIDO:**

```bash
git add .env                                    # Arquivo com secrets
git add infra/                                  # Versão local com credenciais
git add *-credentials.json                      # Service Principals
git add *.pem *.key                             # SSH/API Keys
```

✅ **SEMPRE:**

```bash
git add infra_public/                           # Versão pública segura
git add .gitignore                              # Protege files sensíveis
git add infra_public/.gitignore                 # Dobro proteção
```

### 2. **Hierarquia de Armazenamento de Secrets**

```
┌─────────────────────────────────────────────────────────────┐
│  MAIS SEGURO                                                │
├─────────────────────────────────────────────────────────────┤
│ 1️⃣  Azure Key Vault (secrets no código Azure)              │
│     ✅ Managed Identity access                              │
│     ✅ Encryption at rest + in transit                      │
│     ✅ Audit logs automáticos                               │
│     ✅ Rotation policies                                    │
├─────────────────────────────────────────────────────────────┤
│ 2️⃣  GitHub Secrets (CI/CD apenas)                          │
│     ✅ Only exposed to Actions workflows                    │
│     ✅ Not displayed in logs (masked)                       │
│     ✅ Per environment scopes                               │
│     ⚠️  NÃO para dados de longa vida                        │
├─────────────────────────────────────────────────────────────┤
│ 3️⃣  .env.local (desenvolvimento local APENAS)              │
│     ✅ Criado localmente, nunca commitado                   │
│     ✅ Em .gitignore para sempre                            │
│     ⚠️  Compartilhe via canal seguro (1Password, LastPass)  │
├─────────────────────────────────────────────────────────────┤
│  NUNCA ❌                                                    │
├─────────────────────────────────────────────────────────────┤
│ ❌ Hardcoded em código-fonte                                │
│ ❌ Commitado em repositórios públicos                       │
│ ❌ Printado em logs ou console                              │
│ ❌ Compartilhado via email ou Slack                         │
│ ❌ Armazenado em comentários de commit                      │
│ ❌ Versionado em branch history                             │
└─────────────────────────────────────────────────────────────┘
```

### 3. **Checklist de Segurança Antes de Cada Commit**

```bash
# Verificar por secrets antes de fazer commit
git diff HEAD | grep -E "password|secret|key|token|credential|apikey" && {
  echo "❌ ALERTA: Possível secret detectado!"
  echo "   Use: git reset HEAD <file>"
  exit 1
} || echo "✅ Nenhum secret detectado"

# Verificar arquivos em .gitignore
git status --short | grep "^?" | while read _ file; do
  grep -q "$(basename "$file")" .gitignore && \
    echo "✅ $file está em .gitignore" || \
    echo "⚠️  $file NÃO está em .gitignore"
done
```

---

## 🔍 Monitorar Vazamento de Secrets

### GitHub Secret Scanning (ativado por padrão)

GitHub automaticamente scanneia por padrões conhecidos de secrets:

- AWS keys
- Azure credentials
- Private keys (RSA, DSA, EC)
- Tokens pessoais
- Database strings com senhas

**Ativar notificações:**

1. Settings → Code security & analysis
2. Enable "Secret scanning alerts"
3. Enable "Push protection" (bloqueia commits com secrets)

### Local Pre-commit Hook

Adicione a `.git/hooks/pre-commit`:

```bash
#!/bin/bash
# Bloqueia commits com secrets óbvios

echo "🔍 Scanning for secrets..."

if git diff-index --cached HEAD | grep -E "\.(env|key|pem|password|token|secret)" > /dev/null; then
  echo "❌ Arquivo sensível detectado no staged area!"
  echo "   Execute: git reset HEAD <file>"
  exit 1
fi

exit 0
```

Ativar:

```bash
chmod +x .git/hooks/pre-commit
```

---

## 📋 Ambiente Local Setup

### 1. Criar `.env.local` (NUNCA COMMITAR)

```bash
# .env.local
# Este arquivo está em .gitignore

POSTGRES_PASSWORD="seu-password-temporario"
DATABASE_HOST="localhost"
DATABASE_PORT="5432"
DATABASE_USER="pgadmin"
DATABASE_NAME="invoicesdb"
NODE_ENV="development"
```

**Depois de criar:**

```bash
git status | grep ".env" && echo "✅ .env está em .gitignore" || {
  echo "❌ ALERTA: .env NÃO está em .gitignore!"
  echo "   Adicione: echo '.env' >> .gitignore"
  exit 1
}
```

### 2. Credenciais para Time (Seguro)

**Usar 1Password, LastPass, ou Vault corporativo:**

```bash
# NUNCA via email/Slack
op run --env-file=.env.teamvault -- npm start

# Ou manualmente
export $(cat .env.teamvault | xargs)
npm start
```

---

## 🚀 CI/CD Security (GitHub Actions)

### Setup Seguro para Secrets em GitHub

```yaml
# .github/workflows/deploy.yml

name: Deploy to Azure

on: [push, pull_request]

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production # Environment-specific secrets

    steps:
      - uses: actions/checkout@v3

      - name: Azure Login (Masked)
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }} # Automaticamente masked

      - name: Deploy (Secrets nunca printados)
        run: |
          # ❌ NUNCA faça isso:
          # echo "Password: ${{ secrets.DATABASE_PASSWORD }}"

          # ✅ SEMPRE use assim:
          az keyvault secret set \
            --vault-name "${{ secrets.KEY_VAULT_NAME }}" \
            --name database-password \
            --value "${{ secrets.DATABASE_PASSWORD }}"
```

### Variaveis vs Secrets

| Tipo               | Uso                            | Masking                        |
| ------------------ | ------------------------------ | ------------------------------ |
| `${{ secrets.* }}` | Credenciais, Tokens, Passwords | ✅ Automático (\*\*\*) em logs |
| `${{ vars.* }}`    | Configuração pública           | ❌ Não mascarado               |

```yaml
# Secrets (sensitivo)
- run: echo ${{ secrets.DATABASE_PASSWORD }} # Printa: ***

# Variables (público)
- run: echo ${{ vars.DEPLOYMENT_REGION }} # Printa: eastus
```

---

## 🧪 Teste de Segurança

### Verificar Exposição Acidental

```bash
# Procurar passwords em comentários
grep -r "password\|secret\|api.*key" . --include="*.js" --include="*.ts" --include="*.env*" | \
  grep -v node_modules | grep -v ".git" | grep -v "docs/" && {
  echo "❌ Secrets encontrados no código!"
} || echo "✅ Nenhum secret detectado"

# Verificar .env files
find . -name ".env*" -not -path "./node_modules/*" | {
  grep -q ".env" && echo "⚠️  Arquivos .env encontrados" || echo "✅ Sem .env files"
}

# Verificar key files
find . -name "*.pem" -o -name "*.key" -o -name "*.jks" | {
  wc -l | grep -q "^0$" && echo "✅ Sem key files" || \
    echo "❌ Key files encontrados - adicione em .gitignore!"
}
```

---

## 📞 Incidente de Segurança

### Se descobrir um secret commitado:

1. **Revoke imediatamente** (Azure Portal, GitHub, etc)
2. **Alterar a senha** em produção
3. **Reescrever git history:**
   ```bash
   # Remover arquivo de todo o histórico
   git filter-branch --tree-filter 'rm -f <file>' -- --all
   git push origin --force --all
   ```
4. **Notificar administrador**
5. **Documentar no GitHub Discussions / Issue**

---

## 📊 Auditoria de Segurança

### GitHub Settings para Public Repos

```
Settings → Security & analysis:
✅ Dependabot alerts
✅ Dependabot security updates
✅ Secret scanning
✅ Secret scanning push protection
✅ Code scanning (GitHub Advanced Security)
```

### Azure Monitoring

```bash
# Ver logs de acesso ao Key Vault
az monitor log-analytics query \
  --workspace-id $WORKSPACE_ID \
  --analytics-query "AzureDiagnostics | where ResourceType == \"VAULTS\""

# Audit Trail
az keyvault monitor log show \
  --vault-name kv-tax-invoice-fc
```

---

## 🎓 Treinamento

**Links úteis:**

- [OWASP Top 10 - A02 - Cryptographic Failures](https://owasp.org/Top10/A02_2021-Cryptographic_Failures/)
- [CWE-798: Use of Hard-Coded Credentials](https://cwe.mitre.org/data/definitions/798.html)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [Azure Key Vault Security](https://learn.microsoft.com/en-us/azure/key-vault/general/security-overview)

---

## 👤 Responsabilidades

| Role           | Responsável por                              |
| -------------- | -------------------------------------------- |
| **Developer**  | Não commitar secrets, usar .gitignore        |
| **Reviewer**   | Verificar diffs por secrets antes de approve |
| **Maintainer** | Ativar push protection, monitorar alerts     |
| **DevOps**     | Rotar secrets regularmente, auditar access   |

---

## 📝 Changelog

| Data       | Versão | Mudanças          |
| ---------- | ------ | ----------------- |
| 2026-07-12 | 1.0    | Documento inicial |

---

**Última revisão**: 2026-07-12  
**Status**: ✅ Ativo
