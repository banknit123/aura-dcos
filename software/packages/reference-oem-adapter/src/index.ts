export type ReferenceBus = 'can-fd' | 'lin' | 'automotive-ethernet' | 'diagnostics';
export type ReferenceEcuDomain = 'body' | 'comfort' | 'infotainment' | 'sensor' | 'gateway';

export interface ReferenceEcu {
  id: string;
  name: string;
  domain: ReferenceEcuDomain;
  address: string;
  bus: ReferenceBus;
  signals: string[];
  commands: string[];
  diagnostics: string[];
}

export interface ReferenceSignalMapping {
  auraSignal: string;
  bus: ReferenceBus;
  ecuId: string;
  source: string;
  unit?: string;
}

export interface ReferenceCommandMapping {
  auraCommand: string;
  bus: ReferenceBus;
  ecuId: string;
  target: string;
  requiresGateway: boolean;
}

export interface ReferenceSensorBinding {
  id: string;
  kind: 'camera' | 'radar' | 'lidar';
  transport: ReferenceBus;
  endpoint: string;
}

export interface ReferenceOemAdapterSnapshot {
  adapterId: string;
  profileId: string;
  ecus: ReferenceEcu[];
  signalMappings: ReferenceSignalMapping[];
  commandMappings: ReferenceCommandMapping[];
  sensorBindings: ReferenceSensorBinding[];
  messages: string[];
}

export class ReferenceOemAdapter {
  readonly adapterId = 'reference-oem-suv-adapter';
  readonly profileId = 'reference-oem-suv-2032';

  private readonly ecus: ReferenceEcu[] = [
    { id: 'body-ecu', name: 'Body ECU', domain: 'body', address: '0x710', bus: 'can-fd', signals: ['vehicle.speedKph', 'door.driverOpen', 'window.driverPositionPct'], commands: ['lockDoors', 'unlockDoors', 'setWindowPosition'], diagnostics: ['ReadDTCInformation'] },
    { id: 'comfort-ecu', name: 'Comfort ECU', domain: 'comfort', address: '0x720', bus: 'lin', signals: ['hvac.cabinTempC', 'seat.driverPreset'], commands: ['setTemperature', 'setFanLevel', 'setSeatPreset'], diagnostics: ['ReadDataByIdentifier'] },
    { id: 'sensor-gateway', name: 'Sensor Gateway', domain: 'sensor', address: '10.0.0.50', bus: 'automotive-ethernet', signals: ['camera.frontFrame', 'radar.frontObjects', 'lidar.roofCloud'], commands: [], diagnostics: ['health'] },
    { id: 'aura-gateway', name: 'AURA Secure Gateway', domain: 'gateway', address: '10.0.0.1', bus: 'automotive-ethernet', signals: ['gateway.health'], commands: ['authorizeCommand'], diagnostics: ['audit'] },
  ];

  private readonly signalMappings: ReferenceSignalMapping[] = [
    { auraSignal: 'vehicle.speedKph', bus: 'can-fd', ecuId: 'body-ecu', source: 'CANFD:0x120.VehicleSpeed', unit: 'km/h' },
    { auraSignal: 'door.driverOpen', bus: 'can-fd', ecuId: 'body-ecu', source: 'CANFD:0x210.DriverDoorOpen' },
    { auraSignal: 'window.driverPositionPct', bus: 'can-fd', ecuId: 'body-ecu', source: 'CANFD:0x211.DriverWindowPct', unit: '%' },
    { auraSignal: 'hvac.cabinTempC', bus: 'lin', ecuId: 'comfort-ecu', source: 'LIN:0x12.CabinTemp', unit: 'celsius' },
    { auraSignal: 'seat.driverPreset', bus: 'lin', ecuId: 'comfort-ecu', source: 'LIN:0x18.DriverSeatPreset' },
    { auraSignal: 'camera.frontFrame', bus: 'automotive-ethernet', ecuId: 'sensor-gateway', source: 'SOMEIP:camera.front.frame' },
    { auraSignal: 'radar.frontObjects', bus: 'automotive-ethernet', ecuId: 'sensor-gateway', source: 'SOMEIP:radar.front.objects' },
    { auraSignal: 'lidar.roofCloud', bus: 'automotive-ethernet', ecuId: 'sensor-gateway', source: 'SOMEIP:lidar.roof.cloud' },
  ];

  private readonly commandMappings: ReferenceCommandMapping[] = [
    { auraCommand: 'lockDoors', bus: 'can-fd', ecuId: 'body-ecu', target: 'CANFD:0x310.LockDoors', requiresGateway: true },
    { auraCommand: 'unlockDoors', bus: 'can-fd', ecuId: 'body-ecu', target: 'CANFD:0x310.UnlockDoors', requiresGateway: true },
    { auraCommand: 'setWindowPosition', bus: 'can-fd', ecuId: 'body-ecu', target: 'CANFD:0x311.WindowPosition', requiresGateway: true },
    { auraCommand: 'setTemperature', bus: 'lin', ecuId: 'comfort-ecu', target: 'LIN:0x22.SetTemperature', requiresGateway: true },
    { auraCommand: 'setSeatPreset', bus: 'lin', ecuId: 'comfort-ecu', target: 'LIN:0x24.SetSeatPreset', requiresGateway: true },
  ];

  private readonly sensorBindings: ReferenceSensorBinding[] = [
    { id: 'front-camera', kind: 'camera', transport: 'automotive-ethernet', endpoint: 'rtsp://10.0.0.50/front-camera' },
    { id: 'front-radar', kind: 'radar', transport: 'automotive-ethernet', endpoint: 'someip://10.0.0.50/radar/front' },
    { id: 'roof-lidar', kind: 'lidar', transport: 'automotive-ethernet', endpoint: 'someip://10.0.0.50/lidar/roof' },
  ];

  discoverEcus(): ReferenceEcu[] { return this.ecus.map((ecu) => ({ ...ecu, signals: [...ecu.signals], commands: [...ecu.commands], diagnostics: [...ecu.diagnostics] })); }
  signalMap(): ReferenceSignalMapping[] { return this.signalMappings.map((mapping) => ({ ...mapping })); }
  commandMap(): ReferenceCommandMapping[] { return this.commandMappings.map((mapping) => ({ ...mapping })); }
  sensors(): ReferenceSensorBinding[] { return this.sensorBindings.map((binding) => ({ ...binding })); }

  readDiagnostic(ecuId: string): { ecuId: string; positive: boolean; service: string; payload: string } {
    const ecu = this.ecus.find((item) => item.id === ecuId);
    if (!ecu) throw new Error(`Reference ECU not found: ${ecuId}`);
    return { ecuId, positive: true, service: ecu.diagnostics[0] ?? 'health', payload: `${ecu.name} simulator diagnostic OK` };
  }

  snapshot(): ReferenceOemAdapterSnapshot {
    return { adapterId: this.adapterId, profileId: this.profileId, ecus: this.discoverEcus(), signalMappings: this.signalMap(), commandMappings: this.commandMap(), sensorBindings: this.sensors(), messages: ['Reference OEM adapter is simulator-backed.', 'All vehicle-facing commands require gateway policy.'] };
  }
}

export function createReferenceOemAdapter(): ReferenceOemAdapter { return new ReferenceOemAdapter(); }
