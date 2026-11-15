import { describe, expect, it } from 'vitest'
import demo from '../../data/demo-telemetry.json'
import { createFileImportSource, IngestionGateway, InMemoryReadingSink, parseImportFile, ImportFileError } from './index'
import { createSimulatedSource } from './sources/simulated-source'
import { normaliseMeasurement } from './core/validation'

const now = () => new Date('2026-11-15T10:00:00Z')
const base = { metric: 'cabin-co2', value: 2.1, unit: 'mmHg', recordedAt: now().toISOString() }
const csv = (content: string) => parseImportFile({ name: 'readings.csv', content })
const header = 'metric,value,unit,recordedAt,location,sensorId'

describe('reading identity regressions', () => {
  it('retains simultaneous readings at different locations and from different sensors, but deduplicates retries', async () => {
    const readings = [
      { ...base, location: 'Module A', sensorId: 'one' },
      { ...base, value: 3.2, location: 'Module B', sensorId: 'one' },
      { ...base, value: 2.8, location: 'Module A', sensorId: 'two' },
    ]
    const sink = new InMemoryReadingSink()
    const gateway = new IngestionGateway({ sink, now, sources: [createFileImportSource({ name: 'data.json', content: JSON.stringify(readings) })] })
    await gateway.ingest('file-import')
    await gateway.ingest('file-import')
    expect(sink.all()).toHaveLength(3)
    expect(new Set(sink.all().map(r => r.id)).size).toBe(3)
    expect(sink.all().map(r => r.value).sort()).toEqual([2.1, 2.8, 3.2])
  })

  it('does not collide on delimiter characters or a literal missing-value marker', () => {
    const descriptor = createSimulatedSource(now).descriptor
    const values = [
      { subject: 'A|B', location: 'C' }, { subject: 'A', location: 'B|C' },
      { subject: '-', location: 'C' }, { location: 'C' },
    ].map(identity => normaliseMeasurement({ ...base, ...identity }, descriptor, now()))
    expect(values.every(v => v.ok)).toBe(true)
    expect(new Set(values.map(v => v.ok && v.reading.id)).size).toBe(4)
  })
})

describe('CSV regressions', () => {
  it('preserves quoted commas, escaped quotes, multiline fields, BOM and CRLF', () => {
    const rows = csv('\uFEFF' + header + '\r\n' +
      'cabin-co2,2.1,mmHg,2026-11-15T10:00:00Z,"Module A, sleeping area","sensor ""one"""\r\n' +
      'cabin-co2,3.2,mmHg,2026-11-15T10:00:00Z,"Module B\r\nupper deck",two\r\n\r\n')
    expect(rows).toHaveLength(2)
    expect(rows[0]).toMatchObject({ location: 'Module A, sleeping area', sensorId: 'sensor "one"', value: 2.1 })
    expect(rows[1].location).toBe('Module B\r\nupper deck')
  })

  it.each([
    '', '\uFEFF  ', 'metric,value\nheart-rate,60',
    header + ',value\n', header + '\ncabin-co2,2.1,mmHg',
    header + '\ncabin-co2,2.1,mmHg,2026-11-15T10:00:00Z,"unfinished,one',
    header + '\ncabin-co2,2.1,mmHg,2026-11-15T10:00:00Z,A,one,extra',
  ])('rejects malformed input instead of silently shifting fields: %s', content => {
    expect(() => csv(content)).toThrow(ImportFileError)
  })

  it('rejects blank values in the gateway instead of interpreting them as zero', async () => {
    const gateway = new IngestionGateway({ now, sink: new InMemoryReadingSink(), sources: [
      createFileImportSource({ name: 'data.csv', content: header + '\ncabin-co2,,mmHg,2026-11-15T10:00:00Z,A,one' }),
    ] })
    const report = await gateway.ingest('file-import')
    expect(report.accepted).toEqual([])
    expect(report.rejected[0].issues[0].code).toBe('invalid-value')
  })
})

describe('shared five-minute fixture', () => {
  it('uses all 60 samples without changing their values or five-second spacing', async () => {
    const source = createSimulatedSource(now)
    const rows = await source.fetch()
    expect(rows).toHaveLength(60 * 7)
    const hearts = rows.filter(r => r.metric === 'heart-rate')
    expect(hearts.map(r => r.value)).toEqual(demo.samples.map(s => s.heartRate))
    expect(hearts.every((r, i) => i === 0 || Date.parse(r.recordedAt) - Date.parse(hearts[i-1].recordedAt) === 5000)).toBe(true)
    expect(rows.filter(r => r.metric === 'skin-temperature').map(r => r.value)).toEqual(demo.samples.map(s => s.temperature))
    expect(rows.filter(r => r.metric === 'cabin-co2').map(r => r.value)).toEqual(demo.samples.map(s => s.co2))
    expect(await source.fetch({ subject: 'MC-01', since: hearts[59].recordedAt })).toHaveLength(6)
  })

  it('keeps IDs stable when a source is fetched later', async () => {
    let time = now().getTime()
    const source = createSimulatedSource(() => new Date(time))
    const first = await source.fetch()
    time += 5000
    expect(await source.fetch()).toEqual(first)
  })
})
