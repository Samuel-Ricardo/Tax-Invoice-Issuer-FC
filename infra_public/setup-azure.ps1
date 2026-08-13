<#
.SYNOPSIS
    Tax-Invoice-Issuer-FC — Azure Setup Script (PUBLIC VERSION)
    Provisiona toda a infraestrutura com 1 comando

.DESCRIPTION
    PowerShell port of setup-azure.sh. Creates Azure infrastructure for the
    Tax Invoice Issuer project: Resource Group, Key Vault, PostgreSQL Flexible Server,
    Container Apps Environment, Container App, and GitHub Actions Service Principal.

    SECURITY: This script does NOT print secrets. Credentials are stored in Key Vault
    and Service Principal JSON is saved to a secure local file (.deployment-output/)
    which is in .gitignore.

.PARAMETER SubscriptionId
    Azure Subscription ID. Defaults to current az account context.

.PARAMETER ResourceGroup
    Resource Group name. Default: rg-tax-invoice-fc

.PARAMETER Location
    Azure region. Default: eastus

.PARAMETER EnvName
    Environment name prefix. Default: tax-invoice-fc

.PARAMETER ContainerImage
    Container image to deploy. Default: ghcr.io/samuel-ricardo/tax-invoice-issuer-fc:main

.PARAMETER KeyVaultName
    Key Vault name. Default: kv-{EnvName}

.PARAMETER WhatIf
    Show what would be created without making changes.

.PARAMETER Verbose
    Enable verbose output.

.EXAMPLE
    # Run with defaults (prompts for confirmation)
    .\setup-azure.ps1

.EXAMPLE
    # Run with custom values
    .\setup-azure.ps1 -ResourceGroup "my-rg" -Location "westus2" -EnvName "my-env"

.EXAMPLE
    # Preview what would be created
    .\setup-azure.ps1 -WhatIf

.NOTES
    Prerequisites:
    - Azure CLI installed and logged in (az login)
    - Appropriate RBAC permissions (Contributor on subscription or RG)
    - jq not required (uses PowerShell JSON parsing)
#>

[CmdletBinding(SupportsShouldProcess=$true, ConfirmImpact='High')]
param(
    [Parameter(Mandatory=$false)]
    [string]$SubscriptionId = "",

    [Parameter(Mandatory=$false)]
    [string]$ResourceGroup = "rg-tax-invoice-fc",

    [Parameter(Mandatory=$false)]
    [string]$Location = "eastus",

    [Parameter(Mandatory=$false)]
    [string]$EnvName = "tax-invoice-fc",

    [Parameter(Mandatory=$false)]
    [string]$ContainerImage = "ghcr.io/samuel-ricardo/tax-invoice-issuer-fc:main",

    [Parameter(Mandatory=$false)]
    [string]$KeyVaultName = ""
)

# ── Strict mode & error handling ───────────────────────────────
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Colors for output
$GREEN = [ConsoleColor]::Green
$CYAN = [ConsoleColor]::Cyan
$YELLOW = [ConsoleColor]::Yellow
$RED = [ConsoleColor]::Red
$NC = [ConsoleColor]::White

function Write-Info { param([string]$Msg) Write-Host "ℹ️  $Msg" -ForegroundColor $CYAN }
function Write-Success { param([string]$Msg) Write-Host "✅ $Msg" -ForegroundColor $GREEN }
function Write-Warn { param([string]$Msg) Write-Host "⚠️  $Msg" -ForegroundColor $YELLOW }
function Write-ErrorMsg { param([string]$Msg) Write-Host "❌ $Msg" -ForegroundColor $RED }
function Write-Section { param([string]$Msg) Write-Host "`n$Msg" -ForegroundColor $CYAN; Write-Host ("─" * 60) -ForegroundColor $CYAN }
function Write-SubSection { param([string]$Msg) Write-Host "  $Msg" }

# ── Derived values ─────────────────────────────────────────────
if (-not $KeyVaultName) { $KeyVaultName = "kv-$EnvName" }
$InfraDir = $PSScriptRoot
$OutputDir = Join-Path $InfraDir ".deployment-output"
$CredentialsFile = Join-Path $OutputDir "sp-credentials.json"
$DeploymentLog = Join-Path $OutputDir "deployment.log"

# ── Header ─────────────────────────────────────────────────────
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor $CYAN
Write-Host "🚀 Tax-Invoice-Issuer-FC — Azure Setup (PowerShell)" -ForegroundColor $CYAN
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor $CYAN
Write-Host ""

