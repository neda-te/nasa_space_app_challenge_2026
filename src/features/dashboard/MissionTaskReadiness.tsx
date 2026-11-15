/**
 * Mission task readiness section: task list on the left, reasoning for the selected task on the right.
 */

import { useState } from 'react'
import { Icon } from '../../shared/components/Icon'
import { getMissionTasks, type ReadinessLevel } from './mission-tasks'

/** Readiness pill for a mission task. */
function TaskStatus({ level }: { level: ReadinessLevel }) {
  return (
    <span className={`task-status task-status-${level.toLowerCase().replace(' ', '-')}`}>
      <i />
      {level}
    </span>
  )
}

/** Task list with the detailed reasoning for the selected task. */
export function MissionTaskReadiness({ dailyScore }: { dailyScore: number | null }) {
  const tasks = getMissionTasks(dailyScore)
  const [selectedId, setSelectedId] = useState(tasks[0].id)
  const selected = tasks.find((task) => task.id === selectedId) ?? tasks[0]

  return (
    <section className="mission-readiness" aria-labelledby="mission-readiness-title">
      <div className="section-heading">
        <div>
          <span className="eyebrow">HEALTH-INFORMED PLANNING</span>
          <h3 id="mission-readiness-title">Mission Task Readiness</h3>
          <p>Operational guidance derived from current indicators and personal baselines.</p>
        </div>
        <span className="rules-badge">RULE-BASED · NON-DIAGNOSTIC</span>
      </div>
      <div className="task-layout">
        <div className="task-list" role="list">
          {tasks.map((task) => (
            <button
              className={selected.id === task.id ? 'active' : ''}
              onClick={() => setSelectedId(task.id)}
              key={task.id}
              type="button"
            >
              <span className="task-icon">
                <Icon name={task.icon} size={18} />
              </span>
              <span className="task-copy">
                <strong>{task.title}</strong>
                <small>{task.subtitle}</small>
              </span>
              <TaskStatus level={task.level} />
              <Icon name="chevron" size={16} />
            </button>
          ))}
        </div>
        <article className="task-detail" aria-live="polite">
          <div className="task-detail-head">
            <div>
              <span>SELECTED TASK</span>
              <h4>{selected.title}</h4>
            </div>
            <TaskStatus level={selected.level} />
          </div>
          <div
            className={`task-caution task-caution-${selected.level.toLowerCase().replace(' ', '-')}`}
          >
            <Icon name={selected.level === 'Normal' ? 'check' : 'trend'} size={18} />
            <strong>{selected.statusCopy}</strong>
          </div>
          <div className="task-metrics">
            {selected.metrics.map(([label, current, baseline]) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{current}</strong>
                <small>{baseline}</small>
              </div>
            ))}
          </div>
          <div className="task-detail-grid">
            <div>
              <span>SPECIFIC CONCERNS</span>
              <ul>
                {selected.concerns.map((concern) => (
                  <li key={concern}>{concern}</li>
                ))}
              </ul>
            </div>
            <div>
              <span>RECOMMENDED ACTIONS</span>
              <ul>
                {selected.actions.map((action) => (
                  <li key={action}>{action}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="task-why">
            <span>WHY THIS GUIDANCE</span>
            <p>{selected.why}</p>
          </div>
          <p className="task-sources">
            <b>Data sources:</b> {selected.sources}
          </p>
        </article>
      </div>
    </section>
  )
}
