/* One same-origin playback clock, reused by dashboard and emergency frames. */
;(function () {
  if (typeof window === 'undefined' || window.HEALiumTelemetry) return
  try {
    if (window.parent !== window && window.parent.HEALiumTelemetry) {
      window.HEALiumTelemetry = window.parent.HEALiumTelemetry
      return
    }
  } catch { /* A standalone document owns its own clock. */ }
  const key = 'healium.telemetry.v1', listeners = new Set()
  let data = null, error = '', loading = true, lastSecond = -1
  const initial = () => ({ offset: 0, anchor: Date.now(), playing: true })
  function read() {
    try {
      const value = JSON.parse(localStorage.getItem(key))
      if (value && Number.isFinite(value.offset) && value.offset >= 0 && value.offset <= 300 && Number.isFinite(value.anchor) && typeof value.playing === 'boolean') return value
    } catch { /* In-memory playback also works with storage blocked. */ }
    return null
  }
  let state = read() || initial()
  function elapsed() { return Math.min(300, Math.max(0, state.offset + (state.playing ? (Date.now() - state.anchor) / 1000 : 0))) }
  function snapshot() {
    const seconds = Math.floor(elapsed())
    const index = Math.min(59, Math.floor(seconds / 5))
    return { loading, error, seconds, playing: state.playing && seconds < 300, complete: seconds >= 300,
      sample: data?.samples[index] ?? null, history: data?.samples.slice(0, index + 1) ?? [] }
  }
  function emit() { const value = snapshot(); lastSecond = value.seconds; listeners.forEach(listener => listener(value)) }
  function save() { try { localStorage.setItem(key, JSON.stringify(state)) } catch {} emit() }
  function play() { const seconds = elapsed(); state = { offset: seconds >= 300 ? 0 : seconds, anchor: Date.now(), playing: true }; save() }
  function pause() { state = { offset: elapsed(), anchor: Date.now(), playing: false }; save() }
  function restart() { state = initial(); save() }
  async function load() {
    loading = true; error = ''; emit()
    try {
      const response = await fetch('/data/demo-telemetry.json', { cache: 'no-store' })
      if (!response.ok) throw new Error('Unavailable')
      const next = await response.json()
      const fields = ['heartRate','spo2','systolic','diastolic','temperature','co2','respiratoryRate']
      if (next.simulated !== true || next.samples?.length !== 60 || !next.samples.every((sample, i) => sample.elapsedSeconds === i * 5 && fields.every(field => Number.isFinite(sample[field])))) throw new Error('Invalid samples')
      data = next
    } catch { error = 'Demo data could not be loaded. Retry to reconnect the simulated feed.' }
    loading = false; emit()
  }
  window.HEALiumTelemetry = { snapshot, play, pause, restart, retry: load,
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener) } }
  window.addEventListener('storage', event => { if (event.key === key || event.key === null) { state = read() || initial(); emit() } })
  // Store the initial clock once so reloads and other tabs continue this session.
  if (!read()) save()
  setInterval(() => { if (Math.floor(elapsed()) !== lastSecond) emit() }, 250)
  load()
})()