# ── Prerequisites check ────────────────────────────────────────
Write-Section "🔍 VERIFICANDO PRÉ-REQUISITOS"

# Check Azure CLI
if (-not (Get-Command az -ErrorAction SilentlyContinue)) {
    Write-ErrorMsg "Azure CLI (az) não encontrado. Instale: https://aka.ms/installazurecli"
    exit 1
}
Write-Success "Azure CLI encontrado: $(az version --query 'azure-cli' -o tsv 2>$null)"

# Check logged in
try {
    $account = az account show --query "id" -o tsv 2>$null
    if (-not $account) { throw "Not logged in" }
} catch {
    Write-ErrorMsg "Não logado no Azure. Execute: az login"
    exit 1
}

# Determine Subscription ID
if (-not $SubscriptionId) { $SubscriptionId = $account }
Write-Success "Subscription: $SubscriptionId"

# Check Bicep file
$BicepFile = Join-Path $InfraDir "main.bicep"
if (-not (Test-Path $BicepFile)) {
    Write-ErrorMsg "main.bicep não encontrado em: $BicepFile"
    exit 1
}
Write-Success "Bicep template encontrado"

Write-Host ""
Write-Info "Configuração:"
Write-SubSection "  Subscription:  $SubscriptionId"
Write-SubSection "  Resource Group: $ResourceGroup"
Write-SubSection "  Location:      $Location"
Write-SubSection "  Env Name:      $EnvName"
Write-SubSection "  Key Vault:     $KeyVaultName"
Write-SubSection "  Container Img: $ContainerImage"
Write-Host ""

# Confirm unless -WhatIf
if (-not $WhatIf) {
    $confirm = Read-Host "Continuar com o setup? (s/N)"
    if ($confirm -notmatch '^[sS]$') {
        Write-Warn "Cancelado pelo usuário"
        exit 0
    }
}

# ── 0. Create output directory ─────────────────────────────────
Write-Section "0️⃣  PREPARANDO DIRETÓRIO DE OUTPUT"
if ($WhatIf) {
    Write-Info "[WhatIf] Criaria diretório: $OutputDir"
} else {
    if (-not (Test-Path $OutputDir)) {
        New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
    }
    # Set restrictive ACL (Windows equivalent of chmod 700)
    $acl = Get-Acl $OutputDir
    $rule = New-Object System.Security.AccessControl.FileSystemAccessRule(
        [System.Security.Principal.WindowsIdentity]::GetCurrent().Name,
        "FullControl",
        "ContainerInherit,ObjectInherit",
        "None",
        "Allow"
    )
    $acl.SetAccessRuleProtection($true, $false)
    $acl.SetAccessRule($rule)
    Set-Acl $OutputDir $acl
    Write-Success "Diretório criado com permissões restritas: $OutputDir"
}

# ── 1. Resource Group ──────────────────────────────────────────
Write-Section "1️⃣  RESOURCE GROUP"
if ($WhatIf) {
    Write-Info "[WhatIf] Criaria Resource Group: $ResourceGroup em $Location"
} else {
    Write-Info "Criando Resource Group..."
    az group create --name $ResourceGroup --location $Location --output none 2>&1 | Out-Null
    Write-Success "Resource Group '$ResourceGroup' criado/atualizado"
}

