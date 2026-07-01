import { describe, expect, it } from 'vitest';
import {
  SimulatorVehicleBusAdapter,
  createSimulatorVehicleHal,
  createVehicleHardwareAbstractionLayer,
  type VehicleHalCommand,
} from '../src/index';

describe('VehicleHardwareAbstractionLayer', () => {
  it('discovers endpoints and caches simulator signals', async () => {
    const hal = createSimulatorVehicleHal();

    const endpoints = await hal.discover();
    const signals = await hal.pollSignals();
    const snapshot = hal.snapshot();

    expect(endpoints).toHaveLength(2);
    expect(signals.length).toBeGreaterThan(0);
    expect(snapshot.ready).toBe(true);
    expect(snapshot.buses[0]?.kind).toBe('simulator');
    expect(snapshot.signals.some((signal) => signal.signal === 'cabinTemperatureC')).toBe(true);
  });

  it('rejects commands before discovery and unsupported commands after discovery', async () => {
    const hal = createSimulatorVehicleHal();
    const command: VehicleHalCommand = {
      id: 'cmd-unsupported',
      endpointId: 'body-comfort-domain',
      command: 'openSunroof',
      payload: {},
      safetyLevel: 'comfort',
      requestedAt: new Date().toISOString(),
    };

    await expect(hal.execute(command)).resolves.toMatchObject({ accepted: false, reason: 'Endpoint not discovered: body-comfort-domain' });

    await hal.discover();
    await expect(hal.execute(command)).resolves.toMatchObject({ accepted: false, reason: 'Command not supported by endpoint: openSunroof' });
  });

  it('routes supported secure commands to the registered bus adapter', async () => {
    const bus = new SimulatorVehicleBusAdapter();
    const hal = createVehicleHardwareAbstractionLayer('bench');
    hal.registerBus(bus);
    await hal.discover();

    const result = await hal.execute({
      id: 'cmd-temp-1',
      endpointId: 'body-comfort-domain',
      command: 'setTemperature',
      payload: { targetTemperatureC: 21 },
      safetyLevel: 'comfort',
      requestedAt: new Date().toISOString(),
      requireSecureBus: true,
    });

    expect(result).toMatchObject({ accepted: true, commandId: 'cmd-temp-1' });
    expect(bus.getCommandLog()).toHaveLength(1);
    expect(bus.getCommandLog()[0]?.payload).toEqual({ targetTemperatureC: 21 });
  });
});
