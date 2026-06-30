import { describe, expect, it } from 'vitest';
import {
  createAuraOtaManager,
  createAuraSecurityPolicyEngine,
  createAuraTelemetryBuffer,
  SimulatorPlatformGateway,
} from './index';

describe('Aura vehicle platform', () => {
  it('blocks immersive video while driving', () => {
    const policy = createAuraSecurityPolicyEngine();
    const result = policy.evaluate({
      vehicleState: 'driving',
      driverAttention: 'mediumLoad',
      command: {
        target: 'display',
        action: 'enableImmersiveVideo',
        payload: {},
        safetyCritical: false,
      },
    });

    expect(result.decision).toBe('deny');
  });

  it('audits safety-critical commands', () => {
    const policy = createAuraSecurityPolicyEngine();
    const result = policy.evaluate({
      vehicleState: 'driving',
      driverAttention: 'lowLoad',
      command: {
        target: 'system',
        action: 'enableSafetyFocus',
        payload: {},
        safetyCritical: true,
      },
    });

    expect(result.decision).toBe('audit');
  });

  it('records bounded telemetry events', () => {
    const telemetry = createAuraTelemetryBuffer();
    telemetry.record('test', 'info', 'first event');

    expect(telemetry.list()[0]?.message).toBe('first event');
  });

  it('checks OTA update status', () => {
    const ota = createAuraOtaManager();
    const status = ota.checkForUpdate('0.2.0-prototype');

    expect(status.state).toBe('available');
    expect(status.availableVersion).toBe('0.2.0-prototype');
  });

  it('provides a simulator platform gateway', async () => {
    const gateway = new SimulatorPlatformGateway([
      { id: 'speed', kind: 'speed', value: 40, confidence: 100, timestamp: new Date().toISOString() },
    ]);

    expect(gateway.status().health).toBe('ready');
    expect(await gateway.readSignals()).toHaveLength(1);
  });
});
