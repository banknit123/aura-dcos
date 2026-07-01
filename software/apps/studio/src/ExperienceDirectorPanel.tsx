import React, { useMemo, useState } from 'react';
import { type AuraCabinContext } from '@aura-dcos/digital-twin';
import { type AuraSurface, type SurfaceState } from '@aura-dcos/surfaces';
import { type CompanionState, type DriverAttentionState } from '@aura-dcos/companion';

export interface ExperienceSceneState {
  context: AuraCabinContext;
  surfaces: AuraSurface[];
  companion: CompanionState;
  driverAttention: DriverAttentionState;
}

export interface ExperienceScene {
  id: string;
  title: string;
  durationSeconds: number;
  narratorCue: string;
  presenterCue: string;
  context: Partial<AuraCabinContext>;
  companion: Partial<CompanionState>;
  driverAttention: DriverAttentionState;
  surfaceUpdates: Array<{ id: string; state: SurfaceState; energy: number }>;
}

interface ExperienceDirectorPanelProps {
  baseState: ExperienceSceneState;
  onApplyScene: (scene: ExperienceScene, state: ExperienceSceneState) => void;
  onEvent?: (type: string, message: string) => void;
}

const scenes: ExperienceScene[] = [
  {
    id: 'welcome-awakening',
    title: '1. Intelligent Welcome',
    durationSeconds: 18,
    narratorCue: 'AURA recognizes the journey before it begins. The cabin wakes gently around every occupant.',
    presenterCue: 'Open Dashboard, Roof, Projection and Floor outputs before starting for maximum impact.',
    context: { mode: 'family', vehicleState: 'parked', speedKph: 0, weather: 'clear', occupants: 3, childPresent: true },
    companion: { mood: 'friendly', mode: 'visual', message: 'Welcome back. Family mode is ready.', animationLevel: 82, allowVisualMotion: true, allowSpeech: true },
    driverAttention: 'parked',
    surfaceUpdates: [
      { id: 'dashboard', state: 'informative', energy: 76 },
      { id: 'windshield', state: 'informative', energy: 62 },
      { id: 'roof', state: 'interactive', energy: 88 },
      { id: 'floor', state: 'interactive', energy: 82 },
      { id: 'projection', state: 'interactive', energy: 86 },
    ],
  },
  {
    id: 'commute-flow',
    title: '2. Commute Intelligence',
    durationSeconds: 20,
    narratorCue: 'As the journey begins, AURA shifts from welcome ambience to driver-focused intelligence.',
    presenterCue: 'Point out that driver-visible displays become useful, not distracting.',
    context: { mode: 'commute', vehicleState: 'driving', speedKph: 48, weather: 'clear', occupants: 2, childPresent: false },
    companion: { mood: 'focused', mode: 'voiceOnly', message: 'Route optimized. Driver displays remain focused.', animationLevel: 25, allowVisualMotion: false, allowSpeech: true },
    driverAttention: 'mediumLoad',
    surfaceUpdates: [
      { id: 'dashboard', state: 'informative', energy: 86 },
      { id: 'windshield', state: 'informative', energy: 82 },
      { id: 'roof', state: 'ambient', energy: 42 },
      { id: 'floor', state: 'ambient', energy: 34 },
      { id: 'projection', state: 'ambient', energy: 30 },
    ],
  },
  {
    id: 'voice-safety',
    title: '3. Voice With Context',
    durationSeconds: 22,
    narratorCue: 'AURA understands context, not just commands. It helps when safe and refuses distraction while driving.',
    presenterCue: 'Use Voice Bridge after this scene: ask for navigation, then ask to play a movie.',
    context: { mode: 'business', vehicleState: 'driving', speedKph: 64, weather: 'clear', occupants: 1, childPresent: false },
    companion: { mood: 'focused', mode: 'voiceOnly', message: 'For your safety, video playback is not available while driving.', animationLevel: 0, allowVisualMotion: false, allowSpeech: true },
    driverAttention: 'highLoad',
    surfaceUpdates: [
      { id: 'dashboard', state: 'informative', energy: 88 },
      { id: 'windshield', state: 'informative', energy: 84 },
      { id: 'roof', state: 'ambient', energy: 28 },
      { id: 'floor', state: 'ambient', energy: 26 },
      { id: 'projection', state: 'ambient', energy: 18 },
    ],
  },
  {
    id: 'rain-safety',
    title: '4. Rain Safety Mode',
    durationSeconds: 20,
    narratorCue: 'When conditions change, AURA adapts before the driver has to ask.',
    presenterCue: 'Watch the cabin reduce motion and prioritize emergency-ready surfaces.',
    context: { mode: 'safety', vehicleState: 'driving', speedKph: 82, weather: 'rain', occupants: 1, childPresent: false },
    companion: { mood: 'emergency', mode: 'emergency', message: 'Heavy rain detected. Safety mode active.', animationLevel: 0, allowVisualMotion: false, allowSpeech: true },
    driverAttention: 'critical',
    surfaceUpdates: [
      { id: 'dashboard', state: 'emergency', energy: 96 },
      { id: 'windshield', state: 'emergency', energy: 95 },
      { id: 'roof', state: 'ambient', energy: 12 },
      { id: 'floor', state: 'emergency', energy: 92 },
      { id: 'projection', state: 'off', energy: 0 },
    ],
  },
  {
    id: 'future-vision',
    title: '5. Future Mobility Vision',
    durationSeconds: 18,
    narratorCue: 'AURA is not a screen system. It is an intelligent experience layer for the mobility cabin.',
    presenterCue: 'Close by showing Vehicle Integration Framework and Scan Vehicle.',
    context: { mode: 'family', vehicleState: 'parked', speedKph: 0, weather: 'clear', occupants: 4, childPresent: true },
    companion: { mood: 'friendly', mode: 'visual', message: 'One operating system. Every intelligent journey.', animationLevel: 92, allowVisualMotion: true, allowSpeech: true },
    driverAttention: 'parked',
    surfaceUpdates: [
      { id: 'dashboard', state: 'informative', energy: 82 },
      { id: 'windshield', state: 'informative', energy: 76 },
      { id: 'roof', state: 'interactive', energy: 96 },
      { id: 'floor', state: 'interactive', energy: 88 },
      { id: 'projection', state: 'interactive', energy: 94 },
    ],
  },
];

