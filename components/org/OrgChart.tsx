'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, User, Mail, Phone, Building2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export interface OrgMember {
  id: string
  name: string
  title: string
  email?: string
  phone?: string
  department?: string
  avatarUrl?: string
  reports?: OrgMember[]
}

interface OrgChartProps {
  /** Root of the organization */
  data: OrgMember
  /** Orientation of the chart */
  orientation?: 'vertical' | 'horizontal'
  /** Custom class name */
  className?: string
}

// Member Card Component
function MemberCard({
  member,
  isExpanded,
  hasReports,
  onToggle,
}: {
  member: OrgMember
  isExpanded: boolean
  hasReports: boolean
  onToggle: () => void
}) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/5 hover:border-accent/50 transition-all min-w-[200px]',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
          )}
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={member.avatarUrl} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(member.name)}
            </AvatarFallback>
          </Avatar>
          <div className="text-left flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{member.name}</p>
            <p className="text-xs text-muted-foreground truncate">{member.title}</p>
          </div>
          {hasReports && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={e => {
                e.stopPropagation()
                onToggle()
              }}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="start">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={member.avatarUrl} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(member.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{member.name}</p>
              <p className="text-sm text-muted-foreground">{member.title}</p>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t">
            {member.department && (
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{member.department}</span>
              </div>
            )}
            {member.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a
                  href={`mailto:${member.email}`}
                  className="text-primary hover:underline"
                >
                  {member.email}
                </a>
              </div>
            )}
            {member.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a
                  href={`tel:${member.phone}`}
                  className="text-primary hover:underline"
                >
                  {member.phone}
                </a>
              </div>
            )}
          </div>

          {member.reports && member.reports.length > 0 && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                {member.reports.length} direct report{member.reports.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// Recursive Org Node Component
function OrgNode({
  member,
  level = 0,
  orientation,
}: {
  member: OrgMember
  level?: number
  orientation: 'vertical' | 'horizontal'
}) {
  const [isExpanded, setIsExpanded] = useState(level < 2)
  const hasReports = member.reports && member.reports.length > 0

  return (
    <div
      className={cn(
        'flex',
        orientation === 'vertical' ? 'flex-col items-center' : 'flex-row items-start'
      )}
    >
      {/* Member Card */}
      <MemberCard
        member={member}
        isExpanded={isExpanded}
        hasReports={!!hasReports}
        onToggle={() => setIsExpanded(!isExpanded)}
      />

      {/* Reports */}
      {hasReports && isExpanded && (
        <div
          className={cn(
            'relative',
            orientation === 'vertical' ? 'mt-4' : 'ml-4'
          )}
        >
          {/* Connector Lines */}
          {orientation === 'vertical' && (
            <div className="absolute left-1/2 -top-4 w-px h-4 bg-border" />
          )}
          {orientation === 'horizontal' && (
            <div className="absolute -left-4 top-1/2 w-4 h-px bg-border" />
          )}

          <div
            className={cn(
              'flex gap-4',
              orientation === 'vertical' ? 'flex-row flex-wrap justify-center' : 'flex-col'
            )}
          >
            {member.reports!.map((report, index) => (
              <div key={report.id} className="relative">
                {/* Horizontal connector for vertical layout */}
                {orientation === 'vertical' && member.reports!.length > 1 && (
                  <>
                    {/* Horizontal line at top */}
                    <div
                      className={cn(
                        'absolute -top-4 h-px bg-border',
                        index === 0 && 'left-1/2 right-0',
                        index === member.reports!.length - 1 && 'left-0 right-1/2',
                        index > 0 && index < member.reports!.length - 1 && 'left-0 right-0'
                      )}
                    />
                    {/* Vertical connector */}
                    <div className="absolute left-1/2 -top-4 w-px h-4 bg-border" />
                  </>
                )}

                <OrgNode
                  member={report}
                  level={level + 1}
                  orientation={orientation}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Main Org Chart Component
export function OrgChart({
  data,
  orientation = 'vertical',
  className,
}: OrgChartProps) {
  return (
    <div className={cn('overflow-auto p-6', className)}>
      <OrgNode member={data} orientation={orientation} />
    </div>
  )
}

// Flat list view alternative
interface OrgListProps {
  /** Organization members as flat list */
  members: OrgMember[]
  /** Custom class name */
  className?: string
}

export function OrgList({ members, className }: OrgListProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Group by department
  const departments = members.reduce((acc, member) => {
    const dept = member.department || 'Other'
    if (!acc[dept]) acc[dept] = []
    acc[dept].push(member)
    return acc
  }, {} as Record<string, OrgMember[]>)

  return (
    <div className={cn('space-y-6', className)}>
      {Object.entries(departments).map(([department, deptMembers]) => (
        <div key={department}>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            {department}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {deptMembers.map(member => (
              <div
                key={member.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={member.avatarUrl} />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {getInitials(member.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{member.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{member.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
