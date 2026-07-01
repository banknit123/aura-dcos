import { describe, expect, it } from 'vitest';
import { createSecureVehicleGateway } from './index';

describe('SecureVehicleGateway', () => {
  it('blocks parked-only commands while moving', () => {
    const gateway = createSecureVehicleGateway();
    const result = gateway.authorize({ id: 'ota-install', target: 'ota', action: 'install', risk: 'high', requiresParked: true }, { vehicleSpeedKph: 20, trustedEcus: [], operator: 'studio' });
    expect(result.decision).toBe('deny');
    expect(gateway.auditEvents()).toHaveLength(1);
  });

  it('audits high risk commands', () => {
    const gateway = createSecureVehicleGateway();
    const result = gateway.authorize({ id: 'diag-clear', target: 'diagnostics', action: 'clearDtc', risk: 'high' }, { vehicleSpeedKph: 0, trustedEcus: [], operator: 'studio' });
    expect(result.decision).toBe('audit');
  });
});
