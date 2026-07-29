export type Scenario = 'conservative' | 'expected' | 'high'
export type ReportRole = 'engineer' | 'manager' | 'custom'
export type CostMode = 'simple' | 'detailed'
export type VolumeMode = 'manual' | 'auto'

export interface Inputs {
  engineers: number
  managers: number
  volumeMode: VolumeMode
  prsPerEngineerPerMonth: number
  reportsPerManagerPerMonth: number
  researchQuestionsPerEngineerPerMonth: number
  interruptionsPerEngineerPerMonth: number
  checksPerEngineerPerMonth: number
  engineerAnnualCost: number
  managerAnnualCost: number
  workingWeeks: number
  workingHours: number
  engineerHourlyOverride: number
  managerHourlyOverride: number
  codeReviewTools: number
  reportingTools: number
  otherTools: number
  contractorReview: number
  consultingReporting: number
  overtime: number
  meetingsPerMonth: number
  meetingAttendees: number
  meetingDuration: number
  meetingMinutesSaved: number
  meetingManagerPct: number
  meetingEngineerPct: number
  reportsPerMonth: number
  reportPrepHours: number
  reportPeople: number
  reportRole: ReportRole
  reportCustomRate: number
  prsPerMonth: number
  reviewMinutes: number
  reviewMinutesSaved: number
  reviewers: number
  reviewerCustomRate: number
  autoPrsPerMonth: number
  autoReviewMinutes: number
  autoReviewers: number
  researchPerMonth: number
  researchMinutes: number
  researchMinutesSaved: number
  interruptionsPerMonth: number
  interruptionMinutes: number
  recoveryMinutes: number
  engineersInterrupted: number
  checksPerMonth: number
  checkMinutes: number
  checkPctEliminated: number
  costMode: CostMode
  monthlyCost: number
  reviewCost: number
  statusCost: number
  agentCost: number
  macroCost: number
  otherCost: number
  defectsPerMonth: number
  defectEscapePct: Record<Scenario, number>
  defectCost: Record<Scenario, number>
  incidentsPerYear: number
  incidentProbability: number
  incidentCost: number
  hiresPerYear: number
  onboardingHoursSaved: number
  onboardingHourlyCost: number
  releasesPerYear: number
  weeksAccelerated: number
  weeklyValue: number
  macroscopeAttribution: number
  hiringHours: number
  avoidedHireCost: number
  hiringConfirmed: boolean
  includePotential: boolean
}

export interface CategoryResult {
  hours: number
  value: number
}

export interface AutoVolumes {
  prsPerMonth: number
  reportsPerMonth: number
  researchPerMonth: number
  interruptionsPerMonth: number
  checksPerMonth: number
}

export interface Results {
  engineerHourly: number
  managerHourly: number
  directSavings: number
  categories: Record<string, CategoryResult>
  annualHours: number
  capacityValue: number
  totalValue: number
  annualCost: number
  netValue: number
  roi: number | null
  payback: number | null
  fte: number
  potential: Record<Scenario, number>
  hiringFte: number
  expandedValue: number
  expandedNet: number
  expandedRoi: number | null
  autoVolumes: AutoVolumes
}
