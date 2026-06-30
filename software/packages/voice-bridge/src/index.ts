export type VoiceInputSource = 'typed' | 'microphone' | 'wakeWord';
export type VoiceOutputMode = 'silent' | 'textOnly' | 'speech' | 'speechAndText';
export type ResponseSafety = 'allowed' | 'modified' | 'blocked';
export type VoiceBridgeProviderKind = 'mock' | 'browser' | 'cloud' | 'edge' | 'local';

export interface VoiceInput {
  source: VoiceInputSource;
  transcript: string;
  locale: string;
}

export interface AudioInput {
  source: Exclude<VoiceInputSource, 'typed'>;
  audioBytes: Uint8Array;
  locale: string;
}

export interface SpeechRecognitionResult {
  transcript: string;
  locale: string;
  confidence: number;
  isFinal: boolean;
}

export interface SpeechSynthesisRequest {
  text: string;
  locale: string;
  mode: VoiceOutputMode;
}

export interface SpeechSynthesisResult {
  queued: boolean;
  spokenText: string;
  reason: string;
}

export interface LanguageModelRequest {
  prompt: string;
  systemContext: string;
  maxTokens: number;
  safetyMode: 'normal' | 'driverSafe' | 'emergency';
}

export interface LanguageModelResponse {
  text: string;
  confidence: number;
}

export interface SafeVoiceResponse {
  safety: ResponseSafety;
  outputMode: VoiceOutputMode;
  text: string;
  reason: string;
}

export interface VoiceBridgeContext {
  vehicleState: 'parked' | 'driving';
  driverAttention: 'parked' | 'lowLoad' | 'mediumLoad' | 'highLoad' | 'critical';
  risk: 'normal' | 'elevated' | 'critical';
}

export interface VoiceTurnResult {
  input: VoiceInput;
  request: LanguageModelRequest;
  modelResponse: LanguageModelResponse;
  safeResponse: SafeVoiceResponse;
  speech?: SpeechSynthesisResult;
}

export interface SpeechToTextAdapter {
  readonly kind: VoiceBridgeProviderKind;
  transcribe(input: AudioInput): Promise<SpeechRecognitionResult>;
}

export interface TextToSpeechAdapter {
  readonly kind: VoiceBridgeProviderKind;
  speak(request: SpeechSynthesisRequest): Promise<SpeechSynthesisResult>;
}

export interface LanguageModelAdapter {
  readonly kind: VoiceBridgeProviderKind;
  complete(request: LanguageModelRequest): Promise<LanguageModelResponse>;
}

export interface AuraVoiceBridgeOptions {
  languageModel?: LanguageModelAdapter;
  textToSpeech?: TextToSpeechAdapter;
}

export class MockLanguageModelAdapter implements LanguageModelAdapter {
  readonly kind = 'mock' as const;

  async complete(request: LanguageModelRequest): Promise<LanguageModelResponse> {
    return {
      text: request.safetyMode === 'emergency'
        ? 'Emergency guidance active. Stay focused and follow safety instructions.'
        : `AURA understood: ${request.prompt}`,
      confidence: request.safetyMode === 'driverSafe' ? 88 : 92,
    };
  }
}

export class NoopTextToSpeechAdapter implements TextToSpeechAdapter {
  readonly kind = 'mock' as const;

  async speak(request: SpeechSynthesisRequest): Promise<SpeechSynthesisResult> {
    return {
      queued: false,
      spokenText: request.text,
      reason: 'No text-to-speech adapter configured.',
    };
  }
}

function safetyMode(context: VoiceBridgeContext): LanguageModelRequest['safetyMode'] {
  if (context.risk === 'critical' || context.driverAttention === 'critical') return 'emergency';
  if (context.vehicleState === 'driving') return 'driverSafe';
  return 'normal';
}

function tokenBudget(context: VoiceBridgeContext): number {
  if (context.risk === 'critical' || context.driverAttention === 'critical') return 60;
  if (context.vehicleState === 'driving') return 80;
  return 180;
}

function safeResponseFor(input: VoiceInput, context: VoiceBridgeContext, modelResponse: LanguageModelResponse): SafeVoiceResponse {
  const lower = input.transcript.toLowerCase();

  if (context.risk === 'critical' || context.driverAttention === 'critical') {
    return {
      safety: 'modified',
      outputMode: 'speech',
      text: 'Emergency guidance active. Non-essential conversation is paused.',
      reason: 'Critical driver workload requires emergency voice-only output.',
    };
  }

  if (context.vehicleState === 'driving' && (lower.includes('video') || lower.includes('game') || lower.includes('movie'))) {
    return {
      safety: 'blocked',
      outputMode: 'speech',
      text: 'I cannot start distracting entertainment while driving.',
      reason: 'Driver-visible entertainment is blocked while the vehicle is moving.',
    };
  }

  if (context.vehicleState === 'driving') {
    return {
      safety: 'modified',
      outputMode: 'speech',
      text: modelResponse.text.slice(0, 120),
      reason: 'Driving mode uses concise voice-first output.',
    };
  }

  return {
    safety: 'allowed',
    outputMode: 'speechAndText',
    text: modelResponse.text,
    reason: 'Parked or low-risk state allows normal voice and visual response.',
  };
}

export class AuraVoiceBridge {
  private readonly languageModel: LanguageModelAdapter;
  private readonly textToSpeech: TextToSpeechAdapter;

  constructor(options: AuraVoiceBridgeOptions = {}) {
    this.languageModel = options.languageModel ?? new MockLanguageModelAdapter();
    this.textToSpeech = options.textToSpeech ?? new NoopTextToSpeechAdapter();
  }

  createRequest(input: VoiceInput, context: VoiceBridgeContext): LanguageModelRequest {
    return {
      prompt: input.transcript,
      systemContext: `vehicle=${context.vehicleState};attention=${context.driverAttention};risk=${context.risk}`,
      maxTokens: tokenBudget(context),
      safetyMode: safetyMode(context),
    };
  }

  gateResponse(modelResponse: LanguageModelResponse, context: VoiceBridgeContext, input?: VoiceInput): SafeVoiceResponse {
    return safeResponseFor(input ?? { source: 'typed', transcript: '', locale: 'en-AU' }, context, modelResponse);
  }

  async runTextTurn(input: VoiceInput, context: VoiceBridgeContext): Promise<VoiceTurnResult> {
    const request = this.createRequest(input, context);
    const modelResponse = await this.languageModel.complete(request);
    const safeResponse = this.gateResponse(modelResponse, context, input);
    const speech = await this.textToSpeech.speak({ text: safeResponse.text, locale: input.locale, mode: safeResponse.outputMode });

    return { input, request, modelResponse, safeResponse, speech };
  }
}

export function createAuraVoiceBridge(options?: AuraVoiceBridgeOptions): AuraVoiceBridge {
  return new AuraVoiceBridge(options);
}
