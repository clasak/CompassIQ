'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles, X, Maximize2, Minimize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  data?: Record<string, unknown>
}

interface AskDataProps {
  /** Title for the chat interface */
  title?: string
  /** Placeholder text for input */
  placeholder?: string
  /** Custom class name */
  className?: string
  /** Available data context for the AI */
  dataContext?: {
    metrics?: string[]
    tables?: string[]
    timeRange?: string
  }
  /** Handler for processing queries (integrate with your AI backend) */
  onQuery?: (query: string) => Promise<string>
}

// Sample responses for demo (replace with actual AI integration)
const sampleResponses: Record<string, string> = {
  revenue: `Based on your data, here's the revenue summary:

**Current Month Revenue:** $1,245,000
**vs Last Month:** +12.3% ($1,108,000)
**vs Same Period Last Year:** +24.7% ($998,000)

Top contributing factors:
• New client onboarding increased by 15%
• Average deal size grew from $45K to $52K
• Retention rate improved to 94%`,

  pipeline: `Here's your current sales pipeline:

**Total Pipeline Value:** $4.2M
• 30-day: $890K (8 deals)
• 60-day: $1.4M (12 deals)
• 90-day: $1.9M (15 deals)

**Win Rate:** 32% (up from 28%)
**Average Sales Cycle:** 45 days`,

  clients: `Client health overview:

**Total Active Clients:** 127
• Healthy: 98 (77%)
• At Risk: 21 (17%)
• Critical: 8 (6%)

**Net Promoter Score:** 72
**Average Client Tenure:** 2.4 years`,

  default: `I can help you explore your data. Try asking about:
• "What's our current revenue?"
• "Show me the sales pipeline"
• "How are our clients doing?"
• "What's our AR outstanding?"
• "Show project status"`,
}

function getAIResponse(query: string): string {
  const lowerQuery = query.toLowerCase()

  if (lowerQuery.includes('revenue') || lowerQuery.includes('sales') && lowerQuery.includes('total')) {
    return sampleResponses.revenue
  }
  if (lowerQuery.includes('pipeline') || lowerQuery.includes('deals') || lowerQuery.includes('opportunities')) {
    return sampleResponses.pipeline
  }
  if (lowerQuery.includes('client') || lowerQuery.includes('customer') || lowerQuery.includes('account')) {
    return sampleResponses.clients
  }

  return sampleResponses.default
}

export function AskData({
  title = 'Ask Your Data',
  placeholder = 'Ask a question about your data...',
  className,
  dataContext,
  onQuery,
}: AskDataProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Use custom handler or default demo response
      const response = onQuery
        ? await onQuery(input.trim())
        : await new Promise<string>(resolve => {
            setTimeout(() => resolve(getAIResponse(input.trim())), 800)
          })

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const suggestedQuestions = [
    "What's our current revenue?",
    "Show me the sales pipeline",
    "How are our clients doing?",
    "What's overdue in AR?",
  ]

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg',
          'bg-gradient-to-r from-primary to-accent hover:opacity-90',
          className
        )}
        size="icon"
      >
        <Sparkles className="h-6 w-6" />
      </Button>
    )
  }

  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 flex flex-col bg-card border rounded-xl shadow-2xl overflow-hidden transition-all duration-300',
        isExpanded ? 'w-[600px] h-[80vh]' : 'w-[400px] h-[500px]',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/20">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <span className="font-semibold">{title}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="space-y-4">
            <div className="text-center py-6">
              <div className="inline-flex p-3 rounded-full bg-primary/10 mb-3">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg">Welcome to Ask Your Data</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Ask questions about your business metrics in plain English
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Try asking:
              </p>
              {suggestedQuestions.map((question, i) => (
                <button
                  key={i}
                  onClick={() => setInput(question)}
                  className="block w-full text-left px-3 py-2 text-sm rounded-lg border hover:bg-accent/5 hover:border-accent/50 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map(message => (
            <div
              key={message.id}
              className={cn(
                'flex gap-3',
                message.role === 'user' ? 'flex-row-reverse' : ''
              )}
            >
              <div
                className={cn(
                  'shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-accent/20 text-accent'
                )}
              >
                {message.role === 'user' ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </div>
              <div
                className={cn(
                  'flex-1 px-4 py-3 rounded-xl text-sm',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                <div
                  className={cn(
                    'text-xs mt-2 opacity-60',
                    message.role === 'user' ? 'text-right' : ''
                  )}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex gap-3">
            <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-accent/20 text-accent">
              <Bot className="h-4 w-4" />
            </div>
            <div className="px-4 py-3 rounded-xl bg-muted">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-current rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-current rounded-full animate-bounce delay-100" />
                <span className="w-2 h-2 bg-current rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={placeholder}
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={!input.trim() || isLoading} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {dataContext && (
          <p className="text-xs text-muted-foreground mt-2">
            Available: {dataContext.metrics?.length || 0} metrics, {dataContext.tables?.length || 0} tables
          </p>
        )}
      </form>
    </div>
  )
}
