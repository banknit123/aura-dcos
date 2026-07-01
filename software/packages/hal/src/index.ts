export type AuraDeviceKind = 'display' | 'projector' | 'lighting' | 'audio' | 'sensor' | 'compute';
export type AuraDeviceStatus = 'offline' | 'ready' | 'active' | 'fault';

export interface AuraDevice {
  id: string;
  name: string;
  kind: AuraDeviceKind;
  status: AuraDeviceStatus;
  metadata?: Record<string, string | number | boolean>;
}

export interface AuraDeviceCommand {
  deviceId: string;
  command: string;
  payload?: Record<string, string | number | boolean>;
}

export interface AuraDeviceDriver {
  readonly device: AuraDevice;
  connect(): Promise<void> | void;
  disconnect(): Promise<void> | void;
  execute(command: AuraDeviceCommand): Promise<void> | void;
}

export class AuraHardwareRegistry {
  private readonly drivers = new Map<string, AuraDeviceDriver>();

  register(driver: AuraDeviceDriver): void {
    if (this.drivers.has(driver.device.id)) {
      throw new Error(`Device already registered: ${driver.device.id}`);
    }
    this.drivers.set(driver.device.id, driver);
  }

  get(deviceId: string): AuraDeviceDriver {
    const driver = this.drivers.get(deviceId);
    if (!driver) throw new Error(`Device not registered: ${deviceId}`);
    return driver;
  }

  listDevices(): AuraDevice[] {
    return [...this.drivers.values()].map((driver) => driver.device);
  }

  async connectAll(): Promise<void> {
    for (const driver of this.drivers.values()) {
      await driver.connect();
    }
  }

  async disconnectAll(): Promise<void> {
    for (const driver of [...this.drivers.values()].reverse()) {
      await driver.disconnect();
    }
  }

  async execute(command: AuraDeviceCommand): Promise<void> {
    await this.get(command.deviceId).execute(command);
  }
}

export function createAuraHardwareRegistry(): AuraHardwareRegistry {
  return new AuraHardwareRegistry();
}

export type VehicleBusKind = 'can' | 'can-fd' | 'automotive-ethernet' | 'lin' | 'diagnostics' | 'simulator';
export type VehicleRuntimeMode = 'simulation' | 'bench' | 'vehicle' | 'production';
export type VehicleEndpointState = 'discovered' | 'ready' | 'degraded' | 'offline' | 'unauthorized';
export type VehicleSafetyLevel = 'informational' | 'comfort' | 'body' | 'adas' | 'powertrain' | 'diagnostic';
export type VehiclePayloadPrimitive = string | number | boolean | null;
export type VehiclePayload = Record<string, VehiclePayloadPrimitive | VehiclePayloadPrimitive[]>;

export interface VehicleBusIdentity {
  id: string;
  kind: VehicleBusKind;
  name: string;
  channel: string;
  bitrateKbps?: number;
  secure: boolean;
  metadata?: VehiclePayload;
}

export interface VehicleEndpointCapability {
  id: string;
  name: string;
  safetyLevel: VehicleSafetyLevel;
  readSignals: string[];
  writeCommands: string[];
}

export interface VehicleEndpointDescriptor {
  id: string;
  name: string;
  domain: 'body' | 'chassis' | 'infotainment' | 'comfort' | 'adas' | 'powertrain' | 'diagnostics' | 'sensor';
  busId: string;
  ecuAddress?: string;
  state: VehicleEndpointState;
  capabilities: VehicleEndpointCapability[];
  metadata?: VehiclePayload;
}

export interface VehicleSignalFrame {
  id: string;
  endpointId: string;
  signal: string;
  value: VehiclePayloadPrimitive;
  unit?: string;
  quality: 'valid' | 'stale' | 'estimated' | 'fault';
  timestamp: string;
}

export interface VehicleHalCommand {
  id: string;
  endpointId: string;
  command: string;
  payload: VehiclePayload;
  safetyLevel: VehicleSafetyLevel;
  requestedAt: string;
  requireSecureBus?: boolean;
}

export interface VehicleHalCommandResult {
  accepted: boolean;
  commandId: string;
  reason: string;
  echoedPayload?: VehiclePayload;
}

