export type CompanionSpecies = 'light-being' | 'dog' | 'cat' | 'owl' | 'fox' | 'panda' | 'dolphin' | 'dragon' | 'phoenix' | 'robot' | 'human-avatar' | 'custom';
export type CompanionRole = 'navigator' | 'guardian' | 'coach' | 'family-buddy' | 'travel-guide' | 'productivity' | 'wellness' | 'general';
export type CompanionPersonality = 'calm' | 'playful' | 'professional' | 'humorous' | 'adventurous' | 'gentle' | 'protective';
export type CompanionMovement = 'walk' | 'fly' | 'float' | 'perch' | 'sit' | 'fade' | 'surface-hop';
export type VehicleMotionState = 'parked' | 'low-speed' | 'driving';
export type CabinSurface = 'dashboard' | 'center-console' | 'door' | 'roof' | 'rear-display' | 'passenger-display' | 'ambient-lighting' | 'projection';

export interface CompanionAppearance {
  primaryColor: string;
  accentColor: string;
  eyeColor?: string;
  markings?: string[];
  accessories?: string[];
  size: 'tiny' | 'small' | 'medium' | 'large';
  renderStyle: 'holographic' | 'soft-3d' | 'light-particle' | 'minimal';
}

export interface CompanionVoice {
  name: string;
  tone: 'soft' | 'warm' | 'professional' | 'child-friendly' | 'energetic';
  speechRate: 'slow' | 'normal' | 'fast';
}

export interface CompanionProfile {
  id: string;
  ownerProfileId: string;
  name: string;
  species: CompanionSpecies;
  role: CompanionRole;
  personality: CompanionPersonality;
  appearance: CompanionAppearance;
  voice: CompanionVoice;
  preferredSurfaces: CabinSurface[];
  allowedMovements: CompanionMovement[];
  interactionFrequency: 'low' | 'medium' | 'high';
  marketplaceReady: boolean;
}

export interface CompanionBehaviorPolicy {
  motionState: VehicleMotionState;
  allowedSurfaces: CabinSurface[];
  allowedMovements: CompanionMovement[];
  maxAnimationIntensity: number;
  driverVisibleAllowed: boolean;
  reason: string;
}

export interface CompanionValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

function isHexColor(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

export class CompanionEcosystem {
  private readonly profiles = new Map<string, CompanionProfile>();

  save(profile: CompanionProfile): CompanionValidation {
    const validation = validateCompanionProfile(profile);
    if (!validation.valid) return validation;
    this.profiles.set(profile.id, profile);
    return validation;
  }

  get(id: string): CompanionProfile {
    const profile = this.profiles.get(id);
    if (!profile) throw new Error(`Companion profile not found: ${id}`);
    return profile;
  }

  list(ownerProfileId?: string): CompanionProfile[] {
    const profiles = [...this.profiles.values()];
    return ownerProfileId ? profiles.filter((profile) => profile.ownerProfileId === ownerProfileId) : profiles;
  }

  behaviorPolicy(profile: CompanionProfile, motionState: VehicleMotionState): CompanionBehaviorPolicy {
    if (motionState === 'parked') {
      return { motionState, allowedSurfaces: profile.preferredSurfaces, allowedMovements: profile.allowedMovements, maxAnimationIntensity: 1, driverVisibleAllowed: true, reason: 'Vehicle parked; full companion expression allowed.' };
    }
    if (motionState === 'low-speed') {
      return { motionState, allowedSurfaces: profile.preferredSurfaces.filter((surface) => surface !== 'dashboard'), allowedMovements: profile.allowedMovements.filter((movement) => movement !== 'fly'), maxAnimationIntensity: 0.45, driverVisibleAllowed: false, reason: 'Low speed; reduce driver-visible motion.' };
    }
    return { motionState, allowedSurfaces: profile.preferredSurfaces.filter((surface) => ['rear-display', 'passenger-display', 'ambient-lighting'].includes(surface)), allowedMovements: ['fade'], maxAnimationIntensity: 0.2, driverVisibleAllowed: false, reason: 'Driving; companion remains subtle and non-distracting.' };
  }
}

export function validateCompanionProfile(profile: CompanionProfile): CompanionValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!profile.id.trim()) errors.push('Companion id is required.');
  if (!profile.ownerProfileId.trim()) errors.push('Owner profile id is required.');
  if (!profile.name.trim()) errors.push('Companion name is required.');
  if (!isHexColor(profile.appearance.primaryColor) || !isHexColor(profile.appearance.accentColor)) errors.push('Companion colors must be #RRGGBB values.');
  if (profile.preferredSurfaces.length === 0) errors.push('At least one preferred surface is required.');
  if (profile.allowedMovements.length === 0) errors.push('At least one movement style is required.');
  if (profile.marketplaceReady && profile.species === 'custom') warnings.push('Custom marketplace companions require additional review metadata.');
  if (profile.species === 'dragon' || profile.species === 'phoenix') warnings.push('Fantasy companions should use reduced animation while driving.');
  return { valid: errors.length === 0, errors, warnings };
}

export function createCompanionEcosystem(): CompanionEcosystem {
  return new CompanionEcosystem();
}

export function createDefaultAuraLightCompanion(ownerProfileId: string): CompanionProfile {
  return {
    id: `${ownerProfileId}-aura-light`,
    ownerProfileId,
    name: 'AURA',
    species: 'light-being',
    role: 'general',
    personality: 'calm',
    appearance: { primaryColor: '#00B8C8', accentColor: '#8E7CFF', eyeColor: '#EAFBFF', size: 'small', renderStyle: 'light-particle' },
    voice: { name: 'AURA Soft', tone: 'soft', speechRate: 'normal' },
    preferredSurfaces: ['dashboard', 'center-console', 'projection', 'ambient-lighting'],
    allowedMovements: ['float', 'fade', 'surface-hop'],
    interactionFrequency: 'medium',
    marketplaceReady: true,
  };
}

export function createAnimalCompanion(ownerProfileId: string, species: Extract<CompanionSpecies, 'dog' | 'cat' | 'owl' | 'fox' | 'panda' | 'dolphin'>, name: string): CompanionProfile {
  const canFly = species === 'owl' || species === 'dolphin';
  return {
    id: `${ownerProfileId}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    ownerProfileId,
    name,
    species,
    role: species === 'owl' ? 'guardian' : species === 'dog' ? 'family-buddy' : 'general',
    personality: species === 'dog' ? 'protective' : species === 'cat' ? 'playful' : 'gentle',
    appearance: { primaryColor: '#F5F1E8', accentColor: '#00B8C8', eyeColor: '#6EEBFF', size: 'small', renderStyle: 'soft-3d' },
    voice: { name: `${name} Voice`, tone: 'warm', speechRate: 'normal' },
    preferredSurfaces: ['center-console', 'rear-display', 'passenger-display', 'ambient-lighting'],
    allowedMovements: canFly ? ['fly', 'perch', 'fade', 'surface-hop'] : ['walk', 'sit', 'fade', 'surface-hop'],
    interactionFrequency: 'medium',
    marketplaceReady: true,
  };
}
