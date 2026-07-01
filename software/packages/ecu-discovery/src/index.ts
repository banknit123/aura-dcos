export type EcuTrustState = 'trusted' | 'unknown' | 'untrusted';
export type EcuDomain = 'body' | 'comfort' | 'infotainment' | 'adas' | 'powertrain' | 'diagnostics' | 'sensor';
export type EcuDiscoveryBus = 'can' | 'can-fd' | 'lin' | 'automotive-ethernet' | 'diagnostics' | 'simulator';

export interface EcuCapability {
  id: string;
  name: string;
  signals: string[];
  commands: string[];
  diagnostics: string[];
}

export interface EcuDescriptor {
  id: string;
  name: string;
  domain: EcuDomain;
  address: string;
  bus: EcuDiscoveryBus;
  trustState: EcuTrustState;
  softwareVersion?: string;
  hardwareVersion?: string;
  capabilities: EcuCapability[];
  discoveredAt: string;
}

export interface EcuDiscoveryProbe {
  id: string;
  bus: EcuDiscoveryBus;
  scan(): Promise<EcuDescriptor[]> | EcuDescriptor[];
}

export interface EcuDiscoverySnapshot {
  ecus: EcuDescriptor[];
  trusted: number;
  unknown: number;
  untrusted: number;
  messages: string[];
}

function now(): string {
  return new Date().toISOString();
}

export class EcuDiscoveryService {
  private readonly probes = new Map<string, EcuDiscoveryProbe>();
  private readonly ecus = new Map<string, EcuDescriptor>();

  registerProbe(probe: EcuDiscoveryProbe): void {
    if (this.probes.has(probe.id)) throw new Error(`ECU discovery probe already registered: ${probe.id}`);
    this.probes.set(probe.id, probe);
  }

  async discover(): Promise<EcuDescriptor[]> {
    for (const probe of this.probes.values()) {
      const discovered = await probe.scan();
      for (const ecu of discovered) this.ecus.set(ecu.id, ecu);
    }
    return [...this.ecus.values()];
  }

  markTrust(ecuId: string, trustState: EcuTrustState): EcuDescriptor {
    const ecu = this.ecus.get(ecuId);
    if (!ecu) throw new Error(`ECU not discovered: ${ecuId}`);
    const updated = { ...ecu, trustState };
    this.ecus.set(ecuId, updated);
    return updated;
  }

  get(ecuId: string): EcuDescriptor {
    const ecu = this.ecus.get(ecuId);
    if (!ecu) throw new Error(`ECU not discovered: ${ecuId}`);
    return ecu;
  }

  snapshot(): EcuDiscoverySnapshot {
    const ecus = [...this.ecus.values()];
    return {
      ecus,
      trusted: ecus.filter((ecu) => ecu.trustState === 'trusted').length,
      unknown: ecus.filter((ecu) => ecu.trustState === 'unknown').length,
      untrusted: ecus.filter((ecu) => ecu.trustState === 'untrusted').length,
      messages: [`${ecus.length} ECUs discovered.`, `${this.probes.size} discovery probes registered.`],
    };
  }
}

export class SimulatorEcuDiscoveryProbe implements EcuDiscoveryProbe {
  readonly id = 'sim-ecu-probe';
  readonly bus: EcuDiscoveryBus = 'simulator';

  scan(): EcuDescriptor[] {
    const discoveredAt = now();
    return [
      {
        id: 'body-domain-controller',
        name: 'Body Domain Controller',
        domain: 'body',
        address: '0x710',
        bus: 'can-fd',
        trustState: 'trusted',
        softwareVersion: '1.0.0-sim',
        capabilities: [
          { id: 'closures', name: 'Closures', signals: ['door.driverOpen', 'window.driverPositionPct'], commands: ['lockDoors', 'setWindowPosition'], diagnostics: ['ReadDTCInformation'] },
        ],
        discoveredAt,
      },
      {
        id: 'comfort-domain-controller',
        name: 'Comfort Domain Controller',
        domain: 'comfort',
        address: '0x720',
        bus: 'lin',
        trustState: 'trusted',
        softwareVersion: '1.0.0-sim',
        capabilities: [
          { id: 'comfort', name: 'Comfort', signals: ['hvac.cabinTempC', 'seat.driverPreset'], commands: ['setTemperature', 'setSeatPreset'], diagnostics: ['ReadDataByIdentifier'] },
        ],
        discoveredAt,
      },
    ];
  }
}

export function createEcuDiscoveryService(): EcuDiscoveryService {
  return new EcuDiscoveryService();
}

export function createSimulatorEcuDiscoveryService(): EcuDiscoveryService {
  const service = new EcuDiscoveryService();
  service.registerProbe(new SimulatorEcuDiscoveryProbe());
  return service;
}
