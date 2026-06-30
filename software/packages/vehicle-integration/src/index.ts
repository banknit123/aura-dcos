import { type PlatformCommand, type SecurityPolicyResult } from '@aura-dcos/vehicle-platform';

export type VehicleIntegrationMode = 'demo' | 'integration' | 'production';
export type VehicleHardwareKind = 'display' | 'sensor' | 'actuator' | 'audio' | 'lighting' | 'network' | 'compute';
export type VehicleHardwareHealth = 'ready' | 'degraded' | 'offline' | 'unsupported';
export type DisplayRole = 'dashboard' | 'roof' | 'hud' | 'door' | 'floor' | 'rearCabin' | 'projection' | 'passenger' | 'unknown';
export type SensorRole = 'speed' | 'weather' | 'occupancy' | 'fatigue' | 'battery' | 'door' | 'gps' | 'camera' | 'microphone' | 'unknown';
export type ActuatorRole = 'lighting' | 'audio' | 'hvac' | 'seat' | 'displayBrightness' | 'unknown';
export type IntegrationCommandDecision = 'allowed' | 'denied' | 'modified' | 'audit';

export interface VehicleHardwareDescriptor {
  id: string;
  kind: VehicleHardwareKind;
  role: DisplayRole | SensorRole | ActuatorRole | 'gateway';
  name: string;
  health: VehicleHardwareHealth;
  capabilities: string[];
  metadata?: Record<string, string | number | boolean>;
}

export interface VehicleDisplayDescriptor extends VehicleHardwareDescriptor {
  kind: 'display';
  role: DisplayRole;
  width: number;
  height: number;
  driverVisible: boolean;
}

export interface VehicleCabinProfile {
  id: string;
  name: string;
  mode: VehicleIntegrationMode;
  hardware: VehicleHardwareDescriptor[];
  displays: VehicleDisplayDescriptor[];
  createdAt: string;
}

export interface DisplayRoutePlan {
  surfaceId: string;
  displayId: string;
  role: DisplayRole;
  safeForDriver: boolean;
  reason: string;
}

export interface VehicleAdapterManifest {
  id: string;
  name: string;
  vendor: string;
  mode: VehicleIntegrationMode;
  supportedBuses: string[];
  hardware: VehicleHardwareDescriptor[];
}

export interface VehicleIntegrationAdapter {
  readonly manifest: VehicleAdapterManifest;
  discover(): Promise<VehicleHardwareDescriptor[]>;
  sendCommand(command: PlatformCommand): Promise<SecurityPolicyResult>;
}

export interface IntegrationDiagnostics {
  ready: boolean;
  totalHardware: number;
  readyHardware: number;
  degradedHardware: number;
  offlineHardware: number;
  messages: string[];
}

export interface IntegrationCommandResult {
  decision: IntegrationCommandDecision;
  command: PlatformCommand;
  reason: string;
}

function now(): string {
  return new Date().toISOString();
}

function isDisplay(item: VehicleHardwareDescriptor): item is VehicleDisplayDescriptor {
  return item.kind === 'display' && typeof item.metadata?.width === 'number' && typeof item.metadata?.height === 'number';
}

function rolePriority(role: DisplayRole): number {
  const order: DisplayRole[] = ['dashboard', 'hud', 'projection', 'roof', 'floor', 'rearCabin', 'passenger', 'door', 'unknown'];
  return order.indexOf(role) === -1 ? 999 : order.indexOf(role);
}

export class VehicleDisplayMapper {
  map(profile: VehicleCabinProfile, requestedSurfaces: string[]): DisplayRoutePlan[] {
    const displays = [...profile.displays].sort((a, b) => rolePriority(a.role) - rolePriority(b.role));
    return requestedSurfaces.map((surfaceId, index) => {
      const exact = displays.find((display) => display.role === surfaceId);
      const display = exact ?? displays[index % Math.max(1, displays.length)];
      return {
        surfaceId,
        displayId: display?.id ?? 'unmapped-display',
        role: display?.role ?? 'unknown',
        safeForDriver: !(display?.driverVisible && ['roof', 'rearCabin', 'passenger'].includes(surfaceId)),
        reason: display ? `Mapped ${surfaceId} to ${display.name}.` : `No hardware display available for ${surfaceId}.`,
      };
    });
  }
}

export class VehicleHardwareDiscovery {
  async discover(adapter: VehicleIntegrationAdapter): Promise<VehicleCabinProfile> {
    const hardware = await adapter.discover();
    const displays: VehicleDisplayDescriptor[] = hardware.filter(isDisplay).map((item) => ({
      ...item,
      width: Number(item.metadata?.width),
      height: Number(item.metadata?.height),
      driverVisible: Boolean(item.metadata?.driverVisible),
    }));

    return {
      id: `${adapter.manifest.id}-profile`,
      name: `${adapter.manifest.name} Cabin Profile`,
      mode: adapter.manifest.mode,
      hardware,
      displays,
      createdAt: now(),
    };
  }
}

