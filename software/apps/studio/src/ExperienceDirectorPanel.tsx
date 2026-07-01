import React, { useMemo, useState } from 'react';
import { createAuraCinematicEngine, type CinematicSurfaceRole, type CinematicThemeId } from '@aura-dcos/cinematic-engine';
import { createAuraEmotionEngine } from '@aura-dcos/emotion-engine';
import {
  createAuraExperienceDirector,
  type ExperienceDirectorState,
  type ExperienceScene,
} from '@aura-dcos/experience-director';
import { createAuraKeynoteMode } from '@aura-dcos/keynote-mode';
import { type AuraCabinContext } from '@aura-dcos/digital-twin';
import { type AuraSurface, type SurfaceState } from '@aura-dcos/surfaces';
import { type CompanionState, type DriverAttentionState } from '@aura-dcos/companion';

export interface ExperienceSceneState {
  context: AuraCabinContext;
  surfaces: AuraSurface[];
  companion: CompanionState;
  driverAttention: DriverAttentionState;
}

interface ExperienceDirectorPanelProps {
  baseState: ExperienceSceneState;
  onApplyScene: (scene: ExperienceScene, state: ExperienceSceneState) => void;
  onEvent?: (type: string, message: string) => void;
}

const cinematicSurfaces: CinematicSurfaceRole[] = ['dashboard', 'roof', 'projection', 'floor'];

function driverAttentionFromDirective(value: string): DriverAttentionState {
  if (value === 'parked' || value === 'lowLoad' || value === 'mediumLoad' || value === 'highLoad' || value === 'critical') return value;
  return 'mediumLoad';
}

function surfaceStateFromDirective(value: string): SurfaceState {
  if (value === 'ambient' || value === 'interactive' || value === 'informative' || value === 'emergency' || value === 'off') return value;
  return 'ambient';
}

function riskFromScene(scene: ExperienceScene): 'normal' | 'elevated' | 'critical' {
  if (scene.context.driverAttention === 'critical' || scene.context.weather === 'rain' && scene.context.speedKph > 70) return 'critical';
  if (scene.context.driverAttention === 'highLoad' || scene.context.speedKph > 60) return 'elevated';
  return 'normal';
}

function applyScene(baseState: ExperienceSceneState, scene: ExperienceScene): ExperienceSceneState {
  return {
    context: {
      ...baseState.context,
      mode: scene.context.mode as AuraCabinContext['mode'],
      vehicleState: scene.context.vehicleState,
      speedKph: scene.context.speedKph,
      weather: scene.context.weather,
      occupants: scene.context.occupants,
      childPresent: scene.context.childPresent,
    },
    companion: {
      ...baseState.companion,
      mode: scene.companion.mode as CompanionState['mode'],
      mood: scene.companion.mood as CompanionState['mood'],
      message: scene.companion.message,
      animationLevel: scene.companion.animationLevel,
      allowVisualMotion: scene.companion.allowVisualMotion,
      allowSpeech: scene.companion.allowSpeech,
    },
    driverAttention: driverAttentionFromDirective(scene.context.driverAttention),
    surfaces: baseState.surfaces.map((surface) => {
      const update = scene.surfaces.find((item) => item.surfaceId === surface.id);
      return update ? { ...surface, state: surfaceStateFromDirective(update.state), energy: update.energy } : surface;
    }),
  };
}

