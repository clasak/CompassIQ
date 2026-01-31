'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('flex items-start justify-between gap-4 mb-8', className)}
    >
      <div>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-text-primary">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-text-secondary text-base">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </motion.header>
  )
}
