export type CinematicThemeId = 'oceanSerenity' | 'auroraDrive' | 'galaxyLounge' | 'rainSafety' | 'executiveCalm' | 'familyGlow' | 'forestZen' | 'neonCity';
export type CinematicSurfaceRole = 'dashboard' | 'windshield' | 'roof' | 'floor' | 'projection' | 'door' | 'rearCabin';
export type MotionIntensity = 'none' | 'low' | 'medium' | 'high';

export interface CinematicTheme {
  id: CinematicThemeId;
  name: string;
  mood: string;
  palette: string[];
  motion: MotionIntensity;
  patterns: string[];
  audioCue: string;
  safetySuitable: boolean;
}

export interface CinematicRenderInput {
  theme: CinematicThemeId;
  surfaceRole: CinematicSurfaceRole;
  vehicleState: 'parked' | 'driving';
  speedKph: number;
  weather: 'clear' | 'rain' | 'fog';
  driverAttention: string;
  childPresent: boolean;
  risk: 'normal' | 'elevated' | 'critical';
}

export interface CinematicRenderPlan {
  theme: CinematicTheme;
  surfaceRole: CinematicSurfaceRole;
  cssClass: string;
  headline: string;
  background: string;
  particleLayer: string;
  motion: MotionIntensity;
  brightness: number;
  safeForDriver: boolean;
  notes: string[];
}

export const cinematicThemes: Record<CinematicThemeId, CinematicTheme> = {
  oceanSerenity: {
    id: 'oceanSerenity',
    name: 'Ocean Serenity',
    mood: 'calm, fluid and relaxing',
    palette: ['deep navy', 'aqua', 'teal', 'soft cyan'],
    motion: 'medium',
    patterns: ['bioluminescent waves', 'slow reef particles', 'liquid light caustics'],
    audioCue: 'soft water-like ambient bed',
    safetySuitable: true,
  },
  auroraDrive: {
    id: 'auroraDrive',
    name: 'Aurora Drive',
    mood: 'premium, intelligent and expansive',
    palette: ['midnight blue', 'cyan', 'violet', 'emerald'],
    motion: 'medium',
    patterns: ['flowing aurora ribbons', 'soft magnetic arcs', 'star dust'],
    audioCue: 'wide cinematic synth swell',
    safetySuitable: true,
  },
  galaxyLounge: {
    id: 'galaxyLounge',
    name: 'Galaxy Lounge',
    mood: 'dreamlike, premium and futuristic',
    palette: ['black', 'deep violet', 'ice blue', 'silver'],
    motion: 'high',
    patterns: ['nebula clouds', 'slow star field', 'orbital light trails'],
    audioCue: 'spacious cinematic ambience',
    safetySuitable: false,
  },
  rainSafety: {
    id: 'rainSafety',
    name: 'Rain Safety',
    mood: 'focused, precise and protective',
    palette: ['charcoal', 'white', 'warning rose', 'cool blue'],
    motion: 'low',
    patterns: ['directional hazard lines', 'low-motion rain streaks', 'safe path glow'],
    audioCue: 'minimal safety tone',
    safetySuitable: true,
  },
  executiveCalm: {
    id: 'executiveCalm',
    name: 'Executive Calm',
    mood: 'quiet, focused and professional',
    palette: ['black', 'titanium', 'ice blue', 'warm amber'],
    motion: 'low',
    patterns: ['subtle glass gradients', 'soft pulse lines', 'minimal light sweep'],
    audioCue: 'minimal premium chime',
    safetySuitable: true,
  },
  familyGlow: {
    id: 'familyGlow',
    name: 'Family Glow',
    mood: 'warm, friendly and playful',
    palette: ['navy', 'coral', 'cyan', 'soft gold'],
    motion: 'medium',
    patterns: ['gentle bubbles', 'soft playful ripples', 'welcome path sparkles'],
    audioCue: 'warm welcome tone',
    safetySuitable: false,
  },
  forestZen: {
    id: 'forestZen',
    name: 'Forest Zen',
    mood: 'restorative, organic and wellness-focused',
    palette: ['deep green', 'mint', 'soft blue', 'warm white'],
    motion: 'medium',
    patterns: ['floating leaves', 'fireflies', 'organic breathing light'],
    audioCue: 'soft nature-inspired ambience',
    safetySuitable: true,
  },
  neonCity: {
    id: 'neonCity',
    name: 'Night City',
    mood: 'urban, energetic and premium',
    palette: ['black', 'cyan', 'magenta', 'electric blue'],
    motion: 'high',
    patterns: ['city neon streaks', 'digital rain', 'light trails'],
    audioCue: 'subtle electronic pulse',
    safetySuitable: false,
  },
};

function reduceMotionForSafety(input: CinematicRenderInput, theme: CinematicTheme): MotionIntensity {
  if (input.risk === 'critical' || input.driverAttention === 'critical') return 'none';
  if (input.vehicleState === 'driving' && input.surfaceRole === 'dashboard') return theme.motion === 'high' ? 'low' : theme.motion;
  if (input.vehicleState === 'driving' && input.surfaceRole === 'windshield') return 'low';
  return theme.motion;
}

function brightnessFor(input: CinematicRenderInput): number {
  if (input.risk === 'critical') return input.surfaceRole === 'floor' || input.surfaceRole === 'dashboard' || input.surfaceRole === 'windshield' ? 92 : 14;
  if (input.vehicleState === 'driving' && input.surfaceRole === 'dashboard') return 78;
  if (input.weather === 'rain') return 58;
  return input.surfaceRole === 'roof' ? 88 : 72;
}

export class AuraCinematicEngine {
  render(input: CinematicRenderInput): CinematicRenderPlan {
    const requestedTheme = cinematicThemes[input.theme] ?? cinematicThemes.executiveCalm;
    const theme = input.risk === 'critical' ? cinematicThemes.rainSafety : requestedTheme;
    const driverVisible = input.surfaceRole === 'dashboard' || input.surfaceRole === 'windshield' || input.surfaceRole === 'projection';
    const safeForDriver = !driverVisible || theme.safetySuitable || input.vehicleState === 'parked';
    const motion = reduceMotionForSafety(input, theme);
    const brightness = brightnessFor(input);
    const notes: string[] = [];

    if (!safeForDriver) notes.push('Driver-visible surface should use reduced motion or alternate safety theme while driving.');
    if (input.risk === 'critical') notes.push('Critical risk forces Rain Safety visual language.');
    if (motion === 'none') notes.push('Motion disabled due to safety state.');

    return {
      theme,
      surfaceRole: input.surfaceRole,
      cssClass: `cinematic-${theme.id} cinematic-${input.surfaceRole} motion-${motion}`,
      headline: `${theme.name} on ${input.surfaceRole}`,
      background: theme.palette.join(' / '),
      particleLayer: theme.patterns.join(' + '),
      motion,
      brightness,
      safeForDriver,
      notes,
    };
  }

  listThemes(): CinematicTheme[] {
    return Object.values(cinematicThemes);
  }
}

export function createAuraCinematicEngine(): AuraCinematicEngine {
  return new AuraCinematicEngine();
}
