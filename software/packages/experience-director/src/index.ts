export type ExperienceStatus = 'idle' | 'running' | 'paused' | 'completed';
export type ExperienceSceneKind = 'welcome' | 'commute' | 'voice' | 'weather' | 'safety' | 'integration' | 'vision' | 'theme';
export type ExperienceTheme =
  | 'familyGlow'
  | 'auroraDrive'
  | 'oceanSerenity'
  | 'rainSafety'
  | 'galaxyLounge'
  | 'executiveCalm'
  | 'forestRetreat'
  | 'cinemaMode'
  | 'productivityMode'
  | 'familyAdventure'
  | 'wellnessMode'
  | 'nightDrive';

export type ExperienceSurfaceRole = 'dashboard' | 'windshield' | 'roof' | 'floor' | 'projection' | 'door' | 'rearCabin';
export type ExperienceMotionLevel = 'none' | 'low' | 'medium' | 'high';
export type ExperienceAudioMood = 'silent' | 'ambient' | 'cinematic' | 'focused' | 'playful' | 'wellness';

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

export interface ExperienceThemeDescriptor {
  id: ExperienceTheme;
  name: string;
  category: 'relaxation' | 'entertainment' | 'productivity' | 'family' | 'wellness' | 'driving' | 'safety' | 'presentation';
  tagline: string;
  palette: string[];
  motion: ExperienceMotionLevel;
  audioMood: ExperienceAudioMood;
  driverVisibleSafe: boolean;
  preferredSurfaces: ExperienceSurfaceRole[];
  companionMood: string;
  companionMessage: string;
  surfaceContent: Record<ExperienceSurfaceRole, string>;
}

export interface ExperienceThemeState {
  activeThemeId: ExperienceTheme;
  previousThemeId?: ExperienceTheme;
  status: 'idle' | 'previewing' | 'transitioning' | 'active';
  transitionProgress: number;
  lastChangedAt: string;
}

export interface ExperienceTransitionPlan {
  id: string;
  fromThemeId: ExperienceTheme;
  toThemeId: ExperienceTheme;
  durationMs: number;
  easing: 'linear' | 'easeInOut' | 'cinematicFade' | 'safetyCut';
  steps: string[];
  safetyNotes: string[];
}

export interface SurfaceSynchronizationPlan {
  themeId: ExperienceTheme;
  safeForDriver: boolean;
  surfaces: Array<{ surfaceId: ExperienceSurfaceRole; state: string; energy: number; content: string; motion: ExperienceMotionLevel; brightness: number; }>;
}

export interface ExperiencePreview {
  theme: ExperienceThemeDescriptor;
  timeline: ExperienceScene[];
  transition: ExperienceTransitionPlan;
  synchronization: SurfaceSynchronizationPlan;
  state: ExperienceThemeState;
}

function now(): string { return new Date().toISOString(); }

const content = (dashboard: string, windshield: string, roof: string, floor: string, projection: string, door: string, rearCabin: string): Record<ExperienceSurfaceRole, string> => ({ dashboard, windshield, roof, floor, projection, door, rearCabin });

