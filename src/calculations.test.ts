import { describe, expect, it } from 'vitest'
import { autoVolumes, calculate, directSavings, fteCapacity, hourlyLoadedCost, meetingResult, prReviewResult, roiMetrics } from './calculations'
import { defaults } from './defaults'

describe('core ROI calculations', () => {
  it('calculates hourly loaded cost', () => {
    expect(hourlyLoadedCost(192000, 48, 40)).toBe(100)
  })

  it('calculates meeting hours and weighted value', () => {
    const result = meetingResult(4, 30, 10, 20, 120, 80)
    expect(result.hours).toBe(240)
    expect(result.value).toBe(21120)
  })

  it('calculates PR review hours and value', () => {
    const result = prReviewResult(100, 10, 2, 90)
    expect(result.hours).toBe(400)
    expect(result.value).toBe(36000)
  })

  it('totals direct savings and safely ignores negative values', () => {
    expect(directSavings([1000, 2000, -500, 300])).toBe(3300)
  })

  it('calculates total measurable and net values', () => {
    const results = calculate({ ...defaults, codeReviewTools: 12000, monthlyCost: 1000 })
    expect(results.totalValue).toBeCloseTo(results.directSavings + results.capacityValue)
    expect(results.netValue).toBeCloseTo(results.totalValue - 12000)
  })

  it('calculates ROI and payback', () => {
    expect(roiMetrics(30000, 10000)).toEqual({ net: 20000, roi: 200, payback: 4 })
  })

  it('calculates FTE-equivalent capacity', () => {
    expect(fteCapacity(960, 1920)).toBe(0.5)
  })

  it('handles zero cost without Infinity or NaN', () => {
    const metrics = roiMetrics(10000, 0)
    expect(metrics.roi).toBeNull()
    expect(metrics.payback).toBeNull()
    expect(metrics.net).toBe(10000)
  })

  it('does not include potential impact in primary value', () => {
    const off = calculate({ ...defaults, includePotential: false })
    const on = calculate({ ...defaults, includePotential: true })
    expect(on.totalValue).toBe(off.totalValue)
    expect(on.expandedValue).toBeGreaterThan(on.totalValue)
  })
})

describe('team-average auto-calculated volumes', () => {
  it('multiplies headcount by team-average rates', () => {
    const volumes = autoVolumes({
      engineers: 100, managers: 10, prsPerEngineerPerMonth: 30, reportsPerManagerPerMonth: 2,
      researchQuestionsPerEngineerPerMonth: 2, interruptionsPerEngineerPerMonth: 1, checksPerEngineerPerMonth: 4,
    })
    expect(volumes).toEqual({
      prsPerMonth: 3000, reportsPerMonth: 20, researchPerMonth: 200, interruptionsPerMonth: 100, checksPerMonth: 400,
    })
  })

  it('leaves manual-mode results unaffected by the auto-calculated rate fields', () => {
    const manual = calculate({ ...defaults, volumeMode: 'manual', prsPerEngineerPerMonth: 999 })
    const baseline = calculate(defaults)
    expect(manual.categories.prReview).toEqual(baseline.categories.prReview)
  })

  it('drives PR review volume from headcount in auto mode', () => {
    const results = calculate({ ...defaults, volumeMode: 'auto', engineers: 100, prsPerEngineerPerMonth: 30 })
    expect(results.autoVolumes.prsPerMonth).toBe(3000)
    const expectedHours = 3000 * defaults.reviewMinutesSaved / 60 * defaults.reviewers * 12
    expect(results.categories.prReview.hours).toBeCloseTo(expectedHours)
  })
})
