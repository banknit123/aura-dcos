export type VoiceInputSource = 'typed' | 'microphone' | 'wakeWord';
export type VoiceOutputMode = 'silent' | 'textOnly' | 'speech' | 'speechAndText';
export type ResponseSafety = 'allowed' | 'modified' | 'blocked';

export interface VoiceInput {
  source: VoiceInputSource;
  transcript: string;
  locale: string;
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

export class AuraVoiceBridge {
  createRequest(input: VoiceInput, context: VoiceBridgeContext): LanguageModelRequest {
    const safetyMode = context.risk === 'critical' || context.driverAttention === 'critical'
      ? 'emergency'
      : context.vehicleState === 'driving' || context.driverAttention === 'highLoad'
        ? 'driverSafe'
        : 'normal';

    return {
      prompt: input.transcript.trim(),
      systemContext: `AURA cabin assistant. Safety mode: ${safetyMode}. Keep driver distraction low.`,
      maxTokens: safetyMode === 'normal' ? 180 : 60,
      safetyMode,
    };
  }

  gateResponse(response: LanguageModelResponse, context: VoiceBridgeContext): SafeVoiceResponse {
    if (context.risk === 'critical' || context.driverAttention === 'critical') {
      return {
        safety: 'modified',
        outputMode: 'speech',
        text: 'Emergency guidance active. Please focus on safety instructions.',
        reason: 'Critical state allows only short safety-oriented spoken output.',
      };
    }

    if (context.vehicleState === 'driving' || context.driverAttention === 'highLoad') {
      const shortText = response.text.length > 120 ? `${response.text.slice(0, 117)}...` : response.text;
      return {
        safety: 'modified',
        outputMode: 'speech',
        text: shortText,
        reason: 'Driving state requires concise voice-first output.',
      };
    }

    return {
      safety: 'allowed',
      outputMode: 'speechAndText',
      text: response.text,
      reason: 'Parked or low-load state allows richer output.',
    };
  }
}

export function createAuraVoiceBridge(): AuraVoiceBridge {
  return new AuraVoiceBridge();
}
