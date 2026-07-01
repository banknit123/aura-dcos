import { describe, expect, it } from 'vitest';
import { createReferenceSuvProfile, createVehicleProfileRegistry, validateVehicleProfile } from './index';

describe('VehicleProfileSystem', () => {
  it('validates and stores the reference SUV profile', () => {
    const profile = createReferenceSuvProfile();
    const registry = createVehicleProfileRegistry();
    const validation = registry.save(profile);

    expect(validation.valid).toBe(true);
    expect(validation.readinessScore).toBeGreaterThan(80);
    expect(registry.get('reference-oem-suv-2032').identity.model).toBe('Reference SUV');
    expect(registry.export('reference-oem-suv-2032')).toContain('AURA-SUV-P1');
  });

  it('rejects profiles without enabled displays', () => {
    const profile = createReferenceSuvProfile();
    profile.displays = profile.displays.map((display) => ({ ...display, enabled: false }));

    const validation = validateVehicleProfile(profile);

    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain('At least one display surface must be enabled.');
  });

  it('warns when control domains are missing', () => {
    const profile = createReferenceSuvProfile();
    profile.controls = profile.controls.filter((control) => control.domain !== 'audio');

    const validation = validateVehicleProfile(profile);

    expect(validation.valid).toBe(true);
    expect(validation.warnings).toContain('Control domain not declared: audio');
  });
});
