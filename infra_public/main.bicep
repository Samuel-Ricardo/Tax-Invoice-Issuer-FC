// ============================================================
// Tax-Invoice-Issuer-FC — Azure Infrastructure (PUBLIC VERSION)
// Stack: Container Apps (scale-to-zero) + PostgreSQL Flexible Server B1ms
// Budget: ~$12-15/month (portfolio optimized)
// 
// SECURITY: All secrets are stored in Azure Key Vault
// No credentials are hardcoded or exposed in this template
// ============================================================

@description('Location for all resources')
param location string = resourceGroup().location

@description('Environment name prefix')
param envName string = 'tax-invoice-fc'

@description('Container image to deploy (ghcr.io/...)')
param containerImage string

@description('PostgreSQL admin username')
param postgresAdminUser string = 'pgadmin'

@description('Key Vault ID containing secrets (e.g., /subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.KeyVault/vaults/{vaultName})')
param keyVaultId string

@description('PostgreSQL admin password (stored in Key Vault)')
@secure()
param postgresAdminPassword string

@description('Key Vault secret name for PostgreSQL password')
param postgresPasswordSecretName string = 'postgres-password'

@description('Database name')
param databaseName string = 'invoicesdb'

// ============================================================
// Log Analytics Workspace (free 5GB/day ingestion)
// ============================================================
resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: 'law-${envName}'
  location: location
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
  }
}

// ============================================================
// Container Apps Environment
// ============================================================
resource containerAppsEnv 'Microsoft.App/managedEnvironments@2023-05-01' = {
  name: 'cae-${envName}'
  location: location
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: logAnalytics.properties.customerId
        sharedKey: logAnalytics.listKeys().primarySharedKey
      }
    }
  }
}

// ============================================================
// PostgreSQL Flexible Server — B1ms (cheapest: $12.41/month)
// Tip: Stop the server via portal when not demoing to save cost
// Stopped state = pay only storage (~$0.12/GB/month)
// ============================================================
resource postgresServer 'Microsoft.DBforPostgreSQL/flexibleServers@2023-06-01-preview' = {
  name: 'psql-${envName}'
  location: location
  sku: {
    name: 'Standard_B1ms'
    tier: 'Burstable'
  }
  properties: {
    administratorLogin: postgresAdminUser
    administratorLoginPassword: postgresAdminPassword
    version: '15'
    storage: {
      storageSizeGB: 32
    }
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
    highAvailability: {
      mode: 'Disabled'
    }
  }
}

resource postgresDatabase 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2023-06-01-preview' = {
  parent: postgresServer
  name: databaseName
  properties: {
    charset: 'UTF8'
    collation: 'en_US.utf8'
  }
}

// Allow Azure services to connect to PostgreSQL
resource postgresFirewallAzure 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2023-06-01-preview' = {
  parent: postgresServer
  name: 'AllowAllAzureIPs'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

// ============================================================
// Container App — API (scale to zero = free when idle)
// Secrets are injected from Key Vault at runtime
// ============================================================
resource containerApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: 'ca-${envName}-api'
  location: location
  properties: {
    environmentId: containerAppsEnv.id
    configuration: {
      ingress: {
        external: true
        targetPort: 3000
        transport: 'http'
      }
      secrets: [
        {
          name: 'kv-postgres-password'
          keyVaultUrl: '${keyVaultId}/secrets/${postgresPasswordSecretName}'
          identity: 'system'
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'api'
          image: containerImage
          resources: {
            cpu: json('0.25')
            memory: '0.5Gi'
          }
          env: [
            {
              name: 'DATABASE_HOST'
              value: postgresServer.properties.fullyQualifiedDomainName
            }
            {
              name: 'DATABASE_PORT'
              value: '5432'
            }
            {
              name: 'DATABASE_USER'
              value: postgresAdminUser
            }
            {
              name: 'DATABASE_NAME'
              value: databaseName
            }
            {
              name: 'DATABASE_PASSWORD'
              secretRef: 'kv-postgres-password'
            }
            {
              name: 'NODE_ENV'
              value: 'production'
            }
            {
              name: 'PORT'
              value: '3000'
            }
          ]
        }
      ]
      scale: {
        minReplicas: 0  // Scale to zero when no traffic = $0
        maxReplicas: 1
        rules: [
          {
            name: 'http-rule'
            http: {
              metadata: {
                concurrentRequests: '10'
              }
            }
          }
        ]
      }
    }
  }
}

// ============================================================
// Outputs (SAFE - No credentials exposed)
// ============================================================
output apiUrl string = 'https://${containerApp.properties.configuration.ingress.fqdn}'
output postgresHost string = postgresServer.properties.fullyQualifiedDomainName
output postgresPort int = 5432
output databaseName string = databaseName
output containerAppName string = containerApp.name
output resourceGroupName string = resourceGroup().name
output logAnalyticsWorkspaceId string = logAnalytics.id