export const auraThemeRegistry: Record<ExperienceTheme, ExperienceThemeDescriptor> = {
  oceanSerenity: { id: 'oceanSerenity', name: 'Ocean Serenity', category: 'relaxation', tagline: 'A calm blue cabin with wave-like motion across passenger surfaces.', palette: ['deep navy', 'aqua', 'teal', 'soft cyan'], motion: 'medium', audioMood: 'ambient', driverVisibleSafe: true, preferredSurfaces: ['roof', 'floor', 'projection', 'rearCabin'], companionMood: 'calm', companionMessage: 'Ocean Serenity is active. I will keep the cabin calm and low-distraction.', surfaceContent: content('Calm journey summary', 'Low-motion route ribbon', 'Bioluminescent wave ceiling', 'Soft shoreline path', 'Fluid AURA presence', 'Aqua welcome edge', 'Passenger reef ambience') },
  galaxyLounge: { id: 'galaxyLounge', name: 'Galaxy Lounge', category: 'entertainment', tagline: 'A parked premium lounge mode with stars, nebula clouds and cinematic depth.', palette: ['black', 'deep violet', 'ice blue', 'silver'], motion: 'high', audioMood: 'cinematic', driverVisibleSafe: false, preferredSurfaces: ['roof', 'floor', 'projection', 'rearCabin'], companionMood: 'delighted', companionMessage: 'Galaxy Lounge is ready while parked. The cabin is now an immersive stargazing lounge.', surfaceContent: content('Parked lounge controls', 'Dimmed panoramic stars', 'Nebula sky field', 'Orbital light trails', 'AURA constellation guide', 'Starlight door trim', 'Deep-space theatre ambience') },
  forestRetreat: { id: 'forestRetreat', name: 'Forest Retreat', category: 'relaxation', tagline: 'Organic greens, fireflies and soft breathing light for decompression.', palette: ['deep green', 'mint', 'soft blue', 'warm white'], motion: 'medium', audioMood: 'ambient', driverVisibleSafe: true, preferredSurfaces: ['roof', 'floor', 'door', 'rearCabin'], companionMood: 'restorative', companionMessage: 'Forest Retreat is active. I will reduce cabin intensity and keep guidance gentle.', surfaceContent: content('Minimal trip cards', 'Subtle horizon guide', 'Canopy and firefly ambience', 'Forest path glow', 'Quiet nature companion', 'Leaf-edge welcome', 'Restorative passenger cocoon') },
  cinemaMode: { id: 'cinemaMode', name: 'Cinema Mode', category: 'entertainment', tagline: 'A parked theatre experience with synchronized screen focus and ambient dimming.', palette: ['black', 'warm gold', 'deep red', 'silver'], motion: 'low', audioMood: 'cinematic', driverVisibleSafe: false, preferredSurfaces: ['roof', 'projection', 'rearCabin'], companionMood: 'host', companionMessage: 'Cinema Mode is available while parked. I will dim the cabin and keep controls simple.', surfaceContent: content('Parked playback controls', 'Theatre blackout shade', 'Soft ceiling glow', 'Aisle path lighting', 'Main cinematic canvas', 'Do-not-disturb trim', 'Rear theatre surface') },
  productivityMode: { id: 'productivityMode', name: 'Productivity Mode', category: 'productivity', tagline: 'A focused mobile workspace for parked or passenger-led work sessions.', palette: ['graphite', 'ice blue', 'white', 'soft amber'], motion: 'low', audioMood: 'focused', driverVisibleSafe: true, preferredSurfaces: ['dashboard', 'projection', 'rearCabin'], companionMood: 'focused', companionMessage: 'Productivity Mode is active. I will prioritize calendar, notes and quiet focus.', surfaceContent: content('Focus dashboard and next actions', 'Low-distraction agenda strip', 'Quiet focus gradient', 'Minimal footwell lighting', 'Workspace assistant', 'Focus status line', 'Private work canvas') },
  familyAdventure: { id: 'familyAdventure', name: 'Family Adventure', category: 'family', tagline: 'A warm guided journey mode for children, discovery and shared cabin play.', palette: ['navy', 'coral', 'cyan', 'soft gold'], motion: 'medium', audioMood: 'playful', driverVisibleSafe: false, preferredSurfaces: ['roof', 'floor', 'projection', 'rearCabin'], companionMood: 'friendly', companionMessage: 'Family Adventure is active. I will keep the rear cabin playful and the driver view safe.', surfaceContent: content('Parent-safe journey cards', 'Navigation only', 'Animated discovery sky', 'Treasure path lighting', 'Interactive AURA buddy', 'Adventure entry glow', 'Games and learning surface') },
  wellnessMode: { id: 'wellnessMode', name: 'Wellness Mode', category: 'wellness', tagline: 'Breathing guidance, soft gradients and recovery-first cabin pacing.', palette: ['midnight blue', 'mint', 'lavender', 'warm white'], motion: 'low', audioMood: 'wellness', driverVisibleSafe: true, preferredSurfaces: ['roof', 'floor', 'projection', 'door'], companionMood: 'gentle', companionMessage: 'Wellness Mode is active. Let us slow the cabin down and support a calmer journey.', surfaceContent: content('Wellness-safe status', 'Low-motion breathing edge', 'Guided breath halo', 'Calming pulse path', 'Wellness coach presence', 'Soft recovery light', 'Relaxation capsule') },
  nightDrive: { id: 'nightDrive', name: 'Night Drive', category: 'driving', tagline: 'A driver-safe dark theme with low glare and precise visual hierarchy.', palette: ['black', 'cool blue', 'dim cyan', 'soft white'], motion: 'low', audioMood: 'focused', driverVisibleSafe: true, preferredSurfaces: ['dashboard', 'windshield', 'floor'], companionMood: 'focused', companionMessage: 'Night Drive is active. I will reduce glare and keep only the most useful information visible.', surfaceContent: content('Low-glare driver cluster', 'Dim AR lane and hazard cue', 'Near-black ambience', 'Subtle footwell guide', 'Voice-first presence', 'Dim safety trim', 'Quiet passenger night mode') },
  familyGlow: { id: 'familyGlow', name: 'Family Glow', category: 'family', tagline: 'Warm welcome lighting for daily family journeys.', palette: ['navy', 'coral', 'cyan', 'soft gold'], motion: 'medium', audioMood: 'playful', driverVisibleSafe: false, preferredSurfaces: ['roof', 'floor', 'projection'], companionMood: 'friendly', companionMessage: 'Family mode is ready.', surfaceContent: content('Family welcome', 'Subtle welcome AR', 'Warm animated sky', 'Welcome pathway', 'AURA greeting', 'Warm trim', 'Family rear ambience') },
  auroraDrive: { id: 'auroraDrive', name: 'Aurora Drive', category: 'presentation', tagline: 'Premium intelligent gradients for the AURA keynote path.', palette: ['midnight blue', 'cyan', 'violet', 'emerald'], motion: 'medium', audioMood: 'cinematic', driverVisibleSafe: true, preferredSurfaces: ['dashboard', 'windshield', 'projection'], companionMood: 'focused', companionMessage: 'Aurora Drive is active.', surfaceContent: content('Trip intelligence', 'Aurora route guidance', 'Passenger aurora wash', 'Guided motion line', 'AURA intelligence layer', 'Aurora edge trim', 'Premium passenger gradient') },
  rainSafety: { id: 'rainSafety', name: 'Rain Safety', category: 'safety', tagline: 'Critical low-motion safety visuals for wet or high-load driving.', palette: ['charcoal', 'white', 'warning rose', 'cool blue'], motion: 'low', audioMood: 'focused', driverVisibleSafe: true, preferredSurfaces: ['dashboard', 'windshield', 'floor'], companionMood: 'emergency', companionMessage: 'Safety mode active. Driver-visible information is prioritized.', surfaceContent: content('Safety-critical cluster', 'Hazard emphasis', 'Safety dimmed', 'Emergency path', 'Projection disabled', 'Warning trim', 'Passenger safety notice') },
  executiveCalm: { id: 'executiveCalm', name: 'Executive Calm', category: 'productivity', tagline: 'Quiet professional cabin language for business use.', palette: ['black', 'titanium', 'ice blue', 'warm amber'], motion: 'low', audioMood: 'focused', driverVisibleSafe: true, preferredSurfaces: ['dashboard', 'projection', 'rearCabin'], companionMood: 'focused', companionMessage: 'Executive Calm is active.', surfaceContent: content('Business status', 'Safe route summary', 'Minimal ambience', 'Subtle path', 'Assistant summary', 'Executive trim', 'Private business surface') },
};

