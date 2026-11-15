/**
 * Connection point: manual file import (CSV or JSON).
 *
 * STATUS: parser implemented and tested, but NOT CONNECTED – the dashboard has no upload
 * dialog yet. `createFileImportSource(file)` turns a file into a connected source; without
 * a file the source is registered as not connected.
 *
 * Accepted formats
 * ----------------
 * JSON: an array of measurements
 *   [{ "metric": "heart-rate", "value": 62, "unit": "bpm", "recordedAt": "2026-11-15T10:00:00Z", "subject": "MC-01" }]
 *
 * CSV: header row, then one measurement per row (`subject` and `location` are optional)
 *   metric,value,unit,recordedAt,subject,location
 *   cabin-temperature,72.3,°F,2026-11-15T10:00:00Z,,Habitat module
 *
 * The parser only reads the file. Whether a value is acceptable is decided afterwards by
 * the gateway validation, exactly as for every other source.
 */

import { SourceNotConnectedError } from '../core/errors'
import type { MetricId } from '../core/metrics'
import { metricCatalogue } from '../core/metrics'
import type { DataSourceAdapter, RawMeasurement, SourceDescriptor } from '../core/types'

export interface ImportFile {
  /** File name; the extension (`.json` / `.csv`) selects the parser. */
  name: string
  /** Text content of the file. */
  content: string
}

const requiredColumns = ['metric', 'value', 'unit', 'recordedAt'] as const

/** Thrown when a file cannot be read at all (wrong type, missing columns, broken JSON). */
export class ImportFileError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ImportFileError'
  }
}

function toMeasurement(row: Record<string, unknown>): RawMeasurement {
  const text = (value: unknown) => (value === undefined || value === null ? '' : String(value).trim())
  const rawValue = row.value
  return {
    metric: text(row.metric),
    // Non-numeric input becomes NaN and is rejected by the gateway validation.
    value: typeof rawValue === 'number' ? rawValue : text(rawValue) === '' ? Number.NaN : Number(text(rawValue)),
    unit: text(row.unit),
    recordedAt: text(row.recordedAt),
    subject: text(row.subject) || undefined,
    location: text(row.location) || undefined,
  }
}

function parseJson(content: string): RawMeasurement[] {
  let data: unknown
  try {
    data = JSON.parse(content)
  } catch {
    throw new ImportFileError('The file is not valid JSON.')
  }
  if (!Array.isArray(data)) throw new ImportFileError('The JSON file must contain an array of measurements.')
  return data.map((row) => toMeasurement((row ?? {}) as Record<string, unknown>))
}

function parseCsv(content: string): RawMeasurement[] {
  const lines = content.split(/\r?\n/).filter((line) => line.trim() !== '')
  if (lines.length === 0) throw new ImportFileError('The CSV file is empty.')
  const header = lines[0].split(',').map((cell) => cell.trim())
  const missing = requiredColumns.filter((column) => !header.includes(column))
  if (missing.length > 0) throw new ImportFileError(`Missing CSV column(s): ${missing.join(', ')}.`)
  return lines.slice(1).map((line) => {
    const cells = line.split(',')
    return toMeasurement(Object.fromEntries(header.map((column, index) => [column, cells[index]])))
  })
}

/**
 * Reads the measurements of an import file.
 *
 * @throws ImportFileError when the file as a whole cannot be read.
 */
export function parseImportFile(file: ImportFile): RawMeasurement[] {
  const name = file.name.toLowerCase()
  if (name.endsWith('.json')) return parseJson(file.content)
  if (name.endsWith('.csv')) return parseCsv(file.content)
  throw new ImportFileError('Unsupported file type. Use .csv or .json.')
}

const descriptor: Omit<SourceDescriptor, 'status'> = {
  id: 'file-import',
  name: 'File import (CSV / JSON)',
  kind: 'file-import',
  description:
    'Manual import of measurement files, e.g. exports of devices without a live interface or data read out after a mission phase.',
  transport: 'File selected by the user (.csv or .json)',
  provides: Object.keys(metricCatalogue) as MetricId[],
  quality: 'measured',
}

/**
 * Creates the file-import source.
 *
 * @param file File to import. Without a file the source is not connected.
 */
export function createFileImportSource(file?: ImportFile): DataSourceAdapter {
  return {
    descriptor: { ...descriptor, status: file ? 'connected' : 'not-connected' },
    async fetch() {
      if (!file) throw new SourceNotConnectedError(descriptor.id)
      return parseImportFile(file)
    },
  }
}
