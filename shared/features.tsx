import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import './preferences.js'

export type Preferences = { darkMode: boolean; height: number; weight: number; gender: 'female' | 'male' }
declare global {
  interface Window {
    HEALiumPreferences: {
      key: string; defaults: Preferences; read: () => Preferences;
      write: (value: Preferences) => { ok: boolean; message?: string; value?: Preferences };
      subscribe: (listener: (value: Preferences) => void) => () => void;
    }
  }
}
const defaults: Preferences = { darkMode: false, height: 172, weight: 68, gender: 'female' }
export function usePreferences() {
  const [settings, setSettings] = useState<Preferences>(defaults)
  useEffect(() => {
    setSettings(window.HEALiumPreferences.read())
    return window.HEALiumPreferences.subscribe(setSettings)
  }, [])
  return settings
}

// Closing a popup can expose another icon under a stationary pointer.
let tooltipHoverSuppressed = false

export function InfoTip({ label, text, children }: { label: string; text?: string; children?: ReactNode }) {
  const id = useId()
  const button = useRef<HTMLButtonElement>(null)
  const popup = useRef<HTMLDivElement>(null)
  const suppressFocus = useRef(false)
  const dismissed = useRef(false)
  const [open, setOpen] = useState(false)
  const [pinned, setPinned] = useState(false)
  const [position, setPosition] = useState({ top: 12, left: 12 })
  const reveal = () => {
    window.dispatchEvent(new CustomEvent('healium:tooltip-open', { detail: id }))
    setOpen(true)
  }
  useEffect(() => {
    const closeOther = (event: Event) => {
      if ((event as CustomEvent).detail !== id) { setOpen(false); setPinned(false) }
    }
    window.addEventListener('healium:tooltip-open', closeOther)
    return () => window.removeEventListener('healium:tooltip-open', closeOther)
  }, [id])
  useLayoutEffect(() => {
    if (!open) return
    const place = () => {
      const anchor = button.current?.getBoundingClientRect(), box = popup.current?.getBoundingClientRect()
      if (!anchor || !box) return
      const left = Math.max(12, Math.min(anchor.left, innerWidth - box.width - 12))
      const below = anchor.bottom + 8
      const top = below + box.height <= innerHeight - 12 ? below : Math.max(12, anchor.top - box.height - 8)
      setPosition({ left, top })
    }
    place()
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => { window.removeEventListener('resize', place); window.removeEventListener('scroll', place, true) }
  }, [open])
  useEffect(() => {
    if (!open) return
    const close = (event: Event) => {
      if (!button.current?.contains(event.target as Node) && !popup.current?.contains(event.target as Node)) { setOpen(false); setPinned(false) }
    }
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { tooltipHoverSuppressed = true; dismissed.current = true; setOpen(false); setPinned(false); if (popup.current?.contains(document.activeElement)) { suppressFocus.current = true; button.current?.focus() } } }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', escape)
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', escape) }
  }, [open])
  return <>
    <button ref={button} type="button" className="info-trigger" aria-label={`About ${label}`} aria-expanded={open} aria-describedby={open ? id : undefined}
      onMouseEnter={() => { if (!tooltipHoverSuppressed && !dismissed.current) reveal() }} onMouseMove={(event) => { if (event.movementX || event.movementY) { tooltipHoverSuppressed = false; if (!open && !dismissed.current) reveal() } }} onMouseLeave={() => { if (document.activeElement !== button.current && !popup.current?.contains(document.activeElement)) { dismissed.current = false; if (!pinned) setOpen(false) } }}
      onFocus={() => { if (suppressFocus.current) suppressFocus.current = false; else if (!dismissed.current) reveal() }} onBlur={(event) => { if (!popup.current?.contains(event.relatedTarget)) { dismissed.current = false; if (!pinned) setOpen(false) } }}
      onKeyDown={(event) => { if (open) event.stopPropagation(); if (event.key === 'Escape') { tooltipHoverSuppressed = true; dismissed.current = true; setOpen(false); setPinned(false) } else if (event.key === 'ArrowDown' && open) { event.preventDefault(); popup.current?.focus() } }}
      onClick={(event) => { event.stopPropagation(); dismissed.current = pinned; setPinned(!pinned); if (pinned) setOpen(false); else reveal() }}>i</button>
    {open && createPortal(<div ref={popup} id={id} role="tooltip" tabIndex={0} className="info-popup" style={position} onMouseLeave={() => { if (!pinned && document.activeElement !== button.current && !popup.current?.contains(document.activeElement)) setOpen(false) }} onBlur={(event) => { if (!pinned && !button.current?.contains(event.relatedTarget) && !popup.current?.contains(event.relatedTarget)) setOpen(false) }}>
      <strong>{label}</strong>{text && <p>{text}</p>}{children}
    </div>, document.body)}
  </>
}

