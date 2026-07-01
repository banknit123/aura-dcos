import { describe, expect, it } from 'vitest';
import { createAuraReleasePackager } from './index';

describe('AuraReleasePackager', () => {
  it('creates valid installer and rollback manifests', () => {
    const packager = createAuraReleasePackager();
    const bundles = [
      packager.createCoreBundle('1.0.0'),
      packager.createOemBundle('reference-oem-adapter', '0.1.0'),
      packager.createVehicleProfileBundle('reference-oem-suv-2032', '0.1.0'),
    ];
    const installer = packager.createInstallerManifest('aura-dcos-v1-reference', '1.0.0', bundles);
    const rollback = packager.createRollbackManifest(installer.releaseId, '0.9.0', bundles);

    expect(packager.validate(installer).valid).toBe(true);
    expect(rollback.bundlesToRestore).toContain('aura-core-1.0.0');
  });

  it('rejects manifests without core bundles', () => {
    const packager = createAuraReleasePackager();
    const installer = packager.createInstallerManifest('bad', '1.0.0', [packager.createOemBundle('reference-oem-adapter')]);

    expect(packager.validate(installer).valid).toBe(false);
    expect(packager.validate(installer).errors).toContain('Installer manifest must include an AURA Core bundle.');
  });
});
