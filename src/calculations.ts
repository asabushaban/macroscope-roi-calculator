import type { CategoryResult, Inputs, Results, Scenario } from './types'

const safe = (value: number) => Math.max(0, Number.isFinite(value) ? value : 0)
export const hourlyLoadedCost = (annual: number, weeks: number, hours: number) =>
  weeks > 0 && hours > 0 ? safe(annual) / weeks / hours : 0

export const directSavings = (values: number[]) => values.reduce((sum, value) => sum + safe(value), 0)

export const meetingResult = (
  meetings: number, minutesSaved: number, attendees: number, managerPct: number,
  managerRate: number, engineerRate: number,
): CategoryResult => {
  const hours = safe(meetings) * safe(minutesSaved) / 60 * safe(attendees) * 12
  const managerShare = Math.min(100, safe(managerPct)) / 100
  const weightedRate = managerRate * managerShare + engineerRate * (1 - managerShare)
  return { hours, value: hours * weightedRate }
}

export const prReviewResult = (
  prs: number, minutesSaved: number, reviewers: number, hourlyRate: number,
): CategoryResult => {
  const hours = safe(prs) * safe(minutesSaved) / 60 * safe(reviewers) * 12
  return { hours, value: hours * safe(hourlyRate) }
}

export const roiMetrics = (totalValue: number, annualCost: number) => {
  const total = safe(totalValue)
  const cost = safe(annualCost)
  return {
    net: total - cost,
    roi: cost > 0 ? ((total - cost) / cost) * 100 : null,
    payback: cost > 0 && total > 0 ? (cost / total) * 12 : null,
  }
}

export const fteCapacity = (hours: number, productiveHours: number) =>
  productiveHours > 0 ? safe(hours) / productiveHours : 0

export function calculate(i: Inputs): Results {
  const calculatedEngineerRate = hourlyLoadedCost(i.engineerAnnualCost, i.workingWeeks, i.workingHours)
  const calculatedManagerRate = hourlyLoadedCost(i.managerAnnualCost, i.workingWeeks, i.workingHours)
  const engineerHourly = i.engineerHourlyOverride > 0 ? i.engineerHourlyOverride : calculatedEngineerRate
  const managerHourly = i.managerHourlyOverride > 0 ? i.managerHourlyOverride : calculatedManagerRate

  const meetings = meetingResult(i.meetingsPerMonth, i.meetingMinutesSaved, i.meetingAttendees,
    i.meetingManagerPct, managerHourly, engineerHourly)
  const reportHours = safe(i.reportsPerMonth) * safe(i.reportPrepHours) * safe(i.reportPeople) * 12
  const reportRate = i.reportRole === 'manager' ? managerHourly :
    i.reportRole === 'custom' ? safe(i.reportCustomRate) : engineerHourly
  const reporting = { hours: reportHours, value: reportHours * reportRate }
  const reviewRate = i.reviewerCustomRate > 0 ? i.reviewerCustomRate : engineerHourly
  const prReview = prReviewResult(i.prsPerMonth, i.reviewMinutesSaved, i.reviewers, reviewRate)
  const autoApproval = prReviewResult(i.autoPrsPerMonth, i.autoReviewMinutes, i.autoReviewers, engineerHourly)
  const researchHours = safe(i.researchPerMonth) * safe(i.researchMinutesSaved) / 60 * 12
  const research = { hours: researchHours, value: researchHours * engineerHourly }
  const interruptionHours = safe(i.interruptionsPerMonth) *
    (safe(i.interruptionMinutes) + safe(i.recoveryMinutes)) / 60 * safe(i.engineersInterrupted) * 12
  const interruptions = { hours: interruptionHours, value: interruptionHours * engineerHourly }
  const checkHours = safe(i.checksPerMonth) * safe(i.checkMinutes) *
    Math.min(100, safe(i.checkPctEliminated)) / 100 / 60 * 12
  const manualChecks = { hours: checkHours, value: checkHours * engineerHourly }
  const categories = { meetings, reporting, prReview, autoApproval, research, interruptions, manualChecks }
  const annualHours = Object.values(categories).reduce((sum, item) => sum + item.hours, 0)
  const capacityValue = Object.values(categories).reduce((sum, item) => sum + item.value, 0)
  const cash = directSavings([i.codeReviewTools, i.reportingTools, i.otherTools, i.contractorReview,
    i.consultingReporting, i.overtime])
  const annualCost = (i.costMode === 'simple' ? safe(i.monthlyCost) :
    directSavings([i.reviewCost, i.statusCost, i.agentCost, i.macroCost, i.otherCost])) * 12
  const totalValue = cash + capacityValue
  const metrics = roiMetrics(totalValue, annualCost)
  const productiveHours = safe(i.workingWeeks) * safe(i.workingHours)
  const hiringFte = fteCapacity(i.hiringHours, productiveHours)

  const scenarioValue = (scenario: Scenario) =>
    safe(i.defectsPerMonth) * Math.min(100, safe(i.defectEscapePct[scenario])) / 100 *
      safe(i.defectCost[scenario]) * 12
  const incident = safe(i.incidentsPerYear) * Math.min(100, safe(i.incidentProbability)) / 100 * safe(i.incidentCost)
  const onboardingRate = i.onboardingHourlyCost > 0 ? i.onboardingHourlyCost : engineerHourly
  const onboarding = safe(i.hiresPerYear) * safe(i.onboardingHoursSaved) * onboardingRate
  const delivery = safe(i.releasesPerYear) * safe(i.weeksAccelerated) * safe(i.weeklyValue) *
    Math.min(100, safe(i.macroscopeAttribution)) / 100
  const hiring = i.hiringConfirmed ? hiringFte * safe(i.avoidedHireCost) : 0
  const potential = {
    conservative: scenarioValue('conservative') + incident + onboarding + delivery + hiring,
    expected: scenarioValue('expected') + incident + onboarding + delivery + hiring,
    high: scenarioValue('high') + incident + onboarding + delivery + hiring,
  }
  const expandedValue = totalValue + (i.includePotential ? potential.expected : 0)
  const expandedMetrics = roiMetrics(expandedValue, annualCost)
  return {
    engineerHourly, managerHourly, directSavings: cash, categories, annualHours, capacityValue,
    totalValue, annualCost, netValue: metrics.net, roi: metrics.roi, payback: metrics.payback,
    fte: fteCapacity(annualHours, productiveHours), potential, hiringFte, expandedValue,
    expandedNet: expandedMetrics.net, expandedRoi: expandedMetrics.roi,
  }
}
