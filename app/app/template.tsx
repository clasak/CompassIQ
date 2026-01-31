import type React from 'react'
import { PerfContentMark } from '@/components/perf/PerfContentMark'
import { PerfPanel } from '@/components/perf/PerfPanel'

export default function AppTemplate({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PerfContentMark />
      {children}
      <PerfPanel />
    </>
  )
}

