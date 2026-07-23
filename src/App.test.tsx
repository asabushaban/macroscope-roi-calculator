import { describe, expect, it } from 'vitest'
import { hasPrDoubleCountingRisk } from './App'

describe('double-counting warning behavior', () => {
  it('warns when both PR review categories have volume', () => {
    expect(hasPrDoubleCountingRisk({ prsPerMonth: 100, autoPrsPerMonth: 10 })).toBe(true)
  })

  it('does not warn if either PR category is empty', () => {
    expect(hasPrDoubleCountingRisk({ prsPerMonth: 100, autoPrsPerMonth: 0 })).toBe(false)
  })
})
