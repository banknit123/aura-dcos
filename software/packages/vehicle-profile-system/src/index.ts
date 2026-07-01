export type VehicleBodyStyle = 'suv' | 'sedan' | 'hatch' | 'truck' | 'van' | 'coupe' | 'concept';
export type VehicleProfileBus = 'can' | 'can-fd' | 'lin' | 'automotive-ethernet' | 'diagnostics' | 'simulator';
export type VehicleProfileFeatureState = 'available' | 'unavailable' | 'requires-adapter' | 'requires-certification';
export type DisplaySurfaceRole = 'dashboard' | 'hud' | 'roof' | 'door' | 'floor' | 'rearCabin' | 'projection' | 'passenger';

export interface VehicleProfileIdentity {
  profileId: string;
  oem: string;
  platform: string;
  model: string;
  modelYear: number;
  bodyStyle: VehicleBodyStyle;
}

export interface VehicleProfileDisplaySurface {
  id: string;
  role: DisplaySurfaceRole;
  width: number;
  height: number;
  refreshRateHz: number;
  driverVisible: boolean;
  enabled: boolean;
}

export interface VehicleProfileControl {
  id: string;
  domain: 'hvac' | 'seat' | 'door' | 'window' | 'lighting' | 'audio';
  zones: string[];
  commands: string[];
  state: VehicleProfileFeatureState;
}

export interface VehicleProfileSensor {
  id: string;
  kind: 'camera' | 'radar' | 'lidar' | 'microphone' | 'occupant' | 'environment';
  position: string;
  state: VehicleProfileFeatureState;
}

export interface VehicleProfileBusMapping {
  id: string;
  bus: VehicleProfileBus;
  adapterId: string;
  signalMappings: string[];
  commandMappings: string[];
  diagnosticsConnectors: string[];
}

export interface VehicleProfile {
  identity: VehicleProfileIdentity;
  adapterId: string;
  displays: VehicleProfileDisplaySurface[];
  controls: VehicleProfileControl[];
  sensors: VehicleProfileSensor[];
  busMappings: VehicleProfileBusMapping[];
  requiredCoreVersion: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface VehicleProfileValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
  readinessScore: number;
}

export class VehicleProfileRegistry {
  private readonly profiles = new Map<string, VehicleProfile>();

  save(profile: VehicleProfile): VehicleProfileValidation {
    const validation = validateVehicleProfile(profile);
    if (!validation.valid) return validation;
    this.profiles.set(profile.identity.profileId, profile);
    return validation;
  }

  get(profileId: string): VehicleProfile {
    const profile = this.profiles.get(profileId);
    if (!profile) throw new Error(`Vehicle profile not found: ${profileId}`);
    return profile;
  }

  list(): VehicleProfile[] {
    return [...this.profiles.values()];
  }

  export(profileId: string): string {
    return JSON.stringify(this.get(profileId), null, 2);
  }
}

export function validateVehicleProfile(profile: VehicleProfile): VehicleProfileValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!profile.identity.profileId.trim()) errors.push('Profile id is required.');
  if (!profile.identity.oem.trim()) errors.push('OEM is required.');
  if (!profile.identity.platform.trim()) errors.push('Platform is required.');
  if (profile.identity.modelYear < 2020 || profile.identity.modelYear > 2100) errors.push('Model year must be realistic.');
  if (!profile.adapterId.trim()) errors.push('Adapter id is required.');
  if (!/^\d+\.\d+\.\d+$/.test(profile.requiredCoreVersion)) errors.push('Required core version must use semantic versioning.');
  if (!profile.displays.some((display) => display.enabled)) errors.push('At least one display surface must be enabled.');

  for (const display of profile.displays) {
    if (display.width <= 0 || display.height <= 0 || display.refreshRateHz <= 0) errors.push(`Invalid display dimensions or refresh rate: ${display.id}`);
  }

  const requiredDomains = ['hvac', 'seat', 'door', 'window', 'lighting', 'audio'];
  const presentDomains = new Set(profile.controls.map((control) => control.domain));
  for (const domain of requiredDomains) {
    if (!presentDomains.has(domain as VehicleProfileControl['domain'])) warnings.push(`Control domain not declared: ${domain}`);
  }

  if (profile.busMappings.length === 0) warnings.push('No bus mappings declared.');
  if (profile.sensors.length === 0) warnings.push('No sensors declared.');
  if (profile.busMappings.some((mapping) => mapping.signalMappings.length === 0)) warnings.push('One or more bus mappings have no signal mappings.');

  const readinessScore = Math.max(0, 100 - errors.length * 30 - warnings.length * 8);
  return { valid: errors.length === 0, errors, warnings, readinessScore };
}

