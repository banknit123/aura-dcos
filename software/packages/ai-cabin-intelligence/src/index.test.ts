import { describe, expect, it } from 'vitest';
import { createAiCabinIntelligenceEngine } from './index';

describe('AiCabinIntelligenceEngine', () => {
  const profile = { id: 'driver-1', displayName: 'Driver', preferences: {}, consent: { memory: true, personalization: true } };

  it('creates fatigue safety actions without requiring consent', () => {
    const engine = createAiCabinIntelligenceEngine();
    const result = engine.analyze(profile, { profileId: 'driver-1', speedKph: 90, driverFatigueScore: 0.82 });
    expect(result.inferredEmotion).toBe('tired');
    expect(result.actions[0]?.id).toBe('fatigue-break');
    expect(result.actions[0]?.requiresConsent).toBe(false);
  });

  it('uses consented memory for personalization', () => {
    const engine = createAiCabinIntelligenceEngine();
    engine.remember(profile, 'preferredScene', 'auroraDrive', 'high');
    const result = engine.analyze(profile, { profileId: 'driver-1', speedKph: 0 });
    expect(result.memoryUsed).toHaveLength(1);
    expect(result.actions.some((action) => action.id === 'personal-scene')).toBe(true);
  });
});
