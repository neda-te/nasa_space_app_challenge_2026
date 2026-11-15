import { useEffect, useRef, useState } from 'react'
import './telemetry.js'

type Sample = { elapsedSeconds: number; heartRate: number; spo2: number; systolic: number; diastolic: number; temperature: number; co2: number; respiratoryRate: number; stage: string }
type Snapshot = { loading: boolean; error: string; seconds: number; playing: boolean; complete: boolean; sample: Sample | null; history: Sample[] }
declare global { interface Window { HEALiumTelemetry: { snapshot: () => Snapshot; subscribe: (listener: (value: Snapshot) => void) => () => void; play: () => void; pause: () => void; restart: () => void; retry: () => void } } }
export const demoTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
export function useTelemetry() {
  const [value, setValue] = useState<Snapshot>(() => typeof window === 'undefined' ? { loading: true, error: '', seconds: 0, playing: false, complete: false, sample: null, history: [] } : window.HEALiumTelemetry.snapshot())
  useEffect(() => { setValue(window.HEALiumTelemetry.snapshot()); return window.HEALiumTelemetry.subscribe(setValue) }, [])
  return value
}
export function DemoControls() {
  const feed = useTelemetry()
  return <section className="demo-controls" aria-label="Simulated telemetry playback">
    <div><strong>SIMULATED LIVE DATA</strong><span>{feed.loading ? 'Loading demo…' : feed.error ? 'Feed unavailable' : `${feed.complete ? 'Complete' : feed.playing ? 'Playing' : 'Paused'} · ${demoTime(feed.seconds)} / 5:00 · samples every 5 seconds`}</span></div>
    <div className="demo-actions">{feed.error ? <button onClick={() => window.HEALiumTelemetry.retry()}>Retry demo data</button> : <><button disabled={feed.loading} onClick={() => feed.playing ? window.HEALiumTelemetry.pause() : window.HEALiumTelemetry.play()}>{feed.complete ? 'Replay demo' : feed.playing ? 'Pause demo' : 'Resume demo'}</button><button disabled={feed.loading} onClick={() => window.HEALiumTelemetry.restart()}>Restart demo</button></>}</div>
    {feed.error && <p role="alert">{feed.error}</p>}
  </section>
}
export function DemoAlert() {
  const { sample, error } = useTelemetry()
  const stage = sample?.stage
  const message = error ? 'Simulated feed unavailable.' : stage === 'alert' ? 'Demo alert: heart rate and cabin CO₂ have risen. Open Emergency to explore the response flow.' : stage === 'recovery' ? 'Demo recovery: readings are returning toward the starting values.' : stage === 'rising' ? 'Demo scenario: heart rate and cabin CO₂ are gradually rising.' : 'Demo scenario: stable readings.'
  return <p className={`demo-scenario ${stage === 'alert' ? 'demo-warning' : ''}`} role="status">{message} <small>Scripted demonstration, not a clinical assessment.</small></p>
}
const metrics = [
  ['heartRate', 'Heart rate', 'bpm'], ['spo2', 'Oxygen saturation', '%'], ['systolic', 'Blood pressure', 'mmHg'],
  ['temperature', 'Skin temperature', '°C'], ['co2', 'Cabin CO₂', 'mmHg'], ['respiratoryRate', 'Respiratory rate', 'breaths/min'],
] as const
export function LiveTelemetry({ co2Only = false }: { co2Only?: boolean }) {
  const feed = useTelemetry()
  const [metric, setMetric] = useState<keyof Sample>('heartRate')
  const chart = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(680)
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(240, Math.floor(entry.contentRect.width))))
    if (chart.current) observer.observe(chart.current)
    return () => observer.disconnect()
  }, [feed.loading, feed.error])
  const selected = co2Only ? 'co2' : metric
  const definition = metrics.find(item => item[0] === selected)!
  const values = feed.history.map(sample => Number(sample[selected]))
  const low = Math.floor(Math.min(...values, Number(feed.sample?.[selected] ?? 0))) - 1
  const high = Math.ceil(Math.max(...values, low + 2)) + 1
  const x = (seconds: number) => 50 + seconds / 300 * (width - 70)
  const y = (value: number) => 170 - (value - low) / (high - low) * 140
  return <section className="live-telemetry" aria-label={co2Only ? 'Live demo CO₂ trend' : 'Live demo telemetry'}>
    <h3>{co2Only ? 'CO₂ · live five-minute demo' : 'Live crew telemetry'}</h3>
    <p className="sample-note">Simulated samples · {demoTime(feed.seconds)} elapsed · history grows during playback</p>
    {!co2Only && <><DemoAlert /><div className="live-readings">{metrics.map(([key, title, unit]) => <div key={key}><span>{title}</span><strong data-reading={key}>{feed.sample ? `${feed.sample[key]}${key === 'systolic' ? `/${feed.sample.diastolic}` : ''}` : '—'}</strong><small>{unit}</small></div>)}</div><label className="live-metric-select">Plot measurement <select value={selected} onChange={event => setMetric(event.target.value as keyof Sample)}>{metrics.map(([key, title]) => <option value={key} key={key}>{title}{key === 'systolic' ? ' (systolic)' : ''}</option>)}</select></label></>}
    {feed.error ? <p role="status">{feed.error}</p> : !feed.sample ? <p>Loading simulated measurements…</p> : <>
      <div ref={chart} className="live-chart"><svg viewBox={`0 0 ${width} 215`} role="img" aria-label={`${definition[1]} demo history in ${definition[2]}, elapsed time from zero to five minutes`}>
        {[low, (low + high) / 2, high].map(value => <g key={value}><line x1="50" x2={width-20} y1={y(value)} y2={y(value)} /><text x="42" y={y(value)+4} textAnchor="end">{value.toFixed(1)}</text></g>)}
        <polyline points={feed.history.map(sample => `${x(sample.elapsedSeconds)},${y(Number(sample[selected]))}`).join(' ')} />
        {feed.history.map(sample => <circle key={sample.elapsedSeconds} cx={x(sample.elapsedSeconds)} cy={y(Number(sample[selected]))} r="3"><title>{demoTime(sample.elapsedSeconds)} · {sample[selected]} {definition[2]}</title></circle>)}
        {(width < 480 ? [0,150,300] : [0,60,120,180,240,300]).map(second => <text key={second} x={x(second)} y="195" textAnchor="middle">{demoTime(second)}</text>)}
        <text x="50" y="16">{definition[2]}</text>
      </svg></div><p className="sample-note">Time since demo start (minutes:seconds){selected === 'systolic' ? ' · chart shows systolic pressure' : ''}</p>
      <details><summary>View captured demo samples ({feed.history.length}/60)</summary><div className="sample-values"><table><thead><tr><th>Elapsed</th><th>{definition[1]} ({definition[2]})</th></tr></thead><tbody>{feed.history.map(sample => <tr key={sample.elapsedSeconds}><td>{demoTime(sample.elapsedSeconds)}</td><td>{sample[selected]}</td></tr>)}</tbody></table></div></details>
    </>}
  </section>
}