function applyScene(baseState: ExperienceSceneState, scene: ExperienceScene): ExperienceSceneState {
  return {
    context: { ...baseState.context, ...scene.context },
    companion: { ...baseState.companion, ...scene.companion },
    driverAttention: scene.driverAttention,
    surfaces: baseState.surfaces.map((surface) => {
      const update = scene.surfaceUpdates.find((item) => item.id === surface.id);
      return update ? { ...surface, state: update.state, energy: update.energy } : surface;
    }),
  };
}

export function ExperienceDirectorPanel({ baseState, onApplyScene, onEvent }: ExperienceDirectorPanelProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const activeScene = scenes[activeIndex];
  const progress = useMemo(() => Math.round(((activeIndex + 1) / scenes.length) * 100), [activeIndex]);

  function apply(index: number, autoRun = false): void {
    const scene = scenes[index];
    if (!scene) return;
    const state = applyScene(baseState, scene);
    setActiveIndex(index);
    setRunning(autoRun);
    onApplyScene(scene, state);
    onEvent?.('experience.scene.applied', `${scene.title}: ${scene.narratorCue}`);
  }

  function start(): void {
    apply(0, true);
  }

  function next(): void {
    const nextIndex = activeIndex >= scenes.length - 1 ? 0 : activeIndex + 1;
    apply(nextIndex, running);
  }

  function pause(): void {
    setRunning(false);
    onEvent?.('experience.paused', `Paused on ${activeScene.title}`);
  }

  function reset(): void {
    setRunning(false);
    setActiveIndex(0);
    onEvent?.('experience.reset', 'Experience Director reset to first scene.');
  }

  return (
    <section className="experience-director-panel">
      <div className="experience-hero-card">
        <p className="eyebrow">Phase S</p>
        <h2>One-Click AURA Experience</h2>
        <p className="muted">A guided customer demo that choreographs Digital Twin, Companion and cabin surfaces into a premium story.</p>
        <div className="experience-actions">
          <button onClick={start}>Start AURA Experience</button>
          <button onClick={next}>Next Scene</button>
          <button onClick={pause} disabled={!running}>Pause</button>
          <button onClick={reset}>Reset</button>
        </div>
      </div>

      <div className="experience-progress">
        <span>{activeScene.title}</span>
        <strong>{progress}%</strong>
        <meter min="0" max="100" value={progress} />
      </div>

      <article className="experience-cue-card">
        <strong>Narration Cue</strong>
        <p>{activeScene.narratorCue}</p>
      </article>

      <article className="experience-cue-card presenter">
        <strong>Presenter Cue</strong>
        <p>{activeScene.presenterCue}</p>
      </article>

      <div className="experience-scene-list">
        {scenes.map((scene, index) => (
          <button className={index === activeIndex ? 'active-scene' : ''} key={scene.id} onClick={() => apply(index, false)}>
            {scene.title}
            <small>{scene.durationSeconds}s</small>
          </button>
        ))}
      </div>
    </section>
  );
}
