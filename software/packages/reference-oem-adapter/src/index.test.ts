import { describe, expect, it } from 'vitest';
import { createReferenceOemAdapter } from './index';

describe('ReferenceOemAdapter', () => {
  it('exposes simulator ECU topology and mappings', () => {
    const adapter = createReferenceOemAdapter();
    const snapshot = adapter.snapshot();

    expect(snapshot.adapterId).toBe('reference-oem-suv-adapter');
    expect(snapshot.ecus.map((ecu) => ecu.id)).toContain('body-ecu');
    expect(snapshot.signalMappings.some((mapping) => mapping.auraSignal === 'vehicle.speedKph')).toBe(true);
    expect(snapshot.commandMappings.every((mapping) => mapping.requiresGateway)).toBe(true);
  });

  it('returns simulator diagnostics for known ECUs', () => {
    const adapter = createReferenceOemAdapter();
    const diagnostic = adapter.readDiagnostic('comfort-ecu');

    expect(diagnostic.positive).toBe(true);
    expect(diagnostic.payload).toContain('Comfort ECU');
  });
});
