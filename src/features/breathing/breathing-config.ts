/**
 * Scenes and breathing patterns of the guided breathing exercise.
 */

/** Visual scene of the breathing exercise. */
export type BreathingScene = 'ball' | 'forest' | 'waves' | 'galaxy'

/** Breathing programme. */
export type BreathingMode = 'Calm' | 'Focus' | 'Sleep' | 'Stress relief'

/** Label, sound name and image credit per scene. */
export const breathingThemeMeta: Record<BreathingScene, { label: string; sound: string; credit: string }> =
  {
    ball: { label: 'Minimal', sound: 'Soft tone', credit: 'Minimal focus environment' },
    forest: {
      label: 'Forest',
      sound: 'Forest sound',
      credit: 'Photo: Marita Kavelashvili · Unsplash',
    },
    waves: { label: 'Ocean', sound: 'Ocean waves', credit: 'Photo: Thomas Vimare · Unsplash' },
    galaxy: {
      label: 'Galaxy',
      sound: 'Galaxy ambient',
      credit: 'Photo: Daniele Levis Pelusi · Unsplash',
    },
  }

/** Phase durations in seconds per programme: [inhale, hold, exhale]. */
export const breathingPatterns: Record<BreathingMode, [number, number, number]> = {
  Calm: [4, 4, 6],
  Focus: [4, 2, 4],
  Sleep: [4, 4, 8],
  'Stress relief': [4, 2, 6],
}