export function Alerts({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const anchor = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const close = () => { setOpen(false); anchor.current?.focus() }
  useEffect(() => {
    if (!open) return
    closeButton.current?.focus()
    const outside = (event: PointerEvent) => { if (!anchor.current?.contains(event.target as Node) && !panel.current?.contains(event.target as Node)) setOpen(false) }
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') close() }
    document.addEventListener('pointerdown', outside); document.addEventListener('keydown', escape)
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape) }
  }, [open])
  return <>
    <button ref={anchor} className="notification-button" aria-label="Notifications" aria-haspopup="dialog" aria-expanded={open} aria-controls="mission-alerts" onClick={() => setOpen(!open)}>{children}<span>2</span></button>
    {open && createPortal(<div ref={panel} id="mission-alerts" role="dialog" aria-label="Alerts" className="alerts-panel">
      <div className="feature-heading"><h2>Alerts</h2><button ref={closeButton} className="secondary-button" onClick={close} aria-label="Close alerts">Close</button></div>
      <p className="sample-note">Sample mission alerts · prototype</p>
      <ul><li className="radiation-alert">Solar storm soon: high radiation alert.</li><li>Next blood tests on Wednesday.</li></ul>
    </div>, document.body)}
  </>
}

export function BodyModel({ gender, side = false, region = '' }: { gender: Preferences['gender']; side?: boolean; region?: string }) {
  return <iframe className="shared-body-model" title={`${gender === 'female' ? 'Female' : 'Male'} 3D body model`} src={`/emergency/index.html?view=body&side=${side ? 'side' : 'front'}&region=${encodeURIComponent(region)}`} />
}

export function PreferencesPanel() {
  const settings = usePreferences()
  const [height, setHeight] = useState(String(settings.height)), [weight, setWeight] = useState(String(settings.weight))
  const [message, setMessage] = useState(''), [error, setError] = useState(false)
  useEffect(() => { setHeight(String(settings.height)); setWeight(String(settings.weight)) }, [settings.height, settings.weight])
  const save = (next: Preferences) => {
    const result = window.HEALiumPreferences.write(next)
    setError(!result.ok)
    setMessage(result.ok ? 'Settings saved on this device.' : result.message ?? 'Settings could not be saved.')
  }
  return <section className="preferences-panel" aria-labelledby="preferences-title">
    <div className="feature-heading"><div><h3 id="preferences-title">Display & body profile</h3><p>Saved in this browser and shared with emergency mode.</p></div><InfoTip label="Body profile" text="Height is measured in centimeters and weight in kilograms. Gender selects a schematic 3D model; it does not infer medical characteristics. These preferences stay on this device." /></div>
    <div className="preferences-layout"><form onSubmit={(event) => { event.preventDefault(); save({ ...settings, height: Number(height), weight: Number(weight) }) }}>
      <label className="toggle-setting"><input type="checkbox" role="switch" checked={settings.darkMode} onChange={(event) => save({ ...settings, darkMode: event.target.checked })} />Dark mode</label>
      <label>Height (cm)<input type="number" min="50" max="250" step="0.1" required value={height} onChange={(event) => setHeight(event.target.value)} /></label>
      <label>Weight (kg)<input type="number" min="20" max="350" step="0.1" required value={weight} onChange={(event) => setWeight(event.target.value)} /></label>
      <label>Gender<select aria-label="Gender" value={settings.gender} onChange={(event) => save({ ...settings, gender: event.target.value as Preferences['gender'] })}><option value="female">Female</option><option value="male">Male</option></select></label>
      <p className="sample-note">Dark mode and model selection save immediately. Save profile to apply height and weight.</p>
      <button className="primary-button" type="submit">Save profile</button>
      {message && <p role={error ? 'alert' : 'status'} className={error ? 'settings-error' : 'settings-saved'}>{message}</p>}
    </form><div><BodyModel gender={settings.gender} /><p className="model-caption">{settings.gender === 'female' ? 'Female' : 'Male'} model · {settings.height} cm · {settings.weight} kg</p></div></div>
  </section>
}

