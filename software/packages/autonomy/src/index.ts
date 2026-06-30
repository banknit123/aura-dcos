import { createAuraBrain, type BrainContext, type BrainDecision, type BrainIntent, type BrainRisk } from '@aura-dcos/brain';

export type AutonomySignalKind = 'voice' | 'touch' | 'vehicle' | 'environment' | 'occupant' | 'calendar' | 'system';
export type AutonomySuggestionKind = 'comfort' | 'safety' | 'navigation' | 'companion' | 'energy' | 'information';
export type AutonomyUrgency = 'low' | 'medium' | 'high' | 'critical';

export interface AutonomySignal {
  id: string;
  kind: AutonomySignalKind;
  value: string | number | boolean;
  confidence: number;
  timestamp: string;
}

export interface AutonomyMemoryItem {
  key: string;
  value: string;
  scope: 'session' | 'profile';
  updatedAt: string;
}

export interface AutonomyCabinSnapshot {
  vehicleState: 'parked' | 'driving';
  speedKph: number;
  weather: 'clear' | 'rain' | 'fog';
  driverAttention: 'parked' | 'lowLoad' | 'mediumLoad' | 'highLoad' | 'critical';
  childPresent: boolean;
  occupants: number;
  availableSurfaces: string[];
}

export interface AutonomySuggestion {
  id: string;
  kind: AutonomySuggestionKind;
  urgency: AutonomyUrgency;
  title: string;
  message: string;
  reason: string;
  confidence: number;
}

export interface AutonomyCycleResult {
  risk: BrainRisk;
  inferredIntent: BrainIntent;
  memory: AutonomyMemoryItem[];
  suggestions: AutonomySuggestion[];
  brainDecision: BrainDecision;
}

