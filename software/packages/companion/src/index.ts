export type CompanionMood = 'calm' | 'friendly' | 'focused' | 'alert' | 'emergency';
export type CompanionMode = 'visual' | 'voiceOnly' | 'silent' | 'assistive' | 'emergency';
export type DriverAttentionState = 'parked' | 'lowLoad' | 'mediumLoad' | 'highLoad' | 'critical';

export interface CompanionState {
  name: string;
  mood: CompanionMood;
  mode: CompanionMode;
  message: string;
  animationLevel: number;
  allowVisualMotion: boolean;
  allowSpeech: boolean;
}

export interface CompanionInput {
  driverAttention: DriverAttentionState;
  childPresent: boolean;
  emergencyActive: boolean;
}

export class AuraCompanionEngine {
  evaluate(input: CompanionInput): CompanionState {
    if (input.emergencyActive || input.driverAttention === 'critical') {
      return {
        name: 'AURA',
        mood: 'emergency',
        mode: 'emergency',
        message: 'Emergency guidance active.',
        animationLevel: 0,
        allowVisualMotion: false,
        allowSpeech: true,
      };
    }

    if (input.driverAttention === 'highLoad') {
      return {
        name: 'AURA',
        mood: 'focused',
        mode: 'voiceOnly',
        message: 'Voice-only assistance enabled.',
        animationLevel: 0,
        allowVisualMotion: false,
        allowSpeech: true,
      };
    }

    if (input.driverAttention === 'mediumLoad') {
      return {
        name: 'AURA',
        mood: 'calm',
        mode: 'assistive',
        message: 'I will keep information minimal.',
        animationLevel: 20,
        allowVisualMotion: false,
        allowSpeech: true,
      };
    }

    return {
      name: 'AURA',
      mood: input.childPresent ? 'friendly' : 'calm',
      mode: 'visual',
      message: input.childPresent ? 'Family mode active.' : 'Ready when you are.',
      animationLevel: input.childPresent ? 70 : 45,
      allowVisualMotion: true,
      allowSpeech: true,
    };
  }
}

export function createAuraCompanionEngine(): AuraCompanionEngine {
  return new AuraCompanionEngine();
}
