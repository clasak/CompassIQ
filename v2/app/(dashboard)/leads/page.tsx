'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/ui/stat-card'
import { useLeads } from '@/hooks/use-leads'
import {
  Target,
  Mail,
  Phone,
  TrendingUp,
  Building2,
  MapPin,
  AlertCircle,
  Filter,
  Search,
  Zap,
  DollarSign,
  Users,
  Briefcase,
  Loader2,
  Eye
} from 'lucide-react'

export default function LeadsPage() {
  const router = useRouter()
  const { leads, stats, isLoading, error } = useLeads()
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [selectedSize, setSelectedSize] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Filter prospects
  const filteredProspects = useMemo(() => {
    return leads.filter(prospect => {
      const matchesIndustry = selectedIndustry === 'all' || prospect.industry === selectedIndustry
      const matchesStatus = selectedStatus === 'all' || prospect.status === selectedStatus
      const matchesSize = selectedSize === 'all' || prospect.size.includes(selectedSize)
      const matchesSearch = searchQuery === '' || 
        prospect.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prospect.location.toLowerCase().includes(searchQuery.toLowerCase())
      
      return matchesIndustry && matchesStatus && matchesSize && matchesSearch
    })
  }, [leads, selectedIndustry, selectedStatus, selectedSize, searchQuery])

  // Get unique industries, sizes
  const industries = ['all', ...Array.from(new Set(leads.map(p => p.industry)))]
  const sizes = ['all', '10-20', '20-30', '30-40', '40-50', '50+']
  const statuses = ['all', 'research', 'outreach', 'call-scheduled', 'proposal', 'won', 'lost']

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'research': return 'text-text-secondary bg-surface-subtle'
      case 'outreach': return 'text-pipeline bg-pipeline/10'
      case 'call-scheduled': return 'text-warning bg-warning/10'
      case 'proposal': return 'text-revenue bg-revenue/10'
      case 'won': return 'text-green-500 bg-green-500/10'
      case 'lost': return 'text-danger bg-danger/10'
      default: return 'text-text-secondary bg-surface-subtle'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-revenue'
      case 'medium': return 'bg-warning'
      case 'low': return 'bg-pipeline'
      default: return 'bg-text-tertiary'
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-pipeline animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading prospects...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 text-danger mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">Failed to load prospects</h3>
            <p className="text-text-secondary mb-4">{error}</p>
            <Button variant="default" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="Prospect Pipeline"
        description={`${stats?.total || 0} researched Texas field service companies ready for outreach`}
        actions={
          <Button variant="default" onClick={() => router.push('/campaigns')}>
            <Zap className="w-4 h-4 mr-2" />
            Start Campaign
          </Button>
        }
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Total Prospects"
          value={(stats?.total || 0).toString()}
          icon={Target}
          variant="default"
          delay={0}
        />
        <StatCard
          label="Total Pipeline Value"
          value={`$${((stats?.totalValue || 0) / 1000).toFixed(0)}K`}
          icon={DollarSign}
          variant="success"
          delay={0.1}
        />
        <StatCard
          label="Avg Deal Size"
          value={`$${((stats?.avgValue || 0) / 1000).toFixed(0)}K`}
          icon={TrendingUp}
          variant="success"
          delay={0.2}
        />
        <StatCard
          label="Active Outreach"
          value={(stats?.byStatus?.outreach || 0).toString()}
          icon={Mail}
          variant="success"
          delay={0.3}
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
              <input
                type="text"
                placeholder="Search companies or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-surface-subtle border border-border-subtle rounded-lg text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-pipeline/50"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-4">
              {/* Industry Filter */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-text-secondary">Industry</label>
                <div className="flex flex-wrap gap-2">
                  {industries.map((industry) => (
                    <button
                      key={industry}
                      onClick={() => setSelectedIndustry(industry)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        selectedIndustry === industry
                          ? 'bg-pipeline text-white'
                          : 'bg-surface-subtle text-text-secondary hover:bg-surface-overlay'
                      }`}
                    >
                      {industry === 'all' ? 'All Industries' : industry}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-text-secondary">Status</label>
                <div className="flex flex-wrap gap-2">
                  {statuses.map((status) => (
                    <button
                      key={status}
                      onClick={() => setSelectedStatus(status)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                        selectedStatus === status
                          ? 'bg-pipeline text-white'
                          : 'bg-surface-subtle text-text-secondary hover:bg-surface-overlay'
                      }`}
                    >
                      {status === 'all' ? 'All Statuses' : status.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Filter */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-text-secondary">Company Size</label>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        selectedSize === size
                          ? 'bg-pipeline text-white'
                          : 'bg-surface-subtle text-text-secondary hover:bg-surface-overlay'
                      }`}
                    >
                      {size === 'all' ? 'All Sizes' : `${size} techs`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          Showing <span className="font-semibold text-text-primary">{filteredProspects.length}</span> of {stats?.total || 0} prospects
        </p>
        {(selectedIndustry !== 'all' || selectedStatus !== 'all' || selectedSize !== 'all' || searchQuery) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedIndustry('all')
              setSelectedStatus('all')
              setSelectedSize('all')
              setSearchQuery('')
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Empty state - no leads at all */}
      {leads.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">No prospects yet</h3>
            <p className="text-text-secondary mb-4">Prospect import feature coming soon</p>
            <Button variant="default" disabled className="opacity-50 cursor-not-allowed">
              <Target className="w-4 h-4 mr-2" />
              Add First Prospect (Coming Soon)
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Prospects Grid */}
      {leads.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProspects.map((prospect, index) => (
          <motion.div
            key={prospect.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card className="h-full hover:border-pipeline/50 transition-all group">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg">{prospect.company}</CardTitle>
                    <CardDescription className="mt-1">{prospect.industry}</CardDescription>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${getPriorityColor(prospect.priority)} mt-2`} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-text-secondary">
                    <Users className="w-4 h-4" />
                    <span>{prospect.size}</span>
                  </div>
                  <div className="flex items-center gap-2 text-text-secondary">
                    <MapPin className="w-4 h-4" />
                    <span>{prospect.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-text-secondary">
                    <DollarSign className="w-4 h-4" />
                    <span>${(prospect.estimated_value / 1000).toFixed(0)}K estimated value</span>
                  </div>
                </div>

                {/* Pain Points */}
                <div>
                  <h4 className="text-xs font-semibold text-text-secondary mb-2">Key Pain Points</h4>
                  <div className="space-y-1">
                    {prospect.pain_points?.slice(0, 3).map((pain, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <AlertCircle className="w-3 h-3 text-warning mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-text-secondary leading-relaxed">{pain}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Badge */}
                <div className="pt-4 border-t border-border-subtle">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium capitalize ${getStatusColor(prospect.status)}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {prospect.status.replace('-', ' ')}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      if (prospect.company) {
                        window.open(`mailto:?subject=Reaching out to ${prospect.company}`)
                      }
                    }}
                  >
                    <Mail className="w-4 h-4 mr-1.5" />
                    Email
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => console.log(`View details for ${prospect.company}`, prospect)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>

                {/* Notes (if any) */}
                {prospect.notes && (
                  <div className="pt-2 border-t border-border-subtle">
                    <p className="text-xs text-text-tertiary italic">{prospect.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
        </div>
      )}

      {/* Filtered Empty State */}
      {leads.length > 0 && filteredProspects.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Filter className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">No prospects found</h3>
            <p className="text-text-secondary mb-4">Try adjusting your filters or search query</p>
            <Button
              variant="secondary"
              onClick={() => {
                setSelectedIndustry('all')
                setSelectedStatus('all')
                setSelectedSize('all')
                setSearchQuery('')
              }}
            >
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
