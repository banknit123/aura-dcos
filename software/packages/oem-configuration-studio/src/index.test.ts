import { describe, expect, it } from 'vitest';
import { createOemConfigurationStudio } from './index';

describe('OemConfigurationStudio', () => {
  it('validates and exports OEM configuration profiles', () => {
    const studio = createOemConfigurationStudio();
    const result = studio.save({
      id: 'aura-oem-suv-2032',
      oem: 'AURA OEM',
      platform: 'SUV-2032',
      modelYear: 2032,
      theme: { id: 'premium', brandName: 'AURA', primaryColor: '#001F3F', accentColor: '#00B8C8', typography: 'AURA Sans', companionName: 'AURA' },
      surfaces: [{ surfaceId: 'dashboard', role: 'dashboard', enabled: true, driverVisible: true, maxBrightnessPct: 80 }],
      features: [{ id: 'cinematic-roof', name: 'Cinematic Roof', state: 'requires-certification', requiredPackages: ['@aura-dcos/cinematic-graphics'] }],
    });

    expect(result.valid).toBe(true);
    expect(result.certificationRequired).toContain('cinematic-roof');
    expect(studio.exportProfile('aura-oem-suv-2032')).toContain('SUV-2032');
  });

  it('rejects invalid brand colors', () => {
    const studio = createOemConfigurationStudio();
    const result = studio.validate({
      id: 'bad', oem: 'OEM', platform: 'P', modelYear: 2032,
      theme: { id: 'bad', brandName: 'Bad', primaryColor: 'blue', accentColor: '#00B8C8', typography: 'Sans' },
      surfaces: [{ surfaceId: 'dashboard', role: 'dashboard', enabled: true, driverVisible: true, maxBrightnessPct: 80 }],
      features: [],
    });
    expect(result.valid).toBe(false);
  });
});