# ── 2. Key Vault ───────────────────────────────────────────────
Write-Section "2️⃣  KEY VAULT"
if ($WhatIf) {
    Write-Info "[WhatIf] Criaria Key Vault: $KeyVaultName no RG $ResourceGroup"
} else {
    Write-Info "Criando Key Vault..."
    az keyvault create `
        --name $KeyVaultName `
        --resource-group $ResourceGroup `
        --location $Location `
        --enable-rbac-authorization false `
        --output none 2>&1 | Out-Null
    Write-Success "Key Vault '$KeyVaultName' criado"
}

# ── 3. Generate & store PostgreSQL password ────────────────────
Write-Section "3️⃣  POSTGRESQL PASSWORD (KEY VAULT)"
if ($WhatIf) {
    Write-Info "[WhatIf] Geraria senha segura e armazenaria no Key Vault como 'postgres-password'"
} else {
    Write-Info "Gerando senha segura (base64, 24 bytes)..."
    $bytes = New-Object byte[] 24
    [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
    $PostgresPassword = [Convert]::ToBase64String($bytes)

    Write-Info "Armazenando no Key Vault..."
    az keyvault secret set `
        --vault-name $KeyVaultName `
        --name "postgres-password" `
        --value $PostgresPassword `
        --output none 2>&1 | Out-Null
    Write-Success "Senha PostgreSQL armazenada com segurança no Key Vault"
}

# ── 4. Get Key Vault ID ────────────────────────────────────────
Write-Section "4️⃣  KEY VAULT ID"
if ($WhatIf) {
    Write-Info "[WhatIf] Obteria Key Vault ID para passar ao Bicep"
} else {
    Write-Info "Obtendo Key Vault ID..."
    $KeyVaultId = az keyvault show --name $KeyVaultName --resource-group $ResourceGroup --query "id" -o tsv 2>&1
    Write-Success "Key Vault ID: $KeyVaultId"
}

# ── 5. Deploy Bicep ────────────────────────────────────────────
Write-Section "5️⃣  BICEP DEPLOY"
if ($WhatIf) {
    Write-Info "[WhatIf] Faria deploy do Bicep: main.bicep"
    Write-Info "  Parâmetros: location=$Location, envName=$EnvName, containerImage=$ContainerImage, keyVaultId=<id>, postgresPasswordSecretName=postgres-password"
} else {
    Write-Info "Fazendo deploy da infraestrutura (Bicep)..."
    Write-Info "⏳ Aguarde ~3-5 minutos..."

    $deployResult = az deployment group create `
        --resource-group $ResourceGroup `
        --template-file $BicepFile `
        --parameters `
            location=$Location `
            envName=$EnvName `
            containerImage=$ContainerImage `
            keyVaultId="$KeyVaultId" `
            postgresPasswordSecretName="postgres-password" `
        --output json 2>&1

    $exitCode = $LASTEXITCODE
    if ($exitCode -ne 0) {
        Write-ErrorMsg "Falha no deploy Bicep (código: $exitCode)"
        Write-Host $deployResult
        exit $exitCode
    }

    # Save deployment log
    $deployResult | Out-File -FilePath $DeploymentLog -Encoding utf8
    Write-Success "Deploy concluído! Log salvo em: $DeploymentLog"

    # ── 6. Extract outputs (safe - no secrets) ─────────────────────
    Write-Section "6️⃣  EXTRAINDO OUTPUTS (SEM SECRETS)"
    try {
        $deployment = $deployResult | ConvertFrom-Json
        $outputs = $deployment.properties.outputs

        $ApiUrl = $outputs.apiUrl.value
        $PostgresHost = $outputs.postgresHost.value
        $ContainerAppName = $outputs.containerAppName.value
        $ResourceGroupName = $outputs.resourceGroupName.value
        $LogAnalyticsWorkspaceId = $outputs.logAnalyticsWorkspaceId.value

        Write-Success "Outputs extraídos com sucesso"
    } catch {
        Write-ErrorMsg "Falha ao parsear outputs do deployment: $($_.Exception.Message)"
        exit 1
    }
}

# ── 7. Service Principal for GitHub Actions ────────────────────
Write-Section "7️⃣  SERVICE PRINCIPAL (GITHUB ACTIONS)"
if ($WhatIf) {
    Write-Info "[WhatIf] Criaria Service Principal com role Contributor no scope do Resource Group"
    Write-Info "[WhatIf] Salvaria credenciais em: $CredentialsFile (permissões 600)"
} else {
    Write-Info "Criando Service Principal para GitHub Actions..."
    $spName = "sp-tax-invoice-fc-github-$(Get-Date -Format 'yyyyMMddHHmmss')"
    $scope = "/subscriptions/$SubscriptionId/resourceGroups/$ResourceGroup"

    $spOutput = az ad sp create-for-rbac `
        --name $spName `
        --role "Contributor" `
        --scopes $scope `
        --sdk-auth 2>&1

    $exitCode = $LASTEXITCODE
    if ($exitCode -ne 0) {
        Write-ErrorMsg "Falha ao criar Service Principal (código: $exitCode)"
        Write-Host $spOutput
        exit $exitCode
    }

    # Save to secure file (no output to console)
    $spOutput | Out-File -FilePath $CredentialsFile -Encoding utf8

    # Set restrictive permissions (Windows ACL equivalent of chmod 600)
    $acl = Get-Acl $CredentialsFile
    $acl.SetAccessRuleProtection($true, $false)
    $rule = New-Object System.Security.AccessControl.FileSystemAccessRule(
        [System.Security.Principal.WindowsIdentity]::GetCurrent().Name,
        "Read,Write",
        "None",
        "Allow"
    )
    $acl.SetAccessRule($rule)
    Set-Acl $CredentialsFile $acl

    Write-Success "Service Principal criado e salvo em: $CredentialsFile"
}

