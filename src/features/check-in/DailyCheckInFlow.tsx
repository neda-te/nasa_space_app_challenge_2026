/**
 * Daily health check-in flow (choose session -> questions -> summary).
 *
 * Answers are submitted through the backend API (`useBackend`). After a successful
 * submission a fatigue score (1-10) is derived and reported to the dashboard.
 */

import { useState, useTransition } from 'react'
import { useBackend } from '../../services/backend/BackendContext'
import type { CheckInSubmission } from '../../services/backend/contract'
import { Icon } from '../../shared/components/Icon'
import { eveningQuestions, morningQuestionCount, morningQuestions, type CheckInAnswerKey } from './questions'

/**
 * Check-in flow.
 *
 * @param onClose           Closes the surrounding modal.
 * @param onDashboardUpdate Receives the derived fatigue score (1-10) after a successful submission.
 */
export function DailyCheckInFlow({
  onClose,
  onDashboardUpdate,
}: {
  onClose: () => void
  onDashboardUpdate: (score: number) => void
}) {
  const backend = useBackend()
  const [flow, setFlow] = useState<'choose' | 'morning' | 'evening' | 'summary'>('choose')
  const [completedType, setCompletedType] = useState<'morning' | 'evening'>('morning')
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Partial<Record<CheckInAnswerKey, number>>>({})
  const [hasPhysicalDiscomfort, setHasPhysicalDiscomfort] = useState<boolean | null>(null)
  const [discomfortDescription, setDiscomfortDescription] = useState('')
  const [privacyLevel, setPrivacyLevel] = useState<'private' | 'crew-medical'>('private')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()
  const currentMorning = morningQuestions[step]

  const chooseAnswer = (field: CheckInAnswerKey, value: number) => {
    setAnswers((current) => ({ ...current, [field]: value }))
    setError('')
  }

  const submit = (sessionType: 'morning' | 'evening') => {
    const allowedFields =
      sessionType === 'morning'
        ? morningQuestions.map((question) => question.field)
        : eveningQuestions.map((question) => question.field)
    const responses = Object.fromEntries(
      allowedFields
        .filter((field) => answers[field] !== undefined)
        .map((field) => [field, answers[field]]),
    ) as CheckInSubmission['responses']
    startTransition(async () => {
      const result = await backend.submitDailyCheckIn({
        sessionType,
        privacyLevel,
        responses,
        hasPhysicalDiscomfort: sessionType === 'morning' ? hasPhysicalDiscomfort : undefined,
        physicalDiscomfortDescription:
          sessionType === 'morning' && hasPhysicalDiscomfort ? discomfortDescription : undefined,
      })
      if (!result.success) {
        setError(result.message)
        return
      }
      setCompletedType(sessionType)
      const fatigue =
        sessionType === 'evening'
          ? (answers.physicalFatigue ?? 3) * 2
          : Math.max(1, 12 - (answers.physicalRestfulness ?? 3) * 2)
      onDashboardUpdate(fatigue)
      setFlow('summary')
    })
  }

  if (flow === 'choose') {
    return (
      <>
        <div className="modal-body checkin-choice-body">
          <div className="checkin-intro">
            <span className="research-label">RESEARCH-INSPIRED PROTOTYPE</span>
            <h3>Choose your check-in</h3>
            <p>
              Short self-reports informed by Spaceflight Standard Measures and Behavioral Core
              Measures research. This does not reproduce an official NASA questionnaire.
            </p>
          </div>
          <div className="checkin-flow-cards">
            <button onClick={() => setFlow('morning')}>
              <span className="flow-time">06:00</span>
              <div>
                <b>Morning check-in</b>
                <p>Sleep, restfulness, alertness, and physical comfort</p>
              </div>
              <Icon name="chevron" size={16} />
            </button>
            <button onClick={() => setFlow('evening')}>
              <span className="flow-time evening">20:00</span>
              <div>
                <b>Evening check-in</b>
                <p>Fatigue, stress, workload, and crew connection</p>
              </div>
              <Icon name="chevron" size={16} />
            </button>
          </div>
          <div className="checkin-history-preview">
            <div>
              <span>7-DAY COMPLETION</span>
              <b>11 / 14</b>
            </div>
            <div className="history-dots">
              {[1, 1, 1, 1, 1, 0, 1].map((done, index) => (
                <i className={done ? 'done' : ''} key={index} />
              ))}
            </div>
            <span>Personal baseline available</span>
          </div>
        </div>
        <div className="modal-footer">
          <button className="checkin-skip" onClick={onClose}>
            Skip for now
          </button>
        </div>
      </>
    )
  }

  if (flow === 'summary') {
    const alertness = answers.mentalAlertness ?? 3
    const fatigue = answers.physicalFatigue ?? Math.max(1, 6 - (answers.physicalRestfulness ?? 3))
    const stress = answers.stressLevel ?? 2
    return (
      <>
        <div className="modal-body checkin-summary-body">
          <div className="summary-success">
            <span>
              <Icon name="check" size={19} />
            </span>
            <div>
              <h3>{completedType === 'morning' ? 'Morning' : 'Evening'} check-in saved</h3>
              <p>Your private record has been added to today’s health timeline.</p>
            </div>
          </div>
          <div className="checkin-summary-grid">
            <div>
              <span>ALERTNESS</span>
              <b>{alertness} / 5</b>
              <small>{alertness >= 4 ? 'Above' : 'Near'} personal baseline</small>
            </div>
            <div>
              <span>FATIGUE</span>
              <b>{fatigue} / 5</b>
              <small>{fatigue > 3 ? 'Higher than' : 'Near'} 7-day average</small>
            </div>
            <div>
              <span>STRESS</span>
              <b>{stress} / 5</b>
              <small>{stress <= 2 ? 'Below' : 'Near'} recent baseline</small>
            </div>
            <div>
              <span>SLEEP</span>
              <b>5h 42m</b>
              <small>−1h 18m from usual duration</small>
            </div>
          </div>
          <div className="checkin-trend-card">
            <div>
              <span className="eyebrow">SUBJECTIVE TREND · 7 DAYS</span>
              <h3>Alertness, fatigue & stress</h3>
            </div>
            <div className="checkin-trend-lines">
              <svg viewBox="0 0 420 90" preserveAspectRatio="none">
                <path className="trend-grid" d="M0 20H420M0 45H420M0 70H420" />
                <polyline
                  className="alertness-line"
                  points={`0,50 70,44 140,39 210,43 280,34 350,41 420,${72 - alertness * 10}`}
                />
                <polyline
                  className="fatigue-line"
                  points={`0,35 70,40 140,38 210,47 280,51 350,45 420,${20 + fatigue * 10}`}
                />
              </svg>
              <div>
                <span>
                  <i className="teal" />
                  Alertness
                </span>
                <span>
                  <i className="orange" />
                  Fatigue
                </span>
              </div>
            </div>
          </div>
          <p className="checkin-nondiagnostic">
            Personal comparisons support self-awareness only and are not medical diagnoses or risk
            scores.
          </p>
        </div>
        <div className="modal-footer">
          <button className="primary-button" onClick={onClose}>
            Return to dashboard
          </button>
        </div>
      </>
    )
  }

  const isMorning = flow === 'morning'
  const progress = isMorning ? ((step + 1) / morningQuestionCount) * 100 : 100
  return (
    <>
      <div className="checkin-progress">
        <div>
          <span>
            {isMorning ? `Question ${step + 1} of ${morningQuestionCount}` : 'Evening check-in'}
          </span>
          <b>{Math.round(progress)}%</b>
        </div>
        <i>
          <span style={{ width: `${progress}%` }} />
        </i>
      </div>
      <div className={`modal-body ${isMorning ? 'morning-question-body' : 'evening-checkin-body'}`}>
        {isMorning ? (
          <>
            {step === 0 && (
              <div className="measured-sleep">
                <Icon name="trend" size={16} />
                <div>
                  <span>MEASURED SLEEP DURATION</span>
                  <b>5h 42m</b>
                </div>
                <small>Wearable · synced 06:12</small>
              </div>
            )}
            {step < morningQuestions.length && currentMorning ? (
              <>
                <div className="single-question">
                  <span className="question-number">0{step + 1}</span>
                  <h3>{currentMorning.title}</h3>
                  <p>{currentMorning.support}</p>
                </div>
                <div className="large-answer-scale">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      className={answers[currentMorning.field] === value ? 'active' : ''}
                      onClick={() => chooseAnswer(currentMorning.field, value)}
                      key={value}
                    >
                      <strong>{value}</strong>
                      <span>
                        {value === 1
                          ? currentMorning.low
                          : value === 5
                            ? currentMorning.high
                            : value === 3
                              ? 'Moderate'
                              : ''}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="discomfort-question">
                <div className="single-question">
                  <span className="question-number">0{morningQuestionCount}</span>
                  <h3>Are you experiencing physical discomfort?</h3>
                  <p>Include headache, nausea, soreness, or other symptoms.</p>
                </div>
                <div className="binary-answer-row">
                  <button
                    className={hasPhysicalDiscomfort === true ? 'active' : ''}
                    onClick={() => {
                      setHasPhysicalDiscomfort(true)
                      setError('')
                    }}
                  >
                    Yes
                  </button>
                  <button
                    className={hasPhysicalDiscomfort === false ? 'active' : ''}
                    onClick={() => {
                      setHasPhysicalDiscomfort(false)
                      setDiscomfortDescription('')
                      setError('')
                    }}
                  >
                    No
                  </button>
                </div>
                {hasPhysicalDiscomfort && (
                  <label className="discomfort-description">
                    <span>Please describe your discomfort.</span>
                    <textarea
                      value={discomfortDescription}
                      maxLength={500}
                      onChange={(event) => setDiscomfortDescription(event.target.value)}
                      placeholder="Describe the location, sensation, and when it began."
                    />
                    <small>{discomfortDescription.length} / 500</small>
                  </label>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="evening-intro">
              <h3>How was your day?</h3>
              <p>Use the compact 1–5 scales. You can skip any item.</p>
            </div>
            <div className="evening-slider-list">
              {eveningQuestions.map((question) => (
                <div className="evening-slider" key={question.field}>
                  <div>
                    <b>{question.title}</b>
                    <span>{question.low}</span>
                  </div>
                  <div>
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        className={answers[question.field] === value ? 'active' : ''}
                        onClick={() => chooseAnswer(question.field, value)}
                        key={value}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                  <span>{question.high}</span>
                </div>
              ))}
            </div>
          </>
        )}
        <div className="checkin-privacy">
          <div>
            <Icon name="lock" size={14} />
            <span>
              <b>Privacy</b>
              <small>Answers are never shown publicly.</small>
            </span>
          </div>
          <select
            value={privacyLevel}
            onChange={(event) => setPrivacyLevel(event.target.value as 'private' | 'crew-medical')}
          >
            <option value="private">Private health record</option>
            <option value="crew-medical">Share summary with crew medical</option>
          </select>
        </div>
        {error && <p className="checkin-error">{error}</p>}
      </div>
      <div className="modal-footer checkin-footer">
        <button
          className="secondary-button"
          onClick={() => (isMorning && step > 0 ? setStep(step - 1) : setFlow('choose'))}
        >
          Back
        </button>
        {(!isMorning || step < morningQuestionCount - 1) && (
          <button
            className="checkin-skip"
            onClick={() =>
              isMorning && step < morningQuestionCount - 1 ? setStep(step + 1) : onClose()
            }
          >
            Skip
          </button>
        )}
        {isMorning && step < morningQuestionCount - 1 ? (
          <button className="primary-button" onClick={() => setStep(step + 1)}>
            Next
          </button>
        ) : (
          <button
            className="primary-button"
            disabled={isPending || (isMorning && hasPhysicalDiscomfort === null)}
            onClick={() => submit(isMorning ? 'morning' : 'evening')}
          >
            {isPending ? 'Saving…' : 'Submit check-in'}
          </button>
        )}
      </div>
    </>
  )
}
