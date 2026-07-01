export type OemFeatureState = 'enabled' | 'disabled' | 'requires-certification';
export type OemSurfaceRole = 'dashboard' | 'hud' | 'roof' | 'door' | 'floor' | 'rearCabin' | 'projection' | 'passenger';

export interface OemTheme {
  id: string;
  brandName: string;
  primaryColor: string;
  accentColor: string;
  typography: string;
  companionName?: string;
}

export interface OemSurfaceConfig {
  surfaceId: string;
  role: OemSurfaceRole;
  enabled: boolean;
  driverVisible: boolean;
  maxBrightnessPct: number;
}

export interface OemFeatureConfig {
  id: string;
  name: string;
  state: OemFeatureState;
  requiredPackages: string[];
}

export interface OemVehicleConfiguration {
  id: string;
  oem: string;
  platform: string;
  modelYear: number;
  theme: OemTheme;
  surfaces: OemSurfaceConfig[];
  features: OemFeatureConfig[];
}

export interface OemConfigurationValidation {
  valid: boolean;
  messages: string[];
  certificationRequired: string[];
}

function isColor(value: string): boolean { return /^#[0-9a-fA-F]{6}$/.test(value); }

export class OemConfigurationStudio {
  private readonly configurations = new Map<string, OemVehicleConfiguration>();

  save(configuration: OemVehicleConfiguration): OemConfigurationValidation {
    const validation = this.validate(configuration);
    if (!validation.valid) return validation;
    this.configurations.set(configuration.id, configuration);
    return validation;
  }

  get(id: string): OemVehicleConfiguration {
    const configuration = this.configurations.get(id);
    if (!configuration) throw new Error(`OEM configuration not found: ${id}`);
    return configuration;
  }

  validate(configuration: OemVehicleConfiguration): OemConfigurationValidation {
    const messages: string[] = [];
    const certificationRequired = configuration.features.filter((feature) => feature.state === 'requires-certification').map((feature) => feature.id);
    if (!configuration.oem.trim()) messages.push('OEM name is required.');
    if (!configuration.platform.trim()) messages.push('Vehicle platform is required.');
    if (!isColor(configuration.theme.primaryColor) || !isColor(configuration.theme.accentColor)) messages.push('Theme colors must be #RRGGBB values.');
    if (configuration.surfaces.some((surface) => surface.maxBrightnessPct < 0 || surface.maxBrightnessPct > 100)) messages.push('Surface brightness must be 0-100.');
    if (!configuration.surfaces.some((surface) => surface.enabled)) messages.push('At least one display surface must be enabled.');
    return { valid: messages.length === 0, messages, certificationRequired };
  }

  exportProfile(id: string): string {
    return JSON.stringify(this.get(id), null, 2);
  }
}

export function createOemConfigurationStudio(): OemConfigurationStudio { return new OemConfigurationStudio(); }
