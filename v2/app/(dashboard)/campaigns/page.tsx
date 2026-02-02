'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/ui/stat-card'
import { campaigns, campaignStats } from '@/lib/campaigns-data'
import {
  Mail,
  Copy,
  Check,
  Calendar,
  Target,
  TrendingUp,
  MessageSquare,
  Send,
  Clock,
  Users,
  BarChart3,
  Zap
} from 'lucide-react'

export default function CampaignsPage() {
  const router = useRouter()
  const [selectedCampaign, setSelectedCampaign] = useState(campaigns[0].id)
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)

  const activeCampaign = campaigns.find(c => c.id === selectedCampaign)

  const copyToClipboard = (text: string, emailId: string) => {
    navigator.clipboard.writeText(text)
    setCopiedEmail(emailId)
    setTimeout(() => setCopiedEmail(null), 2000)
  }

  const useCampaign = () => {
    if (activeCampaign) {
      const campaignText = activeCampaign.emails.map((email, i) => 
        `--- Day ${email.day}: ${email.subject} ---\n${email.body}`
      ).join('\n\n')
      
      navigator.clipboard.writeText(campaignText)
      console.log(`✅ Campaign "${activeCampaign.name}" copied to clipboard`)
    }
  }

  const getPersonalizedEmail = (template: string, sampleData = { COMPANY: 'Acme HVAC', FIRST_NAME: 'Sarah' }) => {
    let personalized = template
    Object.entries(sampleData).forEach(([key, value]) => {
      personalized = personalized.replace(new RegExp(`{{${key}}}`, 'g'), value)
    })
    return personalized
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="Outreach Campaigns"
        description="Ready-to-use email sequences for field service operations leaders"
        actions={
          <Button variant="default" onClick={() => router.push('/leads')}>
            <Send className="w-4 h-4 mr-2" />
            Launch Campaign
          </Button>
        }
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Active Campaigns"
          value={campaignStats.totalCampaigns.toString()}
          icon={Target}
          variant="default"
          delay={0}
        />
        <StatCard
          label="Total Emails"
          value={campaignStats.totalEmails.toString()}
          icon={Mail}
          variant="success"
          delay={0.1}
        />
        <StatCard
          label="Emails Sent"
          value={campaignStats.totalSent.toString()}
          icon={Send}
          variant="success"
          delay={0.2}
        />
        <StatCard
          label="Meetings Booked"
          value={campaignStats.totalMeetings.toString()}
          icon={Calendar}
          variant="success"
          delay={0.3}
        />
      </div>

      {/* Campaign Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {campaigns.map((campaign, index) => (
          <motion.div
            key={campaign.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card
              className={`cursor-pointer transition-all ${
                selectedCampaign === campaign.id
                  ? 'border-pipeline bg-pipeline/5 ring-2 ring-pipeline/30'
                  : 'hover:border-pipeline/30'
              }`}
              onClick={() => setSelectedCampaign(campaign.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base">{campaign.name}</CardTitle>
                    <CardDescription className="mt-1 text-xs">{campaign.description}</CardDescription>
                  </div>
                  {selectedCampaign === campaign.id && (
                    <Check className="w-5 h-5 text-pipeline flex-shrink-0" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-text-secondary">
                      <Mail className="w-3.5 h-3.5" />
                      <span>{campaign.emails.length} emails</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-text-secondary">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>14-day sequence</span>
                    </div>
                  </div>

                  {/* Hook */}
                  <div className="pt-3 border-t border-border-subtle">
                    <p className="text-xs text-text-tertiary">
                      <span className="font-semibold text-text-secondary">Hook:</span> {campaign.hook}
                    </p>
                  </div>

                  {/* Target Persona */}
                  <div className="flex items-start gap-2">
                    <Users className="w-3.5 h-3.5 text-pipeline mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-text-secondary leading-relaxed">{campaign.targetPersona}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Email Sequence Detail */}
      {activeCampaign && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-text-primary">{activeCampaign.name}</h2>
              <p className="text-text-secondary mt-1">{activeCampaign.description}</p>
            </div>
            <Button variant="default" onClick={useCampaign}>
              <Zap className="w-4 h-4 mr-2" />
              Use This Campaign
            </Button>
          </div>

          {/* Email Timeline */}
          <div className="space-y-4">
            {activeCampaign.emails.map((email, index) => {
              const emailId = `${activeCampaign.id}-${index}`
              const isCopied = copiedEmail === emailId
              const personalizedSubject = getPersonalizedEmail(email.subject)
              const personalizedBody = getPersonalizedEmail(email.body)

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex gap-4">
                          {/* Day Badge */}
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 rounded-full bg-pipeline/10 border-2 border-pipeline flex items-center justify-center">
                              <span className="text-sm font-bold text-pipeline">D{email.day}</span>
                            </div>
                            {index < activeCampaign.emails.length - 1 && (
                              <div className="w-0.5 h-16 bg-border-subtle mt-2" />
                            )}
                          </div>

                          {/* Email Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="w-4 h-4 text-text-tertiary" />
                              <span className="text-sm text-text-secondary">
                                Day {email.day} {index === 0 ? '(Initial Outreach)' : index === activeCampaign.emails.length - 1 ? '(Break-up)' : '(Follow-up)'}
                              </span>
                            </div>
                            <CardTitle className="text-base">Subject: {personalizedSubject}</CardTitle>
                          </div>
                        </div>

                        {/* Copy Button */}
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => copyToClipboard(personalizedBody, emailId)}
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-4 h-4 mr-1.5" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 mr-1.5" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Email Body */}
                      <div className="bg-surface-subtle rounded-lg p-4 border border-border-subtle">
                        <pre className="text-sm text-text-primary whitespace-pre-wrap font-sans leading-relaxed">
                          {personalizedBody}
                        </pre>
                      </div>

                      {/* Personalization Tags */}
                      {email.personalizationTags.length > 0 && (
                        <div className="mt-4 flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-text-secondary">Personalization tags:</span>
                          {email.personalizationTags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2 py-1 rounded-md bg-pipeline/10 text-pipeline text-xs font-mono"
                            >
                              {`{{${tag}}}`}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Timing Note */}
                      <div className="mt-4 p-3 bg-warning/10 border border-warning/30 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Calendar className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                          <div className="text-xs">
                            <p className="font-semibold text-warning mb-1">Timing</p>
                            <p className="text-text-secondary">
                              {index === 0
                                ? 'Send immediately after qualifying prospect'
                                : `Send ${email.day} days after initial outreach${email.day === 14 ? ' (final follow-up)' : ''}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          {/* Campaign Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-pipeline" />
                Campaign Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Best Practices */}
                <div>
                  <h4 className="text-sm font-semibold text-text-primary mb-3">✅ Best Practices</h4>
                  <ul className="space-y-2 text-sm text-text-secondary">
                    <li className="flex items-start gap-2">
                      <span className="text-revenue mt-0.5">•</span>
                      <span>Keep emails under 120 words</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-revenue mt-0.5">•</span>
                      <span>Single clear CTA per email</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-revenue mt-0.5">•</span>
                      <span>Reference specific pain points</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-revenue mt-0.5">•</span>
                      <span>Show credibility briefly</span>
                    </li>
                  </ul>
                </div>

                {/* What to Avoid */}
                <div>
                  <h4 className="text-sm font-semibold text-text-primary mb-3">❌ Avoid</h4>
                  <ul className="space-y-2 text-sm text-text-secondary">
                    <li className="flex items-start gap-2">
                      <span className="text-danger mt-0.5">•</span>
                      <span>&ldquo;Hope this email finds you well&rdquo;</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-danger mt-0.5">•</span>
                      <span>Wall of text paragraphs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-danger mt-0.5">•</span>
                      <span>Multiple competing CTAs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-danger mt-0.5">•</span>
                      <span>Generic &ldquo;one-size-fits-all&rdquo; pitch</span>
                    </li>
                  </ul>
                </div>

                {/* Personalization Tips */}
                <div>
                  <h4 className="text-sm font-semibold text-text-primary mb-3">💡 Personalization</h4>
                  <ul className="space-y-2 text-sm text-text-secondary">
                    <li className="flex items-start gap-2">
                      <span className="text-pipeline mt-0.5">•</span>
                      <span>Research LinkedIn before sending</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-pipeline mt-0.5">•</span>
                      <span>Reference company growth or news</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-pipeline mt-0.5">•</span>
                      <span>Adjust pain points to industry</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-pipeline mt-0.5">•</span>
                      <span>Match tone to recipient seniority</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