function themeDirective(theme: ExperienceThemeDescriptor, surfaceId: ExperienceSurfaceRole, context: ExperienceContextDirective): ExperienceSurfaceDirective {
  const driverVisible = surfaceId === 'dashboard' || surfaceId === 'windshield' || surfaceId === 'projection';
  const forceSafety = context.driverAttention === 'critical' || (context.weather === 'rain' && context.speedKph > 70);
  const unsafeWhileDriving = context.vehicleState === 'driving' && driverVisible && !theme.driverVisibleSafe;
  const state = forceSafety ? (surfaceId === 'projection' ? 'off' : surfaceId === 'roof' || surfaceId === 'rearCabin' ? 'ambient' : 'emergency') : unsafeWhileDriving ? 'ambient' : theme.preferredSurfaces.includes(surfaceId) ? 'interactive' : 'ambient';
  const energy = forceSafety ? (surfaceId === 'projection' ? 0 : surfaceId === 'dashboard' || surfaceId === 'windshield' || surfaceId === 'floor' ? 92 : 18) : unsafeWhileDriving ? 24 : theme.preferredSurfaces.includes(surfaceId) ? 82 : 46;
  return { surfaceId, state, energy, theme: forceSafety ? 'rainSafety' : theme.id, content: theme.surfaceContent[surfaceId] };
}

