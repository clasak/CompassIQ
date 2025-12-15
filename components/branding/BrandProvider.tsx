'use client'

import React, { createContext, useContext, useEffect, useMemo } from 'react'
import { getBrandCssVars, normalizeBranding, type OrgBranding } from '@/lib/branding'

type BrandingContextValue = {
  branding: OrgBranding
}

const BrandingContext = createContext<BrandingContextValue | null>(null)

export function BrandProvider({
  branding: initial,
  children,
}: {
  branding: OrgBranding
  children: React.ReactNode
}) {
  const branding = useMemo(() => normalizeBranding(initial), [initial])

  useEffect(() => {
    const vars = getBrandCssVars(branding)
    const el = document.documentElement
    for (const [key, value] of Object.entries(vars)) {
      el.style.setProperty(key, value)
    }
    return () => {
      for (const key of Object.keys(vars)) {
        el.style.removeProperty(key)
      }
    }
  }, [branding])

  return <BrandingContext.Provider value={{ branding }}>{children}</BrandingContext.Provider>
}

export function useBranding() {
  const ctx = useContext(BrandingContext)
  if (!ctx) {
    return { branding: normalizeBranding(null) }
  }
  return ctx
}

