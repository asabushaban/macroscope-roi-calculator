import type { Inputs } from './types'

export const defaults: Inputs = {
  engineers: 25, managers: 4, engineerAnnualCost: 180000, managerAnnualCost: 220000,
  workingWeeks: 48, workingHours: 40, engineerHourlyOverride: 0, managerHourlyOverride: 0,
  volumeMode: 'auto',
  prsPerEngineerPerMonth: 15, reportsPerManagerPerMonth: 1, researchQuestionsPerEngineerPerMonth: 2,
  interruptionsPerEngineerPerMonth: 1, checksPerEngineerPerMonth: 4,
  codeReviewTools: 0, reportingTools: 0, otherTools: 0, contractorReview: 0,
  consultingReporting: 0, overtime: 0,
  meetingsPerMonth: 4, meetingAttendees: 10, meetingDuration: 45, meetingMinutesSaved: 15,
  meetingManagerPct: 30, meetingEngineerPct: 70,
  reportsPerMonth: 4, reportPrepHours: 2, reportPeople: 2, reportRole: 'manager',
  reportCustomRate: 0, prsPerMonth: 300, reviewMinutes: 20, reviewMinutesSaved: 5,
  reviewers: 1.5, reviewerCustomRate: 0, autoPrsPerMonth: 0, autoReviewMinutes: 15,
  autoReviewers: 1, researchPerMonth: 40, researchMinutes: 30, researchMinutesSaved: 10,
  interruptionsPerMonth: 20, interruptionMinutes: 15, recoveryMinutes: 5,
  engineersInterrupted: 1, checksPerMonth: 100, checkMinutes: 3, checkPctEliminated: 50,
  costMode: 'simple', monthlyCost: 2500, reviewCost: 0, statusCost: 0, agentCost: 0,
  macroCost: 0, otherCost: 0,
  defectsPerMonth: 5,
  defectEscapePct: { conservative: 5, expected: 10, high: 20 },
  defectCost: { conservative: 1000, expected: 3000, high: 10000 },
  incidentsPerYear: 1, incidentProbability: 25, incidentCost: 20000,
  hiresPerYear: 4, onboardingHoursSaved: 8, onboardingHourlyCost: 0,
  releasesPerYear: 2, weeksAccelerated: 1, weeklyValue: 10000, macroscopeAttribution: 10,
  hiringHours: 0, avoidedHireCost: 180000, hiringConfirmed: false, includePotential: false,
  includeCodeReviewTools: true, includeReportingTools: true, includeOtherTools: true,
  includeContractorReview: true, includeConsultingReporting: true, includeOvertime: true,
  includeMeetings: true, includeReporting: true, includePrReview: true, includeAutoApproval: true,
  includeResearch: true, includeInterruptions: true, includeManualChecks: true,
}

export const presets: Record<string, Partial<Inputs>> = {
  small: {
    engineers: 12, managers: 2, engineerAnnualCost: 165000, managerAnnualCost: 195000,
    meetingsPerMonth: 4, meetingAttendees: 7, prsPerMonth: 140, researchPerMonth: 20,
    interruptionsPerMonth: 10, checksPerMonth: 50, monthlyCost: 1200,
  },
  mid: {
    engineers: 50, managers: 8, engineerAnnualCost: 185000, managerAnnualCost: 225000,
    meetingsPerMonth: 8, meetingAttendees: 12, prsPerMonth: 650, researchPerMonth: 80,
    interruptionsPerMonth: 40, checksPerMonth: 200, monthlyCost: 4500,
  },
  large: {
    engineers: 180, managers: 25, engineerAnnualCost: 205000, managerAnnualCost: 250000,
    meetingsPerMonth: 20, meetingAttendees: 16, prsPerMonth: 2400, researchPerMonth: 250,
    interruptionsPerMonth: 120, checksPerMonth: 800, monthlyCost: 14000,
  },
}

// Benchmark tiers for "auto-calculate" volume mode; sourced in the methodology section.
export const volumePresets: Record<'conservative' | 'typical' | 'highVelocity', Partial<Inputs>> = {
  conservative: {
    prsPerEngineerPerMonth: 10, reportsPerManagerPerMonth: 1, researchQuestionsPerEngineerPerMonth: 1,
    interruptionsPerEngineerPerMonth: 0.5, checksPerEngineerPerMonth: 2,
  },
  typical: {
    prsPerEngineerPerMonth: 15, reportsPerManagerPerMonth: 1, researchQuestionsPerEngineerPerMonth: 2,
    interruptionsPerEngineerPerMonth: 1, checksPerEngineerPerMonth: 4,
  },
  highVelocity: {
    prsPerEngineerPerMonth: 22, reportsPerManagerPerMonth: 2, researchQuestionsPerEngineerPerMonth: 3,
    interruptionsPerEngineerPerMonth: 1.5, checksPerEngineerPerMonth: 6,
  },
}