export class VehicleIntegrationGateway {
  constructor(private readonly adapter: VehicleIntegrationAdapter) {}

  async discoverProfile(): Promise<VehicleCabinProfile> {
    return new VehicleHardwareDiscovery().discover(this.adapter);
  }

  async execute(command: PlatformCommand): Promise<IntegrationCommandResult> {
    const result = await this.adapter.sendCommand(command);
    const decision: IntegrationCommandDecision = result.decision === 'deny' ? 'denied' : result.decision === 'audit' ? 'audit' : 'allowed';
    return { decision, command, reason: result.reason };
  }

  diagnostics(profile: VehicleCabinProfile): IntegrationDiagnostics {
    const readyHardware = profile.hardware.filter((item) => item.health === 'ready').length;
    const degradedHardware = profile.hardware.filter((item) => item.health === 'degraded').length;
    const offlineHardware = profile.hardware.filter((item) => item.health === 'offline').length;
    return {
      ready: offlineHardware === 0 && profile.displays.length > 0,
      totalHardware: profile.hardware.length,
      readyHardware,
      degradedHardware,
      offlineHardware,
      messages: [
        `${profile.displays.length} display surfaces discovered.`,
        `${readyHardware}/${profile.hardware.length} hardware endpoints ready.`,
      ],
    };
  }
}

export class SimulatorVehicleIntegrationAdapter implements VehicleIntegrationAdapter {
  readonly manifest: VehicleAdapterManifest = {
    id: 'simulator-vif-adapter',
    name: 'AURA Simulator Vehicle Adapter',
    vendor: 'AURA',
    mode: 'demo',
    supportedBuses: ['simulator', 'browser'],
    hardware: [],
  };

  async discover(): Promise<VehicleHardwareDescriptor[]> {
    return [
      { id: 'display-dashboard', kind: 'display', role: 'dashboard', name: 'Driver Dashboard', health: 'ready', capabilities: ['navigation', 'adas', 'status'], metadata: { width: 1920, height: 720, driverVisible: true } },
      { id: 'display-roof', kind: 'display', role: 'roof', name: 'Digital Roof', health: 'ready', capabilities: ['ambient', 'cinematic', 'wellness'], metadata: { width: 3840, height: 1200, driverVisible: false } },
      { id: 'display-floor', kind: 'display', role: 'floor', name: 'Guidance Floor', health: 'ready', capabilities: ['wayfinding', 'emergencyPath'], metadata: { width: 1920, height: 1080, driverVisible: false } },
      { id: 'display-projection', kind: 'display', role: 'projection', name: 'AURA Projection', health: 'ready', capabilities: ['companion', 'notifications'], metadata: { width: 1280, height: 1280, driverVisible: true } },
      { id: 'sensor-speed', kind: 'sensor', role: 'speed', name: 'Vehicle Speed Signal', health: 'ready', capabilities: ['speedKph'] },
      { id: 'sensor-occupancy', kind: 'sensor', role: 'occupancy', name: 'Seat Occupancy', health: 'ready', capabilities: ['driver', 'passenger', 'child'] },
      { id: 'actuator-lighting', kind: 'lighting', role: 'lighting', name: 'Ambient Lighting Zones', health: 'ready', capabilities: ['oceanCalm', 'auroraDrive', 'nightCity', 'rainSafety'] },
      { id: 'audio-main', kind: 'audio', role: 'audio', name: 'Spatial Audio System', health: 'ready', capabilities: ['voice', 'music', 'alerts'] },
    ];
  }

  async sendCommand(command: PlatformCommand): Promise<SecurityPolicyResult> {
    if (command.target === 'display' && command.action === 'enableImmersiveVideo' && command.payload.vehicleState === 'driving') {
      return { decision: 'deny', reason: 'Simulator VIF blocked immersive video while driving.' };
    }
    if (command.safetyCritical) return { decision: 'audit', reason: 'Simulator VIF allowed safety command with audit.' };
    return { decision: 'allow', reason: 'Simulator VIF accepted command.' };
  }
}

export function createVehicleDisplayMapper(): VehicleDisplayMapper {
  return new VehicleDisplayMapper();
}

export function createVehicleHardwareDiscovery(): VehicleHardwareDiscovery {
  return new VehicleHardwareDiscovery();
}

export function createVehicleIntegrationGateway(adapter: VehicleIntegrationAdapter = new SimulatorVehicleIntegrationAdapter()): VehicleIntegrationGateway {
  return new VehicleIntegrationGateway(adapter);
}
