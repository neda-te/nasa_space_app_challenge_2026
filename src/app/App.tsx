'use client'
// ^ Marks the client boundary when the dashboard is rendered by the Next.js host (backend/). Ignored by Vite.

/**
 * Application shell.
 *
 * Owns the global UI state (current page, selected crew member, widget layout, signed-in
 * user data) and renders the sidebar, top bar, the active feature page and the modals
 * (daily check-in, sign-in, emergency mode).
 *
 * Navigation is state-based: `page` selects which feature page is rendered; there is
 * no URL router.
 */

import { useEffect, useRef, useState, useTransition } from 'react'
import { AuthModal } from '../features/auth/AuthModal'
import { BreathingExercisePage } from '../features/breathing/BreathingExercisePage'
import { WellnessModal } from '../features/check-in/WellnessModal'
import { CustomizePage } from '../features/customize/CustomizePage'
import { DashboardPage } from '../features/dashboard/DashboardPage'
import { defaultWidgets } from '../features/dashboard/widget-config'
import { SourcesPage } from '../features/data-sources/SourcesPage'
import { EmergencyDataPage } from '../features/emergency-data/EmergencyDataPage'
import type { EmergencySnapshotView } from '../features/emergency-data/types'
import { EnvironmentPage } from '../features/environment/EnvironmentPage'
import { JournalPage } from '../features/journal/JournalPage'
import { LabPage } from '../features/lab-data/LabPage'
import { PhysicalPage } from '../features/physical-health/PhysicalPage'
import { TrendsPage } from '../features/trends/TrendsPage'
import { useBackend } from '../services/backend/BackendContext'
import type { JournalEntryView, PrivateDashboardData } from '../services/backend/contract'
import { Icon } from '../shared/components/Icon'
import type { ChartStyle, Page, WidgetId, WidgetSize } from '../shared/types'
import { navItems } from './navigation'

/**
 * Root component of the dashboard.
 *
 * @param emergencySnapshots Emergency records to show on the Emergency Data page
 *                           (loaded by the host: empty locally, from the backend on the server).
 */