export function ExperienceDirectorPanel({ baseState, onApplyScene, onEvent }: ExperienceDirectorPanelProps) {
  const director = useMemo(() => createAuraExperienceDirector(), []);
  const cinematic = useMemo(() => createAuraCinematicEngine(), []);
  const emotion = useMemo(() => createAuraEmotionEngine(), []);
  const keynote = useMemo(() => createAuraKeynoteMode(), []);
  const [directorState, setDirectorState] = useState<ExperienceDirectorState>(() => director.state());
  const [completedSceneIds, setCompletedSceneIds] = useState<string[]>([]);
  const scenes = useMemo(() => director.allScenes(), [director]);
  const activeScene = directorState.scene;
  const sceneRisk = riskFromScene(activeScene);
  const emotionPlan = emotion.infer({
    vehicleState: activeScene.context.vehicleState,
    speedKph: activeScene.context.speedKph,
    weather: activeScene.context.weather,
    driverAttention: activeScene.context.driverAttention,
    occupants: activeScene.context.occupants,
    childPresent: activeScene.context.childPresent,
    risk: sceneRisk,
  });
  const cinematicPlans = cinematicSurfaces.map((surfaceRole) => cinematic.render({
    theme: (emotionPlan.theme as CinematicThemeId) || activeScene.theme,
    surfaceRole,
    vehicleState: activeScene.context.vehicleState,
    speedKph: activeScene.context.speedKph,
    weather: activeScene.context.weather,
    driverAttention: activeScene.context.driverAttention,
    childPresent: activeScene.context.childPresent,
    risk: sceneRisk,
  }));
  const keynoteScore = keynote.scoreRun({
    scenes,
    completedSceneIds,
    openedOutputs: ['dashboard', 'roof', 'projection', 'floor'],
    safetyChecks: completedSceneIds.includes('rain-safety') ? 2 : 0,
    voiceChecks: completedSceneIds.includes('voice-context') ? 2 : 0,
    integrationChecks: completedSceneIds.includes('integration-ready') ? 1 : 0,
  });

  function publish(nextState: ExperienceDirectorState): void {
    setDirectorState(nextState);
    setCompletedSceneIds((previous) => Array.from(new Set([...previous, nextState.scene.id])));
    const sceneState = applyScene(baseState, nextState.scene);
    onApplyScene(nextState.scene, sceneState);
    onEvent?.('experience.scene.applied', `${nextState.scene.title}: ${nextState.scene.narration}`);
    if (nextState.scene.triggerVehicleScan) onEvent?.('experience.vehicle-scan.cue', 'Presenter cue: run Vehicle Integration Framework scan.');
    if (nextState.scene.triggerVoiceDemo) onEvent?.('experience.voice-demo.cue', 'Presenter cue: run safe and unsafe Voice Bridge prompts.');
  }

  function start(): void {
    setCompletedSceneIds([]);
    publish(director.start());
  }

  function next(): void {
    publish(director.next());
  }

  function previous(): void {
    publish(director.previous());
  }

  function pauseOrResume(): void {
    const nextState = directorState.status === 'running' ? director.pause() : director.resume();
    setDirectorState(nextState);
    onEvent?.(nextState.status === 'paused' ? 'experience.paused' : 'experience.resumed', `${nextState.status} on ${nextState.scene.title}`);
  }

  function reset(): void {
    const nextState = director.stop();
    setDirectorState(nextState);
    setCompletedSceneIds([]);
    onEvent?.('experience.reset', 'Experience Director reset to first scene.');
  }

  function jump(sceneId: string): void {
    publish(director.goTo(sceneId));
  }

  return (
    <section className="experience-director-panel">
      <div className="experience-hero-card mini-grid">
        <article>
          <p className="eyebrow">Phase STU</p>
          <h2>One-Click AURA Experience</h2>
          <p className="muted">Experience Director plus Cinematic, Emotion and Keynote intelligence.</p>
          <div className="actions two-col-actions">
            <button onClick={start}>Start AURA Experience</button>
            <button onClick={next}>Next Scene</button>
            <button onClick={previous}>Previous Scene</button>
            <button onClick={pauseOrResume}>{directorState.status === 'running' ? 'Pause' : 'Resume'}</button>
            <button onClick={reset}>Reset</button>
          </div>
        </article>
      </div>

      <div className="experience-progress integration-diagnostics ready">
        <strong>{activeScene.title}</strong>
        <span>{directorState.status} · {directorState.progressPercent}% · {Math.ceil(directorState.remainingMs / 1000)}s remaining</span>
        <meter min="0" max="100" value={directorState.progressPercent} />
      </div>

      <article className="experience-cue-card hardware-card ready">
        <strong>Narration Cue</strong>
        <p>{activeScene.narration}</p>
      </article>

      <article className="experience-cue-card hardware-card degraded">
        <strong>Presenter Cue</strong>
        <p>{activeScene.presenterCue}</p>
        <small>Next: {activeScene.nextCue}</small>
      </article>

      <div className="mini-grid">
        <article className="hardware-card ready">
          <strong>Emotion & Wellness</strong>
          <span>{emotionPlan.emotion} · {emotionPlan.theme} · {Math.round(emotionPlan.confidence * 100)}%</span>
          <small>{emotionPlan.message}</small>
          <small>{emotionPlan.actions.join(', ')}</small>
        </article>
        <article className={keynoteScore.ready ? 'hardware-card ready' : 'hardware-card degraded'}>
          <strong>Keynote Readiness</strong>
          <span>{keynoteScore.score}/100 · {keynoteScore.ready ? 'ready' : 'needs checks'}</span>
          <small>{keynoteScore.summary}</small>
          <small>{keynoteScore.recommendations[0] ?? 'All demo checks satisfied.'}</small>
        </article>
      </div>

      <div className="mini-grid">
        {cinematicPlans.map((plan) => (
          <article key={plan.surfaceRole} className={plan.safeForDriver ? 'hardware-card ready' : 'hardware-card degraded'}>
            <strong>{plan.theme.name} · {plan.surfaceRole}</strong>
            <span>{plan.motion} motion · {plan.brightness}% brightness</span>
            <small>{plan.particleLayer}</small>
          </article>
        ))}
      </div>

      <div className="experience-scene-list actions">
        {scenes.map((scene) => (
          <button className={scene.id === activeScene.id ? 'active-scene' : ''} key={scene.id} onClick={() => jump(scene.id)}>
            {scene.title} · {scene.theme}
          </button>
        ))}
      </div>
    </section>
  );
}
