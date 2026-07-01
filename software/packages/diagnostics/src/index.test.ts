import { describe, expect, it } from 'vitest';
import { createDiagnosticsGateway } from './index';

describe('Diagnostics gateway', () => {
  it('identifies ECUs and tracks DTCs', async () => {
    const gateway = createDiagnosticsGateway();
    gateway.registerEcu({ id: 'body-ecu', name: 'Body ECU', address: '0x710', supportedProtocols: ['uds', 'obd-ii'], softwareVersion: '1.0.0' });
    gateway.recordDtc({ code: 'B1001', description: 'Ambient lighting communication degraded', status: 'stored', ecuId: 'body-ecu' });

    const identity = await gateway.identifyEcu('body-ecu');
    const dtcs = await gateway.readDtc('body-ecu');

    expect(identity.name).toBe('Body ECU');
    expect(dtcs[0]?.code).toBe('B1001');
  });

  it('requires extended session before clearing DTCs', async () => {
    const gateway = createDiagnosticsGateway();
    gateway.registerEcu({ id: 'comfort-ecu', name: 'Comfort ECU', address: '0x720', supportedProtocols: ['uds'] });
    gateway.recordDtc({ code: 'B2001', description: 'Seat controller intermittent', status: 'confirmed', ecuId: 'comfort-ecu' });

    await expect(gateway.clearDtc('comfort-ecu')).rejects.toThrow('extended diagnostic session');

    gateway.startSession('extended');
    const cleared = await gateway.clearDtc('comfort-ecu');

    expect(cleared).toBe(true);
    expect(gateway.snapshot().dtcs[0]?.status).toBe('cleared');
  });

  it('supports OBD-II live data requests', async () => {
    const gateway = createDiagnosticsGateway();
    gateway.registerEcu({ id: 'powertrain', name: 'Powertrain ECU', address: '0x7E0', supportedProtocols: ['obd-ii'] });

    const live = await gateway.readObdLiveData('powertrain', '0C');

    expect(live.pid).toBe('0C');
    expect(live.value).toBe(42);
  });
});
