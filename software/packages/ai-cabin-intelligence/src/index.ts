export type CabinEmotion = 'calm' | 'focused' | 'tired' | 'stressed' | 'joyful' | 'unknown';
export type PersonalizationConfidence = 'low' | 'medium' | 'high';
export type CabinActionKind = 'ambientScene' | 'hvacSuggestion' | 'audioDucking' | 'breakSuggestion' | 'surfaceMode' | 'companionPrompt';

export interface OccupantProfile {
  id: string;
  displayName: string;
  preferences: Record<string, string | number | boolean>;
  consent: { memory: boolean; personalization: boolean };
}

export interface CabinMemoryEvent {
  id: string;
  profileId: string;
  kind: string;
  value: string | number | boolean;
  confidence: PersonalizationConfidence;
  timestamp: string;
}

export interface CabinContext {
  profileId: string;
  speedKph: number;
  cabinTemperatureC?: number;
  driverFatigueScore?: number;
  voiceSentiment?: CabinEmotion;
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
}

export interface CabinIntelligenceAction {
  id: string;
  kind: CabinActionKind;
  priority: number;
  reason: string;
  payload: Record<string, string | number | boolean>;
  requiresConsent: boolean;
}

export interface CabinIntelligenceResult {
  profile: OccupantProfile;
  inferredEmotion: CabinEmotion;
  actions: CabinIntelligenceAction[];
  memoryUsed: CabinMemoryEvent[];
}

function now(): string { return new Date().toISOString(); }

export class CabinMemoryStore {
  private readonly events: CabinMemoryEvent[] = [];

  remember(profile: OccupantProfile, event: Omit<CabinMemoryEvent, 'timestamp'>): CabinMemoryEvent | undefined {
    if (!profile.consent.memory) return undefined;
    const stored = { ...event, timestamp: now() };
    this.events.push(stored);
    return stored;
  }

  recall(profileId: string, kind?: string): CabinMemoryEvent[] {
    return this.events.filter((event) => event.profileId === profileId && (!kind || event.kind === kind));
  }
}

export class AiCabinIntelligenceEngine {
  constructor(private readonly memory = new CabinMemoryStore()) {}

  analyze(profile: OccupantProfile, context: CabinContext): CabinIntelligenceResult {
    const memoryUsed = profile.consent.personalization ? this.memory.recall(profile.id) : [];
    const inferredEmotion = this.inferEmotion(context);
    const actions: CabinIntelligenceAction[] = [];

    if (context.driverFatigueScore !== undefined && context.driverFatigueScore >= 0.75) {
      actions.push({ id: 'fatigue-break', kind: 'breakSuggestion', priority: 95, reason: 'Driver fatigue score is high.', payload: { message: 'Consider a short rest stop.' }, requiresConsent: false });
    }
    if (inferredEmotion === 'stressed') {
      actions.push({ id: 'calm-cabin', kind: 'ambientScene', priority: 70, reason: 'Cabin state indicates stress.', payload: { scene: 'oceanCalm' }, requiresConsent: true });
    }
    if (context.cabinTemperatureC !== undefined && context.cabinTemperatureC < 19) {
      actions.push({ id: 'warm-cabin', kind: 'hvacSuggestion', priority: 55, reason: 'Cabin temperature is below comfort target.', payload: { temperatureC: 22 }, requiresConsent: false });
    }
    if (memoryUsed.some((event) => event.kind === 'preferredScene' && event.value === 'auroraDrive')) {
      actions.push({ id: 'personal-scene', kind: 'surfaceMode', priority: 45, reason: 'Preferred scene recalled from memory.', payload: { scene: 'auroraDrive' }, requiresConsent: true });
    }

    return { profile, inferredEmotion, actions: actions.sort((a, b) => b.priority - a.priority), memoryUsed };
  }

  remember(profile: OccupantProfile, kind: string, value: string | number | boolean, confidence: PersonalizationConfidence = 'medium'): CabinMemoryEvent | undefined {
    return this.memory.remember(profile, { id: `${profile.id}-${kind}-${Date.now()}`, profileId: profile.id, kind, value, confidence });
  }

  private inferEmotion(context: CabinContext): CabinEmotion {
    if (context.driverFatigueScore !== undefined && context.driverFatigueScore >= 0.75) return 'tired';
    if (context.voiceSentiment && context.voiceSentiment !== 'unknown') return context.voiceSentiment;
    if (context.speedKph > 80 && context.timeOfDay === 'night') return 'focused';
    return 'calm';
  }
}

export function createAiCabinIntelligenceEngine(memory?: CabinMemoryStore): AiCabinIntelligenceEngine {
  return new AiCabinIntelligenceEngine(memory);
}
