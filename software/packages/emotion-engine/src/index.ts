export type CabinEmotion = 'calm' | 'focused' | 'stressed' | 'fatigued' | 'family' | 'alert' | 'celebration';
export type WellnessAction = 'reduceMotion' | 'increaseClarity' | 'calmLighting' | 'familyPlay' | 'suggestBreak' | 'safetyFocus' | 'celebrate';

export interface EmotionInput {
  vehicleState: 'parked' | 'driving';
  speedKph: number;
  weather: 'clear' | 'rain' | 'fog';
  driverAttention: string;
  occupants: number;
  childPresent: boolean;
  risk: 'normal' | 'elevated' | 'critical';
  voiceSentiment?: 'positive' | 'neutral' | 'frustrated' | 'tired';
}

export interface EmotionPlan {
  emotion: CabinEmotion;
  confidence: number;
  theme: string;
  companionMood: string;
  companionTone: string;
  actions: WellnessAction[];
  message: string;
  surfaceEnergyLimit: number;
}

export class AuraEmotionEngine {
  infer(input: EmotionInput): EmotionPlan {
    if (input.risk === 'critical' || input.driverAttention === 'critical') {
      return {
        emotion: 'alert',
        confidence: 0.96,
        theme: 'rainSafety',
        companionMood: 'emergency',
        companionTone: 'short, calm and directive',
        actions: ['safetyFocus', 'reduceMotion', 'increaseClarity'],
        message: 'Safety mode active. Non-essential cabin motion reduced.',
        surfaceEnergyLimit: 95,
      };
    }

    if (input.voiceSentiment === 'tired' || input.driverAttention === 'highLoad') {
      return {
        emotion: 'fatigued',
        confidence: 0.88,
        theme: 'forestZen',
        companionMood: 'focused',
        companionTone: 'gentle and concise',
        actions: ['suggestBreak', 'reduceMotion', 'calmLighting'],
        message: 'You seem tired. I can simplify the cabin and suggest a rest stop.',
        surfaceEnergyLimit: 55,
      };
    }

    if (input.voiceSentiment === 'frustrated' || (input.weather === 'rain' && input.speedKph > 50)) {
      return {
        emotion: 'stressed',
        confidence: 0.84,
        theme: 'oceanSerenity',
        companionMood: 'focused',
        companionTone: 'reassuring and low-pressure',
        actions: ['calmLighting', 'reduceMotion', 'increaseClarity'],
        message: 'I will keep the cabin calm and reduce unnecessary prompts.',
        surfaceEnergyLimit: 60,
      };
    }

    if (input.childPresent || input.occupants >= 3) {
      return {
        emotion: 'family',
        confidence: 0.82,
        theme: input.vehicleState === 'parked' ? 'familyGlow' : 'oceanSerenity',
        companionMood: 'friendly',
        companionTone: 'warm and helpful',
        actions: input.vehicleState === 'parked' ? ['familyPlay', 'calmLighting'] : ['calmLighting', 'reduceMotion'],
        message: input.vehicleState === 'parked' ? 'Family mode is ready.' : 'Family ambience active while driver displays stay focused.',
        surfaceEnergyLimit: input.vehicleState === 'parked' ? 90 : 52,
      };
    }

    if (input.vehicleState === 'driving') {
      return {
        emotion: 'focused',
        confidence: 0.78,
        theme: 'executiveCalm',
        companionMood: 'focused',
        companionTone: 'brief and useful',
        actions: ['increaseClarity', 'reduceMotion'],
        message: 'Focused drive mode active.',
        surfaceEnergyLimit: 70,
      };
    }

    return {
      emotion: 'calm',
      confidence: 0.72,
      theme: 'auroraDrive',
      companionMood: 'friendly',
      companionTone: 'calm and premium',
      actions: ['calmLighting'],
      message: 'Calm cabin ambience active.',
      surfaceEnergyLimit: 85,
    };
  }
}

export function createAuraEmotionEngine(): AuraEmotionEngine {
  return new AuraEmotionEngine();
}