export interface VehicleHalSnapshot {
  runtimeMode: VehicleRuntimeMode;
  buses: VehicleBusIdentity[];
  endpoints: VehicleEndpointDescriptor[];
  signals: VehicleSignalFrame[];
  ready: boolean;
  messages: string[];
}

export interface VehicleBusAdapter {
  readonly identity: VehicleBusIdentity;
  discoverEndpoints(): Promise<VehicleEndpointDescriptor[]> | VehicleEndpointDescriptor[];
  readSignals(endpoint: VehicleEndpointDescriptor): Promise<VehicleSignalFrame[]> | VehicleSignalFrame[];
  sendCommand(command: VehicleHalCommand): Promise<VehicleHalCommandResult> | VehicleHalCommandResult;
}

function isoNow(): string {
  return new Date().toISOString();
}

function commandAllowed(endpoint: VehicleEndpointDescriptor, command: VehicleHalCommand): boolean {
  return endpoint.capabilities.some((capability) => capability.writeCommands.includes(command.command));
}

export class VehicleHardwareAbstractionLayer {
  private readonly buses = new Map<string, VehicleBusAdapter>();
  private readonly endpoints = new Map<string, VehicleEndpointDescriptor>();
  private readonly signalCache = new Map<string, VehicleSignalFrame>();

  constructor(private readonly runtimeMode: VehicleRuntimeMode = 'simulation') {}

  registerBus(adapter: VehicleBusAdapter): void {
    if (this.buses.has(adapter.identity.id)) {
      throw new Error(`Vehicle bus already registered: ${adapter.identity.id}`);
    }
    this.buses.set(adapter.identity.id, adapter);
  }

  listBuses(): VehicleBusIdentity[] {
    return [...this.buses.values()].map((adapter) => adapter.identity);
  }

  listEndpoints(): VehicleEndpointDescriptor[] {
    return [...this.endpoints.values()];
  }

  async discover(): Promise<VehicleEndpointDescriptor[]> {
    this.endpoints.clear();
    for (const adapter of this.buses.values()) {
      const discovered = await adapter.discoverEndpoints();
      for (const endpoint of discovered) {
        if (!this.buses.has(endpoint.busId)) {
          throw new Error(`Endpoint ${endpoint.id} references unknown bus ${endpoint.busId}`);
        }
        this.endpoints.set(endpoint.id, endpoint);
      }
    }
    return this.listEndpoints();
  }

  async pollSignals(): Promise<VehicleSignalFrame[]> {
    const frames: VehicleSignalFrame[] = [];
    for (const endpoint of this.endpoints.values()) {
      const adapter = this.buses.get(endpoint.busId);
      if (!adapter || endpoint.state === 'offline' || endpoint.state === 'unauthorized') continue;
      const nextFrames = await adapter.readSignals(endpoint);
      for (const frame of nextFrames) {
        this.signalCache.set(`${frame.endpointId}:${frame.signal}`, frame);
        frames.push(frame);
      }
    }
    return frames;
  }

  async execute(command: VehicleHalCommand): Promise<VehicleHalCommandResult> {
    const endpoint = this.endpoints.get(command.endpointId);
    if (!endpoint) return { accepted: false, commandId: command.id, reason: `Endpoint not discovered: ${command.endpointId}` };
    if (endpoint.state !== 'ready') return { accepted: false, commandId: command.id, reason: `Endpoint is not ready: ${endpoint.state}` };
    if (!commandAllowed(endpoint, command)) return { accepted: false, commandId: command.id, reason: `Command not supported by endpoint: ${command.command}` };

    const adapter = this.buses.get(endpoint.busId);
    if (!adapter) return { accepted: false, commandId: command.id, reason: `Bus not registered: ${endpoint.busId}` };
    if (command.requireSecureBus && !adapter.identity.secure) {
      return { accepted: false, commandId: command.id, reason: `Command requires secure bus: ${adapter.identity.id}` };
    }
    return adapter.sendCommand(command);
  }

