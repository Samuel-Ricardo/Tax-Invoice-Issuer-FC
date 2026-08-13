<# 
.SYNOPSIS
    Security Audit Script - Tax Invoice Issuer
    Valida que nenhuma credencial está sendo exposta antes do push para public

.DESCRIPTION
    Comprehensive security validation for the infra_public directory.
    Checks git status, file content, .gitignore, documentation, credential files,
    secret patterns, and Bicep template validation.

.NOTES
    Run from the infra_public directory or provide -ScriptDir parameter
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [string]$ScriptDir = $PSScriptRoot
)

# Set strict mode
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Colors
$GREEN = [ConsoleColor]::Green
$RED = [ConsoleColor]::Red
$YELLOW = [ConsoleColor]::Yellow
$CYAN = [ConsoleColor]::Cyan
$NC = [ConsoleColor]::White

$PASS = 0
$FAIL = 0
$WARN = 0

$REPO_ROOT = (Resolve-Path (Join-Path $ScriptDir "..")).Path

function Write-Pass { param([string]$Msg) Write-Host "✅ PASS: $Msg" -ForegroundColor $GREEN; $global:PASS++ }
function Write-Fail { param([string]$Msg) Write-Host "❌ FAIL: $Msg" -ForegroundColor $RED; $global:FAIL++ }
function Write-Warn { param([string]$Msg) Write-Host "⚠️  WARN: $Msg" -ForegroundColor $YELLOW; $global:WARN++ }
function Write-Section { param([string]$Msg) Write-Host "`n$Msg" -ForegroundColor $CYAN; Write-Host ("─" * 75) -ForegroundColor $CYAN }

Write-Host "🔍 SECURITY AUDIT - Tax Invoice Issuer" -ForegroundColor $CYAN
Write-Host ("═" * 78) -ForegroundColor $CYAN
Write-Host ""

# ═══════════════════════════════════════════════════════════════════════════
# 1. GIT STATUS - Verificar secrets não commitados
# ═══════════════════════════════════════════════════════════════════════════

Write-Section "1️⃣  GIT STATUS CHECK"

# Verificar .env files não tracked (exclui .env.example)
$envFiles = git -C $REPO_ROOT ls-files | Where-Object { ($_ -match '^\.env($|\..+)') -and ($_ -notmatch '\.example$') }
if ($envFiles) { Write-Fail ".env file found in git tracking: $($envFiles -join ', ')" } else { Write-Pass ".env files not in git" }

# Verificar infra/ não tracked
$infraTracked = git -C $REPO_ROOT ls-files | Where-Object { $_ -match '^infra/' }
if ($infraTracked) { Write-Fail "infra/ directory found in git tracking (should be .gitignore)" } else { Write-Pass "infra/ not tracked (in .gitignore)" }

# Verificar credentials não staged
$stagedSecrets = git -C $REPO_ROOT diff --cached | Where-Object { $_ -match "password|secret|token|credential|apikey|AKIA" }
if ($stagedSecrets) { Write-Fail "Possible secret in staged changes" } else { Write-Pass "No obvious secrets in staged changes" }

# ═══════════════════════════════════════════════════════════════════════════
# 2. FILE CONTENT CHECK - Verificar secrets em arquivos
# ═══════════════════════════════════════════════════════════════════════════

Write-Section "2️⃣  FILE CONTENT CHECK"

$bicepPath = Join-Path $ScriptDir "main.bicep"
if (Test-Path $bicepPath) {
    $bicepContent = Get-Content $bicepPath -Raw
    if ($bicepContent -match 'postgresAdminPassword@') {
        Write-Fail "main.bicep contains DATABASE_URL with credentials inline"
    } else {
        Write-Pass "main.bicep uses secure secrets reference (Key Vault)"
    }
} else {
    Write-Warn "main.bicep not found"
}

$setupPath = Join-Path $ScriptDir "setup-azure.sh"
if (Test-Path $setupPath) {
    $setupContent = Get-Content $setupPath -Raw
    if ($setupContent -match 'echo.*POSTGRES_PASSWORD') {
        Write-Fail "setup-azure.sh prints PostgreSQL password"
    } else {
        Write-Pass "setup-azure.sh does NOT print password"
    }
    # Check if SP_OUTPUT is printed to stdout (no redirection = bad)
    $printsToStdout = $setupContent -match 'echo.*SP_OUTPUT' -and $setupContent -notmatch 'echo.*SP_OUTPUT.*>'
    if ($printsToStdout) {
        Write-Fail "setup-azure.sh prints Service Principal JSON to stdout"
    } else {
        Write-Pass "setup-azure.sh does NOT print Service Principal to stdout"
    }
} else {
    Write-Warn "setup-azure.sh not found"
}

