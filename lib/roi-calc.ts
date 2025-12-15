export interface ROIDefaults {
  averageDealSize?: number
  monthlyLeads?: number
  currentWinRate?: number
  targetWinRate?: number
  currentSalesCycleDays?: number
  targetSalesCycleDays?: number
  reportingHoursPerWeek?: number
  hourlyCost?: number
  arDaysReductionTarget?: number
  churnReductionTarget?: number
}

export interface ROIResult {
  incrementalRevenuePerMonth: number
  incrementalRevenuePerYear: number
  timeSavingsPerMonth: number
  timeSavingsPerYear: number
  cashAcceleration: number
  churnReductionValue: number
  totalAnnualImpact: number
}

/**
 * Pure ROI calculation (client-safe)
 */
export function calculateROI(defaults: ROIDefaults): ROIResult {
  const {
    averageDealSize = 0,
    monthlyLeads = 0,
    currentWinRate = 0,
    targetWinRate = 0,
    currentSalesCycleDays = 0,
    targetSalesCycleDays = 0,
    reportingHoursPerWeek = 0,
    hourlyCost = 0,
    arDaysReductionTarget = 0,
    churnReductionTarget = 0,
  } = defaults

  const currentWinsPerMonth = monthlyLeads * (currentWinRate / 100)
  const targetWinsPerMonth = monthlyLeads * (targetWinRate / 100)
  const incrementalWinsPerMonth = targetWinsPerMonth - currentWinsPerMonth
  const incrementalRevenuePerMonth = incrementalWinsPerMonth * averageDealSize
  const incrementalRevenuePerYear = incrementalRevenuePerMonth * 12

  const timeSavingsPerMonth = reportingHoursPerWeek * 4.33 * hourlyCost
  const timeSavingsPerYear = timeSavingsPerMonth * 12

  const monthlyRevenue = currentWinsPerMonth * averageDealSize
  const annualRevenue = monthlyRevenue * 12
  const cashAcceleration = (arDaysReductionTarget / 365) * annualRevenue

  const churnReductionValue = annualRevenue * (churnReductionTarget / 100)

  const totalAnnualImpact =
    incrementalRevenuePerYear +
    timeSavingsPerYear +
    cashAcceleration +
    churnReductionValue

  return {
    incrementalRevenuePerMonth: Math.round(incrementalRevenuePerMonth),
    incrementalRevenuePerYear: Math.round(incrementalRevenuePerYear),
    timeSavingsPerMonth: Math.round(timeSavingsPerMonth),
    timeSavingsPerYear: Math.round(timeSavingsPerYear),
    cashAcceleration: Math.round(cashAcceleration),
    churnReductionValue: Math.round(churnReductionValue),
    totalAnnualImpact: Math.round(totalAnnualImpact),
  }
}
