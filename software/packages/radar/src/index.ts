export type RadarPosition = 'front' | 'rear' | 'left' | 'right' | 'corner-front-left' | 'corner-front-right' | 'corner-rear-left' | 'corner-rear-right';
export type RadarHealth = 'ready' | 'degraded' | 'offline' | 'blocked';
export type RadarObjectClass = 'vehicle' | 'pedestrian' | 'cyclist' | 'static' | 'unknown';

export interface RadarDescriptor {
  id: string;
  name: string;
  position: RadarPosition;
  rangeMeters: number;
  horizontalFovDeg: number;
  health: RadarHealth;
}

export interface RadarObject {
  id: string;
  class: RadarObjectClass;
  rangeMeters: number;
  azimuthDeg: number;
  relativeVelocityMps: number;
  confidence: number;
}

export interface RadarFrame {
  radarId: string;
  frameId: string;
  timestamp: string;
  objects: RadarObject[];
}

export interface RadarProvider {
  listRadars(): Promise<RadarDescriptor[]> | RadarDescriptor[];
  readObjects(radarId: string): Promise<RadarFrame> | RadarFrame;
}

export interface RadarSnapshot {
  radars: RadarDescriptor[];
  latestFrames: RadarFrame[];
  ready: boolean;
  messages: string[];
}

function now(): string {
  return new Date().toISOString();
}

export class RadarManager {
  private readonly radars = new Map<string, RadarDescriptor>();
  private readonly latestFrames = new Map<string, RadarFrame>();

  constructor(private readonly provider: RadarProvider) {}

  async discover(): Promise<RadarDescriptor[]> {
    const radars = await this.provider.listRadars();
    this.radars.clear();
    for (const radar of radars) {
      if (radar.rangeMeters <= 0 || radar.horizontalFovDeg <= 0) throw new Error(`Invalid radar descriptor: ${radar.id}`);
      this.radars.set(radar.id, radar);
    }
    return [...this.radars.values()];
  }

  async readObjects(radarId: string): Promise<RadarFrame> {
    const radar = this.radars.get(radarId);
    if (!radar) throw new Error(`Radar not discovered: ${radarId}`);
    if (radar.health === 'offline' || radar.health === 'blocked') throw new Error(`Radar unavailable: ${radarId}`);
    const frame = await this.provider.readObjects(radarId);
    for (const object of frame.objects) {
      if (object.confidence < 0 || object.confidence > 1) throw new Error(`Invalid radar object confidence: ${object.id}`);
    }
    this.latestFrames.set(radarId, frame);
    return frame;
  }

  snapshot(): RadarSnapshot {
    const radars = [...this.radars.values()];
    return {
      radars,
      latestFrames: [...this.latestFrames.values()],
      ready: radars.length > 0 && radars.every((radar) => radar.health === 'ready'),
      messages: [`${radars.length} radar endpoints discovered.`, `${this.latestFrames.size} radar frames cached.`],
    };
  }
}

export class SimulatorRadarProvider implements RadarProvider {
  private sequence = 0;

  listRadars(): RadarDescriptor[] {
    return [{ id: 'front-radar', name: 'Front Radar', position: 'front', rangeMeters: 180, horizontalFovDeg: 120, health: 'ready' }];
  }

  readObjects(radarId: string): RadarFrame {
    this.sequence += 1;
    return {
      radarId,
      frameId: `${radarId}-${this.sequence}`,
      timestamp: now(),
      objects: [{ id: 'obj-1', class: 'vehicle', rangeMeters: 42, azimuthDeg: 3, relativeVelocityMps: -2.5, confidence: 0.92 }],
    };
  }
}

export function createRadarManager(provider: RadarProvider = new SimulatorRadarProvider()): RadarManager {
  return new RadarManager(provider);
}
