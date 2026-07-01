export type ExperienceStatus = 'idle' | 'running' | 'paused' | 'completed';
export type ExperienceSceneKind = 'welcome' | 'commute' | 'voice' | 'weather' | 'safety' | 'integration' | 'vision';
export type ExperienceTheme = 'familyGlow' | 'auroraDrive' | 'oceanSerenity' | 'rainSafety' | 'galaxyLounge' | 'executiveCalm';

export interface ExperienceSurfaceDirective {
  surfaceId: string;
  state: string;
  energy: number;
  theme: ExperienceTheme;
  content: string;
}

export interface ExperienceCompanionDirective {
  mode: string;
  mood: string;
  message: string;
  allowSpeech: boolean;
  allowVisualMotion: boolean;
  animationLevel: number;
}

export interface ExperienceContextDirective {
  mode: string;
  vehicleState: 'parked' | 'driving';
  speedKph: number;
  weather: 'clear' | 'rain' | 'fog';
  occupants: number;
  childPresent: boolean;
  driverAttention: string;
}

export interface ExperienceScene {
  id: string;
  kind: ExperienceSceneKind;
  title: string;
  durationMs: number;
  theme: ExperienceTheme;
  narration: string;
  presenterCue: string;
  nextCue: string;
  context: ExperienceContextDirective;
  companion: ExperienceCompanionDirective;
  surfaces: ExperienceSurfaceDirective[];
  triggerVehicleScan?: boolean;
  triggerVoiceDemo?: boolean;
}

export interface ExperienceTimelineEvent {
  id: string;
  timestamp: string;
  type: string;
  message: string;
  sceneId?: string;
}

export interface ExperienceDirectorState {
  status: ExperienceStatus;
  sceneIndex: number;
  scene: ExperienceScene;
  progressPercent: number;
  elapsedMs: number;
  remainingMs: number;
  events: ExperienceTimelineEvent[];
}

function now(): string {
  return new Date().toISOString();
}

