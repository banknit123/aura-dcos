import { type CompanionMode, type CompanionMood, type CompanionState, type DriverAttentionState } from '@aura-dcos/companion';

export type CompanionStudioPersonaId = 'auraDefault' | 'luxuryConcierge' | 'familyBuddy' | 'wellnessCoach' | 'productivityCopilot' | 'safetyGuardian';
export type CompanionVoiceStyle = 'warm' | 'calm' | 'premium' | 'playful' | 'focused' | 'urgent';
export type CompanionAnimationStyle = 'orb' | 'constellation' | 'softAvatar' | 'minimalPulse' | 'friendlyMascot' | 'safetyBeacon';
export type CompanionMarketplaceStatus = 'builtIn' | 'oemReady' | 'draft' | 'restricted';

export interface CompanionPersona {
  id: CompanionStudioPersonaId;
  name: string;
  role: string;
  description: string;
  defaultMood: CompanionMood;
  defaultMode: CompanionMode;
  greeting: string;
  safetyPriority: number;
  familyFriendly: boolean;
  marketplaceStatus: CompanionMarketplaceStatus;
}

export interface CompanionVoiceProfile {
  style: CompanionVoiceStyle;
  pace: 'slow' | 'balanced' | 'fast';
  warmth: number;
  clarity: number;
  interruptionPolicy: 'neverInterrupt' | 'softInterrupt' | 'urgentOnly';
}

export interface CompanionAnimationProfile {
  style: CompanionAnimationStyle;
  motionLevel: number;
  expressiveness: number;
  driverVisibleAllowed: boolean;
}

export interface CompanionStudioDraft {
  personaId: CompanionStudioPersonaId;
  displayName: string;
  voice: CompanionVoiceProfile;
  animation: CompanionAnimationProfile;
  customGreeting?: string;
}

export interface CompanionStudioPreview {
  persona: CompanionPersona;
  draft: CompanionStudioDraft;
  state: CompanionState;
  marketplace: {
    status: CompanionMarketplaceStatus;
    listingTitle: string;
    safetyBadge: string;
  };
  validation: {
    safe: boolean;
    warnings: string[];
  };
}

export const companionPersonaRegistry: Record<CompanionStudioPersonaId, CompanionPersona> = {
  auraDefault: {
    id: 'auraDefault',
    name: 'AURA',
    role: 'Default cabin companion',
    description: 'Balanced premium assistant for daily driving, cabin orchestration and safe guidance.',
    defaultMood: 'friendly',
    defaultMode: 'assistive',
    greeting: 'Ready when you are.',
    safetyPriority: 80,
    familyFriendly: true,
    marketplaceStatus: 'builtIn',
  },
  luxuryConcierge: {
    id: 'luxuryConcierge',
    name: 'AURA Concierge',
    role: 'Premium luxury host',
    description: 'Quiet, refined cabin host for executive comfort, arrival preparation and premium ambience.',
    defaultMood: 'calm',
    defaultMode: 'assistive',
    greeting: 'Your cabin is prepared for a calm premium journey.',
    safetyPriority: 86,
    familyFriendly: true,
    marketplaceStatus: 'oemReady',
  },
  familyBuddy: {
    id: 'familyBuddy',
    name: 'AURA Buddy',
    role: 'Family and child-friendly companion',
    description: 'Warm, playful companion for parked family experiences and rear-cabin storytelling.',
    defaultMood: 'friendly',
    defaultMode: 'visual',
    greeting: 'Family Adventure is ready. I will keep the fun in the rear cabin.',
    safetyPriority: 72,
    familyFriendly: true,
    marketplaceStatus: 'oemReady',
  },
  wellnessCoach: {
    id: 'wellnessCoach',
    name: 'AURA Wellness',
    role: 'Wellness and decompression coach',
    description: 'Gentle companion for breathing, decompression, low-motion guidance and recovery-first cabin pacing.',
    defaultMood: 'calm',
    defaultMode: 'assistive',
    greeting: 'Let us slow the cabin down and make this journey feel easier.',
    safetyPriority: 90,
    familyFriendly: true,
    marketplaceStatus: 'oemReady',
  },
  productivityCopilot: {
    id: 'productivityCopilot',
    name: 'AURA Copilot',
    role: 'Focused work assistant',
    description: 'Voice-first work companion for calendar summaries, notes and parked productivity sessions.',
    defaultMood: 'focused',
    defaultMode: 'voiceOnly',
    greeting: 'Focus mode is ready. I will keep tasks clear and distractions low.',
    safetyPriority: 88,
    familyFriendly: false,
    marketplaceStatus: 'draft',
  },
  safetyGuardian: {
    id: 'safetyGuardian',
    name: 'AURA Guardian',
    role: 'Safety-first guardian',
    description: 'Strict safety persona for critical alerts, emergency guidance and driver-load protection.',
    defaultMood: 'alert',
    defaultMode: 'emergency',
    greeting: 'Safety monitoring is active.',
    safetyPriority: 100,
    familyFriendly: true,
    marketplaceStatus: 'builtIn',
  },
};

