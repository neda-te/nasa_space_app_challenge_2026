/**
 * Tests of the data-ingestion gateway (`npm test`).
 *
 * They document the guarantees of the gateway: what is accepted, what is rejected and
 * that sources which are not connected never deliver data.
 */

import { describe, expect, it } from 'vitest'
import {
  createFileImportSource,
  createGateway,
  ImportFileError,
  IngestionGateway,
  InMemoryReadingSink,
  parseImportFile,
  SourceNotConnectedError,
  UnknownSourceError,
} from './index'
import { normaliseMeasurement } from './core/validation'
import { toCanonicalUnit } from './core/units'
import { createSimulatedSource } from './sources/simulated-source'

const now = () => new Date('2026-11-15T10:00:00.000Z')
const simulated = createSimulatedSource(now).descriptor

describe('source registry', () => {
  it('lists every planned source and marks only the simulated one as connected', () => {
    const gateway = createGateway({ sink: new InMemoryReadingSink(), now })
    const sources = gateway.listSources()

    expect(sources.map((source) => source.id)).toEqual([
      'simulated',
      'wearable-biosensor',
      'lab-analyzer',
      'radiation-dosimeter',
      'habitat-environment',
      'crew-self-report',
      'ground-medical-uplink',
      'file-import',
    ])
    expect(sources.filter((source) => source.status === 'connected').map((source) => source.id)).toEqual([
      'simulated',
    ])
  })

  it('refuses to ingest from a source that is not connected', async () => {
    const gateway = createGateway({ sink: new InMemoryReadingSink(), now })
    await expect(gateway.ingest('wearable-biosensor')).rejects.toBeInstanceOf(SourceNotConnectedError)
    await expect(gateway.ingest('does-not-exist')).rejects.toBeInstanceOf(UnknownSourceError)
  })
})

describe('simulated source', () => {
  it('runs through the whole pipeline and labels every reading as simulated', async () => {
    const sink = new InMemoryReadingSink()
    const gateway = createGateway({ sink, now })

    const [report] = await gateway.ingestAllConnected()

    expect(report.sourceId).toBe('simulated')
    expect(report.rejected).toEqual([])
    expect(report.accepted.length).toBe(report.fetched)
    expect(report.accepted.length).toBeGreaterThan(0)
    expect(sink.all().every((reading) => reading.quality === 'simulated')).toBe(true)

    const heartRate = sink.latest('heart-rate', 'MC-01')
    expect(heartRate).toMatchObject({ value: 62, unit: 'bpm', recordedAt: '2026-11-15T10:00:00.000Z' })
    expect(sink.latest('cabin-co2')).toMatchObject({ value: 2.1, unit: 'mmHg', subject: null })
  })

  it('does not create duplicates when the same data is ingested twice', async () => {
    const sink = new InMemoryReadingSink()
    const gateway = createGateway({ sink, now })
    await gateway.ingest('simulated')
    const count = sink.all().length
    await gateway.ingest('simulated')
    expect(sink.all().length).toBe(count)
  })
})

describe('normalisation and validation', () => {
  const measurement = { metric: 'heart-rate', value: 62, unit: 'bpm', recordedAt: '2026-11-15T09:00:00Z' }

  it('converts units to the canonical unit of the metric', () => {
    expect(toCanonicalUnit(98.6, '°F', '°C')).toBeCloseTo(37, 5)
    expect(toCanonicalUnit(14.7, 'psi', 'kPa')).toBeCloseTo(101.35, 1)
    expect(toCanonicalUnit(342, 'min', 'h')).toBeCloseTo(5.7, 5)
    expect(toCanonicalUnit(5, 'furlong', 'h')).toBeNull()

    const result = normaliseMeasurement(
      { metric: 'cabin-temperature', value: 72.5, unit: '°F', recordedAt: '2026-11-15T09:00:00Z' },
      simulated,
      now(),
    )
    expect(result.ok && result.reading.unit).toBe('°C')
    expect(result.ok && result.reading.value).toBeCloseTo(22.5, 5)
  })

  it.each([
    ['unknown-metric', { ...measurement, metric: 'mood-ring' }],
    ['invalid-value', { ...measurement, value: Number.NaN }],
    ['unsupported-unit', { ...measurement, unit: 'Hz' }],
    ['out-of-range', { ...measurement, value: 900 }],
    ['invalid-timestamp', { ...measurement, recordedAt: 'yesterday' }],
    ['timestamp-in-future', { ...measurement, recordedAt: '2026-11-16T10:00:00Z' }],
  ])('rejects a measurement with %s', (code, bad) => {
    const result = normaliseMeasurement(bad, simulated, now())
    expect(result.ok).toBe(false)
    expect(!result.ok && result.issues.map((issue) => issue.code)).toContain(code)
  })
})

describe('file import', () => {
  const csv = [
    'metric,value,unit,recordedAt,subject,location',
    'heart-rate,64,bpm,2026-11-15T08:00:00Z,MC-01,',
    'cabin-pressure,14.7,psi,2026-11-15T08:00:00Z,,Habitat module',
    'heart-rate,not-a-number,bpm,2026-11-15T08:05:00Z,MC-01,',
  ].join('\n')

  it('parses CSV and JSON files into raw measurements', () => {
    expect(parseImportFile({ name: 'export.csv', content: csv })).toHaveLength(3)
    expect(
      parseImportFile({
        name: 'export.json',
        content: JSON.stringify([{ metric: 'heart-rate', value: 61, unit: 'bpm', recordedAt: '2026-11-15T08:00:00Z' }]),
      }),
    ).toEqual([
      { metric: 'heart-rate', value: 61, unit: 'bpm', recordedAt: '2026-11-15T08:00:00Z', subject: undefined, location: undefined },
    ])
  })

  it('rejects files it cannot read', () => {
    expect(() => parseImportFile({ name: 'export.xlsx', content: '' })).toThrow(ImportFileError)
    expect(() => parseImportFile({ name: 'export.json', content: '{' })).toThrow(ImportFileError)
    expect(() => parseImportFile({ name: 'export.csv', content: 'metric,value\nheart-rate,60' })).toThrow(
      /Missing CSV column/,
    )
  })

  it('imports valid rows, converts units and reports invalid rows', async () => {
    const sink = new InMemoryReadingSink()
    const gateway = new IngestionGateway({
      sources: [createFileImportSource({ name: 'export.csv', content: csv })],
      sink,
      now,
    })

    const report = await gateway.ingest('file-import')

    expect(report.fetched).toBe(3)
    expect(report.accepted).toHaveLength(2)
    expect(report.rejected).toHaveLength(1)
    expect(report.rejected[0].issues[0].code).toBe('invalid-value')
    expect(sink.latest('cabin-pressure')?.value).toBeCloseTo(101.35, 1)
    expect(sink.latest('cabin-pressure')).toMatchObject({ unit: 'kPa', location: 'Habitat module', quality: 'measured' })
  })
})
