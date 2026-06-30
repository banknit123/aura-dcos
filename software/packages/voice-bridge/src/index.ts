export type VoiceInputSource = 'typed' | 'microphone' | 'wakeWord';
export type VoiceOutputMode = 'silent' | 'textOnly' | 'speech' | 'speechAndText';
export type ResponseSafety = 'allowed' | 'modified' | 'blocked';
export type VoiceBridgeProviderKind = 'mock' | 'browser' | 'cloud' | 'edge';

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

const BLOCKED_PROMPT_PATTERNS = [
  /play\s+(a\s+)?movie/i,
  /show\s+(a\s+)?video/i,
  /open\s+(youtube|netflix|tiktok)/i,
  /turn\s+off\s+(safety|warnings?)/i,
];

function clampConfidence(confidence: number): number {
  if (Number.isNaN(confidence)) return 0;
  return Math.max(0, Math.min(100, Math.round(confidence)));
}

function truncateForDriver(text: string, maxLength: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
}

function containsBlockedPrompt(prompt: string): boolean {
  return BLOCKED_PROMPT_PATTERNS.some((pattern) => pattern.test(prompt));
}

export class MockLanguageModelAdapter implements LanguageModelAdapter {
  readonly kind: VoiceBridgeProviderKind = 'mock';

  async complete(request: LanguageModelRequest): Promise<LanguageModelResponse> {
    return {
      text: `AURA processed: ${request.prompt}. Safety mode is ${request.safetyMode}.`,
      confidence: 88,
    };
  }
}

export class NoopTextToSpeechAdapter implements TextToSpeechAdapter {
  readonly kind: VoiceBridgeProviderKind = 'mock';

  async speak(request: SpeechSynthesisRequest): Promise<SpeechSynthesisResult> {
    return {
      queued: request.mode === 'speech' || request.mode === 'speechAndText',
      spokenText: request.text,
      reason: request.mode === 'silent' || request.mode === 'textOnly'
        ? 'Speech skipped because the selected output mode is not spoken.'
        : 'Speech request accepted by the mock text-to-speech adapter.',
    };
  }
}

export class AuraVoiceBridge {
  private readonly languageModel: LanguageModelAdapter;
  private readonly textToSpeech?: TextToSpeechAdapter;

  constructor(options: AuraVoiceBridgeOptions = {}) {
    this.languageModel = options.languageModel ?? new MockLanguageModelAdapter();
    this.textToSpeech = options.textToSpeech;
  }

  createRequest(input: VoiceInput, context: VoiceBridgeContext): LanguageModelRequest {
    const transcript = input.transcript.trim();
    const safetyMode = context.risk === 'critical' || context.driverAttention === 'critical'
      ? 'emergency'
      : context.vehicleState === 'driving' || context.driverAttention === 'highLoad'
        ? 'driverSafe'
        : 'normal';

    return {
      prompt: transcript,
      systemContext: [
        'AURA cabin assistant.',
        `Safety mode: ${safetyMode}.`,
        `Locale: ${input.locale}.`,
        'Prioritise safety, reduce cognitive load, and avoid driver-visible distraction.',
      ].join(' '),
      maxTokens: safetyMode === 'normal' ? 180 : 60,
      safetyMode,
    };
  }

  async runTextTurn(input: VoiceInput, context: VoiceBridgeContext): Promise<VoiceTurnResult> {
    const request = this.createRequest(input, context);
    const modelResponse = await this.languageModel.complete(request);
    const safeResponse = this.gateResponse(modelResponse, context, request.prompt);
    const speech = this.textToSpeech
      ? await this.textToSpeech.speak({ text: safeResponse.text, locale: input.locale, mode: safeResponse.outputMode })
      : undefined;

    return { input, request, modelResponse, safeResponse, speech };
  }

  gateResponse(response: LanguageModelResponse, context: VoiceBridgeContext, originalPrompt = ''): SafeVoiceResponse {
    const safeConfidence = clampConfidence(response.confidence);

    if (containsBlockedPrompt(originalPrompt) && context.vehicleState === 'driving') {
      return {
        safety: 'blocked',
        outputMode: 'speech',
        text: 'I cannot show distracting content while driving. I can help with navigation, comfort or safety instead.',
        reason: 'Driver-visible entertainment and safety override requests are blocked while driving.',
      };
    }

    if (context.risk === 'critical' || context.driverAttention === 'critical') {
      return {
        safety: 'modified',
        outputMode: 'speech',
        text: 'Emergency guidance active. Please focus on safety instructions.',
        reason: 'Critical state allows only short safety-oriented spoken output.',
      };
    }

    if (safeConfidence < 45) {
      return {
        safety: 'modified',
        outputMode: context.vehicleState === 'driving' ? 'speech' : 'speechAndText',
        text: 'I am not confident enough to act on that. Please repeat or choose a safer cabin control.',
        reason: 'Low-confidence language-model output must not directly control cabin behaviour.',
      };
    }

    if (context.vehicleState === 'driving' || context.driverAttention === 'highLoad') {
      return {
        safety: 'modified',
        outputMode: 'speech',
        text: truncateForDriver(response.text, 120),
        reason: 'Driving state requires concise voice-first output.',
      };
    }

    return {
      safety: 'allowed',
      outputMode: 'speechAndText',
      text: response.text.trim(),
      reason: 'Parked or low-load state allows richer output.',
    };
  }
}

export function createAuraVoiceBridge(options?: AuraVoiceBridgeOptions): AuraVoiceBridge {
  return new AuraVoiceBridge(options);
}
