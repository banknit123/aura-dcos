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