function sceneForTheme(theme: ExperienceThemeDescriptor): ExperienceScene {
  const parked = theme.category === 'entertainment' || theme.category === 'family';
  const context: ExperienceContextDirective = { mode: theme.category === 'productivity' ? 'business' : theme.category === 'family' ? 'family' : theme.category === 'safety' || theme.category === 'driving' ? 'safety' : 'commute', vehicleState: parked ? 'parked' : 'driving', speedKph: parked ? 0 : theme.id === 'nightDrive' ? 54 : 36, weather: 'clear', occupants: theme.category === 'family' ? 4 : 1, childPresent: theme.category === 'family', driverAttention: parked ? 'parked' : 'mediumLoad' };
  return { id: `theme-${theme.id}`, kind: 'theme', title: theme.name, durationMs: 24000, theme: theme.id, narration: theme.tagline, presenterCue: `Apply ${theme.name} and inspect synchronized dashboard, roof, floor and projection surfaces.`, nextCue: 'Select another Studio v2 theme or continue the keynote timeline.', context, companion: { mode: theme.category === 'driving' || theme.category === 'productivity' ? 'voiceOnly' : 'visual', mood: theme.companionMood, message: theme.companionMessage, allowSpeech: true, allowVisualMotion: theme.motion !== 'none' && context.vehicleState === 'parked', animationLevel: theme.motion === 'high' ? 90 : theme.motion === 'medium' ? 70 : 35 }, surfaces: ['dashboard', 'windshield', 'roof', 'floor', 'projection'].map((surface) => themeDirective(theme, surface as ExperienceSurfaceRole, context)) };
}

export const defaultAuraExperienceTimeline: ExperienceScene[] = [
  sceneForTheme(auraThemeRegistry.familyGlow),
  sceneForTheme(auraThemeRegistry.oceanSerenity),
  sceneForTheme(auraThemeRegistry.productivityMode),
  sceneForTheme(auraThemeRegistry.rainSafety),
  sceneForTheme(auraThemeRegistry.galaxyLounge),
  sceneForTheme(auraThemeRegistry.familyAdventure),
];

export class AuraThemeRegistry {
  list(): ExperienceThemeDescriptor[] { return Object.values(auraThemeRegistry); }
  get(themeId: ExperienceTheme): ExperienceThemeDescriptor { return auraThemeRegistry[themeId] ?? auraThemeRegistry.executiveCalm; }
  scenes(): ExperienceScene[] { return this.list().map(sceneForTheme); }
}

export class AuraThemeStateManager {
  private stateValue: ExperienceThemeState;
  constructor(initialThemeId: ExperienceTheme = 'oceanSerenity') { this.stateValue = { activeThemeId: initialThemeId, status: 'idle', transitionProgress: 0, lastChangedAt: now() }; }
  state(): ExperienceThemeState { return { ...this.stateValue }; }
  preview(themeId: ExperienceTheme): ExperienceThemeState { this.stateValue = { ...this.stateValue, activeThemeId: themeId, status: 'previewing', transitionProgress: 0, lastChangedAt: now() }; return this.state(); }
  activate(themeId: ExperienceTheme): ExperienceThemeState { this.stateValue = { activeThemeId: themeId, previousThemeId: this.stateValue.activeThemeId, status: 'active', transitionProgress: 100, lastChangedAt: now() }; return this.state(); }
  transitionTo(themeId: ExperienceTheme, progress = 0): ExperienceThemeState { this.stateValue = { activeThemeId: themeId, previousThemeId: this.stateValue.activeThemeId, status: 'transitioning', transitionProgress: Math.max(0, Math.min(100, progress)), lastChangedAt: now() }; return this.state(); }
}

