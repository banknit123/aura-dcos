import { describe, expect, it } from 'vitest';
import { createOtaUpdateManager } from './index';

describe('OtaUpdateManager', () => {
  it('tracks campaign lifecycle and enforces parked install policy', () => {
    const manager = createOtaUpdateManager();
    manager.register({ id: 'gateway-1.1.0', version: '1.1.0', target: 'vehicle-gateway', checksum: 'abc123', sizeBytes: 1024, requiresParked: true });
    expect(() => manager.transition('gateway-1.1.0', 'installed', false)).toThrow('parked');
    expect(manager.transition('gateway-1.1.0', 'installed', true).state).toBe('installed');
  });
});