$paramsPath = Join-Path $ScriptDir "main.parameters.json"
if (Test-Path $paramsPath) {
    $paramsContent = Get-Content $paramsPath -Raw
    if ($paramsContent -match '"id": ""') {
        Write-Warn "main.parameters.json has empty KeyVault ID (use placeholder)"
    } else {
        Write-Pass "main.parameters.json KeyVault reference looks valid"
    }
} else {
    Write-Warn "main.parameters.json not found"
}

# ═══════════════════════════════════════════════════════════════════════════
# 3. GITIGNORE CHECK - Verificar proteção adequada
# ═══════════════════════════════════════════════════════════════════════════

Write-Section "3️⃣  GITIGNORE CHECK"

$rootGitignore = Join-Path $REPO_ROOT ".gitignore"
if (Test-Path $rootGitignore) {
    $gitignoreContent = Get-Content $rootGitignore -Raw
    if ($gitignoreContent -match '(^|\n)infra/') { Write-Pass ".gitignore blocks infra/ directory" } else { Write-Fail ".gitignore does NOT block infra/" }
    if ($gitignoreContent -match '\.env') { Write-Pass ".gitignore blocks .env files" } else { Write-Fail ".gitignore does NOT block .env files" }
} else {
    Write-Fail ".gitignore not found in repo root"
}

$infraGitignore = Join-Path $ScriptDir ".gitignore"
if (Test-Path $infraGitignore) {
    $gitignoreContent = Get-Content $infraGitignore -Raw
    if ($gitignoreContent -match '\.deployment-output') { Write-Pass ".gitignore blocks .deployment-output (credentials)" } else { Write-Fail ".gitignore does NOT block .deployment-output" }
} else {
    Write-Fail ".gitignore not found in infra_public/"
}

# ═══════════════════════════════════════════════════════════════════════════
# 4. DOCUMENTATION CHECK - Verificar guias de segurança existem
# ═══════════════════════════════════════════════════════════════════════════

Write-Section "4️⃣  DOCUMENTATION CHECK"

@("README.md", "SECURITY.md", "QUICKSTART.md", "REMEDIATION-SUMMARY.md") | ForEach-Object {
    $docPath = Join-Path $ScriptDir $_
    if (Test-Path $docPath) { Write-Pass "Security documentation exists: $_" } else { Write-Fail "Missing documentation: $_" }
}

# ═══════════════════════════════════════════════════════════════════════════
# 5. CREDENTIAL FILES CHECK - Verificar arquivo de credenciais protegido
# ═══════════════════════════════════════════════════════════════════════════

Write-Section "5️⃣  CREDENTIAL FILES CHECK"

$credDir = Join-Path $ScriptDir ".deployment-output"
$credFile = Join-Path $credDir "sp-credentials.json"

if (Test-Path $credDir -PathType Container) {
    if (Test-Path $credFile) {
        # Check file permissions (Windows - check ACL)
        $acl = Get-Acl $credFile
        $accessRules = $acl.Access | Where-Object { $_.FileSystemRights -eq 'FullControl' -and $_.AccessControlType -eq 'Allow' }
        # On Windows, we check if it's not broadly accessible
        $isSecure = $true
        foreach ($rule in $accessRules) {
            $identity = $rule.IdentityReference.Value
            if ($identity -match 'Everyone|Users|Authenticated Users|BUILTIN\\Users') {
                $isSecure = $false
                break
            }
        }
        if ($isSecure) { Write-Pass "Credential file has secure permissions (restricted access)" } else { Write-Warn "Credential file permissions may be too open (verify manually)" }

        # Verificar não foi commitado
        $trackedCreds = git -C $REPO_ROOT ls-files | Where-Object { $_ -match 'sp-credentials\.json' }
        if ($trackedCreds) { Write-Fail "sp-credentials.json is tracked in git!" } else { Write-Pass "sp-credentials.json not in git" }
    }
} else {
    Write-Pass ".deployment-output directory does not exist (no credentials to check)"
}

# ═══════════════════════════════════════════════════════════════════════════
# 6. REGEX PATTERN CHECK - Procurar por padrões conhecidos de secrets
# ═══════════════════════════════════════════════════════════════════════════

Write-Section "6️⃣  SECRET PATTERN DETECTION"

$PATTERN_COUNT = 0