export class AuraThemeTransitionEngine {
  plan(fromThemeId: ExperienceTheme, toThemeId: ExperienceTheme, vehicleState: 'parked' | 'driving' = 'parked'): ExperienceTransitionPlan {
    const target = auraThemeRegistry[toThemeId] ?? auraThemeRegistry.executiveCalm;
    const unsafe = vehicleState === 'driving' && !target.driverVisibleSafe;
    return { id: `${fromThemeId}-to-${toThemeId}`, fromThemeId, toThemeId, durationMs: unsafe ? 400 : target.motion === 'high' ? 1800 : 1200, easing: unsafe ? 'safetyCut' : target.category === 'entertainment' ? 'cinematicFade' : 'easeInOut', steps: unsafe ? ['freeze driver-visible surfaces', 'dim unsafe motion layers', 'apply passenger-only theme'] : ['fade active palette', 'cross-map surface roles', 'synchronize companion message', 'complete cabin theme lock'], safetyNotes: unsafe ? ['Target theme is passenger-only while driving; driver-visible surfaces stay low-motion.'] : ['No blocking safety issue detected for this transition.'] };
  }
}

export class AuraSurfaceSynchronizationEngine {
  synchronize(themeId: ExperienceTheme, context: ExperienceContextDirective): SurfaceSynchronizationPlan {
    const theme = auraThemeRegistry[themeId] ?? auraThemeRegistry.executiveCalm;
    const surfaces = (['dashboard', 'windshield', 'roof', 'floor', 'projection'] as ExperienceSurfaceRole[]).map((surfaceId) => {
      const directive = themeDirective(theme, surfaceId, context);
      const driverVisible = surfaceId === 'dashboard' || surfaceId === 'windshield' || surfaceId === 'projection';
      return { surfaceId, state: directive.state, energy: directive.energy, content: directive.content, motion: driverVisible && context.vehicleState === 'driving' ? 'low' : theme.motion, brightness: directive.energy };
    });
    return { themeId: theme.id, safeForDriver: context.vehicleState === 'parked' || theme.driverVisibleSafe, surfaces };
  }
}

export class AuraExperienceEngine {
  private readonly registry = new AuraThemeRegistry();
  private readonly stateManager = new AuraThemeStateManager();
  private readonly transitionEngine = new AuraThemeTransitionEngine();
  private readonly syncEngine = new AuraSurfaceSynchronizationEngine();
  listThemes(): ExperienceThemeDescriptor[] { return this.registry.list(); }
  sceneFor(themeId: ExperienceTheme): ExperienceScene { return sceneForTheme(this.registry.get(themeId)); }
  preview(themeId: ExperienceTheme, context?: Partial<ExperienceContextDirective>): ExperiencePreview {
    const scene = this.sceneFor(themeId);
    const mergedContext = { ...scene.context, ...context };
    const state = this.stateManager.preview(themeId);
    return { theme: this.registry.get(themeId), timeline: [scene], transition: this.transitionEngine.plan(state.previousThemeId ?? state.activeThemeId, themeId, mergedContext.vehicleState), synchronization: this.syncEngine.synchronize(themeId, mergedContext), state };
  }
  activate(themeId: ExperienceTheme, context?: Partial<ExperienceContextDirective>): ExperiencePreview {
    const scene = this.sceneFor(themeId);
    const mergedContext = { ...scene.context, ...context };
    const before = this.stateManager.state();
    const state = this.stateManager.activate(themeId);
    return { theme: this.registry.get(themeId), timeline: [scene], transition: this.transitionEngine.plan(before.activeThemeId, themeId, mergedContext.vehicleState), synchronization: this.syncEngine.synchronize(themeId, mergedContext), state };
  }
}