function clampConfidence(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function riskFromSnapshot(snapshot: AutonomyCabinSnapshot, signals: AutonomySignal[]): BrainRisk {
  if (snapshot.driverAttention === 'critical') return 'critical';
  if (snapshot.weather === 'fog' && snapshot.vehicleState === 'driving') return 'critical';
  if (signals.some((signal) => signal.kind === 'vehicle' && signal.id === 'collision-warning' && Boolean(signal.value))) return 'critical';
  if (snapshot.driverAttention === 'highLoad') return 'elevated';
  if (snapshot.weather === 'rain' && snapshot.speedKph > 60) return 'elevated';
  if (signals.some((signal) => signal.kind === 'occupant' && signal.id === 'fatigue' && signal.confidence >= 70)) return 'elevated';
  return 'normal';
}

function inferIntent(snapshot: AutonomyCabinSnapshot, risk: BrainRisk, signals: AutonomySignal[]): BrainIntent {
  if (risk === 'critical') return 'emergency';
  if (snapshot.vehicleState === 'parked' && signals.some((signal) => signal.kind === 'occupant' && signal.id === 'entry-detected')) return 'welcome';
  if (signals.some((signal) => signal.kind === 'voice' && String(signal.value).toLowerCase().includes('calm'))) return 'calm';
  if (signals.some((signal) => signal.kind === 'calendar')) return 'assist';
  return 'assist';
}

function rememberFromSignals(signals: AutonomySignal[], previous: AutonomyMemoryItem[]): AutonomyMemoryItem[] {
  const memory = new Map(previous.map((item) => [item.key, item]));
  const now = new Date().toISOString();

  for (const signal of signals) {
    if (signal.kind === 'voice' && typeof signal.value === 'string' && signal.value.trim()) {
      memory.set('lastVoiceIntent', { key: 'lastVoiceIntent', value: signal.value.trim(), scope: 'session', updatedAt: now });
    }

    if (signal.kind === 'occupant' && signal.id === 'comfort-preference' && typeof signal.value === 'string') {
      memory.set('comfortPreference', { key: 'comfortPreference', value: signal.value, scope: 'profile', updatedAt: now });
    }
  }

  return [...memory.values()].slice(-20);
}

function buildSuggestions(snapshot: AutonomyCabinSnapshot, risk: BrainRisk, signals: AutonomySignal[], memory: AutonomyMemoryItem[]): AutonomySuggestion[] {
  const suggestions: AutonomySuggestion[] = [];

  if (risk === 'critical') {
    suggestions.push({
      id: 'safety-focus',
      kind: 'safety',
      urgency: 'critical',
      title: 'Safety focus mode',
      message: 'Reduce all non-essential visuals and keep guidance voice-first.',
      reason: 'Critical driving or environmental state detected.',
      confidence: 96,
    });
    return suggestions;
  }

  if (snapshot.weather === 'rain' && snapshot.vehicleState === 'driving') {
    suggestions.push({
      id: 'rain-calm-cabin',
      kind: 'comfort',
      urgency: snapshot.speedKph > 60 ? 'high' : 'medium',
      title: 'Rain comfort mode',
      message: 'Dim immersive surfaces and keep dashboard information clear.',
      reason: 'Rain while driving increases visual and cognitive workload.',
      confidence: snapshot.speedKph > 60 ? 88 : 76,
    });
  }

  if (signals.some((signal) => signal.kind === 'occupant' && signal.id === 'fatigue' && signal.confidence >= 70)) {
    suggestions.push({
      id: 'fatigue-break',
      kind: 'safety',
      urgency: 'high',
      title: 'Driver rest suggestion',
      message: 'Suggest a short break and reduce cabin motion.',
      reason: 'Fatigue signal confidence crossed the safety threshold.',
      confidence: 84,
    });
  }

  if (snapshot.childPresent && snapshot.vehicleState === 'parked') {
    suggestions.push({
      id: 'family-welcome',
      kind: 'companion',
      urgency: 'low',
      title: 'Family welcome',
      message: 'Use friendly companion behaviour and an interactive floor welcome path.',
      reason: 'Child occupant detected while parked.',
      confidence: 82,
    });
  }

  const comfortPreference = memory.find((item) => item.key === 'comfortPreference');
  if (comfortPreference) {
    suggestions.push({
      id: 'remembered-comfort',
      kind: 'comfort',
      urgency: 'low',
      title: 'Remembered comfort preference',
      message: `Apply remembered preference: ${comfortPreference.value}.`,
      reason: 'Profile memory contains a comfort preference.',
      confidence: 72,
    });
  }

  return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 4);
}

export class AuraAutonomyEngine {
  private memory: AutonomyMemoryItem[] = [];
  private readonly brain = createAuraBrain();

  getMemory(): AutonomyMemoryItem[] {
    return [...this.memory];
  }

  resetMemory(): void {
    this.memory = [];
  }

  runCycle(snapshot: AutonomyCabinSnapshot, signals: AutonomySignal[]): AutonomyCycleResult {
    const normalizedSignals = signals.map((signal) => ({ ...signal, confidence: clampConfidence(signal.confidence) }));
    const risk = riskFromSnapshot(snapshot, normalizedSignals);
    const inferredIntent = inferIntent(snapshot, risk, normalizedSignals);
    this.memory = rememberFromSignals(normalizedSignals, this.memory);
    const suggestions = buildSuggestions(snapshot, risk, normalizedSignals, this.memory);

    const brainContext: BrainContext = {
      intent: inferredIntent,
      risk,
      driverAttention: snapshot.driverAttention,
      vehicleState: snapshot.vehicleState,
      childPresent: snapshot.childPresent,
      availableSurfaces: snapshot.availableSurfaces,
    };

    return {
      risk,
      inferredIntent,
      memory: this.getMemory(),
      suggestions,
      brainDecision: this.brain.decide(brainContext),
    };
  }
}

export function createAuraAutonomyEngine(): AuraAutonomyEngine {
  return new AuraAutonomyEngine();
}
