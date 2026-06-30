import { type AutonomySignal } from '@aura-dcos/autonomy';
import {
  MockLanguageModelAdapter,
  NoopTextToSpeechAdapter,
  type LanguageModelAdapter,
  type LanguageModelRequest,
  type LanguageModelResponse,
  type SpeechSynthesisRequest,
  type SpeechSynthesisResult,
  type TextToSpeechAdapter,
} from '@aura-dcos/voice-bridge';

export type AuraProviderKind = 'mock' | 'local' | 'cloud' | 'vehicle';
export type AuraProviderHealth = 'ready' | 'degraded' | 'unavailable';
export type VehicleSignalKind = 'speed' | 'gear' | 'weather' | 'fatigue' | 'seatbelt' | 'door' | 'battery';

export interface AuraProviderStatus {
  id: string;
  kind: AuraProviderKind;
  health: AuraProviderHealth;
  message: string;
}

export interface AuraProviderRegistryStatus {
  providers: AuraProviderStatus[];
  ready: boolean;
}

export interface VehicleSignal {
  id: string;
  kind: VehicleSignalKind;
  value: string | number | boolean;
  confidence: number;
  timestamp: string;
}

export interface VehicleAdapter {
  readonly id: string;
  readonly kind: AuraProviderKind;
  status(): AuraProviderStatus;
  readSignals(): Promise<VehicleSignal[]>;
}

export interface ProviderRegistryOptions {
  languageModel?: LanguageModelAdapter;
  textToSpeech?: TextToSpeechAdapter;
  vehicle?: VehicleAdapter;
}

function clampConfidence(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export class LocalEchoLanguageModelAdapter implements LanguageModelAdapter {
  readonly kind = 'local' as const;

  async complete(request: LanguageModelRequest): Promise<LanguageModelResponse> {
    const intentHint = request.prompt.toLowerCase().includes('navigate') ? 'navigation' : 'cabin assistance';
    return {
      text: `Local AURA provider handled ${intentHint}: ${request.prompt}`,
      confidence: request.safetyMode === 'emergency' ? 94 : 86,
    };
  }
}

export class LocalConsoleTextToSpeechAdapter implements TextToSpeechAdapter {
  readonly kind = 'local' as const;

  async speak(request: SpeechSynthesisRequest): Promise<SpeechSynthesisResult> {
    return {
      queued: request.mode === 'speech' || request.mode === 'speechAndText',
      spokenText: request.text,
      reason: `Local TTS provider accepted ${request.mode} output for ${request.locale}.`,
    };
  }
}

export class MockVehicleAdapter implements VehicleAdapter {
  readonly id = 'mock-vehicle-adapter';
  readonly kind = 'vehicle' as const;

  constructor(private readonly signals: VehicleSignal[] = []) {}

  status(): AuraProviderStatus {
    return {
      id: this.id,
      kind: this.kind,
      health: 'ready',
      message: 'Mock vehicle adapter ready for prototype signal replay.',
    };
  }

  async readSignals(): Promise<VehicleSignal[]> {
    return this.signals.map((signal) => ({ ...signal, confidence: clampConfidence(signal.confidence) }));
  }
}

export class AuraProviderRegistry {
  readonly languageModel: LanguageModelAdapter;
  readonly textToSpeech: TextToSpeechAdapter;
  readonly vehicle: VehicleAdapter;

  constructor(options: ProviderRegistryOptions = {}) {
    this.languageModel = options.languageModel ?? new MockLanguageModelAdapter();
    this.textToSpeech = options.textToSpeech ?? new NoopTextToSpeechAdapter();
    this.vehicle = options.vehicle ?? new MockVehicleAdapter();
  }

  status(): AuraProviderRegistryStatus {
    const providers: AuraProviderStatus[] = [
      { id: 'language-model', kind: this.languageModel.kind, health: 'ready', message: `${this.languageModel.kind} language-model adapter registered.` },
      { id: 'text-to-speech', kind: this.textToSpeech.kind, health: 'ready', message: `${this.textToSpeech.kind} text-to-speech adapter registered.` },
      this.vehicle.status(),
    ];

    return {
      providers,
      ready: providers.every((provider) => provider.health !== 'unavailable'),
    };
  }

  async readAutonomySignals(): Promise<AutonomySignal[]> {
    const vehicleSignals = await this.vehicle.readSignals();
    return vehicleSignals.map((signal): AutonomySignal => ({
      id: signal.id,
      kind: signal.kind === 'fatigue' ? 'occupant' : 'vehicle',
      value: signal.value,
      confidence: clampConfidence(signal.confidence),
      timestamp: signal.timestamp,
    }));
  }
}

export function createAuraProviderRegistry(options?: ProviderRegistryOptions): AuraProviderRegistry {
  return new AuraProviderRegistry(options);
}
