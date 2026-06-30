import { describe, expect, it } from 'vitest';
import { createAuraVoiceBridge } from './index';

describe('AuraVoiceBridge', () => {
  it('creates emergency mode requests for critical context', () => {
    const bridge = createAuraVoiceBridge();
    const request = bridge.createRequest(
      { source: 'typed', transcript: 'What should I do?', locale: 'en-AU' },
      { vehicleState: 'driving', driverAttention: 'critical', risk: 'critical' },
    );

    expect(request.safetyMode).toBe('emergency');
    expect(request.maxTokens).toBe(60);
  });

  it('shortens responses while driving', () => {
    const bridge = createAuraVoiceBridge();
    const safe = bridge.gateResponse(
      { text: 'This is a long response that should be shortened because the vehicle is driving and driver attention needs to stay focused on the road ahead.', confidence: 90 },
      { vehicleState: 'driving', driverAttention: 'highLoad', risk: 'elevated' },
    );

    expect(safe.safety).toBe('modified');
    expect(safe.outputMode).toBe('speech');
  });
});
