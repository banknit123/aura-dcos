import { describe, expect, it } from 'vitest';
import { createAnimalCompanion, createCompanionEcosystem, createDefaultAuraLightCompanion, validateCompanionProfile } from './index';

describe('CompanionEcosystem', () => {
  it('stores the default light companion', () => {
    const ecosystem = createCompanionEcosystem();
    const companion = createDefaultAuraLightCompanion('driver-1');
    const validation = ecosystem.save(companion);

    expect(validation.valid).toBe(true);
    expect(ecosystem.get(companion.id).species).toBe('light-being');
  });

  it('creates selectable animal companions', () => {
    const cat = createAnimalCompanion('driver-1', 'cat', 'Lumi');
    const bird = createAnimalCompanion('driver-1', 'owl', 'Finn');

    expect(cat.allowedMovements).toContain('walk');
    expect(bird.allowedMovements).toContain('fly');
  });

  it('uses a subtle policy while driving', () => {
    const ecosystem = createCompanionEcosystem();
    const companion = createAnimalCompanion('driver-1', 'owl', 'Finn');
    const policy = ecosystem.behaviorPolicy(companion, 'driving');

    expect(policy.driverVisibleAllowed).toBe(false);
    expect(policy.allowedMovements).toEqual(['fade']);
  });

  it('validates color values', () => {
    const companion = createDefaultAuraLightCompanion('driver-1');
    companion.appearance.primaryColor = 'teal';

    expect(validateCompanionProfile(companion).valid).toBe(false);
  });
});