const defaultVoice: CompanionVoiceProfile = { style: 'warm', pace: 'balanced', warmth: 72, clarity: 88, interruptionPolicy: 'urgentOnly' };
const defaultAnimation: CompanionAnimationProfile = { style: 'orb', motionLevel: 45, expressiveness: 60, driverVisibleAllowed: true };

function clamp(value: number): number { return Math.max(0, Math.min(100, Math.round(value))); }

export class AuraCompanionStudioRegistry {
  listPersonas(): CompanionPersona[] { return Object.values(companionPersonaRegistry); }
  getPersona(personaId: CompanionStudioPersonaId): CompanionPersona { return companionPersonaRegistry[personaId] ?? companionPersonaRegistry.auraDefault; }
}

export class AuraCompanionSafetyValidator {
  validate(draft: CompanionStudioDraft, driverAttention: DriverAttentionState): { safe: boolean; warnings: string[] } {
    const warnings: string[] = [];
    if (driverAttention === 'critical' && draft.animation.motionLevel > 0) warnings.push('Critical driver attention requires visual motion to be disabled.');
    if ((driverAttention === 'highLoad' || driverAttention === 'critical') && draft.voice.interruptionPolicy !== 'urgentOnly') warnings.push('High driver load requires urgent-only interruption policy.');
    if ((driverAttention === 'highLoad' || driverAttention === 'critical') && draft.animation.driverVisibleAllowed) warnings.push('Driver-visible animation must be disabled during high-load states.');
    return { safe: warnings.length === 0, warnings };
  }
}

export class AuraCompanionPreviewEngine {
  private readonly registry = new AuraCompanionStudioRegistry();
  private readonly validator = new AuraCompanionSafetyValidator();

  createDraft(personaId: CompanionStudioPersonaId): CompanionStudioDraft {
    const persona = this.registry.getPersona(personaId);
    return {
      personaId,
      displayName: persona.name,
      voice: { ...defaultVoice, style: persona.defaultMood === 'focused' ? 'focused' : persona.defaultMood === 'alert' || persona.defaultMood === 'emergency' ? 'urgent' : persona.defaultMood === 'calm' ? 'calm' : 'warm' },
      animation: { ...defaultAnimation, style: persona.defaultMode === 'emergency' ? 'safetyBeacon' : persona.id === 'familyBuddy' ? 'friendlyMascot' : persona.id === 'luxuryConcierge' ? 'constellation' : persona.id === 'productivityCopilot' ? 'minimalPulse' : 'orb' },
      customGreeting: persona.greeting,
    };
  }

  preview(draft: CompanionStudioDraft, driverAttention: DriverAttentionState = 'parked', childPresent = false): CompanionStudioPreview {
    const persona = this.registry.getPersona(draft.personaId);
    const validation = this.validator.validate(draft, driverAttention);
    const highLoad = driverAttention === 'highLoad' || driverAttention === 'critical';
    const emergency = driverAttention === 'critical' || persona.id === 'safetyGuardian';
    const state: CompanionState = {
      name: draft.displayName || persona.name,
      mood: emergency ? 'emergency' : highLoad ? 'focused' : childPresent && persona.familyFriendly ? 'friendly' : persona.defaultMood,
      mode: emergency ? 'emergency' : highLoad ? 'voiceOnly' : persona.defaultMode,
      message: draft.customGreeting || persona.greeting,
      animationLevel: highLoad || emergency ? 0 : clamp(draft.animation.motionLevel),
      allowVisualMotion: !highLoad && !emergency && draft.animation.motionLevel > 0,
      allowSpeech: true,
    };
    return {
      persona,
      draft,
      state,
      marketplace: {
        status: persona.marketplaceStatus,
        listingTitle: `${draft.displayName || persona.name} · ${persona.role}`,
        safetyBadge: validation.safe ? `Safety priority ${persona.safetyPriority}/100` : 'Needs safety review',
      },
      validation,
    };
  }
}

export class AuraCompanionStudio {
  private readonly registry = new AuraCompanionStudioRegistry();
  private readonly previewEngine = new AuraCompanionPreviewEngine();
  listPersonas(): CompanionPersona[] { return this.registry.listPersonas(); }
  createDraft(personaId: CompanionStudioPersonaId): CompanionStudioDraft { return this.previewEngine.createDraft(personaId); }
  preview(draft: CompanionStudioDraft, driverAttention?: DriverAttentionState, childPresent?: boolean): CompanionStudioPreview { return this.previewEngine.preview(draft, driverAttention, childPresent); }
}

export function createAuraCompanionStudio(): AuraCompanionStudio { return new AuraCompanionStudio(); }
export function createAuraCompanionStudioRegistry(): AuraCompanionStudioRegistry { return new AuraCompanionStudioRegistry(); }
export function createAuraCompanionPreviewEngine(): AuraCompanionPreviewEngine { return new AuraCompanionPreviewEngine(); }
export function createAuraCompanionSafetyValidator(): AuraCompanionSafetyValidator { return new AuraCompanionSafetyValidator(); }
