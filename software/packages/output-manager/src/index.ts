export type OutputRole = 'controller' | 'dashboard' | 'roof' | 'floor' | 'projection';
export type OutputDeviceKind = 'browserWindow' | 'monitor' | 'projector' | 'tablet' | 'simulated';

export interface OutputDeviceProfile {
  id: string;
  role: OutputRole;
  name: string;
  kind: OutputDeviceKind;
  width: number;
  height: number;
  fullscreen: boolean;
  route: string;
}

export interface OutputLaunchPlan {
  deviceId: string;
  role: OutputRole;
  url: string;
  width: number;
  height: number;
  fullscreen: boolean;
}

export class OutputManager {
  private readonly devices = new Map<string, OutputDeviceProfile>();

  register(device: OutputDeviceProfile): void {
    if (this.devices.has(device.id)) {
      throw new Error(`Output device already registered: ${device.id}`);
    }
    this.devices.set(device.id, device);
  }

  get(deviceId: string): OutputDeviceProfile {
    const device = this.devices.get(deviceId);
    if (!device) throw new Error(`Output device not registered: ${deviceId}`);
    return device;
  }

  list(): OutputDeviceProfile[] {
    return [...this.devices.values()].sort((a, b) => a.id.localeCompare(b.id));
  }

  planLaunch(baseUrl: string): OutputLaunchPlan[] {
    return this.list().map((device) => ({
      deviceId: device.id,
      role: device.role,
      url: `${baseUrl}${device.route}`,
      width: device.width,
      height: device.height,
      fullscreen: device.fullscreen,
    }));
  }
}

export function createOutputManager(): OutputManager {
  return new OutputManager();
}

export function createDefaultOutputManager(): OutputManager {
  const manager = createOutputManager();
  manager.register({ id: 'controller', role: 'controller', name: 'Laptop Controller', kind: 'browserWindow', width: 1440, height: 900, fullscreen: false, route: '' });
  manager.register({ id: 'dashboard', role: 'dashboard', name: 'Dashboard Monitor', kind: 'monitor', width: 1280, height: 720, fullscreen: true, route: '?output=dashboard' });
  manager.register({ id: 'roof', role: 'roof', name: 'Roof Projector', kind: 'projector', width: 1920, height: 1080, fullscreen: true, route: '?output=roof' });
  manager.register({ id: 'projection', role: 'projection', name: 'AURA Presence Projector', kind: 'projector', width: 1280, height: 720, fullscreen: true, route: '?output=projection' });
  manager.register({ id: 'floor', role: 'floor', name: 'Floor Output', kind: 'projector', width: 1280, height: 720, fullscreen: true, route: '?output=floor' });
  return manager;
}
