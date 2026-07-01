export type OemAdapterStatus = 'draft' | 'validated' | 'certification-ready';
export interface OemAdapterCapability { id: string; description: string; required: boolean; }
export interface OemAdapterManifest { id: string; oem: string; vehiclePlatform: string; version: string; status: OemAdapterStatus; capabilities: OemAdapterCapability[]; supportedPackages: string[]; }
export interface OemValidationResult { valid: boolean; messages: string[]; missingRequiredCapabilities: string[]; }

const requiredCapabilities = ['vehicle-signals', 'secure-gateway', 'diagnostics'];

export class OemAdapterValidator {
  validate(manifest: OemAdapterManifest): OemValidationResult {
    const missingRequiredCapabilities = requiredCapabilities.filter((required) => !manifest.capabilities.some((capability) => capability.id === required));
    const messages = [
      `${manifest.oem} ${manifest.vehiclePlatform} adapter ${manifest.version}.`,
      `${manifest.supportedPackages.length} AURA packages declared.`,
      `${missingRequiredCapabilities.length} required capabilities missing.`,
    ];
    return { valid: missingRequiredCapabilities.length === 0, messages, missingRequiredCapabilities };
  }

  certificationChecklist(manifest: OemAdapterManifest): string[] {
    return [
      `Adapter manifest: ${manifest.id}`,
      'Verify secure gateway policy mapping.',
      'Verify diagnostic session authorization.',
      'Verify vehicle signal freshness budgets.',
      'Verify HMI compliance for driver-visible outputs.',
      'Verify OEM cybersecurity and functional safety review completion.',
    ];
  }
}

export function createOemAdapterValidator(): OemAdapterValidator { return new OemAdapterValidator(); }