export const defaultAuraExperienceTimeline: ExperienceScene[] = [
  {
    id: 'welcome-awakening',
    kind: 'welcome',
    title: 'Intelligent Welcome',
    durationMs: 18000,
    theme: 'familyGlow',
    narration: 'AURA recognizes the journey before it begins. The cabin wakes gently around every occupant.',
    presenterCue: 'Open all outputs and show dashboard, roof, projection and floor waking together.',
    nextCue: 'Daily commute intelligence',
    context: { mode: 'family', vehicleState: 'parked', speedKph: 0, weather: 'clear', occupants: 3, childPresent: true, driverAttention: 'parked' },
    companion: { mode: 'visual', mood: 'friendly', message: 'Welcome back. Family mode is ready.', allowSpeech: true, allowVisualMotion: true, animationLevel: 82 },
    surfaces: [
      { surfaceId: 'dashboard', state: 'informative', energy: 76, theme: 'familyGlow', content: 'Personalized welcome' },
      { surfaceId: 'windshield', state: 'informative', energy: 62, theme: 'familyGlow', content: 'Subtle AR welcome' },
      { surfaceId: 'roof', state: 'interactive', energy: 88, theme: 'galaxyLounge', content: 'Animated family sky' },
      { surfaceId: 'floor', state: 'interactive', energy: 82, theme: 'oceanSerenity', content: 'Guided entry path' },
      { surfaceId: 'projection', state: 'interactive', energy: 86, theme: 'auroraDrive', content: 'AURA companion greeting' },
    ],
  },
  {
    id: 'commute-intelligence',
    kind: 'commute',
    title: 'Commute Intelligence',
    durationMs: 20000,
    theme: 'auroraDrive',
    narration: 'As the journey begins, AURA shifts from welcome ambience to driver-focused intelligence.',
    presenterCue: 'Highlight that driver-visible surfaces stay useful and calm.',
    nextCue: 'Voice with context',
    context: { mode: 'commute', vehicleState: 'driving', speedKph: 48, weather: 'clear', occupants: 2, childPresent: false, driverAttention: 'mediumLoad' },
    companion: { mode: 'voiceOnly', mood: 'focused', message: 'Route optimized. Driver displays remain focused.', allowSpeech: true, allowVisualMotion: false, animationLevel: 25 },
    surfaces: [
      { surfaceId: 'dashboard', state: 'informative', energy: 86, theme: 'auroraDrive', content: 'Navigation and trip intelligence' },
      { surfaceId: 'windshield', state: 'informative', energy: 82, theme: 'auroraDrive', content: 'AR route guidance' },
      { surfaceId: 'roof', state: 'ambient', energy: 42, theme: 'oceanSerenity', content: 'Calm passenger ambience' },
      { surfaceId: 'floor', state: 'ambient', energy: 34, theme: 'oceanSerenity', content: 'Low-motion guidance' },
      { surfaceId: 'projection', state: 'ambient', energy: 30, theme: 'executiveCalm', content: 'Voice-first companion' },
    ],
  },
  {
    id: 'voice-context',
    kind: 'voice',
    title: 'Voice With Context',
    durationMs: 22000,
    theme: 'executiveCalm',
    narration: 'AURA understands context, not just commands. It helps when safe and refuses distraction while driving.',
    presenterCue: 'Use Voice Bridge: ask for navigation, then ask to play a movie.',
    nextCue: 'Rain safety mode',
    context: { mode: 'business', vehicleState: 'driving', speedKph: 64, weather: 'clear', occupants: 1, childPresent: false, driverAttention: 'highLoad' },
    companion: { mode: 'voiceOnly', mood: 'focused', message: 'For your safety, video playback is not available while driving.', allowSpeech: true, allowVisualMotion: false, animationLevel: 0 },
    triggerVoiceDemo: true,
    surfaces: [
      { surfaceId: 'dashboard', state: 'informative', energy: 88, theme: 'executiveCalm', content: 'Driver-safe response' },
      { surfaceId: 'windshield', state: 'informative', energy: 84, theme: 'executiveCalm', content: 'Safe route guidance' },
      { surfaceId: 'roof', state: 'ambient', energy: 28, theme: 'executiveCalm', content: 'Reduced motion' },
      { surfaceId: 'floor', state: 'ambient', energy: 26, theme: 'executiveCalm', content: 'Subtle path' },
      { surfaceId: 'projection', state: 'ambient', energy: 18, theme: 'executiveCalm', content: 'Voice-only AURA' },
    ],
  },
  {
    id: 'rain-safety',
    kind: 'safety',
    title: 'Rain Safety Mode',
    durationMs: 20000,
    theme: 'rainSafety',
    narration: 'When conditions change, AURA adapts before the driver has to ask.',
    presenterCue: 'Show reduced motion, safety-first visuals and emergency floor path.',
    nextCue: 'Vehicle integration scan',
    context: { mode: 'safety', vehicleState: 'driving', speedKph: 82, weather: 'rain', occupants: 1, childPresent: false, driverAttention: 'critical' },
    companion: { mode: 'emergency', mood: 'emergency', message: 'Heavy rain detected. Safety mode active.', allowSpeech: true, allowVisualMotion: false, animationLevel: 0 },
    surfaces: [
      { surfaceId: 'dashboard', state: 'emergency', energy: 96, theme: 'rainSafety', content: 'Safety-critical driving information' },
      { surfaceId: 'windshield', state: 'emergency', energy: 95, theme: 'rainSafety', content: 'Hazard emphasis' },
      { surfaceId: 'roof', state: 'ambient', energy: 12, theme: 'rainSafety', content: 'Dimmed roof' },
      { surfaceId: 'floor', state: 'emergency', energy: 92, theme: 'rainSafety', content: 'Emergency path' },
      { surfaceId: 'projection', state: 'off', energy: 0, theme: 'rainSafety', content: 'Projection disabled' },
    ],
  },
  {
    id: 'integration-ready',
    kind: 'integration',
    title: 'Vehicle Integration Ready',
    durationMs: 18000,
    theme: 'executiveCalm',
    narration: 'AURA is hardware-adaptive and designed to integrate through vehicle adapters.',
    presenterCue: 'Click Scan Vehicle in the Vehicle Integration Framework panel.',
    nextCue: 'Future mobility vision',
    context: { mode: 'business', vehicleState: 'parked', speedKph: 0, weather: 'clear', occupants: 1, childPresent: false, driverAttention: 'parked' },
    companion: { mode: 'assistive', mood: 'focused', message: 'Vehicle Integration Framework ready.', allowSpeech: true, allowVisualMotion: true, animationLevel: 64 },
    triggerVehicleScan: true,
    surfaces: [
      { surfaceId: 'dashboard', state: 'informative', energy: 80, theme: 'executiveCalm', content: 'Integration diagnostics' },
      { surfaceId: 'windshield', state: 'informative', energy: 64, theme: 'executiveCalm', content: 'Adapter status' },
      { surfaceId: 'roof', state: 'ambient', energy: 48, theme: 'executiveCalm', content: 'Calm technical showcase' },
      { surfaceId: 'floor', state: 'ambient', energy: 44, theme: 'executiveCalm', content: 'Hardware scan path' },
      { surfaceId: 'projection', state: 'interactive', energy: 72, theme: 'executiveCalm', content: 'OEM integration explanation' },
    ],
  },
  {
    id: 'future-vision',
    kind: 'vision',
    title: 'Future Mobility Vision',
    durationMs: 18000,
    theme: 'galaxyLounge',
    narration: 'AURA is not a screen system. It is an intelligent experience layer for the mobility cabin.',
    presenterCue: 'Close with the positioning: one operating system, every intelligent journey.',
    nextCue: 'Experience complete',
    context: { mode: 'family', vehicleState: 'parked', speedKph: 0, weather: 'clear', occupants: 4, childPresent: true, driverAttention: 'parked' },
    companion: { mode: 'visual', mood: 'friendly', message: 'One operating system. Every intelligent journey.', allowSpeech: true, allowVisualMotion: true, animationLevel: 92 },
    surfaces: [
      { surfaceId: 'dashboard', state: 'informative', energy: 82, theme: 'galaxyLounge', content: 'AURA DCOS vision' },
      { surfaceId: 'windshield', state: 'informative', energy: 76, theme: 'galaxyLounge', content: 'Future route' },
      { surfaceId: 'roof', state: 'interactive', energy: 96, theme: 'galaxyLounge', content: 'Future mobility sky' },
      { surfaceId: 'floor', state: 'interactive', energy: 88, theme: 'oceanSerenity', content: 'Experience pathway' },
      { surfaceId: 'projection', state: 'interactive', energy: 94, theme: 'auroraDrive', content: 'AURA closing presence' },
    ],
  },
];

