import { describe, expect, it } from 'vitest';
import { createAuraVehicleSimulator } from './index';

describe('AuraVehicleSimulator', () => {
  it('lists built-in simulator scenarios', () => {
    const simulator = createAuraVehicleSimulator();
    expect(simulator.listScenarios()).toContain('fatigueDrive');
    expect(simulator.listScenarios()).toContain('rainCommute');
  });

  it('replays scenario signals', () => {
    const simulator = createAuraVehicleSimulator();
    const result = simulator.replay('fatigueDrive');

    expect(result.frameCount).toBeGreaterThan(0);
    expect(result.signals.some((signal) => signal.kind === 'fatigue')).toBe(true);
  });

  it('returns defensive frame copies', () => {
    const simulator = createAuraVehicleSimulator();
    const first = simulator.framesFor('parkedFamily');
    first[0]?.signals.push({ id: 'mutated', kind: 'door', value: false, confidence: 1, timestamp: new Date().toISOString() });

    const second = simulator.framesFor('parkedFamily');
    expect(second[0]?.signals.some((signal) => signal.id === 'mutated')).toBe(false);
  });
});