  snapshot(): VehicleHalSnapshot {
    const endpoints = this.listEndpoints();
    const offline = endpoints.filter((endpoint) => endpoint.state === 'offline').length;
    const unauthorized = endpoints.filter((endpoint) => endpoint.state === 'unauthorized').length;
    return {
      runtimeMode: this.runtimeMode,
      buses: this.listBuses(),
      endpoints,
      signals: [...this.signalCache.values()],
      ready: this.buses.size > 0 && endpoints.length > 0 && offline === 0 && unauthorized === 0,
      messages: [
        `${this.buses.size} vehicle buses registered.`,
        `${endpoints.length} vehicle endpoints discovered.`,
        `${this.signalCache.size} vehicle signals cached.`,
      ],
    };
  }
}

export class SimulatorVehicleBusAdapter implements VehicleBusAdapter {
  readonly identity: VehicleBusIdentity = {
    id: 'sim-vif-bus',
    kind: 'simulator',
    name: 'AURA Simulator Vehicle HAL Bus',
    channel: 'local-simulator',
    secure: true,
    metadata: { purpose: 'phase-v-hal-foundation' },
  };

  private readonly commandLog: VehicleHalCommand[] = [];

  discoverEndpoints(): VehicleEndpointDescriptor[] {
    return [
      {
        id: 'body-comfort-domain',
        name: 'Body and Comfort Domain Controller',
        domain: 'comfort',
        busId: this.identity.id,
        ecuAddress: '0x710',
        state: 'ready',
        capabilities: [
          { id: 'hvac', name: 'HVAC Control', safetyLevel: 'comfort', readSignals: ['cabinTemperatureC', 'fanLevel'], writeCommands: ['setTemperature', 'setFanLevel'] },
          { id: 'ambient-light', name: 'Ambient Lighting', safetyLevel: 'comfort', readSignals: ['lightingScene'], writeCommands: ['setLightingScene'] },
        ],
      },
      {
        id: 'body-closure-domain',
        name: 'Door Window and Seat Controller',
        domain: 'body',
        busId: this.identity.id,
        ecuAddress: '0x720',
        state: 'ready',
        capabilities: [
          { id: 'closures', name: 'Closures', safetyLevel: 'body', readSignals: ['driverDoorOpen', 'windowPositionPct'], writeCommands: ['lockDoors', 'setWindowPosition'] },
          { id: 'seat', name: 'Seat Control', safetyLevel: 'body', readSignals: ['driverSeatPosition'], writeCommands: ['setSeatPreset'] },
        ],
      },
    ];
  }

  readSignals(endpoint: VehicleEndpointDescriptor): VehicleSignalFrame[] {
    const timestamp = isoNow();
    if (endpoint.id === 'body-comfort-domain') {
      return [
        { id: 'sig-cabin-temp', endpointId: endpoint.id, signal: 'cabinTemperatureC', value: 22, unit: 'celsius', quality: 'valid', timestamp },
        { id: 'sig-lighting-scene', endpointId: endpoint.id, signal: 'lightingScene', value: 'oceanCalm', quality: 'valid', timestamp },
      ];
    }
    return [
      { id: 'sig-driver-door', endpointId: endpoint.id, signal: 'driverDoorOpen', value: false, quality: 'valid', timestamp },
      { id: 'sig-window-position', endpointId: endpoint.id, signal: 'windowPositionPct', value: 0, unit: 'percent', quality: 'valid', timestamp },
    ];
  }

  sendCommand(command: VehicleHalCommand): VehicleHalCommandResult {
    this.commandLog.push(command);
    return { accepted: true, commandId: command.id, reason: 'Simulator HAL accepted command.', echoedPayload: command.payload };
  }

  getCommandLog(): VehicleHalCommand[] {
    return [...this.commandLog];
  }
}

export function createVehicleHardwareAbstractionLayer(runtimeMode: VehicleRuntimeMode = 'simulation'): VehicleHardwareAbstractionLayer {
  return new VehicleHardwareAbstractionLayer(runtimeMode);
}

export function createSimulatorVehicleHal(): VehicleHardwareAbstractionLayer {
  const hal = new VehicleHardwareAbstractionLayer('simulation');
  hal.registerBus(new SimulatorVehicleBusAdapter());
  return hal;
}
