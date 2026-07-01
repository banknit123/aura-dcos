import { describe, expect, it } from 'vitest';
import { createAuraEmotionEngine } from './index';

describe('AuraEmotionEngine', () => {
  it('selects safety focus during critical risk', () => {
    const engine = createAuraEmotionEngine();
    const plan = engine.infer({
      vehicleState: 'driving',
      speedKph: 82,
      weather: 'rain',
      driverAttention: 'critical',
      occupants: 1,
      childPresent: false,
      risk: 'critical',
    });

    expect(plan.emotion).toBe('alert');
    expect(plan.theme).toBe('rainSafety');
    expect(plan.actions).toContain('safetyFocus');
  });

  it('detects family mode when a child is present', () => {
    const engine = createAuraEmotionEngine();
    const plan = engine.infer({
      vehicleState: 'parked',
      speedKph: 0,
      weather: 'clear',
      driverAttention: 'parked',
      occupants: 3,
      childPresent: true,
      risk: 'normal',
    });

    expect(plan.emotion).toBe('family');
    expect(plan.theme).toBe('familyGlow');
  });

  it('recommends fatigue support for tired sentiment', () => {
    const engine = createAuraEmotionEngine();
    const plan = engine.infer({
      vehicleState: 'driving',
      speedKph: 60,
      weather: 'clear',
      driverAttention: 'highLoad',
      occupants: 1,
      childPresent: false,
      risk: 'elevated',
      voiceSentiment: 'tired',
    });

    expect(plan.emotion).toBe('fatigued');
    expect(plan.actions).toContain('suggestBreak');
  });
});
