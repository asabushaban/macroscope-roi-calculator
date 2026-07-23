import { useEffect, useMemo, useState } from 'react'
import { calculate } from './calculations'
import { defaults, presets } from './defaults'
import { Field, Metric, Section, Tooltip, type SetInput } from './components/Form'
import type { Inputs, Scenario } from './types'

const STORAGE_KEY = 'macroscope-roi-inputs-v1'
const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const number = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 })
const pct = (value: number | null) => value === null ? 'Not available' : `${number.format(value)}%`
const categoryLabels: Record<string, string> = {
  meetings: 'Meetings', reporting: 'Reporting', prReview: 'PR review',
  autoApproval: 'Auto-approval', research: 'Research', interruptions: 'Interruptions',
  manualChecks: 'Manual checks',
}

function loadInputs(): Inputs {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return { ...defaults, ...JSON.parse(saved) as Partial<Inputs> }
  } catch { /* Ignore unavailable or invalid storage. */ }
  return defaults
}

export function hasPrDoubleCountingRisk(inputs: Pick<Inputs, 'prsPerMonth' | 'autoPrsPerMonth'>) {
  return inputs.prsPerMonth > 0 && inputs.autoPrsPerMonth > 0
}

function App() {
  const [inputs, setInputs] = useState<Inputs>(loadInputs)
  const results = useMemo(() => calculate(inputs), [inputs])
  const roleTotalValid = inputs.meetingManagerPct + inputs.meetingEngineerPct === 100
  const overlapRisk = hasPrDoubleCountingRisk(inputs)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs))
  }, [inputs])

  const setInput: SetInput = (key, value) => setInputs((current) => ({ ...current, [key]: value }))
  const setScenario = (field: 'defectEscapePct' | 'defectCost', scenario: Scenario, value: number) =>
    setInputs((current) => ({ ...current, [field]: { ...current[field], [scenario]: Math.max(0, value) } }))

  const applyPreset = (name: keyof typeof presets) =>
    setInputs((current) => ({ ...current, ...presets[name] }))

  const reset = () => {
    if (window.confirm('Reset all calculator inputs to their defaults?')) {
      localStorage.removeItem(STORAGE_KEY)
      setInputs(defaults)
    }
  }

  const summary = () => `# Macroscope ROI estimate

Generated ${new Date().toLocaleDateString()}

## Primary measurable result
- Annual direct cash savings: ${currency.format(results.directSavings)}
- Annual measurable capacity value: ${currency.format(results.capacityValue)}
- Total measurable annual value: ${currency.format(results.totalValue)}
- Annual Macroscope cost: ${currency.format(results.annualCost)}
- Net measurable annual value: ${currency.format(results.netValue)}
- ROI: ${pct(results.roi)}
- Payback period: ${results.payback === null ? 'Not available' : `${number.format(results.payback)} months`}
- Employee hours returned: ${number.format(results.annualHours)} annually
- FTE-equivalent capacity: ${number.format(results.fte)}

## Potential impact (not part of primary result)
- Conservative: ${currency.format(results.potential.conservative)}
- Expected: ${currency.format(results.potential.expected)}
- High impact: ${currency.format(results.potential.high)}

This estimate is based on the inputs and assumptions provided. Capacity value is not necessarily cash savings. Results are not guaranteed.
`

  const exportSummary = () => {
    const blob = new Blob([summary()], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'macroscope-roi-summary.md'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <header className="hero">
        <nav>
          <a className="brand" href="#top" aria-label="Macroscope ROI calculator home">
            <span className="brand-mark">M</span><span>MACROSCOPE</span>
          </a>
          <span className="saved"><i /> Saved locally</span>
        </nav>
        <div className="hero-content" id="top">
          <div>
            <span className="kicker">BUSINESS VALUE MODEL</span>
            <h1>Calculate the measurable<br /><em>value of engineering clarity.</em></h1>
            <p>A conservative ROI model that separates direct savings, returned capacity, and potential strategic impact—without inflated claims or hidden assumptions.</p>
            <div className="privacy-note">⌁ Your inputs stay in this browser. Nothing is submitted or sent anywhere.</div>
          </div>
          <div className="hero-summary">
            <small>LIVE ESTIMATE</small>
            <strong>{currency.format(results.totalValue)}</strong>
            <span>Total measurable annual value</span>
            <div><b>{number.format(results.annualHours)}</b> hours returned <i /> <b>{number.format(results.fte)}</b> FTE capacity</div>
          </div>
        </div>
      </header>

      <main>
        <div className="toolbar">
          <div>
            <b>Start with an example</b>
            <span>Presets are illustrative only. Every value remains editable.</span>
          </div>
          <div className="preset-buttons">
            <button onClick={() => applyPreset('small')}>Small team</button>
            <button onClick={() => applyPreset('mid')}>Mid-sized org</button>
            <button onClick={() => applyPreset('large')}>Large org</button>
          </div>
        </div>

        <Section number="01" title="Organization profile" eyebrow="YOUR TEAM">
          <p className="intro">Set the baseline used to value employee time. Loaded cost can include salary, payroll taxes, benefits, equipment, and overhead.</p>
          <div className="grid three">
            <Field label="Number of engineers" name="engineers" value={inputs.engineers} setInput={setInput} />
            <Field label="Engineering managers" name="managers" value={inputs.managers} setInput={setInput} />
            <Field label="Working weeks / year" name="workingWeeks" value={inputs.workingWeeks} setInput={setInput} max={52} />
            <Field label="Engineer loaded annual cost" name="engineerAnnualCost" value={inputs.engineerAnnualCost} setInput={setInput} prefix="$" help="Salary plus taxes, benefits, equipment, and overhead." />
            <Field label="Manager loaded annual cost" name="managerAnnualCost" value={inputs.managerAnnualCost} setInput={setInput} prefix="$" help="Use your organization's fully loaded estimate." />
            <Field label="Working hours / week" name="workingHours" value={inputs.workingHours} setInput={setInput} max={168} />
          </div>
          <div className="rate-strip">
            <div><span>CALCULATED ENGINEER RATE <Tooltip text="Annual loaded cost divided by productive weeks and hours." /></span><b>{currency.format(results.engineerHourly)} / hr</b></div>
            <Field label="Override engineer rate (optional)" name="engineerHourlyOverride" value={inputs.engineerHourlyOverride} setInput={setInput} prefix="$" suffix="/ hr" />
            <div><span>CALCULATED MANAGER RATE <Tooltip text="Annual loaded cost divided by productive weeks and hours." /></span><b>{currency.format(results.managerHourly)} / hr</b></div>
            <Field label="Override manager rate (optional)" name="managerHourlyOverride" value={inputs.managerHourlyOverride} setInput={setInput} prefix="$" suffix="/ hr" />
          </div>
        </Section>

        <Section number="02" title="Direct cash savings" eyebrow="HIGH CONFIDENCE" className="cash-section">
          <div className="classification cash"><span>DIRECT CASH</span><p>Only enter spending you reasonably expect to eliminate. Employee time is deliberately excluded.</p></div>
          <div className="split">
            <div>
              <h3>Existing software replaced</h3>
              <Field label="Code review tools" name="codeReviewTools" value={inputs.codeReviewTools} setInput={setInput} prefix="$" suffix="/ year" />
              <Field label="Engineering reporting tools" name="reportingTools" value={inputs.reportingTools} setInput={setInput} prefix="$" suffix="/ year" />
              <Field label="Other tools" name="otherTools" value={inputs.otherTools} setInput={setInput} prefix="$" suffix="/ year" />
            </div>
            <div>
              <h3>External labor reduced</h3>
              <Field label="Contractor / outsourced review" name="contractorReview" value={inputs.contractorReview} setInput={setInput} prefix="$" suffix="/ year" />
              <Field label="Consulting / reporting" name="consultingReporting" value={inputs.consultingReporting} setInput={setInput} prefix="$" suffix="/ year" />
              <Field label="Overtime spend" name="overtime" value={inputs.overtime} setInput={setInput} prefix="$" suffix="/ year" />
            </div>
          </div>
          <div className="subtotal"><span>Annual direct cash savings</span><strong>{currency.format(results.directSavings)}</strong></div>
        </Section>

        <Section number="03" title="Measurable capacity returned" eyebrow="EMPLOYEE TIME" className="capacity-section">
          <div className="classification capacity"><span>CAPACITY VALUE <Tooltip text="The loaded value of employee hours returned to higher-value work; not necessarily payroll savings." /></span><p>Measures employee time returned to higher-value work. It does not imply a reduction in payroll.</p></div>
          <div className="metric-sections">
            <details open>
              <summary><b>A</b><span>Meetings shortened or eliminated<small>{number.format(results.categories.meetings.hours)} hours · {currency.format(results.categories.meetings.value)}</small></span></summary>
              <div className="grid four">
                <Field label="Status meetings / month" name="meetingsPerMonth" value={inputs.meetingsPerMonth} setInput={setInput} />
                <Field label="Attendees / meeting" name="meetingAttendees" value={inputs.meetingAttendees} setInput={setInput} />
                <Field label="Current duration" name="meetingDuration" value={inputs.meetingDuration} setInput={setInput} suffix="min" />
                <Field label="Minutes eliminated" name="meetingMinutesSaved" value={inputs.meetingMinutesSaved} setInput={setInput} suffix="min" />
                <Field label="Managers" name="meetingManagerPct" value={inputs.meetingManagerPct} setInput={setInput} suffix="%" max={100} />
                <Field label="Engineers" name="meetingEngineerPct" value={inputs.meetingEngineerPct} setInput={setInput} suffix="%" max={100} />
              </div>
              {!roleTotalValid && <div className="warning error">Manager and engineer percentages must total 100%. The current total is {inputs.meetingManagerPct + inputs.meetingEngineerPct}%.</div>}
            </details>
            <details>
              <summary><b>B</b><span>Status report preparation<small>{number.format(results.categories.reporting.hours)} hours · {currency.format(results.categories.reporting.value)}</small></span></summary>
              <div className="grid four">
                <Field label="Reports / month" name="reportsPerMonth" value={inputs.reportsPerMonth} setInput={setInput} />
                <Field label="Preparation time / report" name="reportPrepHours" value={inputs.reportPrepHours} setInput={setInput} suffix="hours" step={0.25} />
                <Field label="People involved" name="reportPeople" value={inputs.reportPeople} setInput={setInput} />
                <label className="field"><span className="field-label">Role performing work</span><select value={inputs.reportRole} onChange={e => setInput('reportRole', e.target.value as Inputs['reportRole'])}><option value="engineer">Engineer</option><option value="manager">Engineering manager</option><option value="custom">Custom blended rate</option></select></label>
                {inputs.reportRole === 'custom' && <Field label="Custom blended rate" name="reportCustomRate" value={inputs.reportCustomRate} setInput={setInput} prefix="$" suffix="/ hr" />}
              </div>
            </details>
            <details>
              <summary><b>C</b><span>Human PR review time reduced<small>{number.format(results.categories.prReview.hours)} hours · {currency.format(results.categories.prReview.value)}</small></span></summary>
              <div className="grid four">
                <Field label="PRs reviewed / month" name="prsPerMonth" value={inputs.prsPerMonth} setInput={setInput} />
                <Field label="Current review time / PR" name="reviewMinutes" value={inputs.reviewMinutes} setInput={setInput} suffix="min" />
                <Field label="Minutes saved / PR" name="reviewMinutesSaved" value={inputs.reviewMinutesSaved} setInput={setInput} suffix="min" />
                <Field label="Human reviewers / PR" name="reviewers" value={inputs.reviewers} setInput={setInput} step={0.1} />
                <Field label="Custom reviewer rate (optional)" name="reviewerCustomRate" value={inputs.reviewerCustomRate} setInput={setInput} prefix="$" suffix="/ hr" help="Leave at zero to use the engineer hourly rate." />
              </div>
            </details>
            <details>
              <summary><b>D</b><span>Reviews avoided through auto-approval<small>{number.format(results.categories.autoApproval.hours)} hours · {currency.format(results.categories.autoApproval.value)}</small></span></summary>
              <div className="warning">Avoid entering the same PRs here and in general PR review savings.</div>
              {overlapRisk && <div className="warning error" data-testid="double-count-warning">Both PR categories contain values. Confirm that these are distinct PR populations.</div>}
              <div className="grid three">
                <Field label="Auto-approved PRs / month" name="autoPrsPerMonth" value={inputs.autoPrsPerMonth} setInput={setInput} />
                <Field label="Review time otherwise required" name="autoReviewMinutes" value={inputs.autoReviewMinutes} setInput={setInput} suffix="min" />
                <Field label="Reviewers otherwise required" name="autoReviewers" value={inputs.autoReviewers} setInput={setInput} step={0.1} />
              </div>
            </details>
            <details>
              <summary><b>E</b><span>Codebase research time reduced<small>{number.format(results.categories.research.hours)} hours · {currency.format(results.categories.research.value)}</small></span></summary>
              <div className="grid three">
                <Field label="Questions / investigations monthly" name="researchPerMonth" value={inputs.researchPerMonth} setInput={setInput} />
                <Field label="Manual research time" name="researchMinutes" value={inputs.researchMinutes} setInput={setInput} suffix="min" />
                <Field label="Estimated time saved" name="researchMinutesSaved" value={inputs.researchMinutesSaved} setInput={setInput} suffix="min" />
              </div>
            </details>
            <details>
              <summary><b>F</b><span>Engineer interruptions avoided<small>{number.format(results.categories.interruptions.hours)} hours · {currency.format(results.categories.interruptions.value)}</small></span></summary>
              <p className="helper">Use only when Macroscope replaces asking another engineer—not when research savings already capture the same work.</p>
              <div className="grid four">
                <Field label="Interruptions avoided / month" name="interruptionsPerMonth" value={inputs.interruptionsPerMonth} setInput={setInput} />
                <Field label="Interruption duration" name="interruptionMinutes" value={inputs.interruptionMinutes} setInput={setInput} suffix="min" />
                <Field label="Context-switch recovery" name="recoveryMinutes" value={inputs.recoveryMinutes} setInput={setInput} suffix="min" />
                <Field label="Engineers interrupted" name="engineersInterrupted" value={inputs.engineersInterrupted} setInput={setInput} />
              </div>
            </details>
            <details>
              <summary><b>G</b><span>Existing manual checks automated<small>{number.format(results.categories.manualChecks.hours)} hours · {currency.format(results.categories.manualChecks.value)}</small></span></summary>
              <p className="helper">Only existing manual checks represent labor savings. Newly added checks are additional coverage.</p>
              <div className="grid three">
                <Field label="Existing checks / month" name="checksPerMonth" value={inputs.checksPerMonth} setInput={setInput} />
                <Field label="Manual minutes / check" name="checkMinutes" value={inputs.checkMinutes} setInput={setInput} suffix="min" />
                <Field label="Manual work eliminated" name="checkPctEliminated" value={inputs.checkPctEliminated} setInput={setInput} suffix="%" max={100} />
              </div>
            </details>
          </div>
        </Section>

        <Section number="04" title="Macroscope cost" eyebrow="INVESTMENT">
          <p className="intro">Use expected usage, pilot data, a quote, or current Macroscope pricing information. Pricing is not hard-coded.</p>
          <div className="segmented">
            <button className={inputs.costMode === 'simple' ? 'active' : ''} onClick={() => setInput('costMode', 'simple')}>Simple</button>
            <button className={inputs.costMode === 'detailed' ? 'active' : ''} onClick={() => setInput('costMode', 'detailed')}>Detailed</button>
          </div>
          {inputs.costMode === 'simple' ? (
            <div className="grid two"><Field label="Estimated monthly Macroscope cost" name="monthlyCost" value={inputs.monthlyCost} setInput={setInput} prefix="$" suffix="/ month" /></div>
          ) : (
            <div className="grid three">
              <Field label="Code review cost" name="reviewCost" value={inputs.reviewCost} setInput={setInput} prefix="$" suffix="/ month" />
              <Field label="Status cost" name="statusCost" value={inputs.statusCost} setInput={setInput} prefix="$" suffix="/ month" />
              <Field label="Agent cost" name="agentCost" value={inputs.agentCost} setInput={setInput} prefix="$" suffix="/ month" />
              <Field label="Check Run Agent / Macro" name="macroCost" value={inputs.macroCost} setInput={setInput} prefix="$" suffix="/ month" />
              <Field label="Other Macroscope cost" name="otherCost" value={inputs.otherCost} setInput={setInput} prefix="$" suffix="/ month" />
            </div>
          )}
          <div className="subtotal"><span>Annual Macroscope cost</span><strong>{currency.format(results.annualCost)}</strong></div>
        </Section>

        <Section number="05" title="Primary ROI results" eyebrow="MEASURABLE VALUE" className="results-section">
          <div className="result-hero">
            <Metric label="TOTAL MEASURABLE ANNUAL VALUE" value={currency.format(results.totalValue)} tone="capacity" prominent note="Direct cash savings + measurable capacity value" />
            <Metric label="NET MEASURABLE ANNUAL VALUE" value={currency.format(results.netValue)} prominent note="After annual Macroscope cost" />
          </div>
          <div className="result-grid">
            <Metric label="Direct cash savings" value={currency.format(results.directSavings)} tone="cash" />
            <Metric label="Capacity value" value={currency.format(results.capacityValue)} tone="capacity" />
            <Metric label="Annual Macroscope cost" value={currency.format(results.annualCost)} />
            <Metric label={<>ROI <Tooltip text="Net measurable annual value divided by annual Macroscope cost." /></>} value={pct(results.roi)} />
            <Metric label={<>Payback period <Tooltip text="Annual cost divided by measurable annual value, expressed in months." /></>} value={results.payback === null ? 'Not available' : `${number.format(results.payback)} months`} />
            <Metric label={<>FTE-equivalent capacity <Tooltip text="Hours returned divided by annual productive hours for one employee. It is not automatically payroll savings." /></>} value={number.format(results.fte)} />
            <Metric label="Annual hours returned" value={number.format(results.annualHours)} />
            <Metric label="Monthly hours returned" value={number.format(results.annualHours / 12)} />
          </div>
          <div className="plain-language">Based on the inputs provided, Macroscope could return approximately <b>{number.format(results.annualHours)} employee hours per year</b> and generate <b>{currency.format(results.totalValue)} in measurable annual value</b> before potential strategic impact.</div>
          <div className="breakdown">
            <h3>Capacity value breakdown</h3>
            {Object.entries(results.categories).map(([key, item]) => {
              const width = results.capacityValue > 0 ? item.value / results.capacityValue * 100 : 0
              return <div className="bar-row" key={key}><span>{categoryLabels[key]}</span><div><i style={{ width: `${width}%` }} /></div><b>{currency.format(item.value)}</b><small>{number.format(item.hours)} hrs</small></div>
            })}
          </div>
        </Section>

        <Section number="06" title="Estimate additional potential impact" eyebrow="OPTIONAL · ASSUMPTION-BASED" defaultOpen={false} className="potential-section">
          <div className="classification potential"><span>POTENTIAL IMPACT</span><p>These calculations rely on assumptions and are not included in the primary ROI result unless explicitly enabled.</p></div>
          <div className="potential-block">
            <h3>A. Defects caught earlier</h3>
            <Field label="Actionable defects identified / month" name="defectsPerMonth" value={inputs.defectsPerMonth} setInput={setInput} />
            <div className="scenario-grid">
              {(['conservative', 'expected', 'high'] as Scenario[]).map(s => <div key={s}><b>{s === 'high' ? 'High impact' : s}</b>
                <label className="field"><span className="field-label">Would otherwise escape</span><span className="input-wrap"><input type="number" min="0" max="100" value={inputs.defectEscapePct[s]} onChange={e => setScenario('defectEscapePct', s, e.target.valueAsNumber || 0)} /><span className="affix">%</span></span></label>
                <label className="field"><span className="field-label">Downstream remediation cost</span><span className="input-wrap"><span className="affix prefix">$</span><input type="number" min="0" value={inputs.defectCost[s]} onChange={e => setScenario('defectCost', s, e.target.valueAsNumber || 0)} /></span></label>
              </div>)}
            </div>
          </div>
          <div className="potential-block">
            <h3>B. Production incidents avoided</h3>
            <div className="warning">Keep incidents separate from defect value. Do not count the same issue twice.</div>
            <div className="grid three">
              <Field label="Potential incidents avoided / year" name="incidentsPerYear" value={inputs.incidentsPerYear} setInput={setInput} step={0.1} />
              <Field label="Probability of reaching production" name="incidentProbability" value={inputs.incidentProbability} setInput={setInput} suffix="%" max={100} />
              <Field label="Average incident cost" name="incidentCost" value={inputs.incidentCost} setInput={setInput} prefix="$" />
            </div>
          </div>
          <div className="potential-block"><h3>C. Faster onboarding</h3><div className="grid three">
            <Field label="New engineers / year" name="hiresPerYear" value={inputs.hiresPerYear} setInput={setInput} />
            <Field label="Onboarding hours reduced / engineer" name="onboardingHoursSaved" value={inputs.onboardingHoursSaved} setInput={setInput} suffix="hours" />
            <Field label="Engineer hourly cost (optional)" name="onboardingHourlyCost" value={inputs.onboardingHourlyCost} setInput={setInput} prefix="$" suffix="/ hr" help="Zero uses the profile's engineer rate." />
          </div></div>
          <div className="potential-block"><h3>D. Faster delivery</h3><div className="grid four">
            <Field label="Releases affected / year" name="releasesPerYear" value={inputs.releasesPerYear} setInput={setInput} />
            <Field label="Average weeks accelerated" name="weeksAccelerated" value={inputs.weeksAccelerated} setInput={setInput} step={0.1} />
            <Field label="Weekly gross profit / value" name="weeklyValue" value={inputs.weeklyValue} setInput={setInput} prefix="$" />
            <Field label="Attributed to Macroscope" name="macroscopeAttribution" value={inputs.macroscopeAttribution} setInput={setInput} suffix="%" max={100} help="A conservative 10% default." />
          </div></div>
          <div className="potential-block"><h3>E. Hiring or contractor capacity deferred</h3><div className="grid two">
            <Field label="Annual hours replacing planned hiring" name="hiringHours" value={inputs.hiringHours} setInput={setInput} suffix="hours" />
            <Field label="Loaded annual cost of avoided hire" name="avoidedHireCost" value={inputs.avoidedHireCost} setInput={setInput} prefix="$" />
          </div>
            <p className="helper">Equivalent capacity: <b>{number.format(results.hiringFte)} FTE</b></p>
            <label className="check"><input type="checkbox" checked={inputs.hiringConfirmed} onChange={e => setInput('hiringConfirmed', e.target.checked)} /> We reasonably expect this returned capacity to reduce or delay planned hiring or contractor spending.</label>
            {!inputs.hiringConfirmed && <p className="warning">Dollar value is withheld until this assumption is confirmed.</p>}
          </div>
          <div className="potential-results">
            <Metric label="Conservative potential value" value={currency.format(results.potential.conservative)} tone="potential" />
            <Metric label="Expected potential value" value={currency.format(results.potential.expected)} tone="potential" />
            <Metric label="High-impact potential value" value={currency.format(results.potential.high)} tone="potential" />
          </div>
          <label className="include-toggle"><input type="checkbox" checked={inputs.includePotential} onChange={e => setInput('includePotential', e.target.checked)} /><span><b>Include expected potential impact in expanded ROI</b><small>This adds a separate modeled result. The primary ROI above remains unchanged.</small></span></label>
          {inputs.includePotential && <div className="expanded-result"><span>Expanded modeled ROI</span><strong>{pct(results.expandedRoi)}</strong><small>{currency.format(results.expandedValue)} modeled annual value · {currency.format(results.expandedNet)} net</small></div>}
        </Section>

        <Section number="07" title="Calculation assumptions and methodology" eyebrow="TRANSPARENCY" defaultOpen={false}>
          <div className="methodology">
            <p><b>Direct cash savings</b> represent software, external labor, or other spending expected to be eliminated.</p>
            <p><b>Capacity value</b> represents the loaded value of employee time returned to higher-value work. It is not necessarily payroll savings or headcount reduction.</p>
            <p><b>Potential impact</b> depends on assumptions about downstream outcomes. It is kept separate and should be validated through a pilot.</p>
            <p><b>Customer-specific data</b> should be used wherever possible. Example presets are illustrative, not benchmarks.</p>
            <p><b>Double counting</b> is avoided through separate categories and warnings, but users should confirm that the same work or outcome is not entered more than once.</p>
            <p><b>No guarantee.</b> Results are estimates based entirely on the inputs provided and should not be interpreted as guaranteed savings or outcomes.</p>
          </div>
        </Section>

        <div className="actions">
          <button className="secondary" onClick={reset}>↺ Reset calculator</button>
          <div><button className="secondary" onClick={() => window.print()}>Print results</button><button className="primary" onClick={exportSummary}>Export summary ↓</button></div>
        </div>
      </main>
      <footer><span className="brand"><span className="brand-mark">M</span><span>MACROSCOPE</span></span><p>Conservative ROI modeling for engineering organizations.</p><small>Estimates only. Not a guarantee of results.</small></footer>
    </>
  )
}

export default App
