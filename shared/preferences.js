/* Shared, same-origin browser preferences. No health records or credentials. */
;(function () {
  if (typeof window === 'undefined' || window.HEALiumPreferences) return
  const key = 'healium.preferences.v1'
  const defaults = { darkMode: false, height: 172, weight: 68, gender: 'female' }
  function normalize(value) {
    const source = value && typeof value === 'object' ? value : {}
    return {
      darkMode: source.darkMode === true,
      height: Number.isFinite(source.height) && source.height >= 50 && source.height <= 250 ? source.height : defaults.height,
      weight: Number.isFinite(source.weight) && source.weight >= 20 && source.weight <= 350 ? source.weight : defaults.weight,
      gender: source.gender === 'male' ? 'male' : 'female',
    }
  }
  function read() {
    try { return normalize(JSON.parse(localStorage.getItem(key))) } catch { return { ...defaults } }
  }
  function apply(value) {
    document.documentElement.dataset.theme = value.darkMode ? 'dark' : 'light'
    document.documentElement.dataset.gender = value.gender
    document.documentElement.dataset.height = String(value.height)
    document.documentElement.dataset.weight = String(value.weight)
  }
  function publish(value) {
    apply(value)
    window.dispatchEvent(new CustomEvent('healium:preferences', { detail: value }))
  }
  function write(value) {
    if (!Number.isFinite(value.height) || value.height < 50 || value.height > 250 || !Number.isFinite(value.weight) || value.weight < 20 || value.weight > 350 || !['female', 'male'].includes(value.gender)) {
      return { ok: false, message: 'Enter height from 50–250 cm and weight from 20–350 kg, and select a model gender.' }
    }
    const next = normalize(value)
    try { localStorage.setItem(key, JSON.stringify(next)) } catch {
      return { ok: false, message: 'Settings could not be saved. Browser storage may be unavailable.' }
    }
    publish(next)
    return { ok: true, value: next }
  }
  function subscribe(listener) {
    const handle = (event) => listener(event.detail)
    window.addEventListener('healium:preferences', handle)
    return () => window.removeEventListener('healium:preferences', handle)
  }
  window.addEventListener('storage', (event) => {
    if (event.key === key || event.key === null) publish(read())
  })
  window.HEALiumPreferences = { key, defaults, read, write, subscribe }
  apply(read())
})()