export function createVehicleProfileRegistry(): VehicleProfileRegistry {
  return new VehicleProfileRegistry();
}

export function createReferenceSuvProfile(): VehicleProfile {
  return {
    identity: {
      profileId: 'reference-oem-suv-2032',
      oem: 'Reference OEM',
      platform: 'AURA-SUV-P1',
      model: 'Reference SUV',
      modelYear: 2032,
      bodyStyle: 'suv',
    },
    adapterId: 'reference-oem-suv-adapter',
    requiredCoreVersion: '1.0.0',
    displays: [
      { id: 'dashboard-main', role: 'dashboard', width: 3840, height: 900, refreshRateHz: 60, driverVisible: true, enabled: true },
      { id: 'roof-cinematic', role: 'roof', width: 3840, height: 1200, refreshRateHz: 60, driverVisible: false, enabled: true },
      { id: 'rear-cabin', role: 'rearCabin', width: 1920, height: 720, refreshRateHz: 60, driverVisible: false, enabled: true },
    ],
    controls: [
      { id: 'hvac-4-zone', domain: 'hvac', zones: ['driver', 'passenger', 'rear-left', 'rear-right'], commands: ['setTemperature', 'setFanLevel'], state: 'requires-adapter' },
      { id: 'driver-seat', domain: 'seat', zones: ['driver'], commands: ['setSeatPreset'], state: 'requires-adapter' },
      { id: 'door-locks', domain: 'door', zones: ['all'], commands: ['lockDoors', 'unlockDoors'], state: 'requires-adapter' },
      { id: 'windows', domain: 'window', zones: ['driver', 'passenger', 'rear-left', 'rear-right'], commands: ['setWindowPosition'], state: 'requires-adapter' },
      { id: 'ambient-lighting', domain: 'lighting', zones: ['dashboard', 'doors', 'roof', 'floor'], commands: ['setLightingScene'], state: 'requires-adapter' },
      { id: 'audio-amp', domain: 'audio', zones: ['front', 'rear', 'voice'], commands: ['setGain', 'mute', 'duckVoice'], state: 'requires-adapter' },
    ],
    sensors: [
      { id: 'front-camera', kind: 'camera', position: 'front', state: 'requires-adapter' },
      { id: 'front-radar', kind: 'radar', position: 'front', state: 'requires-adapter' },
      { id: 'roof-lidar', kind: 'lidar', position: 'roof', state: 'requires-adapter' },
      { id: 'cabin-camera', kind: 'occupant', position: 'cabin', state: 'requires-certification' },
    ],
    busMappings: [
      { id: 'body-canfd', bus: 'can-fd', adapterId: 'reference-oem-suv-adapter', signalMappings: ['vehicle.speedKph', 'door.driverOpen', 'window.driverPositionPct'], commandMappings: ['lockDoors', 'setWindowPosition'], diagnosticsConnectors: ['body-ecu'] },
      { id: 'comfort-lin', bus: 'lin', adapterId: 'reference-oem-suv-adapter', signalMappings: ['hvac.cabinTempC', 'seat.driverPreset'], commandMappings: ['setTemperature', 'setSeatPreset'], diagnosticsConnectors: ['comfort-ecu'] },
      { id: 'sensor-ethernet', bus: 'automotive-ethernet', adapterId: 'reference-oem-suv-adapter', signalMappings: ['camera.frontFrame', 'radar.frontObjects', 'lidar.roofCloud'], commandMappings: [], diagnosticsConnectors: [] },
    ],
    metadata: { profileVersion: '0.1.0', simulatorReady: true },
  };
}
