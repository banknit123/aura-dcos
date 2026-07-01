export type AuraBundleKind = 'core' | 'oem-adapter' | 'vehicle-profile' | 'validation-report' | 'documentation';
export type InstallStepKind = 'copy' | 'validate' | 'activate' | 'rollback-point';

export interface AuraReleaseBundle {
  id: string;
  kind: AuraBundleKind;
  version: string;
  artifacts: string[];
  dependencies: string[];
}

export interface InstallerStep {
  id: string;
  kind: InstallStepKind;
  description: string;
  required: boolean;
}

export interface InstallerManifest {
  releaseId: string;
  version: string;
  bundles: AuraReleaseBundle[];
  steps: InstallerStep[];
}

export interface RollbackManifest {
  releaseId: string;
  rollbackToVersion: string;
  bundlesToRestore: string[];
  notes: string[];
}

export interface PackagingValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
  messages: string[];
}

export class AuraReleasePackager {
  createCoreBundle(version = '1.0.0'): AuraReleaseBundle {
    return { id: `aura-core-${version}`, kind: 'core', version, artifacts: ['docs/software/core-release-manifest-v1.json'], dependencies: [] };
  }

  createOemBundle(adapterId: string, version = '0.1.0'): AuraReleaseBundle {
    return { id: adapterId, kind: 'oem-adapter', version, artifacts: [`software/packages/${adapterId}/package.json`], dependencies: ['aura-core-1.0.0'] };
  }

  createVehicleProfileBundle(profileId: string, version = '0.1.0'): AuraReleaseBundle {
    return { id: profileId, kind: 'vehicle-profile', version, artifacts: ['docs/software/vehicle-profile-system.md'], dependencies: ['aura-core-1.0.0'] };
  }

  createInstallerManifest(releaseId: string, version: string, bundles: AuraReleaseBundle[]): InstallerManifest {
    return {
      releaseId,
      version,
      bundles,
      steps: [
        { id: 'copy-bundles', kind: 'copy', description: 'Copy AURA Core, OEM adapter and vehicle profile bundles.', required: true },
        { id: 'validate-compatibility', kind: 'validate', description: 'Run compatibility and validation suite checks.', required: true },
        { id: 'create-rollback-point', kind: 'rollback-point', description: 'Create rollback state before activation.', required: true },
        { id: 'activate-release', kind: 'activate', description: 'Activate release after validation passes.', required: true },
      ],
    };
  }

  createRollbackManifest(releaseId: string, rollbackToVersion: string, bundles: AuraReleaseBundle[]): RollbackManifest {
    return { releaseId, rollbackToVersion, bundlesToRestore: bundles.map((bundle) => bundle.id), notes: ['Rollback restores the previous core, adapter and profile bundle set.', 'Real deployment must verify signed artifacts before rollback.'] };
  }

  validate(manifest: InstallerManifest): PackagingValidation {
    const errors: string[] = [];
    const warnings: string[] = [];
    if (!manifest.bundles.some((bundle) => bundle.kind === 'core')) errors.push('Installer manifest must include an AURA Core bundle.');
    if (!manifest.bundles.some((bundle) => bundle.kind === 'oem-adapter')) errors.push('Installer manifest must include an OEM adapter bundle.');
    if (!manifest.bundles.some((bundle) => bundle.kind === 'vehicle-profile')) errors.push('Installer manifest must include a vehicle profile bundle.');
    if (!manifest.steps.some((step) => step.kind === 'validate' && step.required)) errors.push('Installer manifest must include a required validation step.');
    if (!manifest.steps.some((step) => step.kind === 'rollback-point')) warnings.push('Installer manifest should include a rollback point.');
    return { valid: errors.length === 0, errors, warnings, messages: [`${manifest.bundles.length} release bundles declared.`, `${manifest.steps.length} installer steps declared.`] };
  }
}

export function createAuraReleasePackager(): AuraReleasePackager { return new AuraReleasePackager(); }
