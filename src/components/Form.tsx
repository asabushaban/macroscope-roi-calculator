import { useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import type { Inputs } from '../types'

export type SetInput = <K extends keyof Inputs>(key: K, value: Inputs[K]) => void

interface FieldProps {
  label: string
  name: keyof Inputs
  value: number
  setInput: SetInput
  prefix?: string
  suffix?: string
  help?: string
  step?: number
  max?: number
}

export function Field({ label, name, value, setInput, prefix, suffix, help, step = 1, max }: FieldProps) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <span className="input-wrap">
        {prefix && <span className="affix prefix">{prefix}</span>}
        <input
          aria-label={label}
          type="number"
          min="0"
          max={max}
          step={step}
          value={value}
          onChange={(event) => setInput(name, Math.max(0, event.target.valueAsNumber || 0) as Inputs[typeof name])}
        />
        {suffix && <span className="affix">{suffix}</span>}
      </span>
      {help && <small>{help}</small>}
    </label>
  )
}

export function ToggleField({ enabled, enabledName, setInput, ...fieldProps }: FieldProps & {
  enabled: boolean
  enabledName: keyof Inputs
}) {
  return (
    <div className={`field-toggle${enabled ? '' : ' field-disabled'}`}>
      <label className="include-check" title={enabled ? 'Included in calculation' : 'Excluded from calculation'}>
        <input
          type="checkbox"
          checked={enabled}
          aria-label={`Include ${fieldProps.label} in calculation`}
          onChange={(event) => setInput(enabledName, event.target.checked as Inputs[typeof enabledName])}
        />
      </label>
      <Field {...fieldProps} setInput={setInput} />
    </div>
  )
}

export function CategoryToggle({ checked, onChange, label }: {
  checked: boolean
  onChange: (value: boolean) => void
  label: string
}) {
  return (
    <input
      type="checkbox"
      className="category-toggle"
      checked={checked}
      aria-label={`Include ${label} in calculation`}
      title={checked ? 'Included in calculation' : 'Excluded from calculation'}
      onClick={(event) => event.stopPropagation()}
      onChange={(event) => onChange(event.target.checked)}
    />
  )
}

export function Section({
  number, title, eyebrow, children, defaultOpen = true, className = '',
}: {
  number: string
  title: string
  eyebrow?: string
  children: ReactNode
  defaultOpen?: boolean
  className?: string
}) {
  return (
    <details className={`section-card ${className}`} open={defaultOpen}>
      <summary>
        <span className="section-number">{number}</span>
        <span><small>{eyebrow}</small>{title}</span>
        <span className="chevron" aria-hidden="true">⌄</span>
      </summary>
      <div className="section-body">{children}</div>
    </details>
  )
}

export function Tooltip({ text }: { text: string }) {
  const [coords, setCoords] = useState<{ top: number, left: number } | null>(null)
  const ref = useRef<HTMLSpanElement>(null)

  const show = () => {
    const rect = ref.current?.getBoundingClientRect()
    if (rect) setCoords({ top: rect.top, left: rect.left + rect.width / 2 })
  }
  const hide = () => setCoords(null)

  return (
    <>
      <span
        ref={ref}
        className="tooltip"
        tabIndex={0}
        aria-label={text}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >?</span>
      {coords && createPortal(
        <div className="tooltip-popup" role="tooltip" style={{ top: coords.top, left: coords.left }}>{text}</div>,
        document.body,
      )}
    </>
  )
}

export function AutoReadout({ label, value }: { label: string, value: string }) {
  return (
    <div className="auto-readout">
      <span>{label}</span>
      <b>{value}</b>
    </div>
  )
}

export function Metric({ label, value, note, tone = 'neutral', prominent = false }: {
  label: ReactNode
  value: string
  note?: string
  tone?: 'cash' | 'capacity' | 'potential' | 'neutral'
  prominent?: boolean
}) {
  return (
    <div className={`metric metric-${tone} ${prominent ? 'metric-prominent' : ''}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {note && <small>{note}</small>}
    </div>
  )
}
