/**
 * Modal dialog that hosts the daily check-in flow or a short breathing break.
 */

import { useState } from 'react'
import { Icon } from '../../shared/components/Icon'
import type { BreathingScene } from '../breathing/breathing-config'
import { DailyCheckInFlow } from './DailyCheckInFlow'

/**
 * Wellness modal.
 *
 * @param mode        `checkin` shows the daily check-in, `breathing` a short breathing break.
 * @param onSaveScore Receives the fatigue score derived from the check-in.
 */
export function WellnessModal({
  mode,
  onClose,
  onSaveScore,
}: {
  mode: 'checkin' | 'breathing'
  onClose: () => void
  onSaveScore: (score: number) => void
}) {
  const [breathing, setBreathing] = useState(false)
  const [duration, setDuration] = useState(2)
  const [scene, setScene] = useState<BreathingScene>('ball')
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        className={`wellness-modal ${mode}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wellness-title"
      >
        <div className="modal-header">
          <div className={`modal-symbol ${mode === 'breathing' ? 'blue' : ''}`}>
            <Icon name={mode === 'checkin' ? 'heart' : 'breath'} size={20} />
          </div>
          <div>
            <span className="eyebrow">
              {mode === 'checkin' ? 'DAILY HEALTH · SELF-REPORT' : 'GUIDED RESET · PRIVATE'}
            </span>
            <h2 id="wellness-title">
              {mode === 'checkin' ? 'Daily health check-in' : 'Breathing exercise'}
            </h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close window">
            <Icon name="plus" size={18} />
          </button>
        </div>
        {mode === 'checkin' ? (
          <DailyCheckInFlow onClose={onClose} onDashboardUpdate={onSaveScore} />
        ) : (
          <>
            <div className="modal-body breathing-body">
              <div className={`breathing-scene scene-${scene} ${breathing ? 'active' : ''}`}>
                {scene === 'forest' && (
                  <div className="forest-layer">
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                  </div>
                )}
                {scene === 'waves' && (
                  <div className="wave-layer">
                    <i />
                    <i />
                    <i />
                  </div>
                )}
                {scene === 'galaxy' && (
                  <div className="galaxy-layer">
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                  </div>
                )}
                <div className="breathing-orb">
                  <div>
                    <Icon name="breath" size={25} />
                    <strong>{breathing ? 'Breathe slowly' : 'Ready'}</strong>
                    <span>{breathing ? 'Inhale · hold · exhale' : 'Follow the rhythm'}</span>
                  </div>
                </div>
              </div>
              <div className="breathing-copy">
                <h3>Box breathing</h3>
                <p>
                  Inhale for 4 seconds, hold for 4, exhale for 4, then hold for 4. Stop if you feel
                  uncomfortable.
                </p>
                <span>VISUAL ENVIRONMENT</span>
                <div className="scene-options">
                  {(
                    [
                      ['ball', 'Breathing ball'],
                      ['forest', 'Forest'],
                      ['waves', 'Sea waves'],
                      ['galaxy', 'Galaxy'],
                    ] as [BreathingScene, string][]
                  ).map(([value, label]) => (
                    <button
                      className={scene === value ? 'active' : ''}
                      onClick={() => {
                        setScene(value)
                        setBreathing(false)
                      }}
                      key={value}
                    >
                      <i className={`scene-swatch ${value}`} />
                      {label}
                    </button>
                  ))}
                </div>
                <span>SESSION LENGTH</span>
                <div className="duration-options">
                  {[1, 2, 5].map((minutes) => (
                    <button
                      className={duration === minutes ? 'active' : ''}
                      onClick={() => setDuration(minutes)}
                      key={minutes}
                    >
                      {minutes} min
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="secondary-button" onClick={onClose}>
                Close
              </button>
              <button className="primary-button" onClick={() => setBreathing(!breathing)}>
                {breathing ? 'Pause exercise' : `Begin ${duration}-minute exercise`}
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
