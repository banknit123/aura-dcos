import { describe, expect, it } from 'vitest';
import { createAuraCoreStabilityRegistry } from './index';

describe('AuraCoreStabilityRegistry', () => {
  it('creates a valid AURA Core v1.0 freeze manifest', () => {
    const registry = createAuraCoreStabilityRegistry();
    const manifest = registry.createManifest('1.0.0');
    const validation = registry.validate(manifest);

    expect(manifest.id).toBe('aura-core-1.0.0');
    expect(validation.valid).toBe(true);
    expect(validation.stablePackages).toContain('@aura-dcos/runtime');
    expect(validation.adapterBoundaries).toContain('@aura-dcos/vehicle-signals');
  });

  it('flags missing exported contracts', () => {
    const registry = createAuraCoreStabilityRegistry();
    const manifest = registry.createManifest('1.0.0');
    manifest.apiSurfaces[0] = { ...manifest.apiSurfaces[0], exportedContracts: [] };

    expect(registry.validate(manifest).valid).toBe(false);
  });
});