export class AuraExperienceDirector {
  private readonly timeline: ExperienceScene[];
  private status: ExperienceStatus = 'idle';
  private sceneIndex = 0;
  private elapsedMs = 0;
  private readonly events: ExperienceTimelineEvent[] = [];

  constructor(timeline: ExperienceScene[] = defaultAuraExperienceTimeline) { if (timeline.length === 0) throw new Error('Experience timeline requires at least one scene.'); this.timeline = timeline; }
  start(): ExperienceDirectorState { this.status = 'running'; this.sceneIndex = 0; this.elapsedMs = 0; this.record('experience.started', 'AURA Experience started.'); return this.state(); }
  pause(): ExperienceDirectorState { this.status = 'paused'; this.record('experience.paused', `Paused on ${this.currentScene().title}.`); return this.state(); }
  resume(): ExperienceDirectorState { this.status = 'running'; this.record('experience.resumed', `Resumed ${this.currentScene().title}.`); return this.state(); }
  stop(): ExperienceDirectorState { this.status = 'idle'; this.elapsedMs = 0; this.record('experience.stopped', 'AURA Experience stopped.'); return this.state(); }
  next(): ExperienceDirectorState { if (this.sceneIndex >= this.timeline.length - 1) { this.status = 'completed'; this.record('experience.completed', 'AURA Experience completed.'); return this.state(); } this.sceneIndex += 1; this.elapsedMs = 0; this.record('experience.scene.changed', `Advanced to ${this.currentScene().title}.`, this.currentScene().id); return this.state(); }
  previous(): ExperienceDirectorState { this.sceneIndex = Math.max(0, this.sceneIndex - 1); this.elapsedMs = 0; this.record('experience.scene.changed', `Returned to ${this.currentScene().title}.`, this.currentScene().id); return this.state(); }
  goTo(sceneId: string): ExperienceDirectorState { const index = this.timeline.findIndex((scene) => scene.id === sceneId); if (index < 0) throw new Error(`Unknown experience scene: ${sceneId}`); this.sceneIndex = index; this.elapsedMs = 0; this.record('experience.scene.changed', `Jumped to ${this.currentScene().title}.`, sceneId); return this.state(); }
  tick(deltaMs: number): ExperienceDirectorState { if (this.status !== 'running') return this.state(); this.elapsedMs += Math.max(0, deltaMs); while (this.elapsedMs >= this.currentScene().durationMs && this.status === 'running') { this.elapsedMs -= this.currentScene().durationMs; this.next(); } return this.state(); }
  currentScene(): ExperienceScene { return this.timeline[this.sceneIndex]; }
  allScenes(): ExperienceScene[] { return [...this.timeline]; }
  state(): ExperienceDirectorState { const scene = this.currentScene(); const progressPercent = Math.round(((this.sceneIndex + this.elapsedMs / scene.durationMs) / this.timeline.length) * 100); return { status: this.status, sceneIndex: this.sceneIndex, scene, progressPercent: Math.max(0, Math.min(100, progressPercent)), elapsedMs: this.elapsedMs, remainingMs: Math.max(0, scene.durationMs - this.elapsedMs), events: [...this.events] }; }
  private record(type: string, message: string, sceneId = this.currentScene().id): void { this.events.unshift({ id: `${type}-${Date.now()}-${this.events.length}`, timestamp: now(), type, message, sceneId }); this.events.splice(30); }
}

export function createAuraThemeRegistry(): AuraThemeRegistry { return new AuraThemeRegistry(); }
export function createAuraThemeStateManager(initialThemeId?: ExperienceTheme): AuraThemeStateManager { return new AuraThemeStateManager(initialThemeId); }
export function createAuraThemeTransitionEngine(): AuraThemeTransitionEngine { return new AuraThemeTransitionEngine(); }
export function createAuraSurfaceSynchronizationEngine(): AuraSurfaceSynchronizationEngine { return new AuraSurfaceSynchronizationEngine(); }
export function createAuraExperienceEngine(): AuraExperienceEngine { return new AuraExperienceEngine(); }
export function createAuraExperienceDirector(timeline?: ExperienceScene[]): AuraExperienceDirector { return new AuraExperienceDirector(timeline); }