# ── 8. Final Output ────────────────────────────────────────────
if (-not $WhatIf) {
    Write-Section "8️⃣  RESULTADO FINAL"
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor $GREEN
    Write-Host "✅ SETUP CONCLUÍDO COM SUCESSO!" -ForegroundColor $GREEN
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor $GREEN
    Write-Host ""
    Write-Host "🌐 API URL:           $ApiUrl" -ForegroundColor $CYAN
    Write-Host "🗄️  PostgreSQL Host:  $PostgresHost" -ForegroundColor $CYAN
    Write-Host "🐳 Container App:     $ContainerAppName" -ForegroundColor $CYAN
    Write-Host ""
    Write-Host "📁 Arquivos gerados em: $OutputDir" -ForegroundColor $CYAN
    Write-Host ""
    Write-Host "🔐 SECRETS DE FORMA SEGURA:" -ForegroundColor $YELLOW
    Write-Host ""
    Write-Host "   PostgreSQL Password:" -ForegroundColor $CYAN
    Write-Host "   → Armazenado no Key Vault: ${KeyVaultName}/secrets/postgres-password" -ForegroundColor $NC
    Write-Host "   → NUNCA commitar este valor" -ForegroundColor $RED
    Write-Host ""
    Write-Host "   GitHub Actions Credentials:" -ForegroundColor $CYAN
    Write-Host "   → Salvo em: $CredentialsFile" -ForegroundColor $NC
    Write-Host "   → ⚠️  NÃO COMMITAR este arquivo (já está no .gitignore)" -ForegroundColor $RED
    Write-Host "   → Adicione no GitHub:" -ForegroundColor $NC
    Write-Host "      Settings → Secrets and variables → Actions → New repository secret" -ForegroundColor $NC
    Write-Host "      Secret: AZURE_CREDENTIALS" -ForegroundColor $NC
    Write-Host "      Value: (copie conteúdo de $CredentialsFile)" -ForegroundColor $NC
    Write-Host ""
    Write-Host "   Subscription ID:" -ForegroundColor $CYAN
    Write-Host "   → $SubscriptionId" -ForegroundColor $NC
    Write-Host "   → Adicione no GitHub Secrets como AZURE_SUBSCRIPTION_ID" -ForegroundColor $NC
    Write-Host ""
    Write-Host "💾 PRÓXIMOS PASSOS:" -ForegroundColor $YELLOW
    Write-Host "   1. cat $CredentialsFile (APENAS em seu computador)" -ForegroundColor $NC
    Write-Host "   2. Copie e adicione como GitHub Secret: AZURE_CREDENTIALS" -ForegroundColor $NC
    Write-Host "   3. Adicione AZURE_SUBSCRIPTION_ID: $SubscriptionId" -ForegroundColor $NC
    Write-Host ""
    Write-Host "💡 DICA DE ECONOMIA:" -ForegroundColor $YELLOW
    Write-Host "   Pause o PostgreSQL quando não estiver usando:" -ForegroundColor $NC
    Write-Host "   az postgres flexible-server stop --resource-group $ResourceGroup --name psql-$EnvName" -ForegroundColor $NC
    Write-Host "   (Economiza ~$12/mês)" -ForegroundColor $NC
    Write-Host ""
    Write-Host "⚠️  IMPORTANTE:" -ForegroundColor $RED
    Write-Host "   - Este script gerou o arquivo: $CredentialsFile" -ForegroundColor $NC
    Write-Host "   - Este arquivo está no .gitignore e NUNCA deve ser commitado" -ForegroundColor $NC
    Write-Host "   - Use APENAS em seu ambiente local ou CI/CD protegido" -ForegroundColor $NC
    Write-Host ""
} else {
    Write-Section "✅ WHAT-IF COMPLETO"
    Write-Host "Nenhuma alteração foi feita. Execute sem -WhatIf para provisionar." -ForegroundColor $GREEN
}

# Exit successfully
exit 0