import { createAnimationEngine, type AnimationInstruction } from '@aura-dcos/animation-engine';
import { createCabinSyncStore } from '@aura-dcos/cabin-sync';
import { createDisplayRouter } from '@aura-dcos/display-router';
import { createSceneEngine, type SceneDefinition } from '@aura-dcos/scenes';

export type StudioSceneId = 'welcome' | 'commute' | 'businessRain' | 'emergency';

export interface StudioCabinState extends Record<string, unknown> {
  scene: StudioSceneId;
  risk: 'normal' | 'elevated' | 'critical';
  speedKph: number;
  mode: string;
}

export function createStudioOrchestration() {
  const sync = createCabinSyncStore<StudioCabinState>({
    scene: 'welcome',
    risk: 'normal',
    speedKph: 0,
    mode: 'family',
  });

  const scenes = createSceneEngine();
  const router = createDisplayRouter();
  const animation = createAnimationEngine();

  const sceneDefinitions: SceneDefinition[] = [
    {
      id: 'welcome',
      name: 'Welcome',
      description: 'Entry and family welcome state',
      steps: [
        { target: 'dashboard', action: 'showWelcome', delayMs: 0, durationMs: 800 },
        { target: 'roof', action: 'softAmbient', delayMs: 100, durationMs: 1200 },
        { target: 'floor', action: 'entryPath', delayMs: 0, durationMs: 1000 },
        { target: 'projection', action: 'auraAppear', delayMs: 400, durationMs: 1000 },
      ],
    },
    {
      id: 'commute',
      name: 'Commute',
      description: 'Driver-first low distraction state',
      steps: [
        { target: 'dashboard', action: 'showDrivingCluster', delayMs: 0, durationMs: 500 },
        { target: 'roof', action: 'dim', delayMs: 0, durationMs: 700 },
        { target: 'projection', action: 'voiceOnly', delayMs: 100, durationMs: 400 },
      ],
    },
    {
      id: 'businessRain',
      name: 'Business Rain',
      description: 'Higher workload rainy driving state',
      steps: [
        { target: 'dashboard', action: 'showSafetyFocus', delayMs: 0, durationMs: 500 },
        { target: 'roof', action: 'minimalAmbient', delayMs: 0, durationMs: 700 },
        { target: 'projection', action: 'reducedMotion', delayMs: 0, durationMs: 400 },
      ],
    },
    {
      id: 'emergency',
      name: 'Emergency',
      description: 'Critical safety state across all outputs',
      steps: [
        { target: 'dashboard', action: 'emergencyCluster', delayMs: 0, durationMs: 250 },
        { target: 'roof', action: 'safetyDim', delayMs: 0, durationMs: 250 },
        { target: 'floor', action: 'exitPath', delayMs: 0, durationMs: 250 },
        { target: 'projection', action: 'voiceOnlyEmergency', delayMs: 0, durationMs: 250 },
      ],
    },
  ];

  for (const scene of sceneDefinitions) scenes.register(scene);

  router.registerTarget({ id: 'controller-window', role: 'controller', name: 'Controller', available: true });
  router.registerTarget({ id: 'dashboard-window', role: 'dashboard', name: 'Dashboard Output', available: true });
  router.registerTarget({ id: 'roof-window', role: 'roof', name: 'Roof Output', available: true });
  router.registerTarget({ id: 'projection-window', role: 'projection', name: 'Projection Output', available: true });
  router.registerTarget({ id: 'floor-window', role: 'floor', name: 'Floor Output', available: true });

  const baseAnimations: AnimationInstruction[] = [
    { id: 'roof-energy', target: 'roof', property: 'energy', from: 20, to: 80, durationMs: 1200, delayMs: 0, easing: 'easeInOut' },
    { id: 'projection-opacity', target: 'projection', property: 'opacity', from: 0, to: 1, durationMs: 900, delayMs: 200, easing: 'easeOut' },
  ];

  return {
    sync,
    scenes,
    router,
    animation,
    baseAnimations,
  };
}
