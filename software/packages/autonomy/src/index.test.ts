import { describe, expect, it } from 'vitest';
import { createAuraAutonomyEngine, type AutonomyCabinSnapshot } from './index';

const baseSnapshot: AutonomyCabinSnapshot = {
  vehicleState: 'parked',
  speedKph: 0,
  weather: 'clear',
  driverAttention: 'parked',
  childPresent: true,
  occupants: 3,
  availableSurfaces: ['dashboard', 'projection', 'roof', 'floor'],
};

describe('AuraAutonomyEngine', () => {
  it('creates family welcome suggestions while parked with child present', () => {
    const engine = createAuraAutonomyEngine();
    const result = engine.runCycle(baseSnapshot, [
      { id: 'entry-detected', kind: 'occupant', value: true, confidence: 95, timestamp: new Date().toISOString() },
    ]);

    expect(result.inferredIntent).toBe('welcome');
    expect(result.suggestions.some((suggestion) => suggestion.id === 'family-welcome')).toBe(true);
    expect(result.brainDecision.actions.length).toBeGreaterThan(0);
  });

  it('escalates to critical safety mode in fog while driving', () => {
    const engine = createAuraAutonomyEngine();
    const result = engine.runCycle({
      ...baseSnapshot,
      vehicleState: 'driving',
      speedKph: 72,
      weather: 'fog',
      driverAttention: 'highLoad',
      childPresent: false,
    }, []);

    expect(result.risk).toBe('critical');
    expect(result.inferredIntent).toBe('emergency');
    expect(result.suggestions[0]?.id).toBe('safety-focus');
  });

  it('stores session and profile memory from signals', () => {
    const engine = createAuraAutonomyEngine();
    const result = engine.runCycle(baseSnapshot, [
      { id: 'voice-command', kind: 'voice', value: 'make cabin calm', confidence: 91, timestamp: new Date().toISOString() },
      { id: 'comfort-preference', kind: 'occupant', value: 'soft blue ambience', confidence: 80, timestamp: new Date().toISOString() },
    ]);

    expect(result.memory.some((item) => item.key === 'lastVoiceIntent')).toBe(true);
    expect(result.memory.some((item) => item.key === 'comfortPreference')).toBe(true);
    expect(result.suggestions.some((suggestion) => suggestion.id === 'remembered-comfort')).toBe(true);
  });
});
