'use client'

import { useState } from 'react'
import {
  Database,
  Cloud,
  FileSpreadsheet,
  Link2,
  Plus,
  Check,
  X,
  RefreshCw,
  Settings,
  Trash2,
  ExternalLink,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// Connector type definitions
export type ConnectorType =
  | 'postgresql'
  | 'mysql'
  | 'salesforce'
  | 'hubspot'
  | 'quickbooks'
  | 'google-sheets'
  | 'excel'
  | 'csv'
  | 'rest-api'
  | 'webhook'

export type ConnectorStatus = 'connected' | 'disconnected' | 'error' | 'syncing'

export interface Connector {
  id: string
  type: ConnectorType
  name: string
  status: ConnectorStatus
  lastSync?: Date
  config: Record<string, unknown>
  errorMessage?: string
}

// Connector definitions
const connectorDefinitions: Array<{
  type: ConnectorType
  name: string
  description: string
  icon: React.ElementType
  category: 'database' | 'crm' | 'file' | 'api'
  fields: Array<{
    key: string
    label: string
    type: 'text' | 'password' | 'url' | 'file'
    required: boolean
    placeholder?: string
  }>
}> = [
  {
    type: 'postgresql',
    name: 'PostgreSQL',
    description: 'Connect to PostgreSQL databases',
    icon: Database,
    category: 'database',
    fields: [
      { key: 'host', label: 'Host', type: 'text', required: true, placeholder: 'localhost' },
      { key: 'port', label: 'Port', type: 'text', required: true, placeholder: '5432' },
      { key: 'database', label: 'Database', type: 'text', required: true },
      { key: 'username', label: 'Username', type: 'text', required: true },
      { key: 'password', label: 'Password', type: 'password', required: true },
    ],
  },
  {
    type: 'mysql',
    name: 'MySQL',
    description: 'Connect to MySQL databases',
    icon: Database,
    category: 'database',
    fields: [
      { key: 'host', label: 'Host', type: 'text', required: true, placeholder: 'localhost' },
      { key: 'port', label: 'Port', type: 'text', required: true, placeholder: '3306' },
      { key: 'database', label: 'Database', type: 'text', required: true },
      { key: 'username', label: 'Username', type: 'text', required: true },
      { key: 'password', label: 'Password', type: 'password', required: true },
    ],
  },
  {
    type: 'salesforce',
    name: 'Salesforce',
    description: 'Import data from Salesforce CRM',
    icon: Cloud,
    category: 'crm',
    fields: [
      { key: 'instance_url', label: 'Instance URL', type: 'url', required: true, placeholder: 'https://yourorg.salesforce.com' },
      { key: 'client_id', label: 'Client ID', type: 'text', required: true },
      { key: 'client_secret', label: 'Client Secret', type: 'password', required: true },
      { key: 'username', label: 'Username', type: 'text', required: true },
      { key: 'password', label: 'Password + Security Token', type: 'password', required: true },
    ],
  },
  {
    type: 'hubspot',
    name: 'HubSpot',
    description: 'Connect to HubSpot CRM',
    icon: Cloud,
    category: 'crm',
    fields: [
      { key: 'api_key', label: 'API Key', type: 'password', required: true },
    ],
  },
  {
    type: 'quickbooks',
    name: 'QuickBooks',
    description: 'Import financial data from QuickBooks',
    icon: FileSpreadsheet,
    category: 'crm',
    fields: [
      { key: 'client_id', label: 'Client ID', type: 'text', required: true },
      { key: 'client_secret', label: 'Client Secret', type: 'password', required: true },
      { key: 'realm_id', label: 'Realm ID (Company ID)', type: 'text', required: true },
    ],
  },
  {
    type: 'google-sheets',
    name: 'Google Sheets',
    description: 'Import data from Google Sheets',
    icon: FileSpreadsheet,
    category: 'file',
    fields: [
      { key: 'spreadsheet_id', label: 'Spreadsheet ID', type: 'text', required: true },
      { key: 'sheet_name', label: 'Sheet Name', type: 'text', required: false, placeholder: 'Sheet1' },
      { key: 'credentials_json', label: 'Service Account JSON', type: 'text', required: true },
    ],
  },
  {
    type: 'excel',
    name: 'Excel File',
    description: 'Upload Excel spreadsheets',
    icon: FileSpreadsheet,
    category: 'file',
    fields: [
      { key: 'file', label: 'Excel File', type: 'file', required: true },
    ],
  },
  {
    type: 'csv',
    name: 'CSV File',
    description: 'Upload CSV files',
    icon: FileSpreadsheet,
    category: 'file',
    fields: [
      { key: 'file', label: 'CSV File', type: 'file', required: true },
    ],
  },
  {
    type: 'rest-api',
    name: 'REST API',
    description: 'Connect to any REST API',
    icon: Link2,
    category: 'api',
    fields: [
      { key: 'base_url', label: 'Base URL', type: 'url', required: true, placeholder: 'https://api.example.com' },
      { key: 'auth_type', label: 'Auth Type', type: 'text', required: false, placeholder: 'bearer, basic, api_key' },
      { key: 'api_key', label: 'API Key / Token', type: 'password', required: false },
      { key: 'headers', label: 'Custom Headers (JSON)', type: 'text', required: false },
    ],
  },
  {
    type: 'webhook',
    name: 'Webhook',
    description: 'Receive data via webhooks',
    icon: Link2,
    category: 'api',
    fields: [],
  },
]

const statusColors: Record<ConnectorStatus, string> = {
  connected: 'bg-success text-success-foreground',
  disconnected: 'bg-muted text-muted-foreground',
  error: 'bg-destructive text-destructive-foreground',
  syncing: 'bg-warning text-warning-foreground',
}

const statusLabels: Record<ConnectorStatus, string> = {
  connected: 'Connected',
  disconnected: 'Disconnected',
  error: 'Error',
  syncing: 'Syncing...',
}

// Connector Card Component
function ConnectorCard({
  connector,
  onConfigure,
  onSync,
  onDelete,
}: {
  connector: Connector
  onConfigure: () => void
  onSync: () => void
  onDelete: () => void
}) {
  const definition = connectorDefinitions.find(d => d.type === connector.type)
  const IconComponent = definition?.icon || Database

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <IconComponent className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">{connector.name}</CardTitle>
              <CardDescription className="text-xs">
                {definition?.name}
              </CardDescription>
            </div>
          </div>
          <Badge className={cn('text-xs', statusColors[connector.status])}>
            {statusLabels[connector.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {connector.errorMessage && (
          <div className="flex items-start gap-2 p-2 mb-3 bg-destructive/10 rounded-md text-sm text-destructive">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{connector.errorMessage}</span>
          </div>
        )}

        {connector.lastSync && (
          <p className="text-xs text-muted-foreground mb-3">
            Last sync: {new Date(connector.lastSync).toLocaleString()}
          </p>
        )}

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onSync} className="flex-1">
            <RefreshCw className="h-3 w-3 mr-1" />
            Sync
          </Button>
          <Button variant="outline" size="sm" onClick={onConfigure}>
            <Settings className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Add Connector Dialog
function AddConnectorDialog({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (connector: Omit<Connector, 'id' | 'status' | 'lastSync'>) => void
}) {
  const [selectedType, setSelectedType] = useState<ConnectorType | null>(null)
  const [name, setName] = useState('')
  const [config, setConfig] = useState<Record<string, string>>({})
  const [step, setStep] = useState<'select' | 'configure'>('select')

  const selectedDefinition = selectedType
    ? connectorDefinitions.find(d => d.type === selectedType)
    : null

  const handleSelectType = (type: ConnectorType) => {
    setSelectedType(type)
    setStep('configure')
    setConfig({})
  }

  const handleAdd = () => {
    if (!selectedType || !name) return

    onAdd({
      type: selectedType,
      name,
      config,
    })

    // Reset state
    setSelectedType(null)
    setName('')
    setConfig({})
    setStep('select')
    onOpenChange(false)
  }

  const handleBack = () => {
    setStep('select')
    setSelectedType(null)
  }

  const categories = ['database', 'crm', 'file', 'api'] as const
  const categoryLabels = {
    database: 'Databases',
    crm: 'CRM & Business Apps',
    file: 'Files & Spreadsheets',
    api: 'APIs & Webhooks',
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {step === 'select' ? 'Add Data Connector' : `Configure ${selectedDefinition?.name}`}
          </DialogTitle>
          <DialogDescription>
            {step === 'select'
              ? 'Choose a data source to connect'
              : 'Enter the connection details'}
          </DialogDescription>
        </DialogHeader>

        {step === 'select' ? (
          <Tabs defaultValue="database">
            <TabsList className="grid grid-cols-4 w-full">
              {categories.map(cat => (
                <TabsTrigger key={cat} value={cat} className="text-xs">
                  {categoryLabels[cat]}
                </TabsTrigger>
              ))}
            </TabsList>
            {categories.map(cat => (
              <TabsContent key={cat} value={cat} className="mt-4">
                <div className="grid grid-cols-2 gap-3">
                  {connectorDefinitions
                    .filter(d => d.category === cat)
                    .map(def => (
                      <button
                        key={def.type}
                        onClick={() => handleSelectType(def.type)}
                        className="flex items-start gap-3 p-3 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors text-left"
                      >
                        <div className="p-2 rounded-lg bg-muted">
                          <def.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{def.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {def.description}
                          </p>
                        </div>
                      </button>
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="connector-name">Connection Name</Label>
              <Input
                id="connector-name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={`My ${selectedDefinition?.name} Connection`}
              />
            </div>

            {selectedDefinition?.fields.map(field => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key}>
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                <Input
                  id={field.key}
                  type={field.type === 'password' ? 'password' : 'text'}
                  value={config[field.key] || ''}
                  onChange={e =>
                    setConfig(prev => ({ ...prev, [field.key]: e.target.value }))
                  }
                  placeholder={field.placeholder}
                />
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          {step === 'configure' && (
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
          )}
          {step === 'configure' && (
            <Button onClick={handleAdd} disabled={!name}>
              <Plus className="h-4 w-4 mr-2" />
              Add Connector
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Main Data Connectors Component
interface DataConnectorsProps {
  /** Existing connectors */
  connectors: Connector[]
  /** Handler for adding a connector */
  onAdd?: (connector: Omit<Connector, 'id' | 'status' | 'lastSync'>) => void
  /** Handler for updating a connector */
  onUpdate?: (id: string, config: Record<string, unknown>) => void
  /** Handler for deleting a connector */
  onDelete?: (id: string) => void
  /** Handler for syncing a connector */
  onSync?: (id: string) => void
  /** Custom class name */
  className?: string
}

export function DataConnectors({
  connectors,
  onAdd,
  onUpdate,
  onDelete,
  onSync,
  className,
}: DataConnectorsProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  const handleAdd = (connector: Omit<Connector, 'id' | 'status' | 'lastSync'>) => {
    onAdd?.(connector)
    toast.success('Connector added successfully')
  }

  const handleSync = (id: string) => {
    onSync?.(id)
    toast.info('Sync started')
  }

  const handleDelete = (id: string) => {
    onDelete?.(id)
    toast.success('Connector removed')
  }

  const connectedCount = connectors.filter(c => c.status === 'connected').length

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Data Connectors</h2>
          <p className="text-sm text-muted-foreground">
            {connectedCount} of {connectors.length} connectors active
          </p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Connector
        </Button>
      </div>

      {/* Connectors Grid */}
      {connectors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {connectors.map(connector => (
            <ConnectorCard
              key={connector.id}
              connector={connector}
              onConfigure={() => {}}
              onSync={() => handleSync(connector.id)}
              onDelete={() => handleDelete(connector.id)}
            />
          ))}
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Database className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="font-medium mb-1">No connectors yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add a data connector to start importing data
            </p>
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Connector
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Add Connector Dialog */}
      <AddConnectorDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAdd={handleAdd}
      />
    </div>
  )
}
