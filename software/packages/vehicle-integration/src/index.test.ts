import { describe, expect, it } from 'vitest';
import {
  createVehicleDisplayMapper,
  createVehicleIntegrationGateway,
  SimulatorVehicleIntegrationAdapter,
} from './index';

describe('Vehicle Integration Framework', () => {
  it('discovers a simulator cabin profile', async () => {
    const gateway = createVehicleIntegrationGateway(new SimulatorVehicleIntegrationAdapter());
    const profile = await gateway.discoverProfile();

    expect(profile.displays.length).toBeGreaterThanOrEqual(4);
    expect(profile.displays.some((display) => display.role === 'dashboard')).toBe(true);
    expect(profile.mode).toBe('demo');
  });

  it('maps requested AURA surfaces to available vehicle displays', async () => {
    const gateway = createVehicleIntegrationGateway();
    const profile = await gateway.discoverProfile();
    const routes = createVehicleDisplayMapper().map(profile, ['dashboard', 'roof', 'projection', 'floor']);

    expect(routes).toHaveLength(4);
    expect(routes[0]?.displayId).toBe('display-dashboard');
    expect(routes.some((route) => route.role === 'roof')).toBe(true);
  });

  it('blocks unsafe immersive display commands while driving', async () => {
    const gateway = createVehicleIntegrationGateway();
    const result = await gateway.execute({
      target: 'display',
      action: 'enableImmersiveVideo',
      payload: { vehicleState: 'driving' },
      safetyCritical: false,
    });

    expect(result.decision).toBe('denied');
  });

  it('reports integration diagnostics', async () => {
    const gateway = createVehicleIntegrationGateway();
    const profile = await gateway.discoverProfile();
    const diagnostics = gateway.diagnostics(profile);

    expect(diagnostics.ready).toBe(true);
    expect(diagnostics.totalHardware).toBeGreaterThan(0);
    expect(diagnostics.messages[0]).toContain('display');
  });
});
