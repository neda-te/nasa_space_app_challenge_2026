/**
 * Unit conversion to the canonical unit of each metric.
 *
 * Add a line to `conversions` to support another unit. Keys have the form
 * `<from>-><canonical>`.
 */

const conversions: Record<string, (value: number) => number> = {
  // temperature
  '°F->°C': (v) => ((v - 32) * 5) / 9,
  'K->°C': (v) => v - 273.15,
  // pressure
  'psi->kPa': (v) => v * 6.894757,
  'mmHg->kPa': (v) => v * 0.1333224,
  'kPa->mmHg': (v) => v / 0.1333224,
  // time
  'min->h': (v) => v / 60,
  's->ms': (v) => v * 1000,
  // radiation
  'µSv->mSv': (v) => v / 1000,
  // laboratory
  'mmol/L->mg/dL': (v) => v * 18.016, // glucose only
  'g/L->g/dL': (v) => v / 10,
}

/**
 * Converts `value` from `unit` to `canonicalUnit`.
 *
 * @returns the converted value, or `null` when the unit is not supported.
 */
export function toCanonicalUnit(value: number, unit: string, canonicalUnit: string): number | null {
  const from = unit.trim()
  if (from === canonicalUnit) return value
  const convert = conversions[`${from}->${canonicalUnit}`]
  return convert ? convert(value) : null
}
