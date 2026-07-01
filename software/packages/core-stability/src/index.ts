export type CoreApiStatus = 'stable' | 'adapter-boundary' | 'experimental' | 'deprecated';
export type CoreCompatibilityLevel = 'major' | 'minor' | 'patch';

export interface CoreApiSurface {
  packageName: string;
  version: string;
  status: CoreApiStatus;
  owner: 'core' | 'vehicle-integration' | 'studio' | 'oem-adapter';
  exportedContracts: string[];
  compatibility: CoreCompatibilityLevel;
}

export interface CoreFreezeRule {
  id: string;
  description: string;
  required: boolean;
}

export interface CoreFreezeManifest {
  id: string;
  version: string;
  frozenAt: string;
  apiSurfaces: CoreApiSurface[];
  rules: CoreFreezeRule[];
}

export interface CoreFreezeValidation {
  valid: boolean;
  stablePackages: string[];
  adapterBoundaries: string[];
  experimentalPackages: string[];
  messages: string[];
}

function now(): string {
  return new Date().toISOString();
}

const stableCorePackages: CoreApiSurface[] = [
  { packageName: '@aura-dcos/runtime', version: '1.0.0', status: 'stable', owner: 'core', exportedContracts: ['runtime lifecycle', 'module bootstrapping'], compatibility: 'major' },
  { packageName: '@aura-dcos/events', version: '1.0.0', status: 'stable', owner: 'core', exportedContracts: ['event bus', 'event envelope'], compatibility: 'major' },
  { packageName: '@aura-dcos/config', version: '1.0.0', status: 'stable', owner: 'core', exportedContracts: ['configuration registry'], compatibility: 'major' },
  { packageName: '@aura-dcos/surfaces', version: '1.0.0', status: 'stable', owner: 'core', exportedContracts: ['surface model', 'surface state'], compatibility: 'major' },
  { packageName: '@aura-dcos/output-manager', version: '1.0.0', status: 'stable', owner: 'core', exportedContracts: ['output planning', 'surface routing'], compatibility: 'major' },
  { packageName: '@aura-dcos/companion', version: '1.0.0', status: 'stable', owner: 'core', exportedContracts: ['companion state', 'projection behavior'], compatibility: 'major' },
  { packageName: '@aura-dcos/brain', version: '1.0.0', status: 'stable', owner: 'core', exportedContracts: ['intent evaluation', 'safety-gated actions'], compatibility: 'major' },
  { packageName: '@aura-dcos/voice-bridge', version: '1.0.0', status: 'stable', owner: 'core', exportedContracts: ['speech adapters', 'language model adapters'], compatibility: 'major' },
  { packageName: '@aura-dcos/autonomy', version: '1.0.0', status: 'stable', owner: 'core', exportedContracts: ['autonomy cycle', 'cabin signals'], compatibility: 'major' },
  { packageName: '@aura-dcos/digital-twin', version: '1.0.0', status: 'stable', owner: 'core', exportedContracts: ['cabin twin state'], compatibility: 'major' },
  { packageName: '@aura-dcos/vehicle-signals', version: '1.0.0', status: 'adapter-boundary', owner: 'vehicle-integration', exportedContracts: ['normalized vehicle signals', 'quality and freshness'], compatibility: 'major' },
  { packageName: '@aura-dcos/secure-vehicle-gateway', version: '1.0.0', status: 'adapter-boundary', owner: 'vehicle-integration', exportedContracts: ['command authorization', 'audit events'], compatibility: 'major' },
  { packageName: '@aura-dcos/ota-update-manager', version: '1.0.0', status: 'adapter-boundary', owner: 'vehicle-integration', exportedContracts: ['update campaign lifecycle'], compatibility: 'major' },
  { packageName: '@aura-dcos/cinematic-graphics', version: '1.0.0', status: 'stable', owner: 'core', exportedContracts: ['frame planning', 'scene descriptors', 'driver-visible safety'], compatibility: 'major' },
  { packageName: '@aura-dcos/ai-cabin-intelligence', version: '1.0.0', status: 'stable', owner: 'core', exportedContracts: ['consent-aware memory', 'emotion inference', 'personalization actions'], compatibility: 'major' },
];

const freezeRules: CoreFreezeRule[] = [
  { id: 'no-breaking-stable-api', description: 'Stable package exported contracts require a major version change for breaking changes.', required: true },
  { id: 'adapter-boundaries-only', description: 'OEM and vehicle-specific code must integrate through adapter-boundary packages.', required: true },
  { id: 'simulator-runnable', description: 'Core must remain runnable without real vehicle hardware.', required: true },
  { id: 'safety-gated-commands', description: 'Vehicle-facing commands must pass through safety or secure gateway policy.', required: true },
  { id: 'consent-aware-memory', description: 'Personalization memory must respect occupant consent.', required: true },
];

export class AuraCoreStabilityRegistry {
  createManifest(version = '1.0.0'): CoreFreezeManifest {
    return { id: `aura-core-${version}`, version, frozenAt: now(), apiSurfaces: [...stableCorePackages], rules: [...freezeRules] };
  }

  validate(manifest: CoreFreezeManifest): CoreFreezeValidation {
    const stablePackages = manifest.apiSurfaces.filter((surface) => surface.status === 'stable').map((surface) => surface.packageName);
    const adapterBoundaries = manifest.apiSurfaces.filter((surface) => surface.status === 'adapter-boundary').map((surface) => surface.packageName);
    const experimentalPackages = manifest.apiSurfaces.filter((surface) => surface.status === 'experimental').map((surface) => surface.packageName);
    const missingContracts = manifest.apiSurfaces.filter((surface) => surface.exportedContracts.length === 0).map((surface) => surface.packageName);
    const missingRules = manifest.rules.filter((rule) => rule.required === true).length === 0;
    const valid = missingContracts.length === 0 && !missingRules && adapterBoundaries.length > 0;
    return {
      valid,
      stablePackages,
      adapterBoundaries,
      experimentalPackages,
      messages: [
        `${stablePackages.length} stable AURA Core packages registered.`,
        `${adapterBoundaries.length} OEM adapter boundary packages registered.`,
        `${experimentalPackages.length} experimental packages registered.`,
        `${missingContracts.length} packages missing exported contract declarations.`,
      ],
    };
  }
}

export function createAuraCoreStabilityRegistry(): AuraCoreStabilityRegistry {
  return new AuraCoreStabilityRegistry();
}
