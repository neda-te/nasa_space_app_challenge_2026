/**
 * Mission task readiness rules.
 *
 * Rule-based, non-diagnostic mapping from current health indicators to a readiness
 * level per mission task (EVA, precision maintenance, critical operations, ...). Indicator values are SIMULATED except
 * for the fatigue score, which comes from the crew member's daily check-in.
 */

/** Readiness of the crew member for a mission task. */
export type ReadinessLevel = 'Normal' | 'Caution' | 'High caution'

/** A mission task together with its readiness assessment. */
type MissionTask = {
  id: string
  title: string
  subtitle: string
  icon: string
  level: ReadinessLevel
  statusCopy: string
  metrics: [string, string, string][]
  concerns: string[]
  why: string
  actions: string[]
  sources: string
}

/**
 * Builds the readiness assessment for every mission task.
 *
 * @param dailyScore Fatigue score (1-10) from the daily check-in; falls back to a demo value when `null`.
 */
export function getMissionTasks(dailyScore: number | null): MissionTask[] {
  const fatigue = dailyScore ?? 5.8
  const fatigueHigh = fatigue >= 7
  const fatigueModerate = fatigue >= 5

  return [
    {
      id: 'eva',
      title: 'EVA / Spacewalk',
      subtitle: 'External vehicle activity · 3h 40m planned',
      icon: 'environment',
      level: 'High caution',
      statusCopy: 'Elevated radiation exposure requires mission review.',
      metrics: [
        ['Accumulated dose', '+8% this week', 'Monitor'],
        ['Reaction time', '284 ms', '+18% slower'],
        ['Fatigue', `${fatigue} / 10`, fatigueHigh ? 'High' : 'Moderate'],
      ],
      concerns: [
        'Weekly radiation exposure is above the personal planning baseline.',
        'Slower reaction time may reduce response margin during complex EVA procedures.',
      ],
      why: 'EVA combines radiation exposure, time-critical decisions, and sustained physical demand. The indicators are shown together for planning and do not establish medical causation.',
      actions: [
        'Review current dose projection with flight medical and radiation teams.',
        'Consider a shorter EVA window or crew reassignment.',
        'Repeat the reaction-time test before suit-up.',
      ],
      sources: 'Dosimeter · periodic cognitive test · daily check-in',
    },
    {
      id: 'precision',
      title: 'Precision Maintenance',
      subtitle: 'Guidance assembly calibration · fine motor work',
      icon: 'settings',
      level: 'Caution',
      statusCopy: 'Sleep and reaction trends may affect precision.',
      metrics: [
        ['Sleep', '5h 42m', '−1h 18m'],
        ['Reaction time', '284 ms', '+18% slower'],
        ['Heart rate', '62 bpm', 'Normal'],
      ],
      concerns: [
        'Sleep duration is below the 14-day personal range.',
        'Reaction time is slower than baseline during today’s periodic test.',
      ],
      why: 'Fine motor calibration benefits from sustained attention and consistent response speed. Current values suggest additional verification is appropriate.',
      actions: [
        'Use a two-person verification checklist.',
        'Schedule the task after a recovery break if timing allows.',
        'Pause and reassess if attention feels reduced.',
      ],
      sources: 'Wearable · periodic cognitive test · continuous sensor',
    },
    {
      id: 'critical',
      title: 'Critical Operations',
      subtitle: 'Docking and contingency response readiness',
      icon: 'trend',
      level: fatigueHigh ? 'High caution' : 'Caution',
      statusCopy: fatigueHigh
        ? 'High fatigue adds risk to time-critical decisions.'
        : 'Slower response speed warrants additional safeguards.',
      metrics: [
        ['Reaction time', '284 ms', '+18% slower'],
        ['Attention', '92 / 100', 'In range'],
        ['Fatigue', `${fatigue} / 10`, fatigueHigh ? 'High' : 'Moderate'],
      ],
      concerns: [
        'Response speed is outside the current personal baseline.',
        fatigueHigh
          ? 'The latest check-in reports high subjective fatigue.'
          : 'Subjective fatigue should be monitored through the shift.',
      ],
      why: 'Critical operations depend on rapid response and reliable attention. A second qualified crew member provides additional operational margin.',
      actions: [
        'Assign a second operator for verification.',
        'Repeat readiness checks before the operation.',
        'Escalate any further decline to flight medical.',
      ],
      sources: 'Periodic cognitive test · daily check-in',
    },
    {
      id: 'physical',
      title: 'Physical Work',
      subtitle: 'Cargo transfer and resistance exercise',
      icon: 'heart',
      level: fatigueHigh ? 'High caution' : fatigueModerate ? 'Caution' : 'Normal',
      statusCopy: fatigueHigh
        ? 'Current fatigue supports reducing workload.'
        : fatigueModerate
          ? 'Current fatigue supports paced activity.'
          : 'Current indicators support planned activity.',
      metrics: [
        ['Fatigue', `${fatigue} / 10`, fatigueHigh ? 'High' : fatigueModerate ? 'Moderate' : 'Low'],
        ['Heart rate', '62 bpm', '+2 bpm'],
        ['Activity', '8,240 steps', '94% target'],
      ],
      concerns: fatigueModerate
        ? ['Reported fatigue may reduce endurance during sustained lifting.']
        : ['No task-specific concern is currently indicated.'],
      why: 'Workload guidance responds directly to the latest daily check-in while continuous cardiovascular data remains within range.',
      actions: fatigueModerate
        ? ['Use paced work intervals.', 'Hydrate and reassess after the first transfer block.']
        : ['Continue the planned workload and standard monitoring.'],
      sources: 'Daily check-in · continuous sensor · wearable',
    },
    {
      id: 'routine',
      title: 'Routine Tasks',
      subtitle: 'Inventory, documentation, and standard checks',
      icon: 'check',
      level: 'Normal',
      statusCopy: 'No task-specific limitation is indicated.',
      metrics: [
        ['Heart rate', '62 bpm', 'Normal'],
        ['Attention', '92 / 100', 'In range'],
        ['Cabin status', 'Nominal', 'Stable'],
      ],
      concerns: ['No significant task-specific concern is indicated by current measurements.'],
      why: 'Routine work has lower physical and cognitive demand than EVA, precision maintenance, or critical operations.',
      actions: ['Proceed as planned.', 'Continue standard self-monitoring and scheduled breaks.'],
      sources: 'Continuous sensor · periodic cognitive test · environmental telemetry',
    },
  ]
}