# Procurar AWS keys
$awsKeys = Get-ChildItem $ScriptDir -Recurse -File -Include "*.bicep","*.json","*.sh","*.md" | 
    Where-Object { $_ -notmatch '\\.deployment-output\\' } |
    ForEach-Object { if (Select-String -Pattern 'AKIA[0-9A-Z]{16}' -Path $_.FullName -Quiet) { $_ } }
if ($awsKeys) { Write-Fail "AWS Access Keys detected in: $($awsKeys.FullName -join ', ')"; $PATTERN_COUNT++ } else { Write-Pass "No AWS Access Keys detected" }

# Procurar passwords (em padrão comum)
$passwordPattern = "password\s*[:=]\s*[\x27\x22]?[A-Za-z0-9!@#\$%^&*]{8,}[\x27\x22]?"
$passwordFiles = Get-ChildItem $ScriptDir -Recurse -File -Include "*.bicep","*.json","*.sh" | 
    Where-Object { $_ -notmatch '\\.deployment-output\\' } |
    ForEach-Object { 
        $content = Get-Content $_.FullName -Raw
        if ($content -match $passwordPattern) {
            # Exclude known safe patterns
            if ($content -notmatch 'postgresAdminPassword@' -and $content -notmatch 'PASSWORD_SECRET' -and $content -notmatch 'DATABASE_PASSWORD') {
                $_ 
            }
        }
    }
if ($passwordFiles) { Write-Warn "Possible password patterns found in: $($passwordFiles.FullName -join ', ') (verify manually)"; $PATTERN_COUNT++ } else { Write-Pass "No obvious password patterns" }

# Procurar private keys
$keyFiles = Get-ChildItem $ScriptDir -Recurse -File -Include "*.pem","*.key","*.jks" | Where-Object { $_ -notmatch '\\.deployment-output\\' }
if ($keyFiles) { Write-Fail "Private key files found: $($keyFiles.FullName -join ', ')"; $PATTERN_COUNT++ } else { Write-Pass "No private key files" }

# ═══════════════════════════════════════════════════════════════════════════
# 7. BICEP VALIDATION - Verificar template é válido
# ═══════════════════════════════════════════════════════════════════════════

Write-Section "7️⃣  BICEP TEMPLATE VALIDATION"

if (Get-Command az -ErrorAction SilentlyContinue) {
    try {
        $bicepPath = Join-Path $ScriptDir "main.bicep"
        az bicep lint --file $bicepPath 2>&1 | Tee-Object -Variable lintOutput | Out-Null
        if ($LASTEXITCODE -eq 0) { 
            Write-Pass "main.bicep is valid Bicep syntax" 
        } else { 
            $errorMsg = ($lintOutput | Where-Object { $_ -match 'Error' } | Select-Object -First 1) -replace 'ERROR: ', ''
            Write-Fail "main.bicep has syntax errors: $errorMsg"
        }
    } catch {
        Write-Fail "main.bicep validation failed: $($_.Exception.Message)"
    }
} else {
    Write-Warn "Azure CLI not installed (skipping bicep validation)"
}

# ═══════════════════════════════════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════════════════════════════════

Write-Host ""
Write-Host ("═" * 78) -ForegroundColor $CYAN
Write-Host "📊 AUDIT SUMMARY" -ForegroundColor $CYAN
Write-Host ("═" * 78) -ForegroundColor $CYAN
Write-Host ""
Write-Host "  ✅ PASS: $PASS" -ForegroundColor $GREEN
Write-Host "  ❌ FAIL: $FAIL" -ForegroundColor $RED
Write-Host "  ⚠️  WARN: $WARN" -ForegroundColor $YELLOW
Write-Host ""

if ($FAIL -eq 0) {
    if ($WARN -eq 0) {
        Write-Host "🎉 EXCELLENT - All security checks passed!" -ForegroundColor $GREEN
        Write-Host ""
        Write-Host "✅ SAFE TO PUSH TO PUBLIC REPOSITORY" -ForegroundColor $GREEN
        Write-Host ""
        exit 0
    } else {
        Write-Host "⚠️  WARNING - Some checks require attention" -ForegroundColor $YELLOW
        Write-Host ""
        Write-Host "✅ CAN PUSH, but review warnings above" -ForegroundColor $YELLOW
        Write-Host ""
        exit 0
    }
} else {
    Write-Host "🚨 SECURITY ISSUES DETECTED" -ForegroundColor $RED
    Write-Host ""
    Write-Host "❌ DO NOT PUSH until all FAIL items are resolved" -ForegroundColor $RED
    Write-Host ""
    exit 1
}