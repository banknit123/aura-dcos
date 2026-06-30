import { describe, expect, it } from 'vitest';
import {
  createAuraProviderRegistry,
  LocalEchoLanguageModelAdapter,
  MockVehicleAdapter,
} from './index';

describe('AuraProviderRegistry', () => {
  it('reports provider readiness', () => {
    const registry = createAuraProviderRegistry();
    const status = registry.status();

    expect(status.ready).toBe(true);
    expect(status.providers.length).toBe(3);
  });

  it('maps vehicle fatigue data into autonomy signals', async () => {
    const registry = createAuraProviderRegistry({
      vehicle: new MockVehicleAdapter([
        { id: 'fatigue', kind: 'fatigue', value: true, confidence: 88, timestamp: new Date().toISOString() },
      ]),
    });

    const signals = await registry.readAutonomySignals();
    expect(signals[0]?.kind).toBe('occupant');
    expect(signals[0]?.confidence).toBe(88);
  });

  it('supports a local language model adapter', async () => {
    const adapter = new LocalEchoLanguageModelAdapter();
    const response = await adapter.complete({
      prompt: 'navigate home',
      systemContext: 'AURA test',
      maxTokens: 60,
      safetyMode: 'driverSafe',
    });

    expect(response.text).toContain('navigation');
    expect(response.confidence).toBeGreaterThan(80);
  });
});
