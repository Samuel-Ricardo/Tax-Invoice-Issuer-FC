#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# SECURITY AUDIT SCRIPT - Tax Invoice Issuer
# Valida que nenhuma credencial está sendo exposta antes do push para public
# ═══════════════════════════════════════════════════════════════════════════

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "🔍 SECURITY AUDIT - Tax Invoice Issuer"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""

PASS=0
FAIL=0
WARN=0

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

function check_pass() {
  echo -e "${GREEN}✅ PASS${NC}: $1"
  ((PASS++))
}

function check_fail() {
  echo -e "${RED}❌ FAIL${NC}: $1"
  ((FAIL++))
}

function check_warn() {
  echo -e "${YELLOW}⚠️  WARN${NC}: $1"
  ((WARN++))
}

# ═══════════════════════════════════════════════════════════════════════════
# 1. GIT STATUS - Verificar secrets não commitados
# ═══════════════════════════════════════════════════════════════════════════

echo "1️⃣  GIT STATUS CHECK"
echo "─────────────────────────────────────────────────────────────────────────"

# Verificar .env files não tracked
if git -C "$REPO_ROOT" ls-files | grep -E "\.env($|\.)" > /dev/null 2>&1; then
  check_fail ".env file found in git tracking"
else
  check_pass ".env files not in git"
fi

# Verificar infra/ não tracked
if git -C "$REPO_ROOT" ls-files | grep -E "^infra/" > /dev/null 2>&1; then
  check_fail "infra/ directory found in git tracking (should be .gitignore)"
else
  check_pass "infra/ not tracked (in .gitignore)"
fi

# Verificar credentials não staged
if git -C "$REPO_ROOT" diff --cached | grep -E "password|secret|token|credential|apikey|AKIA" > /dev/null 2>&1; then
  check_fail "Possible secret in staged changes"
else
  check_pass "No obvious secrets in staged changes"
fi

echo ""

# ═══════════════════════════════════════════════════════════════════════════
# 2. FILE CONTENT CHECK - Verificar secrets em arquivos
# ═══════════════════════════════════════════════════════════════════════════

echo "2️⃣  FILE CONTENT CHECK"
echo "─────────────────────────────────────────────────────────────────────────"

# Verificar main.bicep
if grep -q "postgresAdminPassword@" "$SCRIPT_DIR/main.bicep" 2>/dev/null; then
  check_fail "main.bicep contains DATABASE_URL with credentials inline"
else
  check_pass "main.bicep uses secure secrets reference (Key Vault)"
fi

# Verificar setup-azure.sh - não printa password
if grep -q "echo.*POSTGRES_PASSWORD" "$SCRIPT_DIR/setup-azure.sh" 2>/dev/null; then
  check_fail "setup-azure.sh prints PostgreSQL password"
else
  check_pass "setup-azure.sh does NOT print password"
fi

# Verificar setup-azure.sh - não printa SP_OUTPUT
if grep -q "echo.*SP_OUTPUT" "$SCRIPT_DIR/setup-azure.sh" 2>/dev/null; then
  check_fail "setup-azure.sh prints Service Principal JSON"
else
  check_pass "setup-azure.sh does NOT print Service Principal"
fi

# Verificar .parameters.json - não tem KeyVault ID vazio
if grep -q '"id": ""' "$SCRIPT_DIR/main.parameters.json" 2>/dev/null; then
  check_warn "main.parameters.json has empty KeyVault ID (use placeholder)"
else
  check_pass "main.parameters.json KeyVault reference looks valid"
fi

echo ""

# ═══════════════════════════════════════════════════════════════════════════
# 3. GITIGNORE CHECK - Verificar proteção adequada
# ═══════════════════════════════════════════════════════════════════════════

echo "3️⃣  GITIGNORE CHECK"
echo "─────────────────────────────────────────────────────────────────────────"

# Verificar .gitignore na raiz
if grep -q "^infra/" "$REPO_ROOT/.gitignore" 2>/dev/null; then
  check_pass ".gitignore blocks infra/ directory"
else
  check_fail ".gitignore does NOT block infra/"
fi

if grep -q "\.env" "$REPO_ROOT/.gitignore" 2>/dev/null; then
  check_pass ".gitignore blocks .env files"
else
  check_fail ".gitignore does NOT block .env files"
fi

# Verificar .gitignore na pasta infra_public
if grep -q ".deployment-output" "$SCRIPT_DIR/.gitignore" 2>/dev/null; then
  check_pass ".gitignore blocks .deployment-output (credentials)"
else
  check_fail ".gitignore does NOT block .deployment-output"
fi

echo ""

# ═══════════════════════════════════════════════════════════════════════════
# 4. DOCUMENTATION CHECK - Verificar guias de segurança existem
# ═══════════════════════════════════════════════════════════════════════════

echo "4️⃣  DOCUMENTATION CHECK"
echo "─────────────────────────────────────────────────────────────────────────"

for doc in README.md SECURITY.md QUICKSTART.md REMEDIATION-SUMMARY.md; do
  if [ -f "$SCRIPT_DIR/$doc" ]; then
    check_pass "Security documentation exists: $doc"
  else
    check_fail "Missing documentation: $doc"
  fi
