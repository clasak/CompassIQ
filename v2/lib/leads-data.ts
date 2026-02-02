// Real prospect data from compassiq-prospects.md
export interface Prospect {
  id: string
  company: string
  industry: string
  size: string
  location: string
  painPoints: string[]
  status: 'research' | 'outreach' | 'call-scheduled' | 'proposal' | 'won' | 'lost'
  estimatedValue: number
  priority: 'high' | 'medium' | 'low'
  lastContact?: string
  nextAction?: string
  notes?: string
  emailsSent?: number
  responses?: number
}

export const prospects: Prospect[] = [
  // HVAC Companies
  {
    id: 'hts-texas',
    company: 'HTS Texas',
    industry: 'HVAC - Commercial',
    size: '50+ technicians',
    location: 'Houston, TX',
    painPoints: [
      'Complex multi-location operations',
      'Commercial service coordination',
      'Data scattered across systems'
    ],
    status: 'research',
    estimatedValue: 45000,
    priority: 'high',
    notes: 'Large commercial HVAC leader in Houston. Strong operations team.'
  },
  {
    id: 'malek-service',
    company: 'Malek Service Company',
    industry: 'HVAC - Commercial',
    size: '30-40 technicians',
    location: 'Houston, TX',
    painPoints: [
      'Commercial project tracking',
      'Technician efficiency metrics',
      'Manual reporting processes'
    ],
    status: 'research',
    estimatedValue: 35000,
    priority: 'high',
    notes: 'Medium-sized commercial HVAC with growth potential.'
  },
  {
    id: 'one-hour-heating',
    company: 'One Hour Heating & Air',
    industry: 'HVAC - Residential',
    size: '25-35 technicians',
    location: 'Houston, TX',
    painPoints: [
      'Franchise coordination',
      'Multiple location visibility',
      'ServiceTitan complexity concerns'
    ],
    status: 'research',
    estimatedValue: 30000,
    priority: 'medium',
    notes: 'Franchise operation with multiple Houston locations.'
  },
  {
    id: '68-degrees',
    company: '68 Degrees HVAC',
    industry: 'HVAC - Residential',
    size: '15-25 technicians',
    location: 'Houston, TX',
    painPoints: [
      'Growing team needs',
      'Dispatch efficiency',
      'Revenue visibility gaps'
    ],
    status: 'research',
    estimatedValue: 25000,
    priority: 'medium',
    notes: 'Growing residential HVAC company mentioned in Houston Chronicle.'
  },
  {
    id: 'air-specialist',
    company: 'Air Specialist',
    industry: 'HVAC - Residential',
    size: '20-30 technicians',
    location: 'Houston, TX',
    painPoints: [
      'Seasonal demand fluctuations',
      'Capacity planning',
      'Customer follow-up tracking'
    ],
    status: 'research',
    estimatedValue: 28000,
    priority: 'medium'
  },
  {
    id: 'affordable-comfort',
    company: 'Affordable Comfort Heating & Air',
    industry: 'HVAC - Residential',
    size: '15-20 technicians',
    location: 'Dallas, TX',
    painPoints: [
      'Job costing accuracy',
      'Technician productivity',
      'Parts inventory management'
    ],
    status: 'research',
    estimatedValue: 22000,
    priority: 'medium'
  },

  // Plumbing Companies
  {
    id: 'power-plumbing',
    company: 'Power Plumbing',
    industry: 'Plumbing',
    size: '30-40 technicians',
    location: 'Houston, TX',
    painPoints: [
      'Operations team coordination',
      'Multi-service line tracking',
      'Lead conversion optimization'
    ],
    status: 'research',
    estimatedValue: 38000,
    priority: 'high',
    notes: 'Has dedicated operations leadership team - good fit for CompassIQ.'
  },
  {
    id: 'abacus-plumbing',
    company: 'Abacus Plumbing',
    industry: 'Plumbing',
    size: '40+ technicians',
    location: 'Houston, TX',
    painPoints: [
      'Large fleet management',
      'Call center efficiency',
      'Revenue per technician metrics'
    ],
    status: 'research',
    estimatedValue: 42000,
    priority: 'high',
    notes: 'Large Houston area plumbing company. Strong brand presence.'
  },
  {
    id: 'rooter-plus',
    company: 'Rooter Plus Plumbing',
    industry: 'Plumbing',
    size: '20-25 technicians',
    location: 'Dallas, TX',
    painPoints: [
      'Emergency service coordination',
      'After-hours dispatch',
      'Customer satisfaction tracking'
    ],
    status: 'research',
    estimatedValue: 26000,
    priority: 'medium'
  },
  {
    id: 'metro-flow-plumbing',
    company: 'Metro Flow Plumbing',
    industry: 'Plumbing',
    size: '25-30 technicians',
    location: 'Dallas, TX',
    painPoints: [
      'Commercial/residential split tracking',
      'Maintenance contract management',
      'Technician route optimization'
    ],
    status: 'research',
    estimatedValue: 29000,
    priority: 'medium'
  },

  // Electrical Companies
  {
    id: 'john-moore-electric',
    company: 'John Moore Services (Electrical)',
    industry: 'Electrical',
    size: '35+ technicians',
    location: 'Houston, TX',
    painPoints: [
      'Multi-trade coordination',
      'Large team management',
      'Project vs service tracking'
    ],
    status: 'research',
    estimatedValue: 40000,
    priority: 'high',
    notes: 'Part of larger multi-trade operation. Strong operations focus.'
  },
  {
    id: 'electric-today',
    company: 'Electric Today',
    industry: 'Electrical',
    size: '20-30 technicians',
    location: 'Houston, TX',
    painPoints: [
      'Commercial project bidding',
      'Material cost tracking',
      'Job profitability analysis'
    ],
    status: 'research',
    estimatedValue: 32000,
    priority: 'medium'
  },
  {
    id: 'bates-electric',
    company: 'Bates Electric',
    industry: 'Electrical',
    size: '25-35 technicians',
    location: 'Austin, TX',
    painPoints: [
      'Rapid growth management',
      'Quality control processes',
      'Customer communication gaps'
    ],
    status: 'research',
    estimatedValue: 34000,
    priority: 'medium'
  },

  // Pest Control
  {
    id: 'abc-pest-control',
    company: 'ABC Home & Commercial Services',
    industry: 'Pest Control',
    size: '100+ technicians',
    location: 'Austin, TX',
    painPoints: [
      'Recurring service optimization',
      'Route density analytics',
      'Customer retention tracking'
    ],
    status: 'research',
    estimatedValue: 55000,
    priority: 'high',
    notes: 'Large multi-service operation. High volume, recurring revenue model.'
  },
  {
    id: 'orkin-houston',
    company: 'Orkin (Houston Franchise)',
    industry: 'Pest Control',
    size: '40-50 technicians',
    location: 'Houston, TX',
    painPoints: [
      'Franchise reporting to corporate',
      'Territory management',
      'Seasonal demand planning'
    ],
    status: 'research',
    estimatedValue: 38000,
    priority: 'medium'
  },
  {
    id: 'bulwark-pest',
    company: 'Bulwark Pest Control',
    industry: 'Pest Control',
    size: '30-40 technicians',
    location: 'Dallas, TX',
    painPoints: [
      'Monthly service tracking',
      'Customer lifecycle management',
      'Technician productivity metrics'
    ],
    status: 'research',
    estimatedValue: 33000,
    priority: 'medium'
  },

  // Lawn Care
  {
    id: 'trugreen-houston',
    company: 'TruGreen (Houston)',
    industry: 'Lawn Care',
    size: '35-45 technicians',
    location: 'Houston, TX',
    painPoints: [
      'Seasonal crew management',
      'Service completion tracking',
      'Weather impact analysis'
    ],
    status: 'research',
    estimatedValue: 36000,
    priority: 'medium'
  },
  {
    id: 'massey-services',
    company: 'Massey Services',
    industry: 'Lawn Care',
    size: '50+ technicians',
    location: 'Dallas, TX',
    painPoints: [
      'Multi-service bundling',
      'Territory coverage optimization',
      'Customer acquisition costs'
    ],
    status: 'research',
    estimatedValue: 42000,
    priority: 'high'
  },
  {
    id: 'us-lawns',
    company: 'U.S. Lawns',
    industry: 'Lawn Care - Commercial',
    size: '25-35 technicians',
    location: 'Austin, TX',
    painPoints: [
      'Commercial contract management',
      'Crew efficiency tracking',
      'Equipment utilization'
    ],
    status: 'research',
    estimatedValue: 31000,
    priority: 'medium'
  },

  // Multi-Trade
  {
    id: 'service-experts',
    company: 'Service Experts',
    industry: 'Multi-Trade (HVAC + Plumbing)',
    size: '60+ technicians',
    location: 'Houston, TX',
    painPoints: [
      'Cross-service coordination',
      'Unified reporting needs',
      'Complex dispatch logistics'
    ],
    status: 'research',
    estimatedValue: 52000,
    priority: 'high',
    notes: 'Large multi-trade operation. National brand with local ops challenges.'
  },
  {
    id: 'reliable-home-services',
    company: 'Reliable Home Services',
    industry: 'Multi-Trade',
    size: '30-40 technicians',
    location: 'San Antonio, TX',
    painPoints: [
      'Service type profitability',
      'Cross-sell tracking',
      'Technician specialization management'
    ],
    status: 'research',
    estimatedValue: 37000,
    priority: 'medium'
  }
]

// Summary statistics
export const leadStats = {
  total: prospects.length,
  byStatus: {
    research: prospects.filter(p => p.status === 'research').length,
    outreach: prospects.filter(p => p.status === 'outreach').length,
    'call-scheduled': prospects.filter(p => p.status === 'call-scheduled').length,
    proposal: prospects.filter(p => p.status === 'proposal').length,
    won: prospects.filter(p => p.status === 'won').length,
    lost: prospects.filter(p => p.status === 'lost').length,
  },
  byIndustry: prospects.reduce((acc, p) => {
    acc[p.industry] = (acc[p.industry] || 0) + 1
    return acc
  }, {} as Record<string, number>),
  totalValue: prospects.reduce((sum, p) => sum + p.estimatedValue, 0),
  avgValue: Math.round(prospects.reduce((sum, p) => sum + p.estimatedValue, 0) / prospects.length)
}
