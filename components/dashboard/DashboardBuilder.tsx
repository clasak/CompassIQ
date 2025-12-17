'use client'

import { useState, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Table,
  FileText,
  Gauge,
  Activity,
  Target,
  Plus,
  GripVertical,
  X,
  Settings,
  Save,
  Eye,
  Edit3,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// Widget type definitions
export type WidgetType =
  | 'kpi'
  | 'bar-chart'
  | 'line-chart'
  | 'pie-chart'
  | 'donut-chart'
  | 'gauge'
  | 'table'
  | 'text'
  | 'sparkline'

export interface Widget {
  id: string
  type: WidgetType
  title: string
  config: Record<string, unknown>
  size: 'sm' | 'md' | 'lg' | 'xl'
}

export interface Dashboard {
  id: string
  name: string
  description?: string
  widgets: Widget[]
  createdAt: Date
  updatedAt: Date
}

// Widget templates
const widgetTemplates: Array<{
  type: WidgetType
  label: string
  icon: React.ElementType
  defaultSize: Widget['size']
}> = [
  { type: 'kpi', label: 'KPI Card', icon: Target, defaultSize: 'sm' },
  { type: 'bar-chart', label: 'Bar Chart', icon: BarChart3, defaultSize: 'md' },
  { type: 'line-chart', label: 'Line Chart', icon: TrendingUp, defaultSize: 'md' },
  { type: 'pie-chart', label: 'Pie Chart', icon: PieChart, defaultSize: 'md' },
  { type: 'donut-chart', label: 'Donut Chart', icon: PieChart, defaultSize: 'md' },
  { type: 'gauge', label: 'Gauge', icon: Gauge, defaultSize: 'sm' },
  { type: 'table', label: 'Data Table', icon: Table, defaultSize: 'lg' },
  { type: 'text', label: 'Text Block', icon: FileText, defaultSize: 'md' },
  { type: 'sparkline', label: 'Sparkline', icon: Activity, defaultSize: 'sm' },
]

const sizeClasses = {
  sm: 'col-span-1 row-span-1',
  md: 'col-span-2 row-span-1',
  lg: 'col-span-2 row-span-2',
  xl: 'col-span-4 row-span-2',
}

// Sortable Widget Component
function SortableWidget({
  widget,
  onRemove,
  onConfigure,
  isEditing,
}: {
  widget: Widget
  onRemove: (id: string) => void
  onConfigure: (widget: Widget) => void
  isEditing: boolean
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const IconComponent = widgetTemplates.find(t => t.type === widget.type)?.icon || Target

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative bg-card border rounded-lg p-4 transition-all',
        sizeClasses[widget.size],
        isDragging && 'opacity-50 z-50',
        isEditing && 'ring-2 ring-primary/20'
      )}
    >
      {isEditing && (
        <div className="absolute top-2 right-2 flex gap-1 z-10">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onConfigure(widget)}
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive hover:text-destructive"
            onClick={() => onRemove(widget.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 mb-3">
          <IconComponent className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium text-sm">{widget.title}</h3>
        </div>

        {/* Widget content placeholder */}
        <div className="flex-1 flex items-center justify-center bg-muted/30 rounded-md min-h-[100px]">
          <div className="text-center text-muted-foreground">
            <IconComponent className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">{widget.type.replace('-', ' ')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Widget Palette
function WidgetPalette({ onAddWidget }: { onAddWidget: (type: WidgetType) => void }) {
  return (
    <div className="p-4 border rounded-lg bg-card">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <Plus className="h-4 w-4" />
        Add Widgets
      </h3>
      <div className="grid grid-cols-3 gap-2">
        {widgetTemplates.map(template => (
          <button
            key={template.type}
            onClick={() => onAddWidget(template.type)}
            className="flex flex-col items-center gap-1 p-3 rounded-lg border border-dashed hover:border-primary hover:bg-primary/5 transition-colors"
          >
            <template.icon className="h-5 w-5 text-muted-foreground" />
            <span className="text-xs text-center">{template.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// Widget Configuration Dialog
function WidgetConfigDialog({
  widget,
  open,
  onOpenChange,
  onSave,
}: {
  widget: Widget | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (widget: Widget) => void
}) {
  const [title, setTitle] = useState(widget?.title || '')
  const [size, setSize] = useState<Widget['size']>(widget?.size || 'md')

  const handleSave = () => {
    if (!widget) return
    onSave({
      ...widget,
      title,
      size,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configure Widget</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="widget-title">Title</Label>
            <Input
              id="widget-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Widget title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="widget-size">Size</Label>
            <Select value={size} onValueChange={(v: Widget['size']) => setSize(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sm">Small (1x1)</SelectItem>
                <SelectItem value="md">Medium (2x1)</SelectItem>
                <SelectItem value="lg">Large (2x2)</SelectItem>
                <SelectItem value="xl">Extra Large (4x2)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Main Dashboard Builder Component
interface DashboardBuilderProps {
  /** Initial dashboard data */
  initialDashboard?: Dashboard
  /** Handler for saving dashboard */
  onSave?: (dashboard: Dashboard) => void
  /** Available metrics for widget configuration */
  availableMetrics?: Array<{ key: string; label: string }>
  /** Custom class name */
  className?: string
}

export function DashboardBuilder({
  initialDashboard,
  onSave,
  availableMetrics = [],
  className,
}: DashboardBuilderProps) {
  const [dashboard, setDashboard] = useState<Dashboard>(
    initialDashboard || {
      id: crypto.randomUUID(),
      name: 'New Dashboard',
      widgets: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  )
  const [isEditing, setIsEditing] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [configWidget, setConfigWidget] = useState<Widget | null>(null)
  const [configOpen, setConfigOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setDashboard(prev => {
        const oldIndex = prev.widgets.findIndex(w => w.id === active.id)
        const newIndex = prev.widgets.findIndex(w => w.id === over.id)
        return {
          ...prev,
          widgets: arrayMove(prev.widgets, oldIndex, newIndex),
          updatedAt: new Date(),
        }
      })
    }

    setActiveId(null)
  }

  const addWidget = useCallback((type: WidgetType) => {
    const template = widgetTemplates.find(t => t.type === type)
    if (!template) return

    const newWidget: Widget = {
      id: crypto.randomUUID(),
      type,
      title: template.label,
      config: {},
      size: template.defaultSize,
    }

    setDashboard(prev => ({
      ...prev,
      widgets: [...prev.widgets, newWidget],
      updatedAt: new Date(),
    }))

    toast.success(`Added ${template.label}`)
  }, [])

  const removeWidget = useCallback((id: string) => {
    setDashboard(prev => ({
      ...prev,
      widgets: prev.widgets.filter(w => w.id !== id),
      updatedAt: new Date(),
    }))
    toast.success('Widget removed')
  }, [])

  const configureWidget = useCallback((widget: Widget) => {
    setConfigWidget(widget)
    setConfigOpen(true)
  }, [])

  const saveWidgetConfig = useCallback((updatedWidget: Widget) => {
    setDashboard(prev => ({
      ...prev,
      widgets: prev.widgets.map(w =>
        w.id === updatedWidget.id ? updatedWidget : w
      ),
      updatedAt: new Date(),
    }))
    setConfigWidget(null)
  }, [])

  const handleSave = () => {
    onSave?.(dashboard)
    toast.success('Dashboard saved')
  }

  const activeWidget = activeId
    ? dashboard.widgets.find(w => w.id === activeId)
    : null

  return (
    <div className={cn('space-y-4', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Input
            value={dashboard.name}
            onChange={e =>
              setDashboard(prev => ({ ...prev, name: e.target.value }))
            }
            className="text-lg font-semibold w-64"
            placeholder="Dashboard name"
          />
          <span className="text-sm text-muted-foreground">
            {dashboard.widgets.length} widgets
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={isEditing ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </>
            ) : (
              <>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </>
            )}
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Widget Palette (only in edit mode) */}
        {isEditing && (
          <div className="w-64 shrink-0">
            <WidgetPalette onAddWidget={addWidget} />
          </div>
        )}

        {/* Dashboard Canvas */}
        <div className="flex-1">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={dashboard.widgets.map(w => w.id)}
              strategy={rectSortingStrategy}
            >
              <div
                className={cn(
                  'grid gap-4 min-h-[400px] p-4 rounded-lg border-2 border-dashed',
                  isEditing ? 'border-primary/30 bg-primary/5' : 'border-transparent',
                  'grid-cols-4'
                )}
              >
                {dashboard.widgets.length === 0 ? (
                  <div className="col-span-4 flex flex-col items-center justify-center py-20 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mb-4 opacity-30" />
                    <p className="text-lg font-medium">No widgets yet</p>
                    <p className="text-sm">
                      {isEditing
                        ? 'Click a widget from the palette to add it'
                        : 'Switch to edit mode to add widgets'}
                    </p>
                  </div>
                ) : (
                  dashboard.widgets.map(widget => (
                    <SortableWidget
                      key={widget.id}
                      widget={widget}
                      onRemove={removeWidget}
                      onConfigure={configureWidget}
                      isEditing={isEditing}
                    />
                  ))
                )}
              </div>
            </SortableContext>

            <DragOverlay>
              {activeWidget && (
                <div
                  className={cn(
                    'bg-card border rounded-lg p-4 shadow-lg opacity-80',
                    sizeClasses[activeWidget.size]
                  )}
                >
                  <h3 className="font-medium text-sm">{activeWidget.title}</h3>
                </div>
              )}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      {/* Widget Configuration Dialog */}
      <WidgetConfigDialog
        widget={configWidget}
        open={configOpen}
        onOpenChange={setConfigOpen}
        onSave={saveWidgetConfig}
      />
    </div>
  )
}
