import { describe, expect, it } from 'vitest';
import { createVehicleSignalManager } from './index';

describe('VehicleSignalManager', () => {
  it('ingests signals and notifies subscribers', () => {
    const manager = createVehicleSignalManager();
    manager.register({ id: 'vehicle.speedKph', name: 'Vehicle Speed', domain: 'powertrain', unit: 'km/h', freshnessMs: 1000, writable: false });
    const seen: number[] = [];
    manager.subscribe('vehicle.speedKph', (sample) => seen.push(Number(sample.value)));

    manager.ingest({ id: 'vehicle.speedKph', value: 42, quality: 'valid', source: 'can', timestamp: new Date().toISOString() });

    expect(manager.requireFresh('vehicle.speedKph').value).toBe(42);
    expect(seen).toEqual([42]);
  });

  it('marks stale signals in snapshots', () => {
    const manager = createVehicleSignalManager();
    manager.register({ id: 'door.driverOpen', name: 'Driver Door Open', domain: 'body', freshnessMs: 10, writable: false });
    manager.ingest({ id: 'door.driverOpen', value: false, quality: 'valid', source: 'lin', timestamp: new Date(0).toISOString() });

    expect(manager.snapshot(Date.now()).staleSignals).toContain('door.driverOpen');
  });
});