export class AuraExperienceDirector {
  private readonly timeline: ExperienceScene[];
  private status: ExperienceStatus = 'idle';
  private sceneIndex = 0;
  private elapsedMs = 0;
  private readonly events: ExperienceTimelineEvent[] = [];

  constructor(timeline: ExperienceScene[] = defaultAuraExperienceTimeline) {
    if (timeline.length === 0) throw new Error('Experience timeline requires at least one scene.');
    this.timeline = timeline;
  }

  start(): ExperienceDirectorState {
    this.status = 'running';
    this.sceneIndex = 0;
    this.elapsedMs = 0;
    this.record('experience.started', 'AURA Experience started.');
    return this.state();
  }

  pause(): ExperienceDirectorState {
    this.status = 'paused';
    this.record('experience.paused', `Paused on ${this.currentScene().title}.`);
    return this.state();
  }

  resume(): ExperienceDirectorState {
    this.status = 'running';
    this.record('experience.resumed', `Resumed ${this.currentScene().title}.`);
    return this.state();
  }

  stop(): ExperienceDirectorState {
    this.status = 'idle';
    this.elapsedMs = 0;
    this.record('experience.stopped', 'AURA Experience stopped.');
    return this.state();
  }

  next(): ExperienceDirectorState {
    if (this.sceneIndex >= this.timeline.length - 1) {
      this.status = 'completed';
      this.record('experience.completed', 'AURA Experience completed.');
      return this.state();
    }
    this.sceneIndex += 1;
    this.elapsedMs = 0;
    this.record('experience.scene.changed', `Advanced to ${this.currentScene().title}.`, this.currentScene().id);
    return this.state();
  }

  previous(): ExperienceDirectorState {
    this.sceneIndex = Math.max(0, this.sceneIndex - 1);
    this.elapsedMs = 0;
    this.record('experience.scene.changed', `Returned to ${this.currentScene().title}.`, this.currentScene().id);
    return this.state();
  }

  goTo(sceneId: string): ExperienceDirectorState {
    const index = this.timeline.findIndex((scene) => scene.id === sceneId);
    if (index < 0) throw new Error(`Unknown experience scene: ${sceneId}`);
    this.sceneIndex = index;
    this.elapsedMs = 0;
    this.record('experience.scene.changed', `Jumped to ${this.currentScene().title}.`, sceneId);
    return this.state();
  }

  tick(deltaMs: number): ExperienceDirectorState {
    if (this.status !== 'running') return this.state();
    this.elapsedMs += Math.max(0, deltaMs);
    while (this.elapsedMs >= this.currentScene().durationMs && this.status === 'running') {
      this.elapsedMs -= this.currentScene().durationMs;
      this.next();
    }
    return this.state();
  }

  currentScene(): ExperienceScene {
    return this.timeline[this.sceneIndex];
  }

  allScenes(): ExperienceScene[] {
    return [...this.timeline];
  }

  state(): ExperienceDirectorState {
    const scene = this.currentScene();
    const progressPercent = Math.round(((this.sceneIndex + this.elapsedMs / scene.durationMs) / this.timeline.length) * 100);
    return {
      status: this.status,
      sceneIndex: this.sceneIndex,
      scene,
      progressPercent: Math.max(0, Math.min(100, progressPercent)),
      elapsedMs: this.elapsedMs,
      remainingMs: Math.max(0, scene.durationMs - this.elapsedMs),
      events: [...this.events],
    };
  }

  private record(type: string, message: string, sceneId = this.currentScene().id): void {
    this.events.unshift({ id: `${type}-${Date.now()}-${this.events.length}`, timestamp: now(), type, message, sceneId });
    this.events.splice(30);
  }
}

export function createAuraExperienceDirector(timeline?: ExperienceScene[]): AuraExperienceDirector {
  return new AuraExperienceDirector(timeline);
}
