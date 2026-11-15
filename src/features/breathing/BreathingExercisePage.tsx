/**
 * Guided breathing exercise: timed inhale / hold / exhale phases with optional
 * ambient sound (Web Audio) and spoken cues (Speech Synthesis).
 */

import { useEffect, useRef, useState } from 'react'
import { Icon } from '../../shared/components/Icon'
import { PageTitle } from '../../shared/components/PageTitle'
import { HumanBreathingFigure } from './HumanBreathingFigure'
import { breathingPatterns, breathingThemeMeta, type BreathingMode, type BreathingScene } from './breathing-config'

/** Guided breathing exercise page. */
export function BreathingExercisePage() {
  const [theme, setTheme] = useState<BreathingScene>('forest')
  const [mode, setMode] = useState<BreathingMode>('Calm')
  const [duration, setDuration] = useState(3)
  const [running, setRunning] = useState(false)
  const [started, setStarted] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [phase, setPhase] = useState(0)
  const [phaseSeconds, setPhaseSeconds] = useState(4)
  const [sessionRemaining, setSessionRemaining] = useState(180)
  const [breaths, setBreaths] = useState(0)
  const [soundOn, setSoundOn] = useState(true)
  const [voiceOn, setVoiceOn] = useState(true)
  const [volume, setVolume] = useState(42)
  const [moodBefore, setMoodBefore] = useState(3)
  const [moodAfter, setMoodAfter] = useState<number | null>(null)
  const audioRef = useRef<{
    context: AudioContext
    oscillator: OscillatorNode
    gain: GainNode
  } | null>(null)

  const pattern = breathingPatterns[mode]
  const phaseNames = ['Inhale', 'Hold', 'Exhale']
  const totalSeconds = duration * 60
  const progress = Math.min(100, ((totalSeconds - sessionRemaining) / totalSeconds) * 100)

  const stopAmbient = () => {
    const audio = audioRef.current
    if (audio) {
      audio.gain.gain.setTargetAtTime(0, audio.context.currentTime, 0.08)
      window.setTimeout(() => void audio.context.close(), 150)
      audioRef.current = null
    }
  }

  const startAmbient = () => {
    if (!soundOn || audioRef.current) return
    const AudioContextClass = window.AudioContext
    const context = new AudioContextClass()
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    const frequencies: Record<BreathingScene, number> = {
      ball: 174,
      forest: 196,
      waves: 110,
      galaxy: 220,
    }
    oscillator.type = theme === 'galaxy' ? 'sine' : theme === 'waves' ? 'triangle' : 'sine'
    oscillator.frequency.value = frequencies[theme]
    gain.gain.value = (volume / 100) * 0.045
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start()
    audioRef.current = { context, oscillator, gain }
  }

  const speak = (message: string) => {
    if (!voiceOn || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(message)
    utterance.rate = 0.76
    utterance.volume = volume / 100
    window.speechSynthesis.speak(utterance)
  }

  const finishSession = () => {
    setRunning(false)
    setCompleted(true)
    stopAmbient()
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
  }

  const beginSession = () => {
    if (!started || sessionRemaining <= 0) {
      setSessionRemaining(totalSeconds)
      setBreaths(0)
      setPhase(0)
      setPhaseSeconds(pattern[0])
      setCompleted(false)
      setMoodAfter(null)
    }
    setStarted(true)
    setRunning(true)
    startAmbient()
    speak('Inhale')
  }

  useEffect(() => {
    if (!running) return
    const interval = window.setInterval(() => {
      setSessionRemaining((current) => {
        if (current <= 1) {
          window.setTimeout(finishSession, 0)
          return 0
        }
        return current - 1
      })
      setPhaseSeconds((current) => {
        if (current > 1) return current - 1
        const nextPhase = (phase + 1) % 3
        if (phase === 2) setBreaths((count) => count + 1)
        setPhase(nextPhase)
        window.setTimeout(() => speak(phaseNames[nextPhase]), 0)
        return pattern[nextPhase]
      })
    }, 1000)
    return () => window.clearInterval(interval)
  }, [running, phase, pattern, voiceOn, volume])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.gain.gain.setTargetAtTime(
        soundOn ? (volume / 100) * 0.045 : 0,
        audioRef.current.context.currentTime,
        0.08,
      )
    }
  }, [volume, soundOn])

  useEffect(() => {
    if (!running) return
    stopAmbient()
    startAmbient()
  }, [theme])

  useEffect(() => () => stopAmbient(), [])

  const selectDuration = (minutes: number) => {
    if (running) return
    setDuration(minutes)
    setSessionRemaining(minutes * 60)
    setStarted(false)
    setCompleted(false)
  }

  const pause = () => {
    setRunning(false)
    stopAmbient()
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
  }

  return (
    <div className={`breathing-page breathing-theme-${theme}`}>
      <PageTitle
        kicker="WELLNESS TOOL · PRIVATE SESSION"
        title="Breathing Exercise"
        description="A guided reset to regulate breathing, reduce stress, and recover focus."
        action={
          <div className="breathing-session-status">
            <i className={running ? 'active' : ''} />
            {running
              ? 'Session in progress'
              : completed
                ? 'Session complete'
                : 'Ready when you are'}
          </div>
        }
      />
      <div className="breathing-immersive-layout">
        <section className="breathing-stage">
          <div className="breathing-photo-layer" />
          <div className="breathing-vignette" />
          <div className="breathing-stage-top">
            <span>{breathingThemeMeta[theme].label.toUpperCase()} ENVIRONMENT</span>
            <span>
              {mode} · {duration} min
            </span>
          </div>
          <div className="human-guide">
            <HumanBreathingFigure phase={phase} running={running} />
            <div className={`breath-pulse phase-${phase} ${running ? 'active' : ''}`}>
              <div>
                <span>
                  {running ? phaseNames[phase] : completed ? 'Complete' : 'Get comfortable'}
                </span>
                <strong>{running ? phaseSeconds : completed ? breaths : pattern[0]}</strong>
                <small>
                  {running
                    ? `${pattern[0]}s inhale · ${pattern[1]}s hold · ${pattern[2]}s exhale`
                    : completed
                      ? 'breaths completed'
                      : 'Follow the breathing rhythm'}
                </small>
              </div>
            </div>
          </div>
          <div className="breathing-stage-bottom">
            <div>
              <span>SESSION PROGRESS</span>
              <b>
                {Math.floor(sessionRemaining / 60)}:{String(sessionRemaining % 60).padStart(2, '0')}
              </b>
            </div>
            <div className="session-progress">
              <i style={{ width: `${progress}%` }} />
            </div>
            <div>
              <span>BREATHS</span>
              <b>{breaths}</b>
            </div>
          </div>
          <small className="theme-credit">{breathingThemeMeta[theme].credit}</small>
        </section>

        <aside className="breathing-control-panel">
          <section>
            <div className="control-title">
              <div>
                <span className="eyebrow">ENVIRONMENT</span>
                <h3>Choose your space</h3>
              </div>
            </div>
            <div className="breathing-theme-grid">
              {(['forest', 'waves', 'galaxy', 'ball'] as BreathingScene[]).map((item) => (
                <button
                  className={theme === item ? 'active' : ''}
                  onClick={() => setTheme(item)}
                  key={item}
                >
                  <i className={`theme-thumb ${item}`} />
                  <span>
                    {breathingThemeMeta[item].label}
                    <small>{breathingThemeMeta[item].sound}</small>
                  </span>
                  {theme === item && <Icon name="check" size={13} />}
                </button>
              ))}
            </div>
          </section>

          <section>
            <div className="control-title">
              <div>
                <span className="eyebrow">SESSION</span>
                <h3>Breathing mode</h3>
              </div>
            </div>
            <div className="breathing-mode-grid">
              {(Object.keys(breathingPatterns) as BreathingMode[]).map((item) => (
                <button
                  className={mode === item ? 'active' : ''}
                  disabled={running}
                  onClick={() => {
                    setMode(item)
                    setPhaseSeconds(breathingPatterns[item][0])
                  }}
                  key={item}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="session-length-row">
              <span>LENGTH</span>
              <div>
                {[1, 3, 5, 10].map((minutes) => (
                  <button
                    className={duration === minutes ? 'active' : ''}
                    disabled={running}
                    onClick={() => selectDuration(minutes)}
                    key={minutes}
                  >
                    {minutes}m
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section>
            <div className="control-title">
              <div>
                <span className="eyebrow">SOUND</span>
                <h3>Ambient support</h3>
              </div>
              <button
                className={`sound-master ${soundOn ? 'active' : ''}`}
                onClick={() => setSoundOn(!soundOn)}
              >
                {soundOn ? 'On' : 'Muted'}
              </button>
            </div>
            <div className="sound-row">
              <div className="sound-icon">
                <Icon name="environment" size={15} />
              </div>
              <div>
                <b>{breathingThemeMeta[theme].sound}</b>
                <span>Theme ambience</span>
              </div>
              <button className={soundOn ? 'playing' : ''} onClick={() => setSoundOn(!soundOn)}>
                {soundOn ? 'Pause' : 'Play'}
              </button>
            </div>
            <div className="sound-row">
              <div className="sound-icon voice">
                <Icon name="breath" size={15} />
              </div>
              <div>
                <b>Breathing guidance</b>
                <span>Gentle phase prompts</span>
              </div>
              <button className={voiceOn ? 'playing' : ''} onClick={() => setVoiceOn(!voiceOn)}>
                {voiceOn ? 'On' : 'Off'}
              </button>
            </div>
            <label className="volume-control">
              <span>VOLUME</span>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(event) => setVolume(Number(event.target.value))}
              />
              <b>{volume}%</b>
            </label>
          </section>

          <div className="session-actions">
            {!running ? (
              <button className="breathing-primary" onClick={beginSession}>
                {started && !completed
                  ? 'Resume session'
                  : completed
                    ? 'Start another session'
                    : 'Start session'}
              </button>
            ) : (
              <button className="breathing-primary pause" onClick={pause}>
                Pause session
              </button>
            )}
            {started && !completed && (
              <button className="breathing-end" onClick={finishSession}>
                End
              </button>
            )}
          </div>
        </aside>
      </div>

      <div className="breathing-support-row">
        <div className="support-tip">
          <i>1</i>
          <p>
            <b>Relax your shoulders</b>
            <span>Let your hands rest and soften your jaw.</span>
          </p>
        </div>
        <div className="support-tip">
          <i>2</i>
          <p>
            <b>Follow the rhythm</b>
            <span>Focus on slow, steady breaths without forcing.</span>
          </p>
        </div>
        <div className="mood-check">
          <span>{completed ? 'HOW DO YOU FEEL NOW?' : 'MOOD BEFORE SESSION'}</span>
          <div>
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                className={(completed ? moodAfter : moodBefore) === value ? 'active' : ''}
                onClick={() => (completed ? setMoodAfter(value) : setMoodBefore(value))}
                key={value}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
        <p className="breathing-disclaimer">
          For stress relief and self-regulation, not medical treatment.
        </p>
      </div>
    </div>
  )
}
