import { describe, expect, it } from 'vitest';
import { createAuraCompanionEngine } from './index';

describe('AuraCompanionEngine', () => {
  it('switches to emergency mode for critical attention', () => {
    const engine = createAuraCompanionEngine();
    const state = engine.evaluate({ driverAttention: 'critical', childPresent: false, emergencyActive: false });

    expect(state.mode).toBe('emergency');
    expect(state.allowVisualMotion).toBe(false);
    expect(state.allowSpeech).toBe(true);
  });

  it('uses voice-only mode during high driver workload', () => {
    const engine = createAuraCompanionEngine();
    const state = engine.evaluate({ driverAttention: 'highLoad', childPresent: true, emergencyActive: false });

    expect(state.mode).toBe('voiceOnly');
    expect(state.animationLevel).toBe(0);
  });
});
