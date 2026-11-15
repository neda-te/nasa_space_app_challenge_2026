/**
 * Home page of the dashboard: reminders, health summary, widget grid and mission task readiness.
 */

import type { ReminderCompletionView } from '../../services/backend/contract'
import { Icon } from '../../shared/components/Icon'
import { PageTitle } from '../../shared/components/PageTitle'
import type { ChartStyle, Page, WidgetId, WidgetSize } from '../../shared/types'
import { DashboardReminders } from './DashboardReminders'
import { HealthSummary } from './HealthSummary'
import { HomeWidget } from './HomeWidget'
import { MissionTaskReadiness } from './MissionTaskReadiness'

/** Composes the home dashboard from the widgets selected in the settings. */
export function DashboardPage({
  go,
  widgets,
  chart,
  size,
  dailyScore,
  openPhysical,
  reminderCompletions,
  signedIn,
  onToggleReminder,
  onStartCheckIn,
}: {
  go: (page: Page) => void
  widgets: WidgetId[]
  chart: ChartStyle
  size: WidgetSize
  dailyScore: number | null
  openPhysical: (category: string) => void
  reminderCompletions: ReminderCompletionView[]
  signedIn: boolean
  onToggleReminder: (key: string, completed: boolean) => void
  onStartCheckIn: () => void
}) {
  return (
    <>
      <PageTitle
        kicker="MISSION DAY 184 · CREW MEMBER MC-01"
        title="Good morning, Maya"
        description="Your personal health overview for today. Essential indicators update from approved mission data sources."
        action={
          <div className="title-actions">
            <button className="secondary-button" onClick={() => go('Customize')}>
              <Icon name="edit" size={15} />
              Edit Dashboard
            </button>
          </div>
        }
      />
      <DashboardReminders
        completions={reminderCompletions}
        signedIn={signedIn}
        onToggle={onToggleReminder}
        onStartCheckIn={onStartCheckIn}
        go={go}
        openPhysical={openPhysical}
      />
      <HealthSummary dailyScore={dailyScore} go={go} />
      <div className="simulated-banner">
        <span>SIMULATED CREW DATA</span>
        <p>
          Prototype measurements are clearly separated by source type and are not intended for
          diagnosis.
        </p>
        <button onClick={() => go('Sources')}>View data transparency</button>
      </div>
      <div className={`home-grid widget-size-${size.toLowerCase()}`}>
        {widgets.map((id) => (
          <HomeWidget
            id={id}
            go={go}
            chart={chart}
            fatigueScore={dailyScore}
            openPhysical={openPhysical}
            key={id}
          />
        ))}
      </div>
      <MissionTaskReadiness dailyScore={dailyScore} />
      <button className="physical-quick" onClick={() => go('Physical')}>
        <div className="quick-icon">
          <Icon name="heart" size={21} />
        </div>
        <div>
          <span>QUICK ACCESS</span>
          <h3>Physical Health Monitoring</h3>
          <p>Review cardiovascular, sleep, performance, examination, and laboratory records.</p>
        </div>
        <Icon name="arrow" />
      </button>
    </>
  )
}