export function BreathingFullscreen({ children, onBack, onEmergency }: { children: ReactNode; onBack: () => void; onEmergency: () => void }) {
  useEffect(() => {
    const before = document.body.style.overflow, focused = document.activeElement as HTMLElement | null
    // Keep the native emergency dialog outside inert background regions.
    const background = [...document.querySelectorAll<HTMLElement>('.app-shell > .sidebar,.app-shell > .main-content')]
    document.body.style.overflow = 'hidden'
    background.forEach(node => { node.inert = true })
    document.querySelector<HTMLButtonElement>('.breathing-safety-bar button')?.focus()
    const trap = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || document.querySelector('dialog[open]')) return
      const nodes = [...document.querySelectorAll<HTMLElement>('.breathing-fullscreen button:not([disabled]),.breathing-fullscreen input:not([disabled]),.breathing-fullscreen select:not([disabled])')].filter(node => node.getClientRects().length)
      const first = nodes[0], last = nodes[nodes.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }
    document.addEventListener('keydown', trap)
    return () => { document.body.style.overflow = before; background.forEach(node => { node.inert = false }); document.removeEventListener('keydown', trap); if (focused?.isConnected) focused.focus() }
  }, [])
  return createPortal(<section className="breathing-fullscreen" role="dialog" aria-modal="true" aria-label="Full-screen breathing exercise">
    <header className="breathing-safety-bar"><strong>HEALium · Breathing exercise</strong><div><button className="secondary-button" onClick={onBack}>Go back</button><button className="help-button" onClick={onEmergency} aria-label="Emergency — open emergency mode">Emergency</button></div></header>
    <div className="breathing-scroll">{children}</div>
  </section>, document.body)
}

export function CO2Trend({ range }: { range: '24 Hours' | '7 Days' | '30 Days' }) {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(640), [selected, setSelected] = useState<number | null>(null)
  useEffect(() => { const observer = new ResizeObserver(([entry]) => setWidth(Math.max(240, Math.round(entry.contentRect.width)))); if (ref.current) observer.observe(ref.current); return () => observer.disconnect() }, [])
  useEffect(() => setSelected(null), [range])
  const count = range === '24 Hours' ? 13 : range === '7 Days' ? 7 : 30
  const values = Array.from({ length: count }, (_, i) => i === count - 1 ? 2.1 : [1.7,1.8,2.0,1.9,2.2,2.1,2.3,2.0,1.9,2.2,2.0,2.1][i % 12])
  const step = range === '24 Hours' ? 2 * 3600000 : 86400000
  const times = values.map((_, i) => new Date(Date.now() - (count - 1 - i) * step))
  const format = (date: Date) => date.toLocaleString('en-GB', range === '24 Hours' ? { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' } : { day: '2-digit', month: 'short', timeZone: 'UTC' })
  const x = (i: number) => 52 + i / (count - 1) * (width - 74)
  const y = (value: number) => 188 - (value - 1.4) / 1.2 * 150
  const index = Math.min(selected ?? count - 1, count - 1)
  return <section className="co2-chart-card" aria-labelledby="co2-title">
    <div className="feature-heading"><div><span className="eyebrow">SAMPLE DATA · NO CO₂ HISTORY CONNECTED</span><h3 id="co2-title">CO₂ trend</h3></div><InfoTip label="CO₂ trend" text="Cabin carbon dioxide partial pressure, shown in mmHg. This chart uses clearly labeled sample history because no sensor history service is connected. It is not an exposure assessment or a medical threshold." /></div>
    <p>Cabin carbon dioxide partial pressure · {range.toLowerCase()} · mmHg</p>
    <div ref={ref} className="co2-chart"><svg viewBox={`0 0 ${width} 250`} role="img" aria-label="Sample carbon dioxide trend, mmHg, with UTC time axis">
      {[1.4,1.8,2.2,2.6].map((value) => <g key={value}><line x1="52" x2={width-22} y1={y(value)} y2={y(value)} className="co2-grid" /><text x="44" y={y(value)+4} textAnchor="end">{value.toFixed(1)}</text></g>)}
      <text x="8" y="18">mmHg</text><polyline className="co2-line" points={values.map((value,i) => `${x(i)},${y(value)}`).join(' ')} />
      {values.map((value,i) => <circle key={i} cx={x(i)} cy={y(value)} r={selected===i ? 6 : 4} className="co2-point" tabIndex={0} role="button" aria-label={`${format(times[i])} UTC: ${value.toFixed(1)} mmHg, sample`} onFocus={() => setSelected(i)} onMouseEnter={() => setSelected(i)} onClick={() => setSelected(i)}><title>{format(times[i])} UTC: {value.toFixed(1)} mmHg · sample</title></circle>)}
      {[0,Math.floor((count-1)/2),count-1].map((i) => <text key={i} x={x(i)} y="215" textAnchor={i===0 ? 'start' : i===count-1 ? 'end' : 'middle'}>{format(times[i])}</text>)}
      <text x={width/2} y="242" textAnchor="middle">{range === '24 Hours' ? 'Time' : 'Date'} (UTC)</text>
    </svg></div>
    <p className="co2-readout" role="status">Sample: {format(times[index])} UTC · <strong>{values[index].toFixed(1)} mmHg</strong></p>
    <details><summary>View sample values</summary><div className="sample-values"><table><thead><tr><th>Time (UTC)</th><th>CO₂ (mmHg)</th></tr></thead><tbody>{values.map((value,i) => <tr key={i}><td>{format(times[i])}</td><td>{value.toFixed(1)}</td></tr>)}</tbody></table></div></details>
  </section>
}
