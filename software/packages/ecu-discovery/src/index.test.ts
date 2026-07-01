import { describe, expect, it } from 'vitest';
import { createSimulatorEcuDiscoveryService } from './index';

describe('EcuDiscoveryService', () => {
  it('discovers simulator ECUs and summarizes trusted devices', async () => {
    const service = createSimulatorEcuDiscoveryService();
    const ecus = await service.discover();

    expect(ecus).toHaveLength(2);
    expect(service.snapshot().trusted).toBe(2);
  });

  it('updates ECU trust state', async () => {
    const service = createSimulatorEcuDiscoveryService();
    await service.discover();

    const updated = service.markTrust('body-domain-controller', 'unknown');

    expect(updated.trustState).toBe('unknown');
    expect(service.snapshot().unknown).toBe(1);
  });
});
