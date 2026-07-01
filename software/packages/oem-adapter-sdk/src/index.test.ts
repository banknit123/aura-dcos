import { describe, expect, it } from 'vitest';
import { createOemAdapterValidator } from './index';

describe('OemAdapterValidator', () => {
  it('validates required adapter capabilities', () => {
    const validator = createOemAdapterValidator();
    const result = validator.validate({
      id: 'oem-x-suv',
      oem: 'OEM X',
      vehiclePlatform: 'SUV-2032',
      version: '1.0.0',
      status: 'draft',
      supportedPackages: ['@aura-dcos/vehicle-signals'],
      capabilities: [{ id: 'vehicle-signals', description: 'Signal bridge', required: true }],
    });
    expect(result.valid).toBe(false);
    expect(result.missingRequiredCapabilities).toContain('secure-gateway');
  });
});