done

echo ""

# ═══════════════════════════════════════════════════════════════════════════
# 5. CREDENTIAL FILES CHECK - Verificar arquivo de credenciais protegido
# ═══════════════════════════════════════════════════════════════════════════

echo "5️⃣  CREDENTIAL FILES CHECK"
echo "─────────────────────────────────────────────────────────────────────────"

if [ -d "$SCRIPT_DIR/.deployment-output" ]; then
  if [ -f "$SCRIPT_DIR/.deployment-output/sp-credentials.json" ]; then
    PERMS=$(stat -f "%OLp" "$SCRIPT_DIR/.deployment-output/sp-credentials.json" 2>/dev/null || \
            stat -c "%a" "$SCRIPT_DIR/.deployment-output/sp-credentials.json" 2>/dev/null || \
            echo "unknown")
    
    if [[ "$PERMS" == *"600"* ]] || [[ "$PERMS" == *"-rw-------"* ]]; then
      check_pass "Credential file has secure permissions (600)"
    else
      check_warn "Credential file permissions: $PERMS (expected 600)"
    fi
    
    # Verificar não foi commitado
    if git -C "$REPO_ROOT" ls-files | grep "sp-credentials.json" > /dev/null 2>&1; then
      check_fail "sp-credentials.json is tracked in git!"
    else
      check_pass "sp-credentials.json not in git"
    fi
  fi
fi

echo ""

# ═══════════════════════════════════════════════════════════════════════════
# 6. REGEX PATTERN CHECK - Procurar por padrões conhecidos de secrets
# ═══════════════════════════════════════════════════════════════════════════

echo "6️⃣  SECRET PATTERN DETECTION"
echo "─────────────────────────────────────────────────────────────────────────"

PATTERN_COUNT=0

# Procurar AWS keys
if find "$SCRIPT_DIR" -type f \( -name "*.bicep" -o -name "*.json" -o -name "*.sh" -o -name "*.md" \) \
  -exec grep -l "AKIA[0-9A-Z]\{16\}" {} \; 2>/dev/null; then
  check_fail "AWS Access Keys detected"
  ((PATTERN_COUNT++))
else
  check_pass "No AWS Access Keys detected"
fi

# Procurar passwords (em padrão comum)
if find "$SCRIPT_DIR" -type f \( -name "*.bicep" -o -name "*.json" -o -name "*.sh" \) \
  -not -path "./.deployment-output/*" \
  -exec grep -E "password\s*[:=]\s*['\"]?[A-Za-z0-9!@#$%^&*]{8,}['\"]?" {} + 2>/dev/null | \
  grep -v "postgresAdminPassword@" | \
  grep -v "PASSWORD_SECRET" | \
  grep -v "DATABASE_PASSWORD" | head -n 3 > /dev/null; then
  check_warn "Possible password patterns found (verify manually)"
  ((PATTERN_COUNT++))
else
  check_pass "No obvious password patterns"
fi

# Procurar private keys
if find "$SCRIPT_DIR" -type f \( -name "*.pem" -o -name "*.key" -o -name "*.jks" \); then
  check_fail "Private key files found"
  ((PATTERN_COUNT++))
else
  check_pass "No private key files"
fi

echo ""

# ═══════════════════════════════════════════════════════════════════════════
# 7. BICEP VALIDATION - Verificar template é válido
# ═══════════════════════════════════════════════════════════════════════════

echo "7️⃣  BICEP TEMPLATE VALIDATION"
echo "─────────────────────────────────────────────────────────────────────────"

if command -v az &> /dev/null; then
  if az bicep validate --file "$SCRIPT_DIR/main.bicep" > /dev/null 2>&1; then
    check_pass "main.bicep is valid Bicep syntax"
  else
    check_fail "main.bicep has syntax errors"
  fi
else
  check_warn "Azure CLI not installed (skipping bicep validation)"
fi

echo ""

# ═══════════════════════════════════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════════════════════════════════

echo "═══════════════════════════════════════════════════════════════════════════"
echo "📊 AUDIT SUMMARY"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""
echo -e "  ${GREEN}✅ PASS:${NC} $PASS"
echo -e "  ${RED}❌ FAIL:${NC} $FAIL"
echo -e "  ${YELLOW}⚠️  WARN:${NC} $WARN"
echo ""

if [ $FAIL -eq 0 ]; then
  if [ $WARN -eq 0 ]; then
    echo -e "${GREEN}🎉 EXCELLENT - All security checks passed!${NC}"
    echo ""
    echo "✅ SAFE TO PUSH TO PUBLIC REPOSITORY"
    echo ""
    exit 0
  else
    echo -e "${YELLOW}⚠️  WARNING - Some checks require attention${NC}"
    echo ""
    echo "✅ CAN PUSH, but review warnings above"
    echo ""
    exit 0
  fi
else
  echo -e "${RED}🚨 SECURITY ISSUES DETECTED${NC}"
  echo ""
  echo "❌ DO NOT PUSH until all FAIL items are resolved"
  echo ""
  exit 1
fi
