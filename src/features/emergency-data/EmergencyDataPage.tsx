/**
 * Emergency Data page: read-only archive of snapshots received from the emergency
 * flow (`emergency/`). The list is empty in the local preview because no backend is
 * connected.
 */

import { useState } from 'react'
import { Icon } from '../../shared/components/Icon'
import { PageTitle } from '../../shared/components/PageTitle'
import { SourceTag } from '../../shared/components/SourceTag'
import { StatusBadge } from '../../shared/components/StatusBadge'
import { AstronautBody } from './AstronautBody'
import type { EmergencySnapshotView } from './types'

/** List of emergency snapshots with a detail view for the selected record. */
export function EmergencyDataPage({ snapshots }: { snapshots: EmergencySnapshotView[] }) {
  const [selectedId, setSelectedId] = useState(snapshots[0]?.id ?? '')
  const [side, setSide] = useState(false)
  const selected = snapshots.find((item) => item.id === selectedId) ?? snapshots[0]
  const selectedGender: 'female' | 'male' = selected?.astronautCode === 'ER-02' ? 'male' : 'female'
  return (
    <>
      <PageTitle
        kicker="SYSTEM · EXTERNAL EMERGENCY ARCHIVE"
        title="Emergency Data Records"
        description="Read-only, simulated snapshots received from the separate emergency handling system."
        action={<SourceTag kind="research">Payload saved records</SourceTag>}
      />
      <div className="emergency-scope-note">
        <Icon name="lock" size={15} />
        <p>
          This screen archives sanitized emergency telemetry for later health review. Emergency
          response and handling remain outside this dashboard.
        </p>
      </div>
      {selected ? (
        <div className="emergency-layout">
          <section className="body-viewer-panel">
            <div className="viewer-heading">
              <div>
                <span className="eyebrow">ANATOMICAL EVENT MAP</span>
                <h3>Astronaut body representation</h3>
              </div>
              <div className="view-toggle">
                <button className={!side ? 'active' : ''} onClick={() => setSide(false)}>
                  Front
                </button>
                <button className={side ? 'active' : ''} onClick={() => setSide(true)}>
                  Side
                </button>
              </div>
            </div>
            <AstronautBody region={selected.bodyRegion} side={side} gender={selectedGender} />
            <div className="body-region-label">
              <span>{selectedGender.toUpperCase()} HUMAN MODEL · ACTIVE RECORD REGION</span>
              <strong>{selected.bodyRegion.replace('-', ' ')}</strong>
            </div>
          </section>
          <section className="emergency-record-panel">
            <div className="record-detail-head">
              <div>
                <span>{selected.externalEventId}</span>
                <h3>{selected.eventType.replace('-', ' ')}</h3>
              </div>
              <StatusBadge status={selected.status === 'monitoring' ? 'Monitor' : 'Normal'} />
            </div>
            <p className="record-summary">{selected.summary}</p>
            <div className="record-metrics">
              <div>
                <span>Heart rate</span>
                <b>
                  {selected.vitals?.heartRate ?? '—'} <small>bpm</small>
                </b>
              </div>
              <div>
                <span>O₂ saturation</span>
                <b>
                  {selected.vitals?.oxygenSaturation ?? '—'} <small>%</small>
                </b>
              </div>
              <div>
                <span>Blood pressure</span>
                <b>
                  {selected.vitals?.systolicPressure ?? '—'} /{' '}
                  {selected.vitals?.diastolicPressure ?? '—'}
                </b>
              </div>
              <div>
                <span>Astronaut</span>
                <b>{selected.astronautCode}</b>
              </div>
            </div>
            <div className="record-provenance">
              <div>
                <span>RECORDED</span>
                <b>{new Date(selected.recordedAt).toLocaleString()}</b>
              </div>
              <div>
                <span>SOURCE SYSTEM</span>
                <b>{selected.sourceSystem}</b>
              </div>
              <div>
                <span>DATA CLASS</span>
                <b>Simulated · saved in Payload</b>
              </div>
            </div>
            <div className="record-list-heading">
              <span>RECENT SAVED SNAPSHOTS</span>
              <b>{snapshots.length} records</b>
            </div>
            <div className="emergency-record-list">
              {snapshots.map((item) => (
                <button
                  className={item.id === selected.id ? 'active' : ''}
                  onClick={() => setSelectedId(item.id)}
                  key={item.id}
                >
                  <i />
                  <div>
                    <b>{item.eventType.replace('-', ' ')}</b>
                    <span>
                      {item.externalEventId} · {item.bodyRegion.replace('-', ' ')}
                    </span>
                  </div>
                  <time>{new Date(item.recordedAt).toLocaleDateString()}</time>
                  <Icon name="chevron" size={14} />
                </button>
              ))}
            </div>
          </section>
        </div>
      ) : (
        <div className="empty-records">
          <Icon name="data" size={25} />
          <h3>No emergency snapshots saved</h3>
          <p>Imported records from the external emergency system will appear here.</p>
        </div>
      )}
    </>
  )
}