export function App({
  emergencySnapshots,
}: {
  emergencySnapshots: EmergencySnapshotView[]
}) {
  const backend = useBackend()
  const [page, setPage] = useState<Page>('Dashboard')
  const [crew, setCrew] = useState('Cmdr. Maya Chen')
  const [widgets, setWidgets] = useState<WidgetId[]>(defaultWidgets)
  const [chart, setChart] = useState<ChartStyle>('Line')
  const [size, setSize] = useState<WidgetSize>('Medium')
  const [dailyScore, setDailyScore] = useState<number | null>(null)
  const [wellnessModal, setWellnessModal] = useState<'checkin' | 'breathing' | null>(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const emergencyDialog = useRef<HTMLDialogElement>(null)
  const [emergencyOpen, setEmergencyOpen] = useState(false)
  const [privateData, setPrivateData] = useState<PrivateDashboardData>({
    user: null,
    reminders: [],
    journals: [],
  })
  const [privateError, setPrivateError] = useState('')
  const [privatePending, startPrivateTransition] = useTransition()
  const [physicalFocus, setPhysicalFocus] = useState('Cardiovascular Health')

  useEffect(() => {
    if (!emergencyOpen) return
    const dialog = emergencyDialog.current
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog?.showModal()
    return () => {
      dialog?.close()
      document.body.style.overflow = previousOverflow
    }
  }, [emergencyOpen])

  useEffect(() => {
    let active = true
    backend.getPrivateDashboardData()
      .then((data) => {
        if (active) setPrivateData(data)
      })
      .catch(() => {
        if (active) setPrivateError('Private records could not be loaded.')
      })
    return () => {
      active = false
    }
  }, [])

  const go = (next: Page) => {
    setPage(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const openPhysical = (category: string) => {
    setPhysicalFocus(category)
    go('Physical')
  }
  const openCheckIn = () => {
    if (!privateData.user) {
      setAuthModalOpen(true)
      return
    }
    setWellnessModal('checkin')
  }
  const toggleReminder = (key: string, completed: boolean) => {
    if (!privateData.user) {
      setAuthModalOpen(true)
      return
    }
    setPrivateError('')
    startPrivateTransition(async () => {
      const result = await backend.setReminderCompleted(key, completed)
      if (!result.success) {
        setPrivateError(result.message)
        return
      }
      setPrivateData((current) => ({
        ...current,
        reminders: [
          ...current.reminders.filter((item) => item.reminderKey !== result.data.reminderKey),
          result.data,
        ],
      }))
    })
  }
  const signOut = () => {
    startPrivateTransition(async () => {
      const result = await backend.logoutAstronaut()
      if (result.success) {
        setPrivateData({ user: null, reminders: [], journals: [] })
        setDailyScore(null)
      }
    })
  }
  const upsertJournal = (entry: JournalEntryView) => {
    setPrivateData((current) => ({
      ...current,
      journals: [entry, ...current.journals.filter((item) => item.id !== entry.id)].sort(
        (a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime(),
      ),
    }))
  }
  const removeJournal = (id: string) => {
    setPrivateData((current) => ({
      ...current,
      journals: current.journals.filter((entry) => entry.id !== id),
    }))
  }
  const pageNames: Record<Page, string> = {
    Dashboard: 'Crew Health Overview',
    Physical: 'Physical Health Overview',
    Blood: 'Blood Test Results',
    Urine: 'Urine Test Results',
    Environment: 'Environmental Monitoring',
    Trends: 'Trends & Personal Baselines',
    Sources: 'Data Sources & Transparency',
    Customize: 'Dashboard Customization',
    EmergencyData: 'Saved Emergency Data',
    Breathing: 'Breathing Exercise',
    Journal: 'Private Journal',
  }
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <span className="orbit" />
            <span className="planet" />
          </div>
          <div>
            <strong>HEALium</strong>
            <small>CREW HEALTH SYSTEM</small>
          </div>
        </div>
        <div className="mission-chip">
          <span />
          <div>
            <small>MISSION DAY</small>
            <strong>
              184 <i>/ 365</i>
            </strong>
          </div>
          <b>51%</b>
        </div>
        <button
          className="sidebar-checkin"
          onClick={() => {
            openCheckIn()
          }}
        >
          <span className="checkin-plus">
            <Icon name={dailyScore === null ? 'plus' : 'check'} size={14} />
          </span>
          <span>
            <small>DAILY HEALTH</small>
            <b>{dailyScore === null ? 'Start check-in' : 'Update check-in'}</b>
          </span>
          <Icon name="chevron" size={14} />
        </button>
        <button className="sidebar-checkin breathing" onClick={() => go('Breathing')}>
          <span className="checkin-plus">
            <Icon name="breath" size={15} />
          </span>
          <span>
            <small>WELLNESS TOOL</small>
            <b>Breathing exercise</b>
          </span>
          <Icon name="chevron" size={14} />
        </button>
        <nav aria-label="Primary navigation">
          <p className="nav-label">MISSION HEALTH</p>
          {navItems.slice(0, 6).map((item) => (
            <button
              className={`nav-item ${page === item.page || (item.page === 'Physical' && ['Blood', 'Urine'].includes(page)) ? 'active' : ''}`}
              onClick={() => go(item.page)}
              key={item.label}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
          <p className="nav-label second">SYSTEM</p>
          {navItems.slice(6).map((item) => (
            <button
              className={`nav-item ${page === item.page ? 'active' : ''}`}
              onClick={() => go(item.page)}
              key={item.label}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="connection">
            <span />
            <div>
              <strong>All systems connected</strong>
              <small>Synced 38 sec ago</small>
            </div>
          </div>
          <div className="mission-name">
            <div className="mission-avatar">A7</div>
            <div>
              <strong>Asteria VII</strong>
              <small>Deep Space Mission</small>
            </div>
            <Icon name="chevron" size={15} />
          </div>
          <button
            className={`account-button ${privateData.user ? 'signed-in' : ''}`}
            onClick={() => (privateData.user ? signOut() : setAuthModalOpen(true))}
            disabled={privatePending}
          >
            <Icon name="lock" size={14} />
            <span>
              <strong>{privateData.user ? privateData.user.name : 'Private data sign-in'}</strong>
              <small>{privateData.user ? 'Sign out' : 'Sync journal & reminders'}</small>
            </span>
          </button>
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <div>
            <div className="title-line">
              <h1>Astronaut Health Monitoring</h1>
              <span className="demo-note">SIMULATED DEMO DATA</span>
            </div>
            <p>
              {pageNames[page]} <span>•</span> Personal-baseline monitoring
            </p>
          </div>
          <div className="top-actions">
            <div className="mission-time">
              <span>MISSION TIME</span>
              <strong>
                09:42:18 <small>UTC</small>
              </strong>
            </div>
            <label className="crew-selector">
              <span className="crew-avatar">MC</span>
              <span className="crew-copy">
                <small>ACTIVE CREW MEMBER</small>
                <select value={crew} onChange={(e) => setCrew(e.target.value)}>
                  <option>Cmdr. Maya Chen</option>
                  <option>Dr. Elias Romero</option>
                  <option>Lt. Anika Patel</option>
                </select>
              </span>
            </label>
            <button className="notification-button" aria-label="Notifications">
              <Icon name="bell" size={20} />
              <span>2</span>
            </button>
            <button
              className="rounded-lg border border-[#FC3D21] bg-[#FC3D21] px-4 py-2 text-xs font-semibold text-white hover:bg-[#dd321a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B3D91]"
              aria-label="Help — open emergency mode"
              aria-haspopup="dialog"
              onClick={() => setEmergencyOpen(true)}
            >
              Help
            </button>
          </div>
        </header>
        <div className="dashboard-content">
          {page === 'Dashboard' && (
            <DashboardPage
              go={go}
              widgets={widgets}
              chart={chart}
              size={size}
              dailyScore={dailyScore}
              openPhysical={openPhysical}
              reminderCompletions={privateData.reminders}
              signedIn={Boolean(privateData.user)}
              onToggleReminder={toggleReminder}
              onStartCheckIn={openCheckIn}
            />
          )}
          {page === 'Physical' && <PhysicalPage go={go} initialOpen={physicalFocus} />}
          {page === 'Blood' && <LabPage type="Blood" go={go} />}
          {page === 'Urine' && <LabPage type="Urine" go={go} />}
          {page === 'Environment' && <EnvironmentPage />}
          {page === 'Trends' && <TrendsPage />}
          {page === 'Sources' && <SourcesPage />}
          {page === 'EmergencyData' && <EmergencyDataPage snapshots={emergencySnapshots} />}
          {page === 'Breathing' && <BreathingExercisePage />}
          {page === 'Journal' && (
            <JournalPage
              entries={privateData.journals}
              signedIn={Boolean(privateData.user)}
              onAuthRequired={() => setAuthModalOpen(true)}
              onEntrySaved={upsertJournal}
              onEntryDeleted={removeJournal}
            />
          )}
          {page === 'Customize' && (
            <CustomizePage
              widgets={widgets}
              setWidgets={setWidgets}
              go={go}
              chart={chart}
              setChart={setChart}
              size={size}
              setSize={setSize}
            />
          )}
        </div>
        {privateError && (
          <button className="app-notice" onClick={() => setPrivateError('')}>
            {privateError}
          </button>
        )}
        <footer className="app-footer">
          <span>NASA Space Apps Challenge · Research interface v3.0</span>
          <span>
            Personal baseline: 14-day rolling model <i /> Telemetry nominal
          </span>
        </footer>
      </main>
      {wellnessModal && (
        <WellnessModal
          mode={wellnessModal}
          onClose={() => setWellnessModal(null)}
          onSaveScore={(score) => {
            setDailyScore(score)
            toggleReminder('daily-health', true)
          }}
        />
      )}
      {authModalOpen && (
        <AuthModal
          onClose={() => setAuthModalOpen(false)}
          onAuthenticated={(data) => {
            setPrivateData(data)
            setPrivateError('')
          }}
        />
      )}
      <dialog
        ref={emergencyDialog}
        aria-label="Emergency mode"
        className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none border-0 bg-[#d9e0ea] p-0 text-[#07173F] backdrop:bg-[#d9e0ea]"
        onCancel={() => setEmergencyOpen(false)}
        onClose={() => setEmergencyOpen(false)}
      >
        {emergencyOpen && (
          <div className="flex h-full flex-col">
            <div className="flex shrink-0 items-center justify-between border-b border-[#cbd5e3] bg-white px-5 py-2 text-xs">
              <strong>HEALium · Emergency mode</strong>
              <button
                autoFocus
                className="rounded-lg border border-[#cbd5e3] bg-white px-4 py-2 font-semibold hover:bg-[#eef2f7] focus-visible:outline-2 focus-visible:outline-[#0B3D91]"
                onClick={() => setEmergencyOpen(false)}
              >
                ← Back to dashboard
              </button>
            </div>
            <iframe
              title="HEALium emergency flow"
              src="/emergency/index.html"
              className="min-h-0 w-full flex-1 border-0"
            />
          </div>
        )}
      </dialog>
    </div>
  )
}
